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
      if(Array.isArray(d.shop.own))c.shop.own=[...new Set(d.shop.own.filter(k=>typeof k==='string'&&/^(peinture|aile|trainee):[a-zA-Z]{2,12}$/.test(k)))]; /* (2026-10-24) [a-zA-Z] : les quatre peintures de la série (srBraise, srAurore, srLagon, srEtoile) ont une majuscule dans leur id — sans elle, achetées ou portées, elles sautaient au lancement suivant */
      if(d.shop.eq&&typeof d.shop.eq==='object')for(const k of ['peinture','aile','trainee'])if(typeof d.shop.eq[k]==='string'&&/^[a-zA-Z]{2,12}$/.test(d.shop.eq[k]))c.shop.eq[k]=d.shop.eq[k];}
    if(Array.isArray(d.figs))c.figs=[...new Set(['tailwhip'].concat(d.figs.filter(k=>typeof k==='string'&&/^[a-z0-9_]{2,24}$/.test(k))))].slice(0,80); // (2026-10-14) LES FIGURES possédées — (2026-10-15) le TAIL WHIP offert ; le TONNEAU, offert jusque-là, reste dans la liste des sauvegardes d'avant (il s'achète désormais)
    else if((+d.best>0)||(+d.bank>0)||(+d.aura>0))c.figs=['tailwhip','tonneau']; // une sauvegarde d'avant les figures (sans liste) qui a déjà joué : elle avait le tonneau, elle le garde
    c.figS=(d.figS===1||(c.ex.runs===0&&!(+d.best>0)&&!(+d.bank>0)&&!(+d.aura>0)&&!(Array.isArray(d.owned)&&d.owned.length)&&c.figs.every(function(k){return k==='tailwhip'||k==='saltov';})))?1:0;if(c.figS&&c.figs.indexOf('saltov')<0)c.figs.push('saltov'); // (2026-10-20, Sacha : « un nouveau joueur ne doit pas avoir le tonneau, il doit avoir le salto avant, de base ») figS : le SALTO AVANT est OFFERT — à tout profil qui n'a encore fini aucune partie ni rien acheté ; il prend l'emplacement AVANT (le double-tap pouce au repos, donc aussi la figure de l'auto-école) ; une sauvegarde qui a déjà joué ne change pas
    c.figT0=(d.figT0===1||(d.figT0===undefined&&c.figs.indexOf('tonneau')>=0))?1:0; // figT0 : ce tonneau-là était OFFERT (sauvegarde d'avant le tail whip) — pas un achat (ecoDebutAchat)
    if(d.combos&&typeof d.combos==='object'){c.combos={};for(const k of Object.keys(d.combos).slice(0,40))if(/^[MPST]{3}$/.test(k))c.combos[k]=Math.min(1e6,Math.max(0,Math.round(+d.combos[k])||0));} // (2026-10-14) LE CARNET DES COMBOS À TROIS
    if(Array.isArray(d.figEq))c.figEq=[...new Set(d.figEq.filter(k=>typeof k==='string'&&/^[a-z0-9_]{2,24}$/.test(k)))].slice(0,2); // (2026-10-14, LES FIGURES v2) les emplacements — (2026-10-15, Sacha : « seulement 2 figures à la fois, pas 3 ») DEUX
    if(Array.isArray(d.figEq3))c.figEq3=[0,1,2].map(i=>{const k=d.figEq3[i];return typeof k==='string'&&/^[a-z0-9_]{2,24}$/.test(k)?k:'';}); // (2026-10-15 soir) UN PAR DIRECTION, à sa place : avant · arrière · côté ('' = vide) — voir figSlots
    if(d.figRec!=null)c.figRec=Math.max(0,Math.min(9,Math.round((+d.figRec||0)*100)/100)); // (2026-10-15 soir, HUD des figures v4) le meilleur COMBO jamais posé (le × d'un vol)
    if(typeof d.pseudo==='string')c.pseudo=d.pseudo.slice(0,8);
    c.tuto=d.tuto===0?0:(d.tuto||c.ex.runs>0)?1:0;c.permis=d.permis?1:0;c.bienv=d.bienv?1:0;c.tutoProv=d.tutoProv?1:0; /* (2026-10-16) LA QUESTION DE BIENVENUE : `bienv` = ne plus la poser · `tutoProv` = la leçon sautée pour UNE ouverture (voir bienvMontre) */c.cousin=d.cousin?1:0;c.spinJ=Math.max(0,Math.min(9,d.spinJ|0));c.chanceG=Math.max(0,Math.min(3,d.chanceG|0));c.spinBoost=Math.max(0,Math.min(3,d.spinBoost|0)); /* (2026-10-14) FINAL SPIN v2 : les bons gagnés à la machine */ /* (2026-10-14) LE FINAL SPIN : les jetons gardés */ /* (2026-10-14) LE CODE COUSIN */ /* (2026-09-28) un 0 ÉCRIT est respecté : c'est « REVOIR L'AUTO-ÉCOLE » (le « qui a déjà joué » ne vaut que pour les sauvegardes d'avant l'auto-école, sans champ) · `permis` : la prime de 500 déjà versée (une seule fois) */ c.shopVu=d.shopVu?1:0;c.ast=Math.max(0,Math.min(1023,Math.round(+d.ast)||0)); // `ast` : les ASTUCES déjà montrées (bits : 1 drift, 2 assiette en vol ; 256 le doigt de bienvenue de l'accueil, 2026-10-15 soir — d'où 1023 au lieu de 255) // (2026-09-25) la pastille NEW de la boutique ne s'allume que tant qu'on n'y est jamais entré // qui a déjà joué ne refait pas la partie guidée
    c.aura=Math.max(0,Math.min(1e12,Math.round(+d.aura)||0));
    c.auraMax=Math.max(0,Math.min(1e12,Math.round(+d.auraMax)||0));
    /* (2026-10-25, Sacha : « un graphe bougie : l'aura de la partie, la moyenne et le record ») LA MOYENNE D'AURA. Une sauvegarde d'avant n'a pas
       ce compteur : on l'amorce sur le total à vie et le nombre de parties (la meilleure estimation qu'elle porte). */
    if(d.auraH&&typeof d.auraH==='object'&&isFinite(+d.auraH.s)&&isFinite(+d.auraH.n))c.auraH={s:Math.max(0,Math.min(1e12,Math.round(+d.auraH.s)||0)),n:Math.max(0,Math.min(1e7,Math.round(+d.auraH.n)||0))};
    else if(c.ex&&c.ex.runs>0)c.auraH={s:c.aura,n:c.ex.runs};
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
    /* (2026-10-22, Sacha : « corrige ATCHOUM, traduis les indices, ne rembourse que ce qui a été acheté ») LE REMBOURSEMENT NE RENDS QUE CE QUI S'ACHETAIT : une caisse GAGNÉE par sa mission (LA CAISSE-NUAGE : `nuage30` · LA FOURNAISE : `cratere`, réussie dans `d.m2.ok`) sort de `owned` sans remboursement — sans quoi qui l'avait gagnée touchait 1,8 M ou 3,4 M $ */
    {let rb=0;const nm=[],GAG={'LA CAISSE-NUAGE':'nuage30','LA FOURNAISE':'cratere'},ok2=(d.m2&&Array.isArray(d.m2.ok))?d.m2.ok:[];c.owned=c.owned.filter(x=>{if(!CARS[x].retire)return true;let p9=(CAR_UNLOCK[x]&&CAR_UNLOCK[x].p)||0;if(p9&&GAG[CARS[x].name]&&ok2.indexOf(GAG[CARS[x].name])>=0)p9=0;{const u9=CAR_UNLOCK[x]||{};if(p9&&u9.exK==='carnet'&&c.mis.n>=u9.exV)p9=0;if(p9&&(u9.exK==='carrN'||u9.exK==='carrV')&&(c.carr[u9.exK==='carrN'?'nuages':'ville']|0)>=u9.exV)p9=0;} /* (2026-10-24) ni une caisse DONNÉE par sa condition d'avant : le carnet relevé (m2MigreV2), la carrière gagnée (la migration après SAVE.load) — rien n'a été payé */if(p9){rb+=p9;nm.push(CARS[x].name);}return false;});
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
      o9.c.jd=typeof cc.jd==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(cc.jd)?cc.jd:'';o9.c.cartes=L9(cc.cartes,40);o9.c.cartesP=L9(cc.cartesP,40);o9.c.rejoue=Math.round(N9(cc.rejoue,1e5));
      /* (2026-10-22, Sacha : « tableau des voitures / des peintures ») les compteurs à vie des missions de caisse et des peintures secrètes — SANS cette liste ils sautaient au rechargement */
      for(const k of ['pu','figs'])o9.c[k]=Math.round(N9(cc[k],1e7));for(const k of ['nitS','nmaxS','airS','kmTot','verglasKm'])o9.c[k]=N9(cc[k],1e9);
      /* (2026-10-25, Sacha : « palier 10 de chaque musique ») les morceaux de Pouce bleu joués jusqu'au palier 10 : leurs ids ont un tiret (bleu-12, pal-asphalte), L9 les jetterait */
      if(Array.isArray(cc.musP10))o9.c.musP10=[...new Set(cc.musP10.filter(function(x){return typeof x==='string'&&/^[a-z0-9-]{2,40}$/.test(x);}))].slice(0,80);
      if(cc.met&&typeof cc.met==='object')for(const k of Object.keys(cc.met).slice(0,40))if(/^[a-z0-9_]{2,16}$/.test(k))(o9.c.met||(o9.c.met={}))[k]=L9(cc.met[k],12);
      if(cc.sc&&typeof cc.sc==='object')for(const k of Object.keys(cc.sc).slice(0,40))if(/^[a-z0-9_]{2,16}$/.test(k))(o9.c.sc||(o9.c.sc={}))[k]=N9(cc.sc[k],1e9);}
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
      {const h9=this.d.auraH||(this.d.auraH={s:0,n:0});h9.s+=ec.a;h9.n++;} /* (2026-10-25) la partie tuée en arrière-plan compte aussi pour la moyenne */
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
    /* ===== LE MIROIR ILLISIBLE NE SE SÈME PAS (24/10, débogage sortie iOS : « aucune progression perdue ») ===== semé tel quel, il rechargeait la page sur un localStorage
       tout aussi illisible, qui relisait le miroir, rechargeait… à l'infini : appli inutilisable. Illisible = vide (le flush qui suit écrit une sauvegarde saine) */
    if(r&&r.value&&(function(){try{const x9=JSON.parse(r.value);return !!x9&&typeof x9==='object';}catch(e){return false;}})()){SAVE.natif=2;let ok=false;try{localStorage[SAVE.K]=r.value;ok=localStorage[SAVE.K]===r.value;}catch(e){}
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
Object.assign(I18N,{'QUITTE LE GARAGE':'LEAVES THE GARAGE','QUITTENT LE GARAGE':'LEAVE THE GARAGE','REMBOURSÉS':'REFUNDED','LE SITE NE RESTAURE PAS LES SAUVEGARDES':'SAVES CANNOT BE RESTORED ON THE WEBSITE'}); /* (2026-10-24) une tournure qui ne s'accorde pas : « EST PARTIE » donnait « LE QUATTRO EST PARTIE » */
if(SAVE.remb)document.addEventListener('cc:revele',function(){const r=SAVE.remb;if(!r)return;
  try{toast(pxi('coche')+' '+r.n.map(function(x){return TR(x);}).join(' · ')+' '+TR(r.n.length>1?'QUITTENT LE GARAGE':'QUITTE LE GARAGE')+' : '+fmtC(r.v)+' '+TR('REMBOURSÉS'));}catch(e){}},{once:true});
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
/* ---- LES CURSEURS : appliquer au graphe · repeindre les deux interfaces · retenir --------------
   ⚠ `volApply` ne touche QUE ce qui n'est pas déjà repiloté chaque image. La musique en course est
   réécrite par `musicTick` à chaque frame (filtre-mouvement + ducking) : y poser une valeur ici
   serait écrasé 16 ms plus tard. On ne pose donc que le bus des EFFETS et le cas MENU, où rien ne
   tourne. Chercher à « tout appliquer » ici, c'est se battre avec la boucle et perdre. */
function volApply(){
  try{if(MASTER&&AC)(MASTER._vol||MASTER).gain.setTargetAtTime(sfxVol(),AC.currentTime,.03);}catch(e){} // rampe courte : un saut de gain CLAQUE
  // (la musique : son volume est réappliqué à chaque image par musicTick — rien à faire ici)
}
function volUI(){ // les deux écrans de réglages affichent le MÊME état — il n'y a qu'une source
  const set=function(sid,vid,rid,val,on){
    const sl=document.getElementById(sid),lb=document.getElementById(vid),rw=document.getElementById(rid);
    const pc=Math.round(val*100);
    if(sl){sl.value=pc;sl.style.setProperty('--v',pc+'%');} // la piste se remplit en or jusqu'au pouce
    if(lb)lb.textContent=pc+'%';
    if(rw)rw.classList.toggle('mute',on===false||pc===0); // coupé ou à zéro : la ligne s'efface, on comprend pourquoi rien ne sort
  };
  set('volMus','volMusV','volRowMus',VOL.mus,SND.music); set('mVolMus','mVolMusV','mVolRowMus',VOL.mus,SND.music);
  set('volSfx','volSfxV','volRowSfx',VOL.sfx,SND.sfx);   set('mVolSfx','mVolSfxV','mVolRowSfx',VOL.sfx,SND.sfx);
}
function volSet(k,pc){
  VOL[k]=Math.min(1,Math.max(0,pc/100));
  SAVE.d.vol[k]=VOL[k];SAVE.mark(); // `mark` et pas `flush` : on glisse le doigt, ça tire 20 valeurs à la seconde
  volApply();volUI();
}
/* (2026-10-14, session SON — BACKLOG P3) LE CURSEUR MUSIQUE PARLE AUSSI. Le curseur EFFETS rend une pièce témoin au relâcher ; le curseur
   MUSIQUE ne rendait rien — or on ne l'entendait pas là où on le règle le plus : au ciel de l'écran titre la musique ne joue qu'à MUS_CIEL
   (≈ 15 % du garage), et dans les réglages ouverts depuis la PAUSE le morceau est arrêté. Au relâcher : 1,4 s de musique au NOUVEAU volume.
   Au ciel, musicTick lève MUS_CIEL le temps de l'extrait ; en pause, le morceau de la course repart en fondu puis se rendort (bloc MUSAP de
   musicTick). Rien si MUSIQUE est coupée ou à 0 (le silence EST la réponse), ni là où le volume ne se règle pas (iPhone sans MUS_WA : un
   extrait à plein mentirait sur le curseur), ni quand la boutique fait taire le lobby. */
function musApercu(){
  if(!SND.music||!(VOL.mus>0)||MUS_TAIT)return;
  if(VOL_LOCKED&&!musWaTient())return;
  MUSAP.t=performance.now()+1400;
  if(!(paused&&started&&!gameOver&&musicVoulue&&musicEl&&musicEl.paused)||document.hidden)return; // hors pause la musique joue déjà : musicTick applique le volume à l'image suivante
  MUSAP.joue=true;
  try{if(musWaTient()&&AC&&AC.state!=='running'){MUSAP.rev=true;const p9=AC.resume();if(p9&&p9.catch)p9.catch(function(){});} // en pause le contexte dort : la musique branchée (MUS_WA) n'y passerait pas
    if(musWaTient()){const g9=MUS_WA.g.gain,t9=AC.currentTime;g9.cancelScheduledValues(t9);g9.setValueAtTime(0,t9);g9._s9=undefined;}else musicEl.volume=0; // l'extrait part de zéro : le fondu d'entrée est dans musicTick
    musicSession();if(musicEl.muted)musicEl.muted=false;
    const p8=musicEl.play();if(p8&&p8.catch)p8.catch(function(){MUSAP.joue=false;});}catch(e){MUSAP.joue=false;}
}
window.dbgMusAp=function(){ // (banc) l'état de la musique autour de l'extrait du curseur : lecture seule
  return {mode:musicMode,ciel:!!(typeof CHUTE!=='undefined'&&CHUTE.on),paused:paused,cible:+musicVolCible.toFixed(3),cour:+musicVolCour.toFixed(3),
    el:musicEl?{p:musicEl.paused,v:+musicEl.volume.toFixed(3),t:+musicEl.currentTime.toFixed(2),src:(musicEl.src||'').split('/').pop()}:null,
    ap:{reste:Math.round(MUSAP.t-performance.now()),joue:MUSAP.joue,rev:MUSAP.rev},ctx:AC&&AC.state,volMus:VOL.mus,reglagesPause:!!window.__setPause};};
(function(){ // un seul câblage pour les six curseurs (trois par interface)
  const bind=function(id,k){const e=document.getElementById(id);if(!e)return;
    const go=function(){volSet(k,+e.value);};
    e.addEventListener('input',go);e.addEventListener('change',function(){go();SAVE.flush();}); // le doigt relâché = on écrit pour de bon
    /* (2026-09-28, console de son) LE CURSEUR PARLE : un cran (ui.curseur, sa hauteur suit la valeur) à chaque dizaine de % franchie
       pendant le glissé ; au relâcher du curseur EFFETS, une pièce témoin jouée au NOUVEAU volume (volSet vient de le poser sur MASTER) */
    e.addEventListener('pointerdown',function(){e._cran=Math.floor(+e.value/10);});
    e.addEventListener('input',function(){try{const c9=Math.floor(+e.value/10);if(e._cran==null)e._cran=c9;else if(c9!==e._cran){e._cran=c9;sfx('ui.curseur',{st:(c9-5)*2});}}catch(x){}});
    e.addEventListener('change',function(){e._cran=null;if(k==='sfx')try{sfx('piece',{t:.06});}catch(x){}else if(k==='mus')try{musApercu();}catch(x){}}); // (2026-10-14, session SON) …et au relâcher du curseur MUSIQUE, un extrait (musApercu)
    e.addEventListener('click',function(ev){ev.stopPropagation();}); // ⚠ sinon le clic remonte à la ligne .setRow et rouvre/bascule autre chose
    e.addEventListener('pointerdown',function(ev){ev.stopPropagation();});
  };
  bind('volMus','mus');bind('volSfx','sfx');
  bind('mVolMus','mus');bind('mVolSfx','sfx');
})();
// ÉTAL : on recharge les réglages boost/fréquence par-dessus les valeurs d'usine
// ⚠ indexés par NOM, pas par position : changer la liste des fruits ne doit PAS coller les réglages
// de l'ancien étal sur les nouveaux (une pêche héritant du boost d'une pomme).
(function(){const fr=SAVE.d.fruits;if(!fr||!fr.length)return;
  for(const d of FRUIT_DEFS){const e=fr.find(z=>z.n===d.n);if(e){d.boost=e.b;d.freq=e.f;}}})();
function saveFruits(){SAVE.d.fruits=FRUIT_DEFS.map(f=>({n:f.n,b:f.boost,f:f.freq}));SAVE.flush();}
const sndBtnEl=document.getElementById('sndBtn'),musBtnEl=document.getElementById('musBtn');
function sndRefresh(){
  sndBtnEl.innerHTML=pxi(SND.sfx?'son':'muet')+' <span class="blabel">'+TR('SON')+'</span>';sndBtnEl.classList.toggle('off',!SND.sfx); // garde le span → masquable en icône seule sur mobile ; TR() sinon le libellé revient au français à chaque bascule, même en anglais
  if(musBtnEl){musBtnEl.innerHTML=pxi('musique')+' <span class="blabel">'+TR('MUS')+'</span>';musBtnEl.classList.toggle('off',!SND.music);} // ⚠ plus de « LVL 1 » (radio à morceau unique par niveau supprimée) : ce libellé est RECONSTRUIT à chaque bascule
  try{if(AC){if(musGraphe())musWaSon();else if(SND.sfx&&!paused)AC.resume();else AC.suspend();}}catch(e){} /* (2026-10-14, session SON) musique branchée : SON ne suspend plus le contexte, il ferme l'entrée des effets (musWaSon) */ // suspend = silence total du moteur audio — ⚠ en PAUSE c'est la reprise qui rallume (sinon le moteur ronronnait sur un jeu figé)
  if(!SND.sfx){deathStop();fxStop();} // ⚠ les sons de mort sont des HTMLAudio : `AC.suspend()` ne les atteint PAS, il faut les couper à la main
  try{volUI();}catch(e){} // les curseurs se grisent quand leur famille est coupée — et c'est ici qu'on l'apprend
}
sndBtnEl.addEventListener('click',function(e){e.stopPropagation();SND.sfx=!SND.sfx;SAVE.d.sfx=SND.sfx;SAVE.flush();sndRefresh();});
function musBascule(){SND.music=!SND.music;SAVE.d.mus=SND.music;SAVE.flush();sndRefresh(); // (2026-10-14, session SON) LA bascule MUSIQUE : le bouton et le retour d'une longue absence (musRetour) passent par elle
  musicSession(); // (2026-09-28) la session audio suit l'interrupteur : 'ambient' rend la main à la musique du joueur, 'playback' la reprend
  if(SND.music){ if(started&&running&&!gameOver){if(paused&&pbjRegne())MUSREP.att=true;else musicStartRun(false,true);} else musicMenu(); } // rallumée : relance selon le contexte — (2026-10-15) en course c'est le MÊME morceau qui revient (reprise), et dans la pause il attend la reprise (MUSREP)
  else musicStop(false); // éteinte : coupe net
}
if(musBtnEl)musBtnEl.addEventListener('click',function(e){e.stopPropagation();musBascule();});
sndRefresh();
// ---------- ÉTAT ----------
const keys={};
let AUTO_GAS=false; // mobile : accélération auto (le doigt sert à tourner et à la nitro) — voir bloc MOBILE en fin de fichier
// LE VOLANT ANALOGIQUE À DEUX AXES. `st` = braquage (X) · `sv` = assiette en vol (Y, + = pouce vers
// le HAUT = PIQUÉ, manche d'avion). Un SEUL point d'entrée dans la physique : le tactile écrit dans
// le même `keys` et le même `steer` que le clavier — aucune équation n'est réécrite pour le doigt.
const TCTL={on:false,pad:false,act:false,doigt:false,st:0,sv:0,id:null,ox:0,oy:0,dy:0,dyS:0,x0:0,lx:0,ly:0,ab:0,tr:0,ar:-1,play:null,dead:null,ov:null,airTip:false};
const VOLANT_PX=Math.max(34,Math.min(60,+((/[?&]volant=(\d+)/.exec(location.search)||[])[1])||46)); // (2026-10-14, sensations) la course du pouce pour le braquage plein, en px (54 avant) — `?volant=40` pour en essayer une autre sur le téléphone
const VOL_LIS=21.4,VOL_LIS_D=SENS?33.3:21.4; // (2026-10-14, sensations) le lissage du volant et du manche, en 1/s : 21,4 = τ 47 ms (clavier, tout ou rien) · 33,3 = τ 30 ms quand le POUCE tient le stick (`TCTL.doigt`, voir le volant analogique)
const DRIFT_PX=34.9; // LE GESTE DU DRIFT : pouce tiré de 34,9 px vers le bas (réglé le 28/09 — l'ancien sv < -0,45), lu par la conduite ; pour ENTRER à droite, `TCTL.dyS` (le seuil de l'ARC du pouce, voir stMove) peut le relever
let SANDBOX=false; // BAC À SABLE : la caisse se replace au lieu de mourir — on s'entraîne, rien n'est enregistré
// HAPTIQUE : son propre interrupteur depuis le 2026-09-28 (avant, couper le SON coupait aussi les vibrations)
/* LES VIBRATIONS (2026-09-25) — ⚠ iOS N'A PAS `navigator.vibrate` : sur iPhone, AUCUNE des vibrations du jeu ne
   partait. Sous Capacitor on passe par le Taptic Engine (plugin Haptics) : un motif `navigator.vibrate` est traduit
   en impacts — une impulsion courte = LÉGÈRE, moyenne = MOYENNE, longue = LOURDE, et un motif [on,off,on…] rejoue
   chaque impulsion à son heure. Hors app (navigateur Android), le vibreur d'origine reste la voie. */
function hap(p){
  if(!TCTL.on||!SND.vib)return;const n9=performance.now();let k9;{let m=0;if(Array.isArray(p)){for(let i=0;i<p.length;i+=2)if(+p[i]>m)m=+p[i];}else m=+p||0;k9=m<=12?1:m<=40?2:3;}
  /* (2026-10-14, gameplay · œil · vibrations) UN TIC NE COUPE PAS UN COUP. Hors app (navigateur Android), navigator.vibrate REMPLACE la vibration
     en cours : au banc, une pièce ramassée à la même image qu'un POSÉ LOURD (45, puis 5 à la même ms) ou qu'un motif de récompense
     ([18,50,30,60,40], puis 5) ne laissait sentir que le tic de 5 ms. Un tic léger (classe 1) qui tombe pendant la 1re impulsion d'une
     vibration plus forte se tait. Dans l'app (Taptic), chaque impulsion se joue à part : rien ne change. `?sens=0` : comme avant. */
  if(SENS&&k9===1&&(hap._k||0)>1&&n9-(hap._t||-1e9)<(hap._d||0)&&!(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Haptics))return;
  hap._t=n9;hap._k=k9;hap._d=Math.min(60,+(Array.isArray(p)?p[0]:p)||0); // (2026-10-14, gameplay · accord) l'heure et la CLASSE (1 léger · 2 moyen · 3 lourd, comme le Taptic) de la dernière impulsion : le limiteur des détails SENS les lit (sensHap) // (2026-09-28) son interrupteur à lui (réglages › VIBRATIONS) : beaucoup jouent son coupé et gardent le retour haptique
  const H=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Haptics;
  if(H){try{
    const L=Array.isArray(p)?p:[p];let at=0;
    for(let i=0;i<L.length;i+=2){const d=+L[i]||0,st=d<=12?'LIGHT':d<=40?'MEDIUM':'HEAVY';
      if(at===0)H.impact({style:st});else setTimeout(function(){try{H.impact({style:st});}catch(e){}},at);
      at+=d+(+L[i+1]||0);}
  }catch(e){}return;}
  try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}
}
// LE CLIC D'INTERFACE (2026-09-24) : une note brève et haute + une micro-vibration — chaque bouton RÉPOND, comme une borne d'arcade
const UI_CLIC={nav:'ui.nav',retour:'ui.retour',on:'ui.on',off:'ui.off',onglet:'ui.onglet',refus:'ui.refus',danger:'ui.danger',jouer:'ui.jouer'}; /* (2026-10-16, Sacha : « le bouton jouer doit avoir un bruit de moteur ») jouer : le V8 de JOUER / REJOUER (atelier-son, `ui.jouer`) */ // (2026-09-28) uiClic(rôle) : « j'appuie » ne sonne plus comme « je gagne », et un refus ne sonne plus comme un succès
/* (2026-10-14, session SON) LES APPUIS RAPPROCHÉS CHANTENT : un appui seul garde sa note ; des appuis à moins de 0,6 s l'un de l'autre montent
   doucement la pentatonique du morceau (degrés 0-1-2-3 puis 2-3-2-3…), 0,6 à 1,2 s la tiennent, au-delà de 1,2 s sans appui elle repart d'en bas.
   « retour » redescend d'un degré. Seulement les fiches key:1 (tap, nav, onglet, retour : dans la tonalité, jamais faux). +7 au plus (bases [0]). */
const SON_UI={i:0,t:-9},SON_UI_MEL={'ui.tap':1,'ui.nav':1,'ui.onglet':1,'ui.retour':1};
function sonUiSt(id){const t=performance.now()/1000,g=t-SON_UI.t;SON_UI.t=t;
  if(g>1.2)SON_UI.i=0;else if(id==='ui.retour')SON_UI.i=Math.max(0,(SON_UI.i<4?SON_UI.i:2+(SON_UI.i&1))-1);else if(g<.6&&++SON_UI.i>5)SON_UI.i=4;
  const i=SON_UI.i;return sonPd(i<4?i:2+(i&1));}
function uiClicId(k){const id=UI_CLIC[typeof k==='string'?k:'']||'ui.tap';return id==='ui.jouer'&&SONV2&&!(window.CCSON&&window.CCSON.existe(id))?'ui.tap':id;} // (2026-10-16) une vieille banque en cache sans le moteur : l'appui d'or
function uiClic(k){ if(UI_SON)UI_SON.t=performance.now(); try{ const id9=uiClicId(k),st9=SON_UI_MEL[id9]?sonUiSt(id9):0,f9=function(){if(SONV2)sfx(id9,st9?{st:st9}:id9==='ui.jouer'?{vol:-9}:undefined);else chimeNote(1480,0,.045,.05);}; /* (2026-10-16, LE PIQUÉ QUI NE CRIE PLUS) le V8 de JOUER −9 dB : posé sur le ciel calme, avec le lâcher et le vent, c'était le gros du BOOM du départ (+15 à +20 dB en 200 ms, mesuré) */ // (2026-10-14, session SON) id9/st9 pris À L'APPUI (le son peut partir plus tard, en pause)
  if(SND.sfx&&!paused){ if(AC&&AC.state!=='running')AC.resume().then(f9).catch(function(){}); else f9(); }
  else if(SND.sfx&&paused&&SONV2&&PSON_ON)f9(); /* (2026-10-16) LE CLIC DANS LA PAUSE : il sonne tout de suite (sfx → pauseSon réveille le contexte le temps du clic) — l'attente ci-dessous reste pour ?pauseson=0 */
  else if(SND.sfx&&paused&&SONV2){const r9=k==='retour',t9=performance.now(),j9=uiClic._att=(uiClic._att|0)+1,w9=function(){if(j9!==uiClic._att)return;if((!paused||r9)&&AC&&AC.state==='running')f9();else if(performance.now()-t9<(r9?1200:700))setTimeout(w9,60);};setTimeout(w9,60);} /* (2026-10-14, session SON — relevé par DEBUGGING) UNE seule attente à la fois : la ligne QUITTER puis sa confirmation ouvraient chacune la leur, la sortie de pause les relâchait dans la même image (le son de danger doublé, 14-27 ms d'écart) ; la nouvelle remplace l'ancienne */ /* (QA 2026-09-29) REPRENDRE (« retour ») n'attend plus la fin de la pause : le 3-2-1 la tient ≥ 0,9 s, le clic était perdu — il part dès que le compte a réveillé le son */ /* (débogage son 2026-09-29) en pause : le clic attend (0,7 s au plus) que REPRENDRE réveille le son ; un interrupteur du panneau, lui, reste muet */
  }catch(e){} hap(k==='jouer'?[8,230,30]:8); } /* (2026-10-16) JOUER : le tic de la clé, puis le coup de gaz dans le pouce (≈ 250 ms, avec le VROUUM) */ // (2026-09-26) REPRENDRE : le contexte se réveille en asynchrone — la note attend qu'il tourne // en pause le moteur audio dort : la note s'empilerait et partirait en rafale à la reprise
/* LE FILET DES BOUTONS MUETS (2026-10-16, Sacha : « chaque bouton doit avoir un son lorsqu'on clique dessus dans l'interface, chaque curseur »).
   Les 94 uiClic sont posés à la main, bouton par bouton : ceux qu'on avait oubliés restaient muets. Le filet écoute tout clic d'un VRAI doigt
   (isTrusted), en capture : il retient le bouton touché puis, l'appui traité (setTimeout 0 : après tous les gestionnaires), si AUCUN son n'est
   parti depuis le contact (`UI_SON.t` : uiClic et tout sfx, sauf le micro-tic `ui.appui` et les boucles), il joue le clic du bouton — son rôle
   deviné (`uiFiletRole`) : interrupteur (on/off selon l'état neuf), onglet, retour/fermer, refus (verrouillé : aria-disabled, `.off`), l'or
   (ui.tap), sinon nav ; la vibration vient avec (uiClic). Un bouton qui sonne déjà par son action (équiper, acheter, la carte qui se retourne)
   n'est pas doublé : la règle de la session SON (GSON9) tient. Hors du filet : la course (volant, nitro), le canvas (la caisse qu'on tapote a
   sa tôle), les champs de texte, les curseurs (leur cran, plus bas), un bouton `.arme` (la touche qui attend, voulue muette), `data-muet`.
   `dbgFilet()` : combien de clics le filet a joués, et sur quoi. */
const UI_BTN_SEL='button,a[href],[role="button"],[role="tab"],[role="switch"],[role="menuitem"],[role="option"],[role="checkbox"],[data-m],[data-a],[data-c],[data-go],input[type="checkbox"],input[type="radio"],select,summary,label,'+APPUI_SEL;
function uiFiletRole(el){
  if(el.getAttribute('aria-disabled')==='true'||el.classList.contains('off'))return 'refus';
  const ty=(el.type||'').toLowerCase(),ro=el.getAttribute('role')||'';
  if(ty==='checkbox'||ty==='radio'||ro==='switch'||ro==='checkbox')return (el.checked||el.getAttribute('aria-checked')==='true')?'on':'off';
  if(el.hasAttribute('aria-pressed'))return el.getAttribute('aria-pressed')==='true'?'on':'off';
  const nom=((el.id||'')+' '+(typeof el.className==='string'?el.className:'')+' '+(el.getAttribute('aria-label')||'')).toLowerCase();
  if(ro==='tab'||/onglet|\btab|gtab|ivtab/.test(nom))return 'onglet';
  if(/close|ferme|retour|back|annul|croix|quitter/.test(nom))return 'retour';
  if(/pb-gold/.test(nom))return '';
  return 'nav';
}
addEventListener('pointerdown',function(){UI_SON.pd=performance.now();},{capture:true,passive:true});
addEventListener('click',function(e){
  if(!e.isTrusted||performance.now()<(uiGarde.t||0))return; // un .click() programmé (Entrée, interrupteurs) sonne par le bouton qu'il pousse · le verrou du double-tap avale ce clic-là
  let el=e.target&&e.target.nodeType===1?e.target:(e.target&&e.target.parentElement);
  for(let n=0;el&&n<8&&el!==document.body&&el!==document.documentElement;n++,el=el.parentElement){
    if(el.tagName==='CANVAS'||el.hasAttribute('data-muet'))return;
    if(el.matches(UI_BTN_SEL))break;
    try{if(getComputedStyle(el).cursor==='pointer')break;}catch(x){}}
  if(!el||el===document.body||el===document.documentElement||!el.matches)return;
  if(el.tagName==='LABEL'&&el.control)el=el.control; // l'étiquette d'une case : c'est la case qui bascule (son clic à elle suit, il sonnera on/off)
  if(el.closest('#tNitroZone,#tSteer,#touchCtl,#tNitro,#tLeft,#tRight,[data-muet]')||el.classList.contains('arme'))return;
  if(el.matches('input[type="range"],input[type="text"],input[type="search"],input[type="number"],input[type="email"],input:not([type]),textarea'))return;
  const t0=performance.now(),d0=t0-UI_SON.pd<1500?UI_SON.pd-30:t0-60; // depuis le CONTACT (un bouton qui agit au pointerdown a déjà sonné) ; au clavier, les 60 dernières ms
  setTimeout(function(){if(UI_SON.t>=d0)return;UI_SON.n=(UI_SON.n|0)+1;UI_SON.der=(el.id?'#'+el.id:el.tagName.toLowerCase()+(typeof el.className==='string'&&el.className?'.'+el.className.trim().split(/\s+/).join('.'):''));uiClic(uiFiletRole(el));},0);
},true);
/* LE CRAN DE TOUS LES CURSEURS (2026-10-16, même demande) : seuls les six curseurs de volume parlaient (`.volS`, câblés plus bas : ui.curseur à
   chaque dizaine de %) ; les autres (le présentoir des fruits, le cadrage de la boutique…) glissaient en silence. Même cran pour tous, à chaque
   dixième de leur course franchi (la hauteur suit la valeur, −10 à +8 demi-tons) — un tap qui fait sauter le curseur sonne aussi. */
function uiCranG(el){const lo=+el.min||0,hi=el.max===''?100:+el.max;return Math.floor(Math.max(0,Math.min(.999,((+el.value)-lo)/((hi-lo)||1)))*10);}
addEventListener('pointerdown',function(e){const el=e.target;if(el&&el.type==='range'&&!el.classList.contains('volS'))try{el._cranG=uiCranG(el);}catch(x){}},{capture:true,passive:true});
addEventListener('input',function(e){const el=e.target;if(!el||el.type!=='range'||el.classList.contains('volS'))return;
  try{const c9=uiCranG(el);if(el._cranG==null)el._cranG=c9;else if(c9!==el._cranG){el._cranG=c9;sfx('ui.curseur',{st:(c9-5)*2});}}catch(x){}},true);
window.dbgFilet=function(){return{joues:UI_SON.n|0,dernier:UI_SON.der||null,son:Math.round(UI_SON.t),contact:Math.round(UI_SON.pd)};};
window.dbgSens=function(l,n,p){if(l!=null||n!=null||p!=null)sensCoup(l||0,n||0,p||0);return{on:SENS,volant:VOLANT_PX,lissage:TCTL.doigt?VOL_LIS_D:VOL_LIS,tangage:+SCOUP.p.toFixed(3),roulis:+carRoll9.toFixed(3),pompe:+susY.toFixed(3)};}; // (2026-10-14, sensations) banc : dbgSens() = l'état · dbgSens(versLat,nez,pompe) = un coup dans la carrosserie
window.dbgTouch=function(){return{relais:TCTL.nHer||0,coupes:TCTL.nAnn||0,on:TCTL.on,pad:TCTL.pad,act:TCTL.act,st:+TCTL.st.toFixed(3),sv:+TCTL.sv.toFixed(3),dy:+(TCTL.dy||0).toFixed(1),seuil:+(driftEnCours?DRIFT_PX:Math.max(DRIFT_PX,TCTL.dyS)).toFixed(1),arc:TCTL.ar<0?null:+TCTL.ar.toFixed(1),exces:+(TCTL.tr>0?TCTL.ab/TCTL.tr*Math.max(0,TCTL.ox-TCTL.x0):0).toFixed(1),drift:driftEnCours,play:TCTL.play,steer:+steer.toFixed(3)};}; // console : l'état du volant tactile (un téléphone ne s'inspecte pas) — `seuil` : les px vers le bas qu'il faut dépasser pour entrer (ou rester) en drift · `arc` : la descente de l'arc du pouce à la butée droite, lue aux glissés · `exces` : ce que le bout de l'arc descend en plus, retiré à la butée
// LE GAZ, exposé : la vignette a besoin de savoir qu'on POUSSE, pas seulement qu'on va vite.
// (posé une fois par frame dans la physique, à côté de son `up` — une seule vérité, pas deux
// façons de relire les touches qui divergeraient le jour où on remappe le clavier)
let gasOn=false;
addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault();if(TCTL.on&&!e.repeat&&(e.code==='Space'||e.code==='Enter')&&boomSkip())return;if(e.code==='KeyP'){if(window.__panBascule){if(!e.repeat)window.__panBascule();}else togglePause();} /* (2026-09-28) en coque tactile P ouvre/ferme le panneau ⏸ (voir __panBascule) ; ailleurs, la pause de toujours */if(e.code==='Enter'&&!e.repeat&&started&&gameOver&&pendingScore==null&&!garageOn&&overlay.style.display!=='none'&&!(e.target&&e.target.closest&&e.target.closest('input,textarea'))&&!document.querySelector('#modale.on,#tPanel.open,#spinM.on')){const rp9=document.querySelector('body.touch #mDead.on [data-m="replay"]');if(rp9)rp9.click();else if(!document.body.classList.contains('touch'))playViaGarage();} // (2026-09-25) jamais depuis un champ ou une fenêtre ouverte ; en coque tactile, seul le bouton or de l'écran de mort
  if(e.code==='Space'&&!e.repeat&&started&&!gameOver){ // double-tap NITRO (<280 ms) = BRAQUAGE (e.repeat : une touche MAINTENUE ne compte pas)
    const n9=performance.now();
    // (le double-tap « DÉCOLLAGE » est retiré — voir styleFromBoost)
    lastSpaceT=n9;
  }
  /* ⚠ PLUS DE « N'IMPORTE QUELLE TOUCHE = DÉPART » (2026-09-25, user : « quand j'appuie sur espace dans la boutique ça
     lance une partie »). Le vieil écran-titre démarrait sur toute touche, et ce `start()` était resté branché sur TOUT
     le clavier : dans la boutique, le garage, les réglages, ESPACE sautait la séquence de départ et posait le HUD de
     course sur l'atelier. Désormais seule ENTRÉE, sur l'accueil, joue — par le même bouton que le doigt (auto-école
     comprise). */
  if(e.code==='Enter'&&!e.repeat&&(!started||MENUV.retour)&&!garageOn&&!(typeof stallOn!=='undefined'&&stallOn)&&!document.querySelector('#modale.on,#tPanel.open,#spinM.on')){ // (2026-09-28) la même garde que la branche de mort : la feuille CARRIÈRE, une fenêtre ou le panneau ouverts ne lancent plus la partie derrière · (2026-09-28) l'accueil d'après-mort (MENUV.retour) aussi
    const pb=document.querySelector('#mHome.on [data-m="play"]');if(pb)pb.click();
  }});
addEventListener('keyup',e=>{if((e.code==='Space'||e.code==='ShiftLeft'||e.code==='ShiftRight')&&keys[e.code])veqDoigt(false);keys[e.code]=false;});
addEventListener('keydown',e=>{if(!e.repeat&&(e.code==='Space'||e.code==='ShiftLeft'||e.code==='ShiftRight'))veqDoigt(true);},true); // (2026-10-14) LE TONNEAU : le double-tap NITRO au clavier (en capture : avant le gestionnaire du jeu)
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;try{document.querySelectorAll('#tNitro.on,#tLeft.on,#tRight.on').forEach(e=>e.classList.remove('on'));}catch(e){}}); // alt-tab : aucune touche ne reste coincée — (passe qualité) ni ENFONCÉE à l'écran (l'éclair restait appuyé)
/* LA CAISSE PLUS LOURDE (2026-10-15, Sacha : « augmente la gravité pour la voiture, c'est dérangeant : quand on fait une figure sur la
   route la voiture ne se pose pas — applique-le à la physique globale ») — GRAV_K est LE bouton de la gravité, et il n'y en a qu'un :
   FALL_G le porte, donc TOUT ce qui le lit suit d'un bloc (la chute, le vol plané à la nitro qui en reprend 60-75 %, le viseur, la durée
   de la figure du saut nitro, le vol équilibré, la mer de Jade, les filets et la coupe du fantôme tracés au générateur) ; la meute et les
   dos d'âne, qui tombaient à 26 écrit en dur, le prennent aussi. La pente de la route (GRAV) n'y est PAS : elle règle l'élan, pas le vol.
   ×1,3 : le saut nitro (21) dure 0,98 s au lieu de 1,27 et monte 23 % moins haut. `?grav=1` rend l'ancienne gravité, `?grav=1.5` pour essayer.
   (2026-10-17, Sacha, une 2e fois : « augmente la gravité des voitures : quand on fait une figure sur route on doit retomber sur la route plus
   vite ») ×1,3 → ×1,45 — et surtout `sautBesoin`, qui rallongeait le saut à la durée de CATALOGUE de la figure (1,1 à 1,9 s : plus long qu'à
   ×1 !), ne le rallonge plus que jusqu'au vol MINIMUM où la figure se plante (voir sautBesoin). Pourquoi 1,45 et pas plus : une chute plus
   lourde porte moins loin, et les RACCOURCIS en dépendent — MESURÉ (raccourcis.cjs, graine 1, palier 0, même trace rejouée) : le CANYON
   garde 21 raccourcis rentables à ×1,3, 20 à ×1,4, 18 à ×1,45 (0,69/km), 15 à ×1,5 (0,57/km : sous la règle des 0,6/km) ; forêt 29-31,
   volcan 4, inchangés. `?grav=1.3` = la veille. */
const GRAV_K=(function(){try{const v=parseFloat(new URLSearchParams(location.search).get('grav'));return v>0&&v<4?v:1.45;}catch(e){return 1.45;}})();
const GRAV=9.8*.55,FALL_G=33*GRAV_K,AXIS_Y=new THREE.Vector3(0,1,0),AIR_MAX=6;
/* LA GRAVITÉ DE L'ORBITE (2026-09-28, portée de la lignée car-crash) — l'orbite était un décor : mêmes sauts, même jauge qu'aux nuages.
   En ESPACE (niveau EN ORBITE et toute la carrière ESPACE) la gravité est DIVISÉE PAR DEUX : `gK()` est lu par TOUS les intégrateurs
   de chute (joueur, vol plané à la nitro, viseur, meute, dos d'âne, plots qui valsent) ; la jauge d'airtime passe de 6 à 10,2 s
   (`airMax()`) — un saut deux fois plus haut ne doit pas exploser en plein ciel. ⚠ Le VOL PLANÉ à la nitro reprend une PART de la
   gravité : il est ×gK lui aussi, sinon il la battrait (.6 × 33 > .5 × 33) et la caisse monterait toute seule. Mesuré là-bas :
   même impulsion → 13,5 m de haut contre 6,7. Jamais au parc (ses sauts sont réglés à part). */
const ORB_G=.5,ORB_AIR=5/6; /* (2026-10-14 soir, Sacha : « dans l'espace 5 secondes de air time ») la jauge de l'espace passe de 10,2 s à 5 s (6 × 5/6) : moins que sur Terre, alors que les sauts y montent deux fois plus haut — voulu */
function gK(){return (LVL.espaceA>=.5&&!PARK.on)?ORB_G:(DN.gx>1?DN.gx:1);} /* (2026-10-23, DUNES) DN.gx : la pesanteur d'un vol de tremplin, tirée à la vitesse du décollage (voir dnLevre) — plus on va vite, plus la caisse retombe vite : elle se pose sur l'ÉPAULE à toute vitesse */
function volSens(){return SAVE.d&&SAVE.d.volH==='plonge'?1:-1;} // (2026-10-10) absent = MONTE
function volhBascule(){SAVE.d.volH=volSens()<0?'plonge':'monte';SAVE.flush();} // (2026-09-30, R7-5) LE seul écrivain de « POUCE HAUT EN VOL » : les RÉGLAGES et la PAUSE passent par lui // (2026-09-29) « pouce en HAUT = monte » : l'assiette au pouce s'inverse (le clavier ne change pas)
function airMax(){return AIR_MAX*(gK()<1?ORB_AIR:1);}
// AIR_RATE : le vol se joue PLUS VITE en temps réel — la parabole dans l'espace est identique
// (viseur d'atterrissage + seuils de figures inchangés), mais on passe moins de temps à flotter.
let fallVH0=-1; // (vol v6) vitesse HORIZONTALE au décollage : au-delà, la traînée de la route s'applique en vol
let AIR_RATE=1; // base V1 (temps réel) — startFall le RE-pilote depuis 2026-07-20 : =1 sous 450 km/h affichés, puis rampe douce jusqu'au cap 1.35 (l'ancienne ère 2.3 COMPENSAIT SPD=.25 ; ici c'est un dosage de tempo, pas une compensation).
const PARK={on:false}; // MODE FREESTYLE : le parc de figures (pas une course). Armé au menu, persiste entre les runs. Neutralise police/mort/portail.
const PARK_VCAP=145; // PARC : plafond de vitesse (m/s ≈ 260 km/h affichés) — la nitro infinie ne DOIT PAS envoyer à 1000 km/h ingérables ; on garde une vitesse RAPIDE mais CONTRÔLABLE (sol ET air)
const SPD=0.48; // +20 % (2026-09-25, user : « augmente la vitesse global du jeu et des voitures de 20 % ») — 0.4 × 1,2 ; il venait de −20 % (0.5 → 0.4) le matin même —  // vitesse globale du jeu — RESTAURÉ à la valeur V1 (2026-07-19) : le ÷2 « trop rapide dès le début » tuait le fun nerveux/arcade de la V1 ; le user tranche pour la V1. SPD scale TOUT : avance joueur/bots, chute, viseur ET compteur (donc les km/h affichés DOUBLENT — seuils de sensation ABSOLUS ajustés en conséquence, les systèmes RELATIFS via vmaxShow s'ajustent seuls)
const BOOM_SOL={ok:false,p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()}; // (2026-09-28) le bitume sous l'explosion : ses pièces y rebondissent
/* (2026-10-14, sensations) L'ÉPAVE GARDE SON ÉLAN. Les pièces partaient en étoile depuis un point FIXE : à 200 km/h la caisse
   s'arrêtait net dans l'air, comme collée. Elles héritent d'une part de sa vraie vitesse (PT_U.uVc, celle que suit la caméra) : 22 %,
   12 m/s au plus — au sol la roue file DEVANT, dans le vide la pluie de tôle continue de TOMBER. Les éclats, plus légers, moitié moins.
   Pas contre un MUR (tour, façade, pic : rien ne traverse). debrisLoin repasse derrière : jamais vers l'objectif. */
const SENS_BOOM={v:new THREE.Vector3(),n:0,t0:0};
function sensBoomElan(){
  if(mortCause==='tour'||mortCause==='facade'||mortCause==='pic')return;
  const V=SENS_BOOM.v.copy(PT_U.uVc.value),l=V.length();if(!(l>3))return; // (un NaN ne passe pas)
  V.multiplyScalar(Math.min(12,l*.22)/l);
  for(const d of debris){if(!d||!d.v)continue;d.v.addScaledVector(V,d.part?1:.5);debrisLoin(d.v);}
}
/* (2026-10-14, sensations) LE REBOND SE SENT. Roue, capot, éclats rebondissaient sur la dalle en silence, tous pareils (×.55 partout).
   · une ROUE (clone d'un moyeu : userData.R) est en caoutchouc : elle garde son élan le long de la route (×.83 au lieu de ×.55),
     saute un peu plus haut et TOURNE à la vitesse où elle file — elle s'en va en rebondissant au lieu de tomber comme une plaque ;
   · toute pièce qui tape à plus de 3 m/s crache quelques étincelles qui COURENT au ras du bitume (sparkGold, 2 à 5) ;
   · les vraies pièces font cliqueter la tôle (debris.tole, dosé au choc) et les deux premières donnent un tap léger dans la main —
     après le motif de la mort (boomT > .35 s), par le limiteur commun. Dix rebonds comptés par mort, pas un de plus. */
function sensBoomRebond(d,vn){
  if(boomT<SENS_BOOM.t0)SENS_BOOM.n=0;SENS_BOOM.t0=boomT; // une mort neuve : le compte repart (boomT est reparti de 0)
  const N=BOOM_SOL.n,V=d.v,k=V.dot(N),p=d.m.position,roue=!!(d.part&&d.m.userData&&d.m.userData.R>0);
  if(roue){V.addScaledVector(N,-k).multiplyScalar(1.5).addScaledVector(N,k*1.6); // le long de la dalle ×1,5 · vers le haut ×1,6
    d.rx=(d.rx<0?-1:1)*Math.min(18,V.length()/Math.max(.2,d.m.userData.R));d.ry*=.4;}
  if(SENS_BOOM.n>=10)return;SENS_BOOM.n++;
  const ne=Math.min(5,2+(vn*.25|0));
  for(let i=0;i<ne;i++){const h=1+Math.random()*2.5; // elles décollent à peine de la dalle (le long de SA normale : vrai aussi sous la route)
    spawnP(sparkGold,p.x,p.y,p.z,V.x*.7+N.x*h+(Math.random()-.5)*7,V.y*.2+N.y*h,V.z*.7+N.z*h+(Math.random()-.5)*7,.22+Math.random()*.2);}
  if(!d.part)return;
  sfx('debris.tole',{vol:Math.max(-12,Math.min(0,-11+vn*.7))});
  if(SENS_BOOM.n<=2&&boomT>.35)sensHap(10,1);
}
/* (2026-10-14, sensations) LA PLUIE DE BRAISES REBONDIT. Les braises orange et jaunes retombent en arc (acc 13 / 16) mais passaient
   À TRAVERS la dalle : elles s'éteignaient sous la route. Sur le plan de BOOM_SOL (mort au sol seulement, dans la largeur de la route),
   elles sautillent — 45 % du choc rendu, 30 % de frottement — et meurent en dansant sur le bitume. ≤ 100 cases, zéro allocation ;
   une réserve endormie ne coûte rien. Le rebond ne dépend pas du pas : il se déclenche au contact, la gravité reste à updatePool. */
function sensBoomBraises(P){
  if(!P||P.dort)return;
  const p=P.pos,v=P.vel,L=P.life,S=BOOM_SOL,nx=S.n.x,ny=S.n.y,nz=S.n.z,ox=S.p.x,oy=S.p.y,oz=S.p.z,bx=S.b.x,by=S.b.y,bz=S.b.z;
  for(let i=0,j=0;i<P.n;i++,j+=3){if(!(L[i]>0))continue;
    const dx=p[j]-ox,dy=p[j+1]-oy,dz=p[j+2]-oz,h=dx*nx+dy*ny+dz*nz;if(h>=.06||h<-1.5)continue;
    const vn=v[j]*nx+v[j+1]*ny+v[j+2]*nz;if(vn>=0||Math.abs(dx*bx+dy*by+dz*bz)>ROAD_HALF)continue;
    const r=.06-h,w=-.45*vn; // remise sur la dalle · la vitesse de rebond
    p[j]+=nx*r;p[j+1]+=ny*r;p[j+2]+=nz*r;
    v[j]=(v[j]-nx*vn)*.7+nx*w;v[j+1]=(v[j+1]-ny*vn)*.7+ny*w;v[j+2]=(v[j+2]-nz*vn)*.7+nz*w;}
}
/* (2026-10-14, sensations) CONTRE UN PIC DE JADE, ON S'ÉCRASE. La mort 'pic' était la seule sans signature : même étoile, pas de son
   de cause. La roche ne se traverse pas : la part de vitesse de chaque pièce qui FONÇAIT dans le pic repart en arrière (un quart rendu,
   doux : rien ne vole vers l'objectif), une gerbe d'étincelles gicle à rebours du choc, et la pierre craque (`cratere`, baissé de
   7 dB sous l'explosion — faute d'un vrai son de roche, voir les notes). Instantané : rien n'attend, rien ne dure. */
function sensBoomRoc(){
  if(mortCause!=='pic')return;
  const V=SENS_BOOM.v.copy(PT_U.uVc.value),l=V.length();if(!(l>3))return;
  V.multiplyScalar(1/l);
  for(const d of debris){if(!d||!d.v)continue;const a=d.v.dot(V);if(a>0)d.v.addScaledVector(V,-1.25*a);}
  const k=Math.min(1,l/60);
  for(let i=0;i<12;i++){const u=5+Math.random()*(6+10*k);
    spawnP(sparkGold,boomPos.x,boomPos.y,boomPos.z,-V.x*u+(Math.random()-.5)*9,-V.y*u+2+Math.random()*5,-V.z*u+(Math.random()-.5)*9,.3+Math.random()*.3);}
  if(!TUTO.on)sfx('cratere',{vol:-7});
}
const FVISEE={p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()}; // le point de la route que la caméra regarde (route v2)
/* ================= LA CAMÉRA DE ROUTE S'ADAPTE (vague 3, 2026-09-27) =================
   Sacha : « quand on est à l'envers de l'autre côté de la route, et que du coup on a l'impression que ça monte beaucoup, il faut que
   la caméra fasse un truc pour s'adapter ». Mesuré (`dbgCamRoute`, portrait 390×844) : la piste PLONGE sans cesse (pente −0,2 à −0,74),
   par paliers — chaque départ de plongée est un SOMMET. Vu du dessus, un sommet dérobe la route (on voit le ciel) ; vu du DESSOUS, le
   même sommet devient un MUR : la route s'y cabre de +13 à +23° à 45-60 m, l'axe de la caméra fait 25 à 34° avec elle, la dalle sombre
   monte en rampe jusqu'au tiers haut de l'écran — et l'horizon, qui dessus flotte AU-DESSUS de la route (+0,31 à l'écran), est dessous
   caché DERRIÈRE elle (−0,16 à −0,36) : tout crie « ça grimpe », pendant que la caisse accélère en descente. (Le monde à l'envers, lui,
   ne se corrige pas : remettre le ciel en haut inverserait la gauche et la droite à l'écran.) Deux gestes de CAMÉRA — conduite,
   physique et aides intouchées :
     · LE CABRAGE ANTICIPÉ — la caméra lit la route ~0,65 s devant et PIVOTE AUTOUR DE LA CAISSE d'une part de son cabrage : devant un
       mur, elle lève le nez et descend un peu sous l'axe (la rampe redevient une route qui file) ; devant un sommet, elle monte et
       pique (la route qui se dérobe reste à l'écran). Pivoter autour de la caisse la laisse PILE à sa place à l'écran ; le retard latéral,
       la penche et le regard qui suit la route restent ceux d'avant. Plus franc DESSOUS, où chaque plongée commence par un mur.
     · LE TONNEAU — passer dessus ↔ dessous (atterrir sous la dalle, repartir en bac à sable après une mort) interpolait le haut de la
       caméra vers son OPPOSÉ : un vecteur mêlé à son contraire ne tourne pas, il RÉTRÉCIT — mesuré, le haut de l'écran restait collé à
       l'ancienne face jusqu'à 0,5 s (la caisse pendue au plafond, la dalle en rampe au-dessus d'elle : LE « ça monte beaucoup »), puis
       basculait d'un coup en passant par zéro, ~1,2 s pour se poser. Désormais la caméra ROULE autour de l'axe du regard en orbitant
       autour de la caisse, d'un seul geste : posée en ~0,2 s.
   Zéro allocation par image. */
const CAM_ROUTE={
  ANTICIPE:.5,           // part du cabrage à venir que la caméra prend d'avance, sur le DESSUS (0 = collée au bitume sous la caisse, 1 = déjà dans la pente)
  ANTICIPE_DESSOUS:.9,   // … sur le DESSOUS, où chaque départ de plongée est un mur
  VOIR_LOIN:.65,         // s — la route à venir est lue à la distance parcourue en ce temps…
  LOIN_MIN:38,LOIN_MAX:90, // m — … bornée (à 1500 km/h, 0,65 s dépasserait la courbe)
  HAUT_MAX:22,           // ° — nez levé au plus…
  GARDE:12,              // ° — … en gardant la caméra au moins à ce site au-dessus du bitume derrière la caisse (paysage : moins de marge)
  BAS_MAX:24,            // ° — nez piqué au plus (sommet, route qui se dérobe)
  LISSE:.2,              // s — lissage du pivot : ni à-coup ni retard sensible
  TONNEAU:7,             // 1/s — vitesse du tonneau dessus ↔ dessous (l'essentiel en ~0,3 s : un geste franc, la traversée de la dalle ne dure qu'un éclair)
  phi:0,sg:1,vif:false,enCours:false,ax:new THREE.Vector3(),v:new THREE.Vector3(),w:new THREE.Vector3(),q:new THREE.Quaternion(),
  FA:{p:new THREE.Vector3(),t:new THREE.Vector3(),n:new THREE.Vector3(),b:new THREE.Vector3()}
};
function camRouteTonneau(cible,axe,dt){ // LE TONNEAU : `cible` = l'écart caisse→caméra voulu, `axe` = l'axe du regard (unitaire)
  const C=CAM_ROUTE;C.vif=false;if(!C.TONNEAU){C.enCours=false;return;} // (TONNEAU:0 = le comportement d'avant, pour comparer)
  C.v.copy(camUp).addScaledVector(axe,-camUp.dot(axe));C.w.copy(F.n).addScaledVector(axe,-F.n.dot(axe));
  if(C.v.lengthSq()<1e-4||C.w.lengthSq()<1e-4)return;
  C.v.normalize();C.w.normalize();
  let a=Math.atan2(C.ax.crossVectors(C.w,C.v).dot(axe),C.v.dot(C.w)); // de combien la caméra est ROULÉE par rapport à la face (autour du regard)
  if(Math.abs(a)>3.05)a=3.05*C.sg;C.sg=a<0?-1:1; // pile à l'opposé : on garde le sens déjà engagé (sinon il hésiterait d'une image à l'autre)
  const aA=Math.abs(a);
  if(aA>1.05)C.enCours=true;else if(aA<.09)C.enCours=false; // un tonneau s'engage au-delà de 60° de roulis et va jusqu'au bout (< 5°)
  if(!C.enCours&&aA<.5)return; // la conduite de tous les jours (< 29°) : rien ne change, l'interpolation d'avant s'en charge
  let r=a;
  if(C.enCours){C.vif=true;r=a*Math.exp(-dt*C.TONNEAU);C.q.setFromAxisAngle(axe,r-a);camUp.applyQuaternion(C.q);} // le haut ROULE (il ne passe plus par zéro)
  C.q.setFromAxisAngle(axe,r*(C.enCours?1:THREE.MathUtils.smoothstep(aA,.5,1.05)));cible.applyQuaternion(C.q); // la place voulue roule avec lui : la caméra orbite autour de la caisse au lieu de couper la dalle
}
/* (2026-10-18, Sacha : « oui : redresse la caméra sur le glacier seulement, pour qu'on voie la pente en roulant ») LA CAMÉRA DU GLACIER.
   La caméra de route s'incline avec la piste : à 70 % de pente, la glace remplissait l'écran comme un parking plat. Au glacier (v4, sur la
   piste), le CABRAGE ANTICIPÉ prend en plus une part `k` de la pente sous la caisse : tout le plan pivote autour de la caisse, nez levé vers
   l'horizon — la caisse reste à sa place à l'écran, la piste devant elle PLONGE, les pics se redressent. Le plafond du cabrage (`haut` :
   CAM_GLACIER.max = 30°, et la caméra garde 12° au-dessus de la glace derrière la caisse) borne le geste : ~22-24° debout, ~10° couché.
   ⚠ Ne pas MONTER la caméra pour redresser plus : essayé (banc), la caisse descend et rapetisse à l'écran — le pivot seul la garde à sa place.
   `?glaciercam=0` = la caméra d'avant. Partout ailleurs : zéro. */
const CAM_GLACIER={on:!/[?&]glaciercam=0\b/.test(location.search),k:.9,max:40,garde:12,monte:2,recul:1}; /* (2026-10-19, Sacha : « fais une caméra du glacier qui montre la pente, vue plus haute qui plonge » — choisie sur planche parmi 3 : l'actuelle k ,8/max 30/monte 1, « 1 » ci-contre, « 2 » monte 2,6/recul 1,2/k 1/max 45) la caméra MONTE ×2 avec la pente, et le cabrage redresse jusqu'à ~28° (11° avant) : plus de piste qui part devant et de paysage ; la caisse un peu plus basse et plus petite à l'écran */ // k : part de la pente redressée · max : plafond (°) · garde : site mini (°) de la caméra au-dessus de la glace derrière la caisse (7 essayé : vue rasante, les roues passaient derrière la glace)
function camGlacier(){ // la part de pente (rad, ≥ 0 en descente) que la caméra du glacier redresse
  if(!CAM_GLACIER.on||side<0||!banqOk())return 0;
  const h=Math.hypot(F.t.x,F.t.z);return Math.max(0,Math.atan2(-driveDir*F.t.y,h))*CAM_GLACIER.k;}
function camGlacierM(i){const g9=camGlacier();if(!(g9>0))return 1;const m9=Math.min(1,g9/(.61*CAM_GLACIER.k));return 1+((i?CAM_GLACIER.monte:CAM_GLACIER.recul)-1)*m9;} // (2026-10-19) LA VUE QUI PLONGE : au glacier, la caméra MONTE (×monte) et RECULE (×recul) avec la pente (pleine dose à 35°) — plus haute, le cabrage peut redresser davantage sans passer sous la glace derrière la caisse
function camRouteCabrage(dt,camBack,camH){ // LE CABRAGE ANTICIPÉ : pose C.q, le pivot à appliquer autour de la caisse
  const C=CAM_ROUTE,D=THREE.MathUtils.clamp(Math.abs(vA)*SPD*C.VOIR_LOIN,C.LOIN_MIN,C.LOIN_MAX);
  frameAt(THREE.MathUtils.clamp(s+driveDir*D,0,L-.01),C.FA);
  const th=Math.atan2(driveDir*C.FA.t.dot(F.n),C.FA.t.dot(F.t)), // le cabrage de la route là-bas, dans le plan (tangente, normale de TA face) d'ici — + = elle se lève
        gl9=camGlacier()>0,haut=Math.max(0,Math.min(gl9?CAM_GLACIER.max:C.HAUT_MAX,Math.atan2(camH,camBack)*57.3-(gl9?CAM_GLACIER.garde:C.GARDE)))/57.3, // (2026-10-18) au glacier : le plafond et la garde de CAM_GLACIER
        vise=THREE.MathUtils.clamp(th*(side<0?C.ANTICIPE_DESSOUS:C.ANTICIPE)+camGlacier(),-C.BAS_MAX/57.3,haut);
  C.phi+=(vise-C.phi)*(1-Math.exp(-dt/C.LISSE));
  C.ax.crossVectors(F.t,F.n).multiplyScalar(driveDir).normalize(); // tourner autour de cet axe fait monter l'avant vers la normale
  C.q.setFromAxisAngle(C.ax,C.phi);
}
/* (2026-09-30, caméra) DEUX RÉGLAGES DE LA CAMÉRA DE ROUTE, chacun derrière UNE constante — `on:false` rend la caméra d'avant
   (A/B au banc : `dbgCamRoute({regard:{on:false},taille:{on:false}})`). Mesurés par projection perspective (portrait 390×844, route plate) :
   · CAM_REGARD — le regard qui suit la route (route v2) visait un point FIXE à 35 m : 0,5 s d'avance à 250 km/h, 0,14 s à 900. Au rayon mini
     de la caisse, l'œil partait de 8,8° vers la sortie du virage à 250 km/h… et de 4,7° seulement à 900 — alors qu'en portrait le champ
     horizontal est étroit (52° au repos, 77° en croisière). La distance suit désormais la vitesse d'AVANCE réelle (vitMult compris : NITROOO,
     VITESSE ×2) : `k` s d'avance, bornée [min,max]. ⚠ Le regard est un MÉLANGE DE POSITIONS : à poids égal, un point à 90 m tire l'angle
     1,5× plus fort qu'à 35 m (part d'angle ,54 → ,81 : lacet 20,8° à 720 km/h, la caisse rejetée à mi-chemin du bord de l'écran) et, en ligne droite, relève
     l'assiette de 4° (la caisse glisse vers le bas de l'image, contre tout le cadrage portrait). `comp` garde la même PART D'ANGLE qu'à `min`
     (poids × min/D) : en ligne droite rien ne bouge, dans un virage l'œil part vers la sortie autant à 900 km/h qu'à 150 (12-14° au rayon
     mini). Portrait : poids ×(1+por). La fenêtre où le regard s'efface (point de route trop loin de la visée) grandit avec D (40-100 m à 35 m).
   · CAM_TAILLE — en portrait, la NITRO RAPETISSAIT la caisse, pile quand le feu et le dragon doivent se voir : le champ (fovPor, plafond 150°)
     passait de 120° en croisière à 141° en nitro tenue, 146° en réserve bleue, 141-148° sous NITROOO ; recul et hauteur grandissaient avec
     speedKmh, qui compte ×2,6 sous NITROOO (palier 20 : recul 7,4 m et hauteur 9,5 m, contre 4,7 et 4,4 en croisière). Taille de la
     caisse à l'écran, croisière = 1 (paliers 10 et 20) : 0,44 en nitro tenue, 0,38 en bleu, 0,23 à 0,35 sous NITROOO. En portrait (POR>.5)
     le champ final passe par un GENOU (inchangé sous fovMax−genou, tend vers fovMax au-dessus) et la part VITESSE du recul et de la hauteur
     s'arrête à `recMax` m de recul (≈333 km/h ; la hauteur suit, sinon la caméra grimpe et l'angle plonge — ⚠ ça rapproche aussi la
     croisière des hauts paliers : +15 % de caisse au palier 20). Après : 0,65 à 0,68 de la croisière en nitro, en bleu comme sous NITROOO.
     L'ouverture « ça pousse » reste entière de 94° (repos) à ~120° (croisière), et les COUPS de champ (fovPunch : allumage, pad, drift,
     palier) passent PAR-DESSUS le genou, intacts. `boost` : part du recul de nitro (camBoost) gardée en portrait — c'est lui qui fait
     l'essentiel du 0,65 restant (à ,5 : 0,75) ; 1 = inchangé. */
const CAM_REGARD={on:true,k:.45,min:35,max:90,por:.3,comp:1,D:35,kV:0}; // D, kV : lus par dbgCamRoute (dernière image)
const CAM_TAILLE={on:true,fovMax:125,genou:6,recMax:.6,boost:1};
/* (2026-10-17, LA CAMÉRA SANS SURSAUT) LA REPRISE DE CONDUITE se reconnaît à un trou de plus de CAM_REPRISE ms dans la conduite (garage,
   pause, respawn ; le retour d'un vol, lui, est signalé par startFall). À 150 ms, une image qui tousse (ramasse-miettes, programme compilé
   au 1er nitro — sur iPhone 150 à 300 ms) passait pour une reprise : la visée perdait son pivot (`phi=0`), la caméra se recalait d'1,5 m
   sur le côté et le champ repartait d'ailleurs — un second sursaut juste après le premier. Les vraies absences durent plus d'une seconde. */
const CAM_REPRISE=400;
/* LA CAMÉRA HÉROS (2026-09-30, session SON — Sacha : « la voiture est souvent trop petite pour l'écran, surtout sur mobile : trouve des trucs
   de caméra pour la jouabilité et la sensation de vitesse, surtout sur route »). MESURÉ (banc cam-mesure2.js, `dbgCamRoute().caisse`, image
   normale — ⚠ en rendu logiciel chaque image passait pour une « reprise de conduite » et la caméra reculait de v·dt : `dbgCamReprise`) :
   le coupable n'était pas le recul (5,6-7,6 m) mais le CHAMP, grand ouvert EN PERMANENCE avec la vitesse : 123-131° en portrait,
   107-144° couché (où CAM_TAILLE ne joue pas) — un fish-eye où la caisse ne faisait que 29-44 % de la largeur debout, 3 À 8 % couché ; et la
   NITRO (tenue presque tout le temps) reculait encore la caméra de 1,6 m.
   LES TRUCS :
   · le champ TENU s'ouvre deux fois moins avec la vitesse (+20° au lieu de +38, nitro +8 au lieu de +15/22, FLOW ×½) ;
   · « ÇA POUSSE » se dit par l'ACCÉLÉRATION : chaque prise de vitesse (pad, nitro, relance) ouvre le champ de `kick`°, qui se referme
     doucement quand la vitesse se stabilise — c'est le CHANGEMENT qui se sent, pas le champ grand ouvert ;
   · le VERTIGO (travelling compensé) : quand le champ s'ouvre, la caméra AVANCE d'autant (`dolly`) — la caisse garde sa taille, c'est le
     monde qui s'étire autour d'elle ;
   · la nitro ne recule plus la caméra (`boost` : 20 % du recul d'avant) — le coup de champ de l'allumage reste ;
   · à haute vitesse la caméra DESCEND un peu vers la route (`bas`) : le bitume défile plus fort ;
   · debout, la visée descend (`vise`) : la caisse remonte entre le HUD du haut et les commandes du bas ;
   · un voile de FLOU de vitesse sur les BORDS en croisière rapide (`flou`, le centre reste net).
   A/B : dbgCamRoute({heros:{on:false}}). */
const CAM_HEROS={on:true,ref:86,dMin:.88,dMax:1,kick:16,accK:200,tau:.6,acc:0,v0:-1,boost:.2,bas:.08,vise:1.2,recP:1.1,flou:.2,fovMaxL:112,genouL:8,leve:.09,lk:0,
  /* (2026-09-30, relevé par GRAPHISME au banc du HUD) debout, l'arrière de la caisse descendait à ~750 px : sous le bouton NITRO (744-828) et
     l'anneau du volant (656-748). La visée n'y pouvait presque rien (le regard est tiré vers la route au loin, CAM_REGARD) → on DÉCENTRE
     L'OBJECTIF : toute l'image monte de `leve` (en NDC, ×POR), sans changer ni la taille ni la perspective (l'objectif à bascule du
     photographe). Il s'efface en vol (lissé : pas de saut de 38 px au décollage). Le garage gère SON décentrement (setViewOffset) : ici on
     ajoute au terme de la matrice juste après updateProjectionMatrix, une fois par image. */
  leveApplique:function(dt,cible){this.lk+=((this.on?cible:0)-this.lk)*Math.min(1,dt*3);const d=this.leve*POR*this.lk;if(Math.abs(d)<1e-4)return;
    camera.projectionMatrix.elements[9]-=d;camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();},
  dolly:function(f){if(!(f>0))return 1;const r=Math.tan(fovPor(this.ref)*Math.PI/360)/Math.tan(Math.min(170,f)*Math.PI/360);return THREE.MathUtils.clamp(r,this.dMin,this.dMax);}};
function camTailleOn(){return CAM_TAILLE.on&&POR>.5;}
function camTailleFov(f){const T=CAM_TAILLE,K=T.fovMax-T.genou;return f<=K?f:K+T.genou*(1-Math.exp(-(f-K)/T.genou));} // le genou : pente 1 à K, tend vers fovMax
const ASSIST_VIRAGE=0; // (conduite v6) ZÉRO : la caisse ne suit plus la route toute seule — c'était l'« aimant » (elle prenait 78 % de chaque virage, 99,5 % avec le cap visé)
const TURN_HS=.0035; // pénalité de braquage à haute vitesse (avant .008 — plus petit = virages plus faciles)
const CAP_V0=20,CAP_V1=.08;  // vitesse LATÉRALE plein pouce (m/s monde) = 20 + 8 % de l'avance : 23 m/s à 145 km/h, 33 m/s à 590
const CAP_YAW=1.6,CAP_RET=2; // plafond de lacet (× le gain historique, TURN_HS compris) ; ×2 quand le cap REVIENT : lâcher = filer droit tout de suite
/* (conduite v6, 2026-09-25 soir) LE POUCE FAIT TOURNER LA CAISSE. User : « il y a un centrage automatique : quand je ne touche à
   rien, je reste quand même sur la route ». MESURÉ (banc v6/conduite/diag) : pouce lâché, la caisse prenait 99,5 % de chaque virage
   (78 % par ASSIST_VIRAGE, 21,5 % par le cap visé qui se réalignait sur la ROUTE) — elle ne tombait dans aucun virage testé. Le cap
   visé était relatif à la route : lâcher = se remettre dans l'axe = l'aimant. DÉSORMAIS le pouce commande une VITESSE DE LACET
   (comme un volant) : pouce lâché, la caisse garde son cap dans le MONDE et file tout droit — dans un virage, elle sort si on ne
   tourne pas. `lacetMax(v)` = lacet plein pouce = v / rayon mini, le rayon mini grandit avec la vitesse (61 m à 250 km/h, 100 m à
   720) ; VOL_TAU = l'inertie de la caisse (elle met 0,1 s à prendre son lacet : elle PÈSE). Banc (pilote réaction 150 ms, route ÷2,
   virages mis à l'échelle par `lvPiste`) : 0 sortie/km jusqu'au palier 10 sans nitro, pouce moyen 20-26 %, et pouce lâché dans un
   R 150 → dehors en 1,2 s. La glisse n'existe plus qu'en DRIFT VOLONTAIRE (pouce tiré vers le bas / ↓) : le nez tourne plus que la
   trajectoire (`slipB`, jusqu'à ~20°) — une vraie glisse, qui se voit ET se conduit. */
const VOL_R0=40,VOL_RK=.3,VOL_TAU=.1;
function lacetMax(v){const vw=Math.max(8,Math.abs(v)*SPD);return vw/(VOL_R0+VOL_RK*vw);} // rad/s au plein pouce — ×spdMult dans la boucle (HAUTE VITESSE, 2026-09-30)
/* (2026-10-14, GAMEPLAY — LECTURE SEULE, la règle commune des maps : passation/RACCOURCIS.md) « Plus la vitesse du palier est élevée, plus les virages
   doivent être larges. » `vPalier(t)` : la vitesse de croisière MONDE (m/s) du palier moteur t (par défaut le palier courant) — le même calcul que
   `lvPiste` (palier +2, overdrive, poussée). `rayonPalier(t)` : le rayon mini qu'on TIENT volant à fond à cette vitesse (lacetMax : r = R0 + RK·v).
   Un virage d'axe plus serré que `rayonPalier` ne passe PAS à la vitesse du palier ; entre 1 et 1,5 × rayonPalier, c'est un virage SERRÉ (volant à
   fond) ; au-delà, il passe au pouce. Rien ne les appelle dans le jeu : ce sont les mesures du banc (cc-banc/raccourcis.cjs) et des générateurs de pistes. */
function vPalier(t){const u=Math.min(ENGINE_TIERS.length-1,((t==null?engTier:t)|0)+2);return 2.75*CARS[0].maxKmh/3.6*engLate(u)*ENGINE_TIERS[u].push*SPD;}
function rayonPalier(t){return VOL_R0+VOL_RK*vPalier(t);}
/* LE BALAYAGE (2026-09-30, HAUTE VITESSE). Plots, pads, dos d'âne et flaques se testaient en UN POINT (`|s−objet| < w`) : la caisse avance
   de km/h ÷ 3,6 ÷ images/s par image — à 30 i/s (iPhone bridé) un plot (w 2,6) devenait fantôme au-delà de ~560 km/h, un dos d'âne (w 2,2)
   de ~475, une flaque (w 4-5) de ~860 ; à 60 i/s, le double. On teste désormais le TRAJET de l'image, comme la catapulte : l'écart latéral
   le plus serré pendant que la caisse RECOUVRE l'objet (|s−so| ≤ w), `lat` interpolé le long du trajet (sA→sB, lA→lB). Infinity = pas de
   recouvrement. Au pas, le trajet est un point : c'est l'ancien test (il en est un sur-ensemble). */
function balEcart(so,w,sA,sB,lA,lB,lo){
  const a=Math.max(Math.min(sA,sB),so-w),b=Math.min(Math.max(sA,sB),so+w);
  if(a>b)return Infinity;
  const d=sB-sA;if(Math.abs(d)<1e-6)return Math.abs(lB-lo);
  const ea=lA+(lB-lA)*(a-sA)/d-lo,eb=lA+(lB-lA)*(b-sA)/d-lo;
  return ea*eb<=0?0:Math.min(Math.abs(ea),Math.abs(eb));
}
let yawR=0,slipB=0,glisse9=0,routeLacet=0; // lacet courant · angle de glisse (drift) · glisse ressentie (fumée, crissement)
const AIR_ASSIST=0; // (conduite v6) règle n°1 : aucun recentrage, en vol non plus — était .2 ; // aide au recentrage en vol (0 = off), monte avec la vitesse — ÷5 (2026-09-25, user : « un effet qui t'attire vers le centre de la route, trop puissant, baisse-le au point qu'il ne soit plus remarquable ») : à 1,0 un ressort de 0,7·écart m/s² ramenait la caisse sur l'axe en plein vol ; il reste un filet qu'on ne sent plus
const CAM_SHAKE_V=.45; // intensité du tremblement caméra lié à la vitesse (position + roulis) — .78→.45 : un frémissement, plus un séisme (user : « c'est trop »)
// OVERDRIVE : il suivait le NIVEAU DE CAISSE (+8 %/niveau à partir du 6e). Depuis que la caisse est
// équipée au choix, ça revenait à vendre de la vitesse au garage. Il suit désormais le PALIER MOTEUR,
// calé pour que le sommet donne exactement le même +50 % qu'avant (palier 22 sur 30 et au-delà).
function lateMul(){return engLate(engTier);}
function engLate(t){return 1+Math.min(.5,Math.max(0,t-8)*.035);} // (2026-09-30) l'overdrive d'UN palier donné : lateMul (le palier courant), lvPiste (+2) et engGain (les deux paliers comparés) le lisent ici
/* (piste v6) L'ÉCHELLE DES VIRAGES suit la VITESSE : croisière (momentum compris ≈ 2,75 × maxSp) du palier moteur +2 (on monte
   pendant la zone). 70 m/s (253 km/h) → 1 ; 132 m/s → 1,6 ; 290 m/s → 3,2 ; plafond 4,4. Sans aide au virage (conduite v6), un
   rayon fixe devenait infaisable à 1000 km/h sur une route de 24 m : les virages grandissent, leur NOMBRE par minute reste. */
function lvPiste(){const t=Math.min(ENGINE_TIERS.length-1,(engTier|0)+2),late=engLate(t),
  vw=2.75*CARS[0].maxKmh/3.6*late*ENGINE_TIERS[t].push*SPD;return 1+THREE.MathUtils.clamp((vw-70)/140*1.4,0,3.4);}
// vitesse max AFFICHÉE — la sensation de vitesse (tremblement, filés, FOV) se juge RELATIVE à elle.
// ⚠ elle doit décrire la vitesse RÉELLEMENT atteignable : lire CARS[level].maxKmh (la fiche de la
// carrosserie, jusqu'à 1900) alors que la caisse plafonne en vrai à CARS[0]×moteur donnait un ratio
// minuscule — plus aucun frisson, plus de speed lines, quelle que soit l'allure.
function vmaxShow(){return CARS[0].maxKmh*SPD*lateMul()*(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).push;}
// LA CROISIÈRE RÉELLE (2026-09-25, audit mesuré) : gaz auto, la traînée équilibre la poussée à ≈1,55× vmaxShow. Les effets de VITESSE
// (tremblement, filés, champ) se jugent sur ELLE : calés sur vmaxShow, ils saturaient 3-4 s après le départ et restaient plats toute la
// partie — le momentum, un pad, le FLOW, le mini-turbo ne changeaient plus RIEN à l'écran. (vmaxShow reste la référence de l'économie.)
function vCroisiere(){return vmaxShow()*1.55;}
let mode='drive',s=0,lat=0,psi=0,vA=0,vL=0,side=1,driveDir=1; // driveDir : sens de conduite le long du ruban (+1/-1). TOUJOURS 1 en course ; dans le PARC il suit le sens d'atterrissage → les routes se roulent dans les DEUX sens (pas de sens imposé)
const START_CASH=1.61; // la mise de depart, clin d'oeil au studio 1.61
let steer=0,pitchS=0,money=START_CASH,levelCash=0,boost=0,fallT=0,fallTR=0,padCd=0,shake=0,combo=0,comboT=0,graceT=0,safeS=0,yawAcc=0,edgeT=0,squashT=0,momT=0,styleM=0,fever=0,streak=0,slowT=0,steerHold=0,aheadV=0,sideCd=0,slipT=0,oilCd=0,hitT=0,insUsed=false,feverArmed=false,lastSpaceT=0,rollover=0,idleT=0,driftT=0,driftYaw=0;
/* LE FREIN ÉTALÉ (2026-10-17, session « Physique et gameplay fluides » — Sacha : « améliore une dernière fois la physique et le gameplay,
   fluidifie la conduite, la voltige et tout », « la dernière amélioration avant de figer le gameplay »). Une vitesse PERDUE d'un coup
   (la pose, le choc contre une paroi, la foudre, un débris, un accrochage) tombait en UNE image : jusqu'à −45 % entre deux images, la
   caisse « freinait au mur » et la caméra sursautait. La même perte, au même total, passe désormais en ~0,2 s : FREIN_L est le
   LOGARITHME de ce qui reste à perdre (≤ 0), vidé en exponentielle (FREIN_TAU) par la conduite — deux chocs se COMPOSENT comme avant
   (×0,7 puis ×0,6 = ×0,42). Hors conduite (en vol, vA ne sert pas) la perte reste immédiate ; au décollage le reste est payé d'un coup
   (startFall). `?frein=0` = l'ancien coup sec, pour comparer. */
const FREIN_TAU=/[?&]frein=0\b/.test(location.search)?0:.08;let FREIN_L=0;
function vFrein(k){k=Math.max(.01,Math.min(1,k));if(mode!=='drive'||!FREIN_TAU)vA*=k;else FREIN_L+=Math.log(k);}
/* ⚠ LE VOL EN VRILLE EST UN PARTI PRIS, PAS UN OUBLI (tranché par le user, 2026-08-05).
   J'ai tenté deux fois de « corriger » la rotation de la caisse en vol — d'abord en la remplaçant
   par une inclinaison de virage pilotant le lacet (trop de latence au braquage), puis en gardant
   l'inclinaison en pur décor. Le user a essayé et tranché les deux fois POUR LA VRILLE.
   Les variables `airBank` / `airRollT` / `AIR_BANK_*` ont donc été RETIRÉES : les laisser en place
   aurait fait croire à un réglage disponible alors que plus rien ne les lit. */
let airRoll=0; // vrille visuelle en vol
/* LA PHYSIQUE DU BORD v2 — portée de la branche de Léo (cb3e82c, 2026-09-26, Léo : « quand on s'approche du bord la voiture déclique vers le
   ciel, fais plus réaliste ») sur main le 2026-09-30 (Sacha : « quand on roule au bord de la route on est comme TÉLÉPORTÉ à côté — c'est un
   petit CLIC bizarre, Léo l'avait corrigé »). Mesuré sur main avant (banc bord5.js, sortie douce) : au passage du bord la caisse SAUTAIT de
   0,79 NDC à l'écran en UNE image (×52 son mouvement normal — du bord droit de l'image au centre : la caméra de vol la visait d'un coup),
   restait figée une image puis rattrapait 2,7 m, montait de 60 cm, et recevait un coup de saut de +3,4. Désormais c'est une vraie BASCULE :
   roues dehors → la caisse penche vers le vide ; centre de gravité dehors → elle bascule sans décoller, du côté du vide, de plus en plus
   vite ; si l'on braque à temps, le pneu raccroche la LÈVRE au lieu d'aller cogner la tranche ; et la caméra glisse au lieu de sauter.
   `bascOn` = ce vol vient d'une sortie par le bord, `bascDir` = sens de la vrille (+1 = celui de toujours), `levreY` = la marche que la
   caisse remonte en raccrochant (décroît). */
/* LE BORD DE LA ROUTE TORDUE (2026-10-15 soir, Sacha : « fais revenir le BUMP sur la route tordue des nuages, sans toucher au reste »).
   Sur la route SANS HAUT NI BAS (TORD) la dalle est couchée, sur la tranche, à l'envers — et la caisse sortie par le bord tombait selon le
   bas du MONDE : elle ne s'enfonçait jamais sous le niveau de SA dalle, donc ne pouvait plus en cogner la tranche (MESURÉ, même graine :
   0 BUMP sur 20 sorties, contre 3 sur la même piste remise droite). Ici, le temps de la BASCULE (1,1 s au plus) et après
   chaque BUMP, la gravité est celle de la ROUTE quittée (−Nn × face de départ) : la caisse s'enfonce sous la dalle comme sur une route
   droite, la lèvre raccroche, la tranche cogne, et le BUMP renvoie vers le ciel de LA ROUTE (pas vers celui du monde). Au-delà (ou à plus de
   20 m du bord), le vol reprend la gravité du monde. Route droite (TORD éteint) : rien ne change. `TBORD.t` = le temps qu'il reste. */
const TBORD={t:0,on:false,u:new THREE.Vector3()};
/* LE VOL QUI SUIT LA ROUTE (2026-10-18, Sacha : « dans la map nuage la route fait des rotations et tout, mais la voiture a du mal à voler,
   comme si le jeu n'arrivait pas à savoir de quel côté de la route on va »). Sur la route SANS HAUT NI BAS, le vol gardait le bas du MONDE :
   un saut depuis une dalle couchée partait à côté d'elle, depuis une dalle à l'envers il tombait loin d'elle, et l'ÉQUILIBRE redressait la
   caisse et l'écran vers un ciel qui n'existe plus sur cette map. MESURÉ (banc volcote.cjs, saut de 21 m/s à 162 km/h, sans toucher aux
   commandes, mêmes points de la piste avant/après) : posés sur leur route 6/6 sur dalle à plat, 3/5 penchée, 1/6 sur la tranche, 0/6 à
   l'envers — les autres, perdus dans le vide jusqu'au couperet des 6 s ; l'écran tournait de 73 à 88° pendant un saut depuis une dalle sur
   la tranche ou à l'envers. APRÈS : 23/23 posés sur leur route, même face, à ~15 m ; l'écran tourne de 6 à 14°.
   Ici, le HAUT DU VOL (`VOLR.u`) est le ciel de LA ROUTE SURVOLÉE : la normale de la dalle la plus proche (le radar de tryLand), sur la face
   qu'on a quittée — et quand le radar passe à un autre tronçon, la face la plus proche du haut d'avant (jamais de bascule de plus de 90°),
   lissée en ~0,08 s. La gravité, le plané du nitro, l'équilibre de la caisse et de l'écran, le viseur de pose, le plafond de vitesse « à
   plat », le BUMP, le compteur et les prédictions des figures le suivent : on retombe sur la route qu'on survole, quelle que soit sa pose
   dans l'espace — comme sur une route droite. Les autres maps : le haut du monde, au chiffre près (`VOLR.on` faux). Sortie par le bord :
   on tombe sous SA dalle et on s'y perd, comme ailleurs (la gravité de la route ne s'arrête plus au bout d'1,1 s — voir TBORD).
   `?sans=volroute` rend le vol d'avant. */
/* LA VRILLE PORTE LE VOL (2026-10-19, Sacha : « il y a toujours des problèmes dans la map nuage : quand on vole près de la route, ça dévie la
   trajectoire »). LA CAUSE, MESURÉE (simulateur de la branche 'fall' sur deux pistes des nuages vidées du jeu, mêmes formules) : le haut du vol
   suit la dalle survolée en ~0,08 s ; quand la route VRILLE sous la caisse (jusqu'à 64°/s), la gravité tourne avec elle, mais l'élan, le repère
   de la caisse (FLY_U, autour duquel tourne le volant) et le haut de l'écran restent dans l'ancien (l'équilibre les rattrape à 2,6/s, la caméra
   à 3/s) : la gravité tire DE CÔTÉ à l'écran. Sans toucher aux commandes, sur un vol de 1,5 s au nitro, la poussée de côté cumulée valait
   11-15 m/s en médiane et jusqu'à 92 m/s (0,3 sur un saut court) ; et un pilote qui vise la route ne se posait que 34 fois sur 48.
   Désormais la part de la rotation du haut du vol qui est la VRILLE de la route (son roulis autour de son axe T) emporte aussi l'élan, le repère
   du vol, la caisse et le haut de l'écran : la route tourne, le vol tourne avec elle, comme quand on roule. Le reste (la route qui plonge ou se
   cabre sous la caisse) ne touche que la gravité, comme avant : on décolle toujours des crêtes, et aucune force ne ramène vers la route.
   MESURÉ (même simulateur, 88 départs) : poussée de côté méd 1,0-1,4 m/s, max 10-13 ; sauts courts inchangés (tous posés) ; vols nitro sans
   les mains 22/48 et 18/40 posés (21 et 18 avant) ; un pilote qui vise la route 48/48 et 40/40 (34 et 34), gros vols 37/48 et 36/40 (23 et 24).
   `?sans=volroulis` = avant ; `dbgVolRoulis(false|true)` le bascule en direct pour les vols suivants. */
let VOLR_ROULIS=!/[?&]sans=([^&]*,)?volroulis(,|&|$)/.test(location.search);
window.dbgVolRoulis=function(v){if(v!=null)VOLR_ROULIS=!!v;return VOLR_ROULIS;};
/* ===== LE VOL SANS HAUT NI BAS (2026-10-20, Sacha : « il y a toujours des problèmes dans la map nuage : on est aimanté à la route, le jeu a du mal à
   gérer le haut et le bas — il ne faut plus de haut ni de bas, juste la voiture, elle peut voler naturellement, librement ; quand tu voles près de la
   route tu es attiré et ta trajectoire est déviée par le haut et le bas ») =====
   `VOLR` faisait encore tourner le haut du vol avec la dalle la plus proche, image après image : près de la route, la gravité tirait toujours vers
   « sa » dalle, et chaque vrille, chaque plongeon de la route sous la caisse tordait la trajectoire (l'aimant, même quand l'écran ne roulait plus).
   Désormais le haut du vol est celui du DÉCOLLAGE et il ne bouge plus : la face de la route qu'on quitte (`startFall`, `VOLR.u = F.n`). Un vol est une
   parabole nette dans le repère de la caisse au départ — gravité, plané du nitro, équilibre de la caisse et de l'écran, viseur et prédictions des figures
   suivent ce même haut, donc rien ne dévie, rien n'attire (aucune aide : la route qui s'est tordue entre-temps peut aussi être manquée).
   `?sans=volfige` = le haut qui suit la dalle (v689) ; `dbgVolFige(false|true)` le bascule en direct pour les vols suivants. */
let VOLR_FIGE=!/[?&]sans=([^&]*,)?volfige(,|&|$)/.test(location.search);
window.dbgVolFige=function(v){if(v!=null)VOLR_FIGE=!!v;return VOLR_FIGE;};
let VOLR_ON=!/[?&]sans=([^&]*,)?volroute(,|&|$)/.test(location.search);
window.dbgVolRoute=function(v){if(v!=null)VOLR_ON=!!v;return {on:VOLR_ON,vol:VOLR.on,u:VOLR.u.toArray().map(function(x){return +x.toFixed(3);})};}; // (banc) dbgVolRoute(false) = le vol d'avant pour les vols suivants
const VOLR={on:false,k:12,u:new THREE.Vector3(0,1,0),c:new THREE.Vector3(),a:new THREE.Vector3(),b:new THREE.Vector3(),q:new THREE.Quaternion()}; // k : la vitesse du lissage (1/s) · u : le haut du vol · c, a, b, q : calcul
function volrOn(){return VOLR_ON&&TORD.on&&!PARK.on;}
function volVu(v){return VOLR.on?v.dot(VOLR.u):v.y;} // la part de v vers le haut du vol
function volMonte(v,d){if(VOLR.on)v.addScaledVector(VOLR.u,d);else v.y+=d;} // + d vers le haut du vol
function volPlafU(v,m){if(!VOLR.on){if(v.y>m)v.y=m;return;}const k=v.dot(VOLR.u);if(k>m)v.addScaledVector(VOLR.u,m-k);} // la montée bornée à m
function volH(v){if(!VOLR.on)return Math.hypot(v.x,v.z);const k=v.dot(VOLR.u);return Math.sqrt(Math.max(0,v.lengthSq()-k*k));} // la vitesse « à plat »
function volHK(v,f){if(!VOLR.on){v.x*=f;v.z*=f;return;}const k=v.dot(VOLR.u);v.addScaledVector(VOLR.u,-k).multiplyScalar(f).addScaledVector(VOLR.u,k);} // la part « à plat » × f
function volrSuit(dt){if(!VOLR.on)return;if(!TORD.on){VOLR.on=false;VOLR.u.set(0,1,0);return;} // chaque image de vol : le haut suit la dalle survolée (une route qui change en plein vol rend le haut du monde)
  if(VOLR_FIGE)return; // (LE VOL SANS HAUT NI BAS) le haut du vol reste celui du décollage : la route qui tourne dessous ne le touche plus
  const i=tryLand._bi;if(!(i>=0)||!Nn[i])return;
  const t=T[i],a=VOLR.a.copy(VOLR.u);if(t)a.addScaledVector(t,-a.dot(t)); // (LA VRILLE PORTE LE VOL) le haut d'avant, vu le long de l'axe de la route
  VOLR.c.copy(Nn[i]);if(VOLR.c.dot(VOLR.u)<0)VOLR.c.negate();VOLR.u.lerp(VOLR.c,1-Math.exp(-dt*VOLR.k)).normalize();
  if(!VOLR_ROULIS||!t)return;
  const b=VOLR.b.copy(VOLR.u).addScaledVector(t,-VOLR.u.dot(t));if(a.lengthSq()<1e-6||b.lengthSq()<1e-6)return;
  const r=Math.atan2(VOLR.c.crossVectors(a,b).dot(t),a.dot(b));if(Math.abs(r)<1e-7)return; // le roulis de la route sous la caisse, cette image
  fallVel.applyAxisAngle(t,r);FLY_U.applyAxisAngle(t,r);FLY_R.applyAxisAngle(t,r);camUp.applyAxisAngle(t,r);VEQ.qb.premultiply(VOLR.q.setFromAxisAngle(t,r));}
let bascOn=false,bascDir=1,levreY=0,bascT=0; /* bascT (1/10, soir) : le temps VÉCU depuis la sortie par le bord — `fallT` est rendu par les bumps, il réarmait la bascule en plein vol */
const BUMP_VY=16; /* (2026-10-01) la vitesse verticale rendue par un BUMP (voir tryLand) */
const BUMP_VAL=5; /* (2026-10-15 soir, Sacha) ce que le 1er BUMP d'un vol verse à la chaîne, comme une figure (le RICOCHET sur l'eau : 5) — puis ×0,6 par rebond */
const LEVRE_POSE=.45; /* (2026-10-01) la marche qu'un pneu monte à TOUTE pose au bord (voir levre9 dans tryLand) */
const LEVRE_H=2; /* (1/10, soir : 1,2 → 2 m, pendant 1 s — la marge que donnait, par accident, la portée réarmée après un bump) */ // sous la surface, jusqu'où le pneu peut encore raccrocher la lèvre (plus bas : c'est la tranche qui cogne → BUMP)
/* (2026-10-01, Sacha, le lendemain : « maintenant quand on s'expulse de la route à grande vitesse on MEURT sans raison, sans qu'on ait la
   chance de se RATTRAPER ») — la v2 avait retiré le bond de sortie (+0,6 m et +3,4 vers le haut) : c'était le « clic », mais c'était AUSSI
   le sursis. Mesuré : avant, la caisse restait au-dessus de −1,2 m (la fenêtre de pose) ~0,59 s ; en v2, 0,39 s — et la lèvre ne
   raccrochait qu'à −0,7 m pendant 0,6 s : à grande vitesse, le temps de braquer, on était déjà sous la dalle. Le sursis revient SANS le
   bond : la caisse PIVOTE sur ses roues intérieures avant de tomber — la gravité monte de 0 à 100 % en BASC_T (0,45 s), la réserve de
   nitro plane au même prorata (jamais de remontée), et la lèvre raccroche jusqu'à LEVRE_H 1,2 m pendant 0,8 s. */
const BASC_T=.45;
/* VOL LIBRE (2026-09-26) — le REPÈRE DU VOL : FLY_U = le « haut » de la caisse en l'air, FLY_R = sa droite. Plus aucune référence au
   ciel : au décollage FLY_U part de la normale de la route (dessus comme dessous), puis il est TRANSPORTÉ avec la trajectoire
   (on lui retire sa part le long de la vitesse, image après image). Le volant tourne autour de FLY_U, le manche autour de FLY_R,
   la caméra prend FLY_U pour « haut » — la caisse va là où on la guide, et l'écran la suit sans jamais se remettre à l'endroit. */
const FLY_U=new THREE.Vector3(0,1,0),FLY_R=new THREE.Vector3(1,0,0);
/* LE VOL ÉQUILIBRÉ (2026-10-14, Léo : « en vol, la voiture tourne dans le sens de la route qu'elle a quittée ; il faudrait qu'elle QUITTE la
   route, avec un effet réaliste de BALANCE dans l'air — équilibré ; selon l'endroit du joystick, la voiture se pivote et se dirige »).
   Ce qui tournait : (1) le volant TENU dans le virage continuait de tourner la trajectoire en l'air, au lacet du sol — la caisse suivait la
   courbe qu'elle venait de quitter ; (2) la VRILLE visuelle permanente (3 rad/s autour du nez, vers le vide après le bord) ; (3) le haut du
   vol partait de la normale de la route (penchée dans les virages relevés) et y restait.
   · LE VOLANT SE RÉ-ARME AU DÉCOLLAGE (`veqVolant`) : la part du braquage tenue depuis la route s'efface sur VIRVOL.latch s — la caisse part
     TOUT DROIT, sur son élan ; tout geste NOUVEAU (pousser plus, changer de côté) agit tout de suite, un pouce gardé finit par tourner.
     Sortie par le BORD : le verrou ne part qu'à la fin de la bascule (roues encore sur la lèvre = on braque comme au sol : le sauvetage).
     Le TAUX de virage en vol ne change pas (verdict de Sacha du 09/10) — (2026-10-18) jusqu'au VIRAGE SERRÉ EN VOL : voir `VIRVOL` juste dessous.
   · L'ÉQUILIBRE (`veqNiveau`) : le haut du vol (FLY_U) se redresse vers la verticale du monde autour de la trajectoire (l'hémisphère où il
     est : partie à l'envers sous la dalle, elle reste à l'envers) — caisse et caméra reviennent à l'horizontale.
   · LA BALANCE (`veqCorps`) : plus de vrille. La caisse est un corps sur ressorts amortis autour de son assiette de vol : elle PIVOTE devant
     la trajectoire du côté du pouce, s'INCLINE dans le virage, lève / baisse le nez avec le manche ; le redressement et le décollage lui
     laissent un retard qu'elle rattrape en se balançant. Sortie par le bord : un coup de roulis vers le vide, rattrapé.
   · À LA POSE (`veqPose`), l'assiette qui reste passe à la conduite (roulis de caisse, lacet visuel, tangage) : elle se balance sur ses ressorts.
   · LE DÉCOLLAGE : la suspension se DÉTEND (la caisse monte sur ses roues pendantes, `ext`), un tremplin lève le nez.
   · L'ATTERRISSAGE (`veqCorps`, `veqPose`, `veqContact`) : à l'approche de la dalle (temps avant contact < `posB` s) la caisse PRÉPARE sa pose :
     elle se met dans le plan de la route, les roues dessous, le nez dans sa trajectoire. Au contact : la suspension détendue CLAQUE et s'écrase,
     le nez PLONGE puis rebondit (`VEQ.sp`, ressort), la caméra s'enfonce un instant (`VEQ.cam*`), un anneau de poussière sur les grosses poses ;
     ce qui reste d'assiette passe aux ressorts de la conduite (roulis, lacet, tangage — calculé sur la VRAIE orientation de la caisse).
   · LES FIGURES AU DOUBLE-TAP NITRO (`veqDouble`, deux appuis brefs) — elles s'ACCUMULENT (Léo, 14/10 : « au lieu de supprimer les tricks, on
     va les accumuler ») : le catalogue vit dans figures.js (`FIG`, partagé avec la BOÎTE BLANCHE boite-figures.html), on les ACHÈTE au shop
     (catégorie FIGURES), on les garde dans l'inventaire (`SAVE.d.figs`, le TONNEAU offert) ; le double-tap en joue UNE AU HASARD parmi celles
     qu'on possède (jamais deux fois la même d'affilée), et un double-tap pendant une figure ENCHAÎNE la suivante (le lecteur `FIG.Lecteur` la
     lance à 70 % de la précédente : les rotations se composent, la caisse ne s'arrête jamais). « Ça les pose automatiquement » : la figure
     se RACCOURCIT pour finir avant la pose (le viseur dit quand on touche, `CAMV.eta`) ; trop bas, rien ne part.
     AU SOL = LE SAUT NITRO (`veqSaut`) : le booster plaque la route, la caisse DÉCOLLE (~1,2 s, ~2,5 m) et sa figure part toute seule — il coûte
     du nitro, et sa pose en rend moins qu'un vrai saut (on ne fabrique pas de nitro en sautant sur place).
     Chaque figure finie entre dans la CHAÎNE (son aura, payée à la pose ; des figures DIFFÉRENTES font monter le multiplicateur). Posée en plein
     tour : à moins de 20° de la fin elle compte ; au-delà de 50° c'est une POSE RATÉE (« FIGURE RATÉE ! », le flow tombe).
   `?vol=ancien` (ou `dbgVol('ancien')`) rend le vol d'avant au chiffre près (le tonneau reste). Console : `dbgVol()`, `dbgVol('tonneau')`. */
/* LE VIRAGE SERRÉ EN VOL (2026-10-18, Sacha : « augmente la maniabilité dans les airs, on a du mal à faire des virages serrés »). Deux freins :
   (1) le LACET plafonnait à 1,75 rad/s dès 260 km/h — passé ce cap, le rayon grandissait avec la vitesse (48 m à 300 km/h, 95 m à 600) ;
   (2) le VERROU du volant (`veqVolant`) effaçait pendant 0,7 s le braquage tenu depuis la route — un saut dure ~1 s : on y tournait à moitié.
   Désormais le lacet vaut ×1,5 et son plafond monte (3,1 rad/s, atteint vers 390 km/h) : le rayon fond d'un bon tiers (19 m à 150 km/h, 30 m
   à 300, 54 m à 600) ; le verrou s'efface en 0,35 s (la caisse quitte toujours la route TOUT DROIT, mais le pouce tenu reprend vite la main).
   UNE formule pour tout le vol (`lacetVol`) : le vol, la mousse, la poudreuse du glacier et le lacet emporté à la pose. `?virvol=0` = avant. */
const VIRVOL=/[?&]virvol=0\b/.test(location.search)?{k:1,cap:.6,latch:.7}:{k:1.5,cap:.9,latch:.35};
function lacetVol(v){return VIRVOL.k*(1.15+Math.min(VIRVOL.cap,v*.004));} // rad/s au plein pouce, v = |fallVel|
function lacetVolK(v){return lacetVol(v)/(1.15+Math.min(.6,v*.004));} /* le rapport au virage d'AVANT le 18/10 : la caméra de vol suit d'autant plus vite
   (mesuré : à lacet ×1,6 et suivi inchangé, la caméra restait 28° à l'EXTÉRIEUR du virage contre 16° — on voyait moins où l'on tourne) */
window.dbgVirVol=function(k,cap,latch){if(k!=null)VIRVOL.k=k;if(cap!=null)VIRVOL.cap=cap;if(latch!=null)VIRVOL.latch=latch;return Object.assign({},VIRVOL);};
const VEQ_K={niv:2.6,iner:.8,lacet:.26,roulis:.38,tangage:.2,w:9.5,z:.42,wR:8,zR:.36,houle:.024,
  ext:.11,posA:.05,posB:.45,    // la suspension pendante en vol · la pose se prépare entre ,45 s et ,05 s avant qu'elle soit déclarée
  saut:21,sautCout:.2,sautNit:.3,sautCd:.9}; // LE SAUT NITRO : impulsion, coût (part de la jauge), part du nitro rendu à sa pose, attente (s)
const VEQ={on:!/[?&]vol=ancien\b/.test(location.search),l0:0,lT:0,lArm:false,u:0,by:0,byV:0,bp:0,bpV:0,br:0,brV:0,tf:0,ext:0,
  qb:new THREE.Quaternion(),qp:new THREE.Quaternion(),qo:new THREE.Quaternion(),qd:new THREE.Quaternion(),eu:new THREE.Euler(0,0,0,'YXZ'),
  tv:new THREE.Vector3(),tc:new THREE.Vector3(),n9:new THREE.Vector3(),f9:new THREE.Vector3(),g9:new THREE.Vector3(),m4:new THREE.Matrix4(),
  si:-1,sh:0,sl:0,sd:1e9,pose:0,      // le radar de la dalle (tryLand) · pose : l'alignement de pose en cours (0-1)
  sautT:-9,sautF:-1,rate:false,dReq:false,dDn:0,dUp:0,n:0,
  sp:0,spV:0,camT:-1,camA:0,volT:0,   // le nez qui rebondit à la pose · la caméra qui s'enfonce
  pv:new THREE.Vector3(),pv2:new THREE.Vector3(),ax:new THREE.Vector3(),qr:new THREE.Quaternion()};
function veqDepart(bord,impU,roll0,qDep){ // au décollage (startFall)
  VEQ.l0=steer;VEQ.lT=0;VEQ.lArm=!bord;VEQ.u=0;VEQ.tf=0;VEQ.ext=0;VEQ.pose=0;VEQ.si=-1;VEQ.rate=false;VEQ.sp=0;VEQ.spV=0;
  VEQ.by=0;VEQ.byV=0;VEQ.bp=0;VEQ.bpV=bord?0:-1.1*THREE.MathUtils.clamp((impU==null?.9:impU)/30,0,1); // un tremplin lève un peu le nez : la balance commence
  VEQ.br=roll0;VEQ.brV=bord?bascDir*4:0; // bord : la caisse BASCULE vers le vide, les ressorts la rattrapent — (2026-10-17) tout décollage emporte son roulis (il retombait à 0 en une image hors du bord)
  VEQ.qb.copy(qDep);
}
function veqVolant(){ // LE VOLANT EN L'AIR : la part tenue depuis la route s'efface, tout geste nouveau agit
  if(!VEQ.on)return steer;
  if(!VEQ.lArm){if(bascOn&&bascT<BASC_T)return VEQ.u=steer;VEQ.lArm=true;VEQ.l0=steer;VEQ.lT=0;}
  const g=Math.max(0,1-VEQ.lT/VIRVOL.latch);
  if(g<=0||steer*VEQ.l0<=0){VEQ.l0=0;return VEQ.u=steer;}
  if(Math.abs(steer)<Math.abs(VEQ.l0))VEQ.l0=steer; // le pouce revient vers le centre : le verrou descend avec lui (jamais de contre-braquage)
  return VEQ.u=Math.sign(steer)*Math.max(0,Math.abs(steer)-Math.abs(VEQ.l0)*g);
}
function veqNiveau(dt,dir){ // L'ÉQUILIBRE : le haut du vol se redresse vers la verticale, autour de la trajectoire `dir`
  const U9=TBORD.on?TBORD.u:VOLR.on?VOLR.u:null,sg= /* (LE VOL QUI SUIT LA ROUTE) sur la route sans haut ni bas, l'équilibre se fait sur le ciel de la dalle survolée */(U9?FLY_U.dot(U9):FLY_U.y)>=0?1:-1; // (LE BORD DE LA ROUTE TORDUE) au bord, l'équilibre se fait sur le ciel de LA ROUTE : le volant reste dans le plan de la dalle, on peut revenir cogner sa tranche
  if(U9)VEQ.tv.copy(U9).multiplyScalar(sg).addScaledVector(dir,-sg*U9.dot(dir));else VEQ.tv.set(0,sg,0).addScaledVector(dir,-sg*dir.y);
  const L=VEQ.tv.length();if(L<.15)return; // trajectoire presque verticale : pas d'horizon à retrouver
  VEQ.tv.multiplyScalar(1/L);
  const e=Math.atan2(VEQ.tc.crossVectors(FLY_U,VEQ.tv).dot(dir),THREE.MathUtils.clamp(FLY_U.dot(VEQ.tv),-1,1));
  const a=e*(1-Math.exp(-dt*VEQ_K.niv*Math.min(1,(L-.15)/.35)*(1-JEAU.wB)));
  if(Math.abs(a)<1e-7)return;
  FLY_U.applyAxisAngle(dir,a);VEQ.br-=a*VEQ_K.iner; // la caisse a de l'INERTIE : le repère se redresse, elle traîne un peu… et se balance pour le rattraper
}
function veqRoute(bI,sd,f,q){ // l'assiette de CONDUITE sur la dalle bI, face sd, nez vers f (dans le plan) → q
  const n=VEQ.n9.copy(Nn[bI]).multiplyScalar(sd);
  VEQ.g9.copy(f).addScaledVector(n,-f.dot(n));if(VEQ.g9.lengthSq()<1e-6)VEQ.g9.copy(T[bI]);VEQ.g9.normalize();
  VEQ.tc.crossVectors(n,VEQ.g9).normalize();VEQ.m4.makeBasis(VEQ.tc,n,VEQ.g9);return q.setFromRotationMatrix(VEQ.m4);
}
function veqCorps(dt){ // LA BALANCE : qTmp = l'assiette de vol (repère) → la caisse, sur ses ressorts, autour
  const d=Math.min(dt,1/30),K=VEQ_K,m=1-JEAU.wB,u=VEQ.u;
  VEQ.tf+=dt;const h=REDUCED_MOTION?0:K.houle*Math.min(1,VEQ.tf/.6)*m;
  const byT=u*K.lacet*m,brT=(-u*K.roulis+h*Math.sin(VEQ.tf*5.3))*m,bpT=(-pitchS*K.tangage+h*.7*Math.sin(VEQ.tf*3.7+1.1))*m;
  VEQ.byV+=(K.w*K.w*(byT-VEQ.by)-2*K.z*K.w*VEQ.byV)*d;VEQ.by=THREE.MathUtils.clamp(VEQ.by+VEQ.byV*d,-.6,.6);
  VEQ.bpV+=(K.w*K.w*(bpT-VEQ.bp)-2*K.z*K.w*VEQ.bpV)*d;VEQ.bp=THREE.MathUtils.clamp(VEQ.bp+VEQ.bpV*d,-.6,.6);
  VEQ.brV+=(K.wR*K.wR*(brT-VEQ.br)-2*K.zR*K.wR*VEQ.brV)*d;VEQ.br=THREE.MathUtils.clamp(VEQ.br+VEQ.brV*d,-1.2,1.2);
  VEQ.eu.set(VEQ.bp,VEQ.by,VEQ.br,'YXZ');VEQ.qo.setFromEuler(VEQ.eu);qTmp.multiply(VEQ.qo);
  /* LA POSE SE PRÉPARE : le temps avant de toucher la face visée (hauteur ÷ vitesse d'approche, en mètres du monde) — sous `posB` s la caisse
     se met dans le plan de la route, nez dans sa trajectoire, roues dessous ; à `posA` s elle y est. Hors de la largeur (+6 m) : rien. */
  let a=0;
  if(VEQ.si>=0&&VEQ.sd<1600&&Math.abs(VEQ.sl)<ROAD_HALF+6){
    const i=VEQ.si,dessus=VEQ.sh>-THICK*.5,hs=dessus?VEQ.sh:-THICK-VEQ.sh,sd=dessus?1:-1,vN=-fallVel.dot(Nn[i])*sd*SPD;
    if(hs>-1.5&&vN>.4)a=1-THREE.MathUtils.smoothstep(Math.max(0,hs-2.8)/vN,K.posA,K.posB); // ⚠ la pose est DÉCLARÉE à 3 m (tryLand) : à 2,8 m la caisse doit être prête
    if(a>.001){veqRoute(i,sd,fallVel,VEQ.qp);qTmp.slerp(VEQ.qp,a*m);}}
  VEQ.pose+=(a-VEQ.pose)*lisse60(10,dt);
  VEQ.qb.slerp(qTmp,lisse60(12+10*a,dt));carGroup.quaternion.copy(VEQ.qb);airRoll=VEQ.br;
  // LES ROUES PENDENT : en l'air la suspension se détend (la carrosserie monte au-dessus de ses roues)
  VEQ.ext+=(K.ext-VEQ.ext)*lisse60(9,dt);carBody.position.y=VEQ.ext;
}
/* ===== LE LISSAGE CALÉ SUR 60 i/s (24/10, débogage sortie iOS : « un jeu irréprochable sur tous les iPhone, du vieux à 30 images/s au ProMotion 120 Hz ») =====
   x+=(cible-x)*Math.min(1,dt*k) n'avance PAS du même chemin par seconde selon la cadence : à 30 i/s la part prise par image double, l'approche
   est plus vive (k=22 : +45 % de raideur à 30 i/s, −11 % à 120 Hz). lisse60(k,dt) rend EXACTEMENT la part de Math.min(1,dt*k) à 60 i/s (la
   cadence où tout a été réglé) et la compose au temps près : deux images à 30 Hz = une à 60 = la moitié de deux à 120. Preuve :
   passation/preuves/preuve-lisse60.cjs (assiette du vol équilibré, aimant à pièces). */
function lisse60(k,dt){return 1-Math.pow(Math.max(0,1-k/60),dt*60);}
function veqPose(bI,sd){ // la caisse se pose (tryLand, lèvre) : ce qui reste d'assiette passe aux ressorts de la conduite
  VEQ.rate=false;VEQ.volT=fallTR;
  let rx=0,ry=0,rz=0;
  if(VEQ.on&&bI!=null&&bI>=0){ // l'écart RÉEL entre la caisse et sa place de conduite (nez = cap de la pose)
    VEQ.f9.copy(T[bI]).multiplyScalar(Math.cos(psi)).addScaledVector(B[bI],Math.sin(psi)*sd);
    veqRoute(bI,sd,VEQ.f9,VEQ.qp);VEQ.qd.copy(VEQ.qp).invert().multiply(VEQ.qb);VEQ.eu.setFromQuaternion(VEQ.qd,'YXZ');
    rx=VEQ.eu.x;ry=VEQ.eu.y;rz=VEQ.eu.z;}
  let corps=false;
  if(FIGV2.on&&FX2.corps){const C=FX2.corps,j=C.pose(); /* (2026-10-14, LES FIGURES v2) près de l'endroit, les figures finies comptent ; à plus de 52°, CHUTE */
    for(let i=0;i<j.payees.length;i++)figPaye(j.payees[i]);if(j.ratee)VEQ.rate=true;FX2.trio=[]; /* (COMBOS À TROIS) la pose ferme le vol : un trio entamé ne passe pas au vol suivant */
    corps=j.ecart>.002;if(corps){VEQ.qd.set(C.q[0],C.q[1],C.q[2],C.q[3]);VEQ.eu.setFromQuaternion(VEQ.qd,'YXZ');rx+=VEQ.eu.x;ry+=VEQ.eu.y;rz+=VEQ.eu.z;}
    FX2.wPose=C.w[2];C.vide();}
  if(!VEQ.on&&!corps)return;
  driftYaw=THREE.MathUtils.clamp(ry,-.35,.35);carRoll9=THREE.MathUtils.clamp(rz,-.42,.42);
  if(VEQ.on){rollV=THREE.MathUtils.clamp(VEQ.brV*.5+FX2.wPose*.4,-4,4);FX2.wPose=0;pitch9=0;VEQ.sp=THREE.MathUtils.clamp(rx,-.35,.35);VEQ.spV=0;}
}
function veqContact(imp,nI,sd){ // LE CONTACT (touche9 : quand les roues touchent vraiment) — la suspension claque, le nez plonge, la caméra s'enfonce
  if(!VEQ.on)return;
  const k=THREE.MathUtils.clamp(imp/14,0,1),gros=imp>6||VEQ.volT>1.2;
  susY=Math.min(.12,VEQ.ext);susV=Math.min(susV,-.6-imp*.32);VEQ.ext=0; // détendue en l'air, elle s'ÉCRASE
  VEQ.spV+=.9+k*2.4; // le nez plonge (avant chargé), le ressort le relève
  if(!REDUCED_MOTION){VEQ.camT=0;VEQ.camA=.12+k*.5+(gros?.12:0);}
  if(gros&&nI!=null&&nI>=0){ // L'ANNEAU DE POUSSIÈRE : la route a pris le coup
    const n=VEQ.n9.copy(Nn[nI]).multiplyScalar(sd),p=carGroup.position,nb=Math.round(14+k*14);
    VEQ.f9.copy(T[nI]);VEQ.g9.crossVectors(n,VEQ.f9).normalize();
    for(let j=0;j<nb;j++){const a=j/nb*6.2832,c=Math.cos(a),s9=Math.sin(a),v=7+k*9+Math.random()*3;
      spawnP(dust,p.x+(VEQ.f9.x*c+VEQ.g9.x*s9)*1.4,p.y+(VEQ.f9.y*c+VEQ.g9.y*s9)*1.4+n.y*.2,p.z+(VEQ.f9.z*c+VEQ.g9.z*s9)*1.4,
        (VEQ.f9.x*c+VEQ.g9.x*s9)*v+n.x*1.2,(VEQ.f9.y*c+VEQ.g9.y*s9)*v+n.y*1.2,(VEQ.f9.z*c+VEQ.g9.z*s9)*v+n.z*1.2,.45+Math.random()*.25);}}
}
function veqConduite(d9){ // au sol, chaque image : le nez qui rebondit après la pose (ressort ω 13)
  if(VEQ.sp===0&&VEQ.spV===0)return 0;
  VEQ.spV+=(-169*VEQ.sp-2*.32*13*VEQ.spV)*d9;VEQ.sp=THREE.MathUtils.clamp(VEQ.sp+VEQ.spV*d9,-.4,.4);
  if(Math.abs(VEQ.sp)<1e-4&&Math.abs(VEQ.spV)<1e-3){VEQ.sp=0;VEQ.spV=0;}
  return VEQ.sp;
}
function veqCamera(dt){ // au sol : la caméra s'enfonce sous le choc de la pose, puis revient
  if(VEQ.camT<0)return;VEQ.camT+=dt;const x=VEQ.camT/.36;
  if(x>=1){VEQ.camT=-1;return;}
  if(!window.dbgNoShake)camera.position.addScaledVector(F.n,-VEQ.camA*Math.sin(Math.PI*x)*(1-.4*x));
}
function veqNitK(){return VEQ.sautF===flightId?VEQ_K.sautNit:1;} // la pose d'un SAUT NITRO rend moins de nitro
function veqDoigt(bas){ /* LE DOUBLE-TAP (2026-10-14, Léo : « un trick qui s'actionne quand j'appuie deux fois rapidement sur le booster ») : deux appuis BREFS
   sur NITRO — le 1er de moins de 240 ms, le 2e moins de 320 ms après le 1er. Lu aux événements (clavier, doigt, souris), joué par la boucle (`VEQ.dReq`). */
  const n=performance.now();
  if(!bas){VEQ.dUp=n;return;}
  if(VEQ.dDn>0&&n-VEQ.dDn<320&&VEQ.dUp>=VEQ.dDn&&VEQ.dUp-VEQ.dDn<240){VEQ.dDn=0;VEQ.dReq=true;VEQ.dReqT=n;FX2.redP=0;}
  else{VEQ.dDn=n;if(FIGV2.on&&mode==='fall')FX2.redP=n;} /* (2026-10-14, Sacha : « 1 seul tap permet de redresser la voiture ») — (2026-10-15, L'IMPULSION) le redressement ATTEND
     que la fenêtre du double-tap se ferme (figRedP, 330 ms) : avant, le 1er appui d'un double-tap redressait la figure qu'on voulait EMPILER */
}
function figRedP(){if(!FX2.redP||performance.now()-FX2.redP<330)return;FX2.redP=0; // un appui SEUL sur NITRO pendant une figure : la caisse se remet face à la route (FIG.Corps.redresse)
  if(FIGV2.on&&mode==='fall'&&FX2.corps&&!paused&&!gameOver&&FX2.corps.redresse()){FX2.redresse++;try{if(SONV2)sfx('turbo.mini',{vol:-8});}catch(e){}hap(8);}}
function veqDouble(){ // le double-tap : au sol, le SAUT NITRO (et sa figure) ; en vol, une FIGURE (enchaînée)
  if(!started||gameOver||paused||introD||(TUTO.on&&!tutoFigOuverte()))return false; // (2026-10-14) fermé pendant l'auto-école… sauf à son étape FIGURE
  let ok=false;if(mode==='drive'){const r9=frLance();ok=r9===null?veqSaut():r9;}else if(mode==='fall')ok=veqFigure(); // (2026-10-17, Sacha) au sol, LA FIGURE SUR LA ROUTE ; rien dans cette direction : le saut nitro
  if(ok&&TUTO.on)TUTO.sauts=(TUTO.sauts|0)+1;
  return ok;
}
/* LES FIGURES LANCÉES EN ROULANT (2026-10-15 soir, Sacha : « le salto avant ne marche pas quand on le lance en roulant sur la route ;
   vérifie que chaque figure est lançable en roulant, sans être dans les airs ») — MESURÉ au banc (double-tap au sol, `dbgSautFig`, mer de
   nuages) : le saut nitro donne ~1 s de vol sur du plat, mais quand la route REMONTE sous la caisse il ne dure que 0,24-0,40 s — le salto
   (avant comme arrière) restait à 0,3-0,6 tour, posé sans être payé ; le tonneau aussi (1 sur 5). Et un double-tap fait pendant un petit
   rebond (dos d'âne, la pose qui se tasse : hopY/hopV/POSE_F) était jeté sans un bruit.
   · LE SAUT À LA TAILLE DE LA FIGURE : quand une figure part avec le saut, `sautAllonge` intègre la VRAIE trajectoire (la loi de la chute,
     comme le viseur) contre la VRAIE route devant (dalleProche) et, si la pose arrive avant `sautBesoin(f)` (de quoi planter la figure — au
     vol MINIMUM depuis le 17/10, plus à sa durée de catalogue), ajoute juste ce qu'il faut de poussée le long de la normale (+19 m/s au plus : ~11 m de haut au lieu de 5).
     Sur du plat rien ne change (le saut fait déjà son vol) ; c'est la route qui remonte qui allonge le saut.
   · LE DOUBLE-TAP GARDÉ : pendant un rebond, la demande attend la fin du rebond (0,4 s au plus, `VEQ.sautAtt`) au lieu d'être perdue.
   Banc : `dbgSautFig(x,y)` (un double-tap, le joystick en x, y), `dbgSautFig('cause')`. ?saut=fixe = le saut d'avant (21 m/s toujours). */
const SAUT_FIXE=/[?&]saut=fixe\b/.test(location.search),SAUT_P=new THREE.Vector3(),SAUT_V=new THREE.Vector3(),SAUT_N=new THREE.Vector3(),SAUT_D=new THREE.Vector3();
/* (2026-10-17, Sacha : « on doit retomber sur la route plus vite ») LE VOL MINIMUM, PLUS LE VOL DE CATALOGUE : on visait 90 % de la durée
   de catalogue (≥ 1 s) — sur du plat aussi, si bien que CHAQUE saut nitro à figure montait à 1,1-1,9 s et que la gravité ×1,3 n'y changeait
   rien. On ne vise plus que le plus court vol où figLance accepte la figure (`figDMin`, figDose D = (vol − 0,35) × 0,72), + 0,06 s de
   marge : la figure tourne plus vite, la caisse retombe. La route qui remonte reste rattrapée.
   LA FIGURE DU SAUT, PLUS NERVEUSE : celle-là (`douce` : partie toute seule avec le saut) peut se boucler en max(0,25 s ; 40 % du catalogue)
   au lieu de max(0,32 s ; la moitié) — c'est ce plancher qui fixe la durée du saut. MESURÉ (banc cc-banc/sautgrav.cjs, ville, 32 sauts,
   toutes les figures dans toutes leurs directions) : la veille 1,27 s de vol moyen (1,03 s sur du plat), 1,85 s au plus, 6,5 m de haut,
   26 figures payées ; aujourd'hui (×1,45) 1,08 s (0,85 s sur du plat), 1,58 s au plus, 5,6 m, 30 payées, 0 chute. Les figures lancées
   EN VOL gardent leur plancher. */
function figDMin(f,douce){return douce?Math.max(.25,f.D*.4):Math.max(.32,f.D*.5);}
function sautBesoin(f){return f&&f.D?.35+figDMin(f,true)/.72+.06:0;}
function sautVolPredit(dv){ // la durée (s) du vol qui vient de partir, avec dv m/s de plus le long de la normale de la route au décollage — 2,4 = pas de pose en vue
  SAUT_P.copy(fallPos);SAUT_V.copy(fallVel).addScaledVector(SAUT_N,dv);volPlafU(SAUT_V,70); /* (LE VOL QUI SUIT LA ROUTE) la montée et la chute le long du haut du vol */
  const g=FALL_G*gK(),h=1/30;let gi=-1;
  for(let k=1;k<=72;k++){volMonte(SAUT_V,-g*h);SAUT_P.addScaledVector(SAUT_V,h*SPD);if(k<3)continue;
    const bi=dalleProche(SAUT_P.x,SAUT_P.y,SAUT_P.z,8,400,gi);if(bi<0)continue;gi=bi-bi%8;
    SAUT_D.subVectors(SAUT_P,pts[bi]);const hh=SAUT_D.dot(Nn[bi]),l=SAUT_D.dot(B[bi]),vn=SAUT_V.dot(Nn[bi]);
    /* (2026-10-17) + LA FENÊTRE DE tryLand : passé 0,35 s, la caisse à moins de 3 m du bitume qui monte à moins de 4,5 m/s est POSÉE — un
       petit saut est rattrapé au SOMMET. MESURÉ (banc cc-banc/sautgrav.cjs, ville) : à ×1,5 le saut de 21 m/s culmine à 2,1 m, posé à 0,33 s
       au lieu des 0,85 s prédits — la figure n'avait pas le temps (16 payées sur 32). À ×1,3 le plancher d'1 s le cachait. */
    if(Math.abs(l)<ROAD_HALF+1&&((hh>-THICK-1&&hh<.35&&vn<0)||(k*h>.35&&hh>-1.2&&hh<3&&vn<4.5)))return k*h;}
  return 2.4;}
function sautAllonge(f){ // juste après startFall : le saut assez long pour planter `f`
  const need=sautBesoin(f);if(!need||SAUT_FIXE)return 0;
  const t0=sautVolPredit(0);VEQ.tPred=t0;if(t0>=need)return 0;
  let dv=0;for(let d=1.5;d<=19.5;d+=1.5){dv=Math.min(19,d);if(sautVolPredit(dv)>=need)break;} // (2026-10-17) par pas de 1,5 m/s (étaient 3) : pas un dixième de vol de trop
  fallVel.addScaledVector(SAUT_N,dv);volPlafU(fallVel,70);VEQ.allonge=(VEQ.allonge|0)+1;VEQ.dvDer=dv;return dv;}
function sautFigVisee(fo){ // la figure qui partira avec ce saut (celle du glissé, sinon celle de la direction tenue)
  if(!FIGV2.on||!window.FIG)return null;if(fo&&fo.f)return fo.f;
  const S=figSlots();let k=FDIR.on?figDirSlot():0;if(!S[k]&&!(FDIR.on&&!TUTO.on))for(let j=1;j<FIG_NB&&!S[k];j++)k=(k+1)%FIG_NB;return S[k]?FIG.par[S[k]]:null;}
function veqSaut(fo){ // LE SAUT NITRO : le booster plaque la route, la caisse décolle — `fo` (LA FIGURE AU GLISSÉ) : la figure du sens glissé au lieu de l'emplacement suivant
  if(hopY>0||hopV!==0||POSE_F){if(!fo&&mode==='drive'&&!(VEQ.sautAtt>0))VEQ.sautAtt=performance.now();return false;} // (2026-10-15 soir) un rebond : le double-tap ATTEND (veqSautAttente)
  if(performance.now()-VEQ.sautT<VEQ_K.sautCd*1000)return false;
  /* (2026-10-14, GAMEPLAY — bug relevé par GENERAL : « saut nitro au double-tap sur la FACE CACHÉE : startFall(21) part vers le BAS, chute
     mortelle ») SOUS LA DALLE, la caisse est pendue à la route : la pousser « vers le haut de la caisse », c'est la lâcher dans le VIDE (et la
     pose d'après, quand il y en a une, sortait POSÉ LOURD ~10,5 : momentum ÷ 2, une faute, des zones Survivant et des singes semés sur du plat).
     Pas de saut dessous : le « tchk » de la nitro à vide, et rien n'est payé. */
  if(side<0){try{if(SONV2)sfx('nitro.vide');}catch(e){}hap(6);return false;}
  const libre=pwrNitroT>0||PARK.on||startBoostT>0,cout=libre?0:VEQ_K.sautCout*nitroCap();
  if(!libre&&nitroR+nitroX<cout){try{if(SONV2)sfx('nitro.vide');}catch(e){}hap(6);return false;}
  if(cout>0){if(nitroR>=cout)nitroR-=cout;else{nitroX=Math.max(0,nitroX-(cout-nitroR));nitroR=0;}}
  VEQ.sautT=performance.now();
  const p9=carGroup.position.clone();VEQ.sautAtt=0;
  SAUT_N.copy(F.n);const fV9=sautFigVisee(fo); /* (2026-10-15 soir) la normale de la route au décollage et la figure qui partira */
  startFall(VEQ_K.saut,1);VEQ.sautF=flightId;VEQ.l0=0; // un saut VOULU : le volant tenu continue de tourner (pas de verrou), on reste sur sa route
  try{sautAllonge(fV9);}catch(e){} /* (2026-10-15 soir, Sacha : « chaque figure lançable en roulant ») le saut assez long pour la planter, quand la route remonte */
  if(fo&&FIGV2.on)figLance(-1,Object.assign({dispo:2*VEQ_K.saut/(FALL_G*gK())-.15},fo));else // (2026-10-15) le glissé : la figure de SON sens
  veqFigure(2*VEQ_K.saut/(FALL_G*gK())-.15); // la figure part TOUTE SEULE, à la taille du saut
  for(let k=0;k<26;k++){const a=Math.random()*6.2832,r=Math.random()*1.2; // le souffle du booster contre la route
    spawnP(k%3?flames:flameCore,p9.x+Math.cos(a)*r,p9.y+.2,p9.z+Math.sin(a)*r,Math.cos(a)*(3+Math.random()*6),-2-Math.random()*3,Math.sin(a)*(3+Math.random()*6),.18+Math.random()*.16);}
  sparkBurst(sparkGold,p9,10,9);shake=Math.max(shake,.45);fovPunch=Math.max(fovPunch,8);hap([12,30,18]);
  try{if(SONV2)sfx('nitro.plein',{vol:-6});}catch(e){}
  VEQ.n++;return true;
}
const FLC={t:-9e9,k:1,n:0,c:0,ok:false}; // le coup de réacteur du 1er appui, à rendre si l'appui était le début d'un double-tap (voir figLance)
function veqFigsAMoi(){if(cousin()&&window.FIG)return FIG.liste.map(function(f){return f.id;});const L=SAVE.d.figs;return Array.isArray(L)&&L.length?L:['tailwhip'];}
function veqFigure(dispo){ // EN VOL : une figure AU HASARD parmi celles qu'on possède — enchaînée derrière celle en cours
  if(dispo==null&&FDIR.on)return !!figLance(figDirSlot(),{double:true,empile:true,dx:FDIR.x,strict:!TUTO.on}); // (2026-10-15, les deux familles) strict : sans figure avant, le pouce en avant ne fait rien (sauf à l'auto-école) // (2026-10-15, Sacha) LE CHOIX AU JOYSTICK : avant = l'emplacement 1, côté = le 2 (voir FDIR)
    if(dispo==null&&IMPU.on)return !!figImpulsion(); // (2026-10-15) le double-tap EN VOL : L'IMPULSION de flanc (voir figImpulsion)
    if(FDIR.on&&dispo!=null)return !!figLance(figDirSlot(),{dispo:dispo,dx:FDIR.x,strict:!TUTO.on,muet:true}); // (2026-10-15 soir, Sacha : « la figure qui se lance doit dépendre de la touche directionnelle pressée au moment du double-tap : sur la route, on ne peut pas lancer un rodéo placé sur la flèche arrière si on avance ») le SAUT NITRO aussi : la figure de la direction tenue — rien dans cette direction : le saut part sans figure, sans bruit de refus
    return !!figLance(FX2.cyc,{dispo:dispo,double:dispo==null});} // (2026-10-14, LES FIGURES v2) l'emplacement SUIVANT, en vraie physique (le saut nitro ; ?impu=0 : aussi le double-tap en vol)
window.dbgVol=function(a){
  if(a==='ancien'||a==='neuf'){VEQ.on=a==='neuf';return VEQ.on?'vol équilibré':'vol d’avant';}
  if(a==='double')return veqDouble();
  if(a==='tout'){SAVE.d.figs=FIG.liste.map(function(f){return f.id;});SAVE.flush();return SAVE.d.figs;} // (banc) toutes les figures
  if(a==='rien'){SAVE.d.figs=['tailwhip'];SAVE.d.figT0=0;SAVE.flush();return SAVE.d.figs;}
  return {on:VEQ.on,mode:mode,u:+VEQ.u.toFixed(3),steer:+steer.toFixed(3),verrou:+VEQ.l0.toFixed(3),lT:+VEQ.lT.toFixed(2),
    lacet:+(VEQ.by*57.3).toFixed(1),tangage:+(VEQ.bp*57.3).toFixed(1),roulis:+(VEQ.br*57.3).toFixed(1),pose:+VEQ.pose.toFixed(2),ext:+VEQ.ext.toFixed(3),
    haut:FLY_U.toArray().map(function(v){return +v.toFixed(3);}),aMoi:veqFigsAMoi(),
    figures:VEQ.n,rate:VEQ.rate,nez:+(VEQ.sp*57.3).toFixed(1),camT:+VEQ.camT.toFixed(2),hopY:+hopY.toFixed(2),carRoll:+(carRoll9*57.3).toFixed(1),
    cap:+(Math.atan2(fallVel.x,fallVel.z)*57.3).toFixed(1),radar:[VEQ.si,+VEQ.sh.toFixed(1),+VEQ.sl.toFixed(1),Math.round(VEQ.sd)],vy:+fallVel.y.toFixed(1),eta:+(+CAMV.eta).toFixed(2),hautCaisse:+VEQ.pv.set(0,1,0).applyQuaternion(carGroup.quaternion).y.toFixed(3),fallT:+fallTR.toFixed(2),nitro:+(nitroR+nitroX).toFixed(2)};};
/* ===== LES FIGURES v2 — LA PHYSIQUE (2026-10-14, Sacha : « refonte totale du système de figures : on doit pouvoir en équiper jusqu'à 3,
   mais c'est surtout la PHYSIQUE qui doit être exceptionnelle et super fun ; quand on est dans les airs la voiture garde l'inertie de son
   mouvement » · « inspiration Asphalt 8 : les figures dans les airs rapportent du nitro, et de l'aura en les cumulant comme un jeu de BMX —
   front flip, spin ×2… — si tu te poses » · « le double-tap n'exécute pas juste une animation, ça donne une IMPULSION : le front flip, une
   petite explosion au niveau des roues arrière qui propulse l'arrière vers l'avant ; la figure d'après, un spin, s'ADDITIONNE à l'impulsion
   du front flip, de manière fun, réaliste et jouissive »).
   Le moteur vit dans figures.js (`FIG.Corps` : l'état, les explosions, l'inertie, la prise, le planté — voir son commentaire). Ici, le jeu :
   · TROIS EMPLACEMENTS — DEUX depuis le 15/10 (`FIG_NB`, Sacha : « 2 figures à la fois, pas 3 ») — (`SAVE.d.figEq`, `figEquipees`, `figEquipe`, `figRetire`) : on choisit à l'inventaire (onglet FIGURES : toucher =
     équiper / retirer, le numéro de l'emplacement sur la tuile) ou à la boutique (ÉQUIPER) ; pleins, la plus ancienne laisse sa place. Jamais
     choisis : le TONNEAU + les deux dernières achetées.
   · EN VOL, TROIS BOUTONS — RETIRÉS le 15/10 : le double-tap NITRO + le joystick choisit l'emplacement (`FDIR`, `?figdir=0` les rend) — (`#tFig`, à côté de NITRO ; au clavier 1 · 2 · 3) : toucher = l'EXPLOSION de la figure ; TENIR = la poussée
     continue (la toupie accélère : ×2, ×3…), lâcher = elle va se planter. Le double-tap NITRO joue l'emplacement suivant ; au sol, il fait
     le SAUT NITRO et sa figure. Toupies et tonneaux partent du côté où l'on braque (sinon, chacun son tour).
   · L'INERTIE (`figMemo`, `figDepart`) : au décollage la caisse EMPORTE son écart à la trajectoire et sa rotation de route, mesurée entre ses
     deux dernières images de conduite (le lacet du virage, la crête qui fait plonger le nez, la route qui vrille), moins la rotation du vol
     lui-même — elle continue de tourner, se balance, se range (l'air : `FIG.PHY.aero`). Un DRIFT qui décolle part en TOUPIE DE DRIFT (le flat
     spin d'Asphalt 8) si le vol est assez long. La sortie par le BORD garde la bascule de Léo (VEQ), qui a sa physique à elle.
   · LES EXPLOSIONS (`figBoum`, `figJet`) : la flamme au point qui pousse, le souffle à l'opposé, une gerbe d'or, la secousse ; une poussée vers
     le haut donne un petit coup de rein (un peu de vol en plus, jamais vers le bas). Tenue : le jet brûle et le son monte.
   · LA PAIE (`figPaye`) : une figure PLANTÉE (revenue à l'endroit) entre dans la chaîne d'aura avec ses tours (TOUPIE 360 ×2 : son aura
     × 2,25) et rend du NITRO tout de suite (`NITRO2.figAir`, de moins en moins dans un même vol). Comme au BMX, l'aura n'est GAGNÉE qu'à la
     pose : posée en plein tour (> 52°), c'est la CHUTE — les figures de ce vol quittent la chaîne (`figChute`) et le flow tombe.
   Console : `dbgFig()`. */
const FIGV2={on:true}; // les figures v2 (la physique) sont les SEULES : plus de lecteur de Léo (?fig=ancien) ni de figures libres (?fig=libre)
if(window.FIG&&FIG.PHY&&/[?&]elan=0/.test(location.search))FIG.PHY.elan=false; // (2026-10-15 soir, Sacha : « là, on dirait une animation ») L'ÉLAN de figures.js (le coup, la glissade freinée par l'air, le retour souple) ; ?elan=0 = la physique d'avant (prise sèche, planté)
function figDose(f,bud){return window.FIG&&FIG.PHY&&FIG.PHY.elan?Math.min(f.D*1.35,(bud-.35)*.72):Math.min(f.D,(bud-.3)/.85);} // (LE COUP NET) la durée d'une figure : elle OCCUPE le saut — 72 % du vol qui reste (moins la pose), jusqu'à 1,35 × sa durée de catalogue (avant : bouclée en 0,35 s, puis la caisse à plat les deux tiers du saut)
const FIG_NB=3; // (2026-10-15, Sacha : « on doit pouvoir sélectionner seulement 2 figures à la fois, pas 3 » — puis le soir, avec la direction ARRIÈRE : « 3, une par geste ») — les EMPLACEMENTS : ↑ avant (1), ↓ arrière (2), ◄► côté (3)
const FX2={corps:window.FIG&&FIG.Corps?new FIG.Corps():null,slots:[null,null,null],tenus:[false,false,false],ptr:[null,null,null],btOn:[false,false,false],bts:null,
  cv:{n:0,dist:0,ids:{},noms:[],cle:'',finT:0},redP:0,cyc:0,sensAlt:1,nPay:0,nitF:0,nitL:0,pts:0,aura:0,deriveArm:0,drift:false,driftS:1,qm0:new THREE.Quaternion(),qm1:new THREE.Quaternion(),dm:0,memo:false,memoN:false,
  qf:new THREE.Quaternion(),qr:new THREE.Quaternion(),qd:new THREE.Quaternion(),m4:new THREE.Matrix4(),v:new THREE.Vector3(),d:new THREE.Vector3(),
  n:0,payees:0,chutes:0,vis:null,cle:'',wPose:0,jetS:0,herite:null,img:0,att:null,redresse:0};
/* UN EMPLACEMENT PAR DIRECTION (2026-10-15, Sacha : « séparer les figures qui se font sur les côtés de celles qui se font vers l'avant ; dans
   la boutique, classe toutes les figures selon ces deux catégories » · puis « mets aussi une catégorie vers l'ARRIÈRE ; une même figure doit
   avoir marqué à quelle direction elle peut aller : le tonneau, c'est que les côtés, mais le rodéo peut être mis à l'avant ou à l'arrière »
   · « 3, une par geste »). Les directions d'une figure viennent de figures.js (`FIG.dirs`) ; trois emplacements, un par geste du double-tap
   NITRO : ↑ pouce en AVANT (0), ↓ pouce en ARRIÈRE (1), ◄► pouce sur un CÔTÉ (2, elle part de ce côté). Une figure ne va que dans un
   emplacement qu'elle accepte (`figPeut`) ; une figure à deux sens (rodéo, tire-bouchon, cosmique) peut tenir l'avant ET l'arrière — le geste
   choisit alors le sens de son salto (`FIG.oriente`). Équiper prend la place de celle de CET emplacement, jamais d'un autre.
   `SAVE.d.figEq3` = les trois id, à leur place ('' = vide) ; une sauvegarde d'avant (`figEq`, deux id) se range d'elle-même : chaque figure
   dans la 1re direction libre qu'elle accepte. Un emplacement vide se remplit avec la dernière figure possédée qui y va (une qui n'est pas
   déjà ailleurs d'abord) ; le côté a toujours au moins le TONNEAU (offert) — depuis le 15/10, le TAIL WHIP.
   Un emplacement vide : son geste ne fait RIEN (le refus, `o.strict`) — Sacha : « le tonneau est typiquement une figure latérale ». Deux
   exceptions, qui ne sont pas le geste du joueur : l'étape FIGURE de l'auto-école (« tape 2 fois NITRO », pouce au repos — un débutant n'a
   que le tonneau, la leçon serait bloquée) et la figure AUTOMATIQUE du saut nitro au sol : elles prennent un emplacement qui existe. */
const FIG_DIR=['avant','arriere','cote'];
const FIG_FAM=[["VERS L'AVANT",'POUCE EN AVANT','haut'],["VERS L'ARRIÈRE",'POUCE EN ARRIÈRE','bas'],['SUR LES CÔTÉS','POUCE À GAUCHE OU À DROITE','fleches']]; // le nom de chaque direction, le geste qui la joue, son pictogramme (ceux du rappel #fhLeg)
function figPeut(id){const f=window.FIG&&FIG.par[id];if(!f||!FIG.dirs)return [2]; // les emplacements que la figure accepte (0 avant · 1 arrière · 2 côté)
  return FIG.dirs(f).map(function(d){return FIG_DIR.indexOf(d);}).filter(function(i){return i>=0;});}
/* ranger les figures L (de la plus récente à la plus ancienne) dans les emplacements VIDES de S : d'abord celles à UN sens, puis celles à deux
   sens qui ne sont pas déjà ailleurs, puis (reuse) n'importe laquelle qui y va — avec SALTO AVANT + RODÉO, le salto devant, le rodéo derrière
   (MESURÉ au banc Node : rangé dans l'ordre, le rodéo prenait les deux places et le salto disparaissait) */
function figRange(S,L,reuse){for(let passe=0;passe<(reuse?3:2);passe++)for(let k=0;k<FIG_NB;k++)if(S[k]==null)
  for(let i=0;i<L.length;i++){const P=figPeut(L[i]);if(P.indexOf(k)>=0&&(passe===2||(S.indexOf(L[i])<0&&(passe===1||P.length===1)))){S[k]=L[i];break;}}
  return S;}
function figSlots(){if(!window.FIG)return [null,null,'tailwhip'];
  const own=function(id){return !!FIG.par[id]&&figPossede(id);},S=[null,null,null],E3=SAVE.d.figEq3;
  if(Array.isArray(E3)){for(let k=0;k<FIG_NB;k++){const id=E3[k];if(id&&own(id)&&figPeut(id).indexOf(k)>=0)S[k]=id;}}
  else if(Array.isArray(SAVE.d.figEq))figRange(S,SAVE.d.figEq.filter(own).reverse(),false); // une sauvegarde d'avant les trois directions
  if(S[0]==null||S[1]==null||S[2]==null){figRange(S,(cousin()?FIG.liste.map(function(f){return f.id;}):(Array.isArray(SAVE.d.figs)?SAVE.d.figs.slice():[])).filter(own).reverse(),true);
    if(S[2]==null)S[2]='tailwhip';} // (2026-10-15) le côté a toujours au moins le TAIL WHIP (offert)
  return S;}
function figEquipees(){return figSlots().filter(function(id,i,S){return id&&S.indexOf(id)===i;});} // les figures équipées (une fois chacune), l'avant d'abord
/* équiper `id` dans l'emplacement k (0-2) ; sans k (l'inventaire) : le 1er qu'elle accepte et qui ne l'a pas déjà, un vide d'abord */
function figEquipe(id,k){if(!window.FIG||!FIG.par[id]||!figPossede(id))return null;const S=figSlots(),P=figPeut(id);
  if(k==null||P.indexOf(k)<0){k=null;for(let j=0;j<P.length&&k==null;j++)if(S[P[j]]==null)k=P[j];for(let j=0;j<P.length&&k==null;j++)if(S[P[j]]!==id)k=P[j];if(k==null)return {deja:true,slot:P[0]};}
  if(S[k]===id)return {deja:true,slot:k};
  const parti=S[k];S[k]=id;SAVE.d.figEq3=S.map(function(x){return x||'';});SAVE.d.figEq=figEquipees().slice(0,2);SAVE.flush();FX2.cle='';return {parti:parti,slot:k};}
function figMemo(dt){FX2.qm1.copy(FX2.qm0);FX2.qm0.copy(carGroup.quaternion);FX2.dm=dt;FX2.memo=FX2.memoN;FX2.memoN=true;} // (conduite, chaque image) l'assiette des deux dernières images
function figDepart(bord){const C=FX2.corps;FX2.memoN=false;FX2.herite=null;FX2.nitF=0;FX2.nitL=0; /* (loi 6) un vol neuf : rien à rendre */if(!C)return;
  C.vide();FX2.slots[0]=FX2.slots[1]=FX2.slots[2]=null;FX2.nPay=0;FX2.pts=0;if(FX2.cv.cle!=='fin')figCvRaz();else{FX2.cv.n=0;FX2.cv.dist=0;FX2.cv.ids={};FX2.cv.noms.length=0;}FX2.redP=0;FX2.trio=[]; /* (COMBOS À TROIS : un vol neuf, un trio neuf) */FX2.deriveArm=0;FX2.img=0;FX2.att=null;CAMV.eta=99; // (le viseur de l'image d'avant date du vol précédent)
  if(!FIGV2.on||bord||!VEQ.on){FX2.memo=false;return;} // le BORD garde la bascule de Léo (VEQ)
  tmp.copy(fallVel).normalize();FX2.m4.makeBasis(FLY_R,FLY_U,tmp);FX2.qf.setFromRotationMatrix(FX2.m4);
  FX2.qr.copy(FX2.qf).invert().multiply(carGroup.quaternion); // l'écart de la caisse à sa trajectoire : elle l'EMPORTE
  const w=[0,0,0];
  if(FX2.memo&&FX2.dm>0&&FX2.dm<.1){const d=FX2.qd.copy(FX2.qm1).invert().multiply(FX2.qm0); // ce qu'elle a tourné à la dernière image, dans SON repère
    if(d.w<0){d.x=-d.x;d.y=-d.y;d.z=-d.z;d.w=-d.w;}const s9=Math.hypot(d.x,d.y,d.z),a9=2*Math.atan2(s9,d.w);
    if(s9>1e-7&&a9<.5){const k9=a9/s9/FX2.dm;w[0]=d.x*k9;w[1]=d.y*k9;w[2]=d.z*k9;}}
  const v2=fallVel.lengthSq();if(v2>4)w[0]-=FALL_G*gK()*volH(fallVel)/v2; // …moins la rotation du VOL lui-même (la trajectoire plonge, le repère la suit) : on garde l'élan RELATIF
  FX2.memo=false;
  C.herite([FX2.qr.x,FX2.qr.y,FX2.qr.z,FX2.qr.w],w);FX2.herite=w.map(function(x){return +x.toFixed(2);});
  VEQ.qb.copy(FX2.qf); // (le vol équilibré de Léo) son assiette lissée part de celle du VOL : l'écart est dans le corps, il ne compte pas deux fois
  if(FX2.drift)FX2.deriveArm=w[1]>.15?1:w[1]<-.15?-1:FX2.driftS; // LA TOUPIE DE DRIFT : armée — lancée quand on sait combien de temps on vole
}
function figCoup(k,auto){k=Math.min(1.5,k); // l'explosion se SENT : le son, la main, la caméra
  try{if(SONV2)sfx('fig.explose',{var:k>.95?1:0,vol:-4+4*Math.min(1,k)});}catch(e){} /* (2026-10-14, session SON — étape 3) l'explosion de figure a SON son (avant : turbo.super / turbo.mini, ceux du drift) */
  hap(auto?[8,16]:[12,26,12]);shake=Math.max(shake,.16+.14*k);fovPunch=Math.max(fovPunch,3+3*k);}
function figPoint(e){const sp=CARS[level]||CARS[0],hc=(sp.h||1.3)*.5; // le point d'explosion (repère caisse normé → monde) et sa poussée (monde)
  FX2.v.set(e.p[0]*sp.w*.5,hc+e.p[1]*hc,e.p[2]*sp.l*.5);carGroup.localToWorld(FX2.v);FX2.d.set(e.f[0],e.f[1],e.f[2]).applyQuaternion(carGroup.quaternion);}
function figBoum(e){const k=Math.min(1.6,e.k||1),n=Math.round(18+20*k),vx=fallVel.x*SPD*.86,vy=fallVel.y*SPD*.86,vz=fallVel.z*SPD*.86;figPoint(e);
  for(let i=0;i<n;i++){const s9=8+Math.random()*16*k; // LE SOUFFLE part à l'OPPOSÉ de la poussée, et suit un peu la caisse (sinon il resterait planté dans le ciel)
    spawnP(i%2?flames:flameCore,FX2.v.x,FX2.v.y,FX2.v.z,vx-FX2.d.x*s9+(Math.random()-.5)*6,vy-FX2.d.y*s9+(Math.random()-.5)*6,vz-FX2.d.z*s9+(Math.random()-.5)*6,.14+Math.random()*.2);}
  // L'ANNEAU : l'onde de l'explosion s'étale dans le plan perpendiculaire à la poussée (on VOIT que ça a pété là, pas un pot d'échappement)
  tmp2.set(FX2.d.y,-FX2.d.x,0);if(tmp2.lengthSq()<.04)tmp2.set(0,FX2.d.z,-FX2.d.y);tmp2.normalize();tmp3.crossVectors(FX2.d,tmp2).normalize();
  for(let j=0,nb=Math.round(10+6*k);j<nb;j++){const a=j/nb*6.2832,c=Math.cos(a),s9=Math.sin(a),v=10+6*k;
    spawnP(j%2?embers:flameCore,FX2.v.x,FX2.v.y,FX2.v.z,vx+(tmp2.x*c+tmp3.x*s9)*v-FX2.d.x*3,vy+(tmp2.y*c+tmp3.y*s9)*v-FX2.d.y*3,vz+(tmp2.z*c+tmp3.z*s9)*v-FX2.d.z*3,.16+Math.random()*.08);}
  sparkBurst(sparkGold,FX2.v,Math.round(8+8*k),12);
  {const du9=volVu(FX2.d);if(du9>.2&&mode==='fall')volMonte(fallVel,du9*2.4*k);} // le COUP DE REIN : poussée vers le haut, un peu de vol en plus
}
function figJet(r,dt){const n=emiN('figJet',dt),vx=fallVel.x*SPD*.85,vy=fallVel.y*SPD*.85,vz=fallVel.z*SPD*.85; // la poussée TENUE : le jet brûle tant qu'on tient
  for(let b=0;b<r.boums.length;b++){figPoint(r.boums[b]);
    for(let i=0;i<n*2;i++){const s9=12+Math.random()*10;spawnP(i%2?flames:flameCore,FX2.v.x,FX2.v.y,FX2.v.z,vx-FX2.d.x*s9+(Math.random()-.5)*2.5,vy-FX2.d.y*s9+(Math.random()-.5)*2.5,vz-FX2.d.z*s9+(Math.random()-.5)*2.5,.06+Math.random()*.08);}}
  FX2.jetS+=dt;if(FX2.jetS>.28){FX2.jetS=0;try{if(SONV2)sfx('nitrooo.palier',{vol:-10,st:echSt()});}catch(e){}}} // le son MONTE pendant que ça accélère
/* LE TEMPS QU'IL RESTE EN L'AIR : le viseur (CAMV.eta) — sauf quand la caisse S'ÉLOIGNE encore de la route : au décollage elle est à 60 cm
   du bitume et le viseur, qui cherche la dalle à moins de 3 m, annonçait une pose dans 0,12 s (MESURÉ au banc : le salto du saut nitro était
   annulé à la 1re image, ou ne partait pas). Tant qu'elle s'éloigne de SA dalle (le radar de tryLand), c'est la parabole qui compte, le long de
   la normale de la route : le temps d'y revenir (plané nitro compris). */
function figBudget(){let vn,gn,h;
  /* (relecture, MESURÉ au banc du jeu fusionné : un saut nitro sur deux finissait en CHUTE) le max(viseur, parabole) gardait la parabole quand la
     ROUTE REMONTE devant : la pose arrivait plus tôt que prévu et la prise n'avait plus le temps. Le viseur intègre la vraie trajectoire contre la
     vraie route : il fait FOI — sauf tant qu'il voit encore la dalle qu'on vient de quitter (moins de 0,35 s de vol et une pose « dans 0,12-0,36 s »,
     la fenêtre où tryLand ne pose de toute façon pas). Sans pose en vue : la parabole si l'on s'éloigne de la route, sinon 9 s. */
  const raw=CAMV.eta<90?Math.max(0,+CAMV.eta):-1,faux=raw>=0&&fallTR<.35&&raw<=.36;
  if(raw>=0&&!faux)return raw;
  const e=9,i=VEQ.si;
  if(i>=0&&Nn[i]){const n=Nn[i],sd=VEQ.sh>-THICK*.5?1:-1;vn=fallVel.dot(n)*sd;gn=FALL_G*gK()*Math.max(.2,volVu(n)*sd);h=Math.max(0,sd>0?VEQ.sh:-THICK-VEQ.sh)/SPD;}
  else{vn=volVu(fallVel);gn=FALL_G*gK();h=Math.max(0,fallPos.y-lastNearY)/SPD;}
  if(!(vn>1))return faux?.4:e;if(nitroOn)gn*=nitroBlue?.25:.4;
  return (vn+Math.sqrt(vn*vn+2*gn*h))/gn;}
/* (2026-10-14, session SON) LA MATIÈRE DU TOUR : chaque axe a son souffle, accordé sur la gamme du vol — x tangage = fig.salto (le wouomp qui passe par-dessus), y lacet = fig.toupie (le frrrt qui tournoie à plat), z roulis = fig.tonneau (l'air qui s'enroule d'une oreille à l'autre) ; un axe penché prend sa composante la plus forte */
function figMat(a){const x=Math.abs(a[0]),y=Math.abs(a[1]),z=Math.abs(a[2]);return x>=y&&x>=z?'fig.salto':y>=z?'fig.toupie':'fig.tonneau';}
function figPose(dt){const C=FX2.corps;if(!C)return; // en vol, chaque image, une fois l'assiette de vol posée (veqCorps) : le CORPS tourne par-dessus, autour du MILIEU de la caisse
  if(gameOver||mode!=='fall'){C.vide();return;}
  FX2.img++;C.budget=figBudget();C.poseK=VEQ.pose;
  if(FX2.att&&FX2.img>=2){const a=FX2.att;FX2.att=null;figLance(a.s,a.o);} // la figure demandée À L'IMAGE DU DÉCOLLAGE part maintenant que le viseur a mesuré le vol
  if(FX2.deriveArm&&window.FIG&&FIG.auto&&(CAMV.eta<90||fallTR>.1)){const s9=FX2.deriveArm;FX2.deriveArm=0; // la TOUPIE DE DRIFT : seulement si on a le temps de la planter
    if(C.budget>.95&&C.occupe()<3){C.lance(FIG.auto.derive,s9,Math.min(1.05,Math.max(.62,(C.budget-.3)/.85)),{vise:true,douce:true});C.evts.length=0; // pas d'explosion : c'est le DRIFT qui la lance — une bouffée de gomme aux roues arrière
      const sp9=CARS[level]||CARS[0];for(const sd of [-1,1]){FX2.v.set(sd*sp9.w*.45,.3,-sp9.l*.38);carGroup.localToWorld(FX2.v);
        for(let k9=0;k9<7;k9++)spawnP(dust,FX2.v.x,FX2.v.y,FX2.v.z,fallVel.x*SPD*.7+(Math.random()-.5)*6,fallVel.y*SPD*.7+(Math.random()-.5)*4,fallVel.z*SPD*.7+(Math.random()-.5)*6,.35+Math.random()*.25);}
      try{if(SONV2)sfx('turbo.mini',{vol:-6});}catch(e){}hap([8,16]);}}
  for(let i=0;i<3;i++){const r=FX2.slots[i];if(r&&r.tient&&!FX2.tenus[i])C.tiens(r,false);}
  const fin=C.tick(dt);
  for(let i=0;i<C.evts.length;i++)figBoum(C.evts[i]);C.evts.length=0;
  for(let i=0;i<C.figs.length;i++){const r=C.figs[i];if(r.tient&&!r.paye)figJet(r,dt);
    if(!r.paye&&!r.mv.length&&r.osc&&r.t<r.D){const nb=Math.floor(r.t*r.osc.w/Math.PI);if(nb>(r.batDit|0)){r.batDit=nb;const ch9=r.osc.z>.3; /* (2026-10-14, session SON — étape 3) LES BATTEMENTS SE SENTENT : SHIMMY (un « wik » par aller-retour, gauche / droite) et CHANDELLE (au sommet) n'ont pas de tour, donc pas de tic — fig.battement, sur l'échelle du vol sans la consommer */
      try{if(SONV2)sfx('fig.battement',{var:ch9?1:0,vol:-4,st:sonPdAR(ECH+(nb&1)),pan:ch9?0:(nb&1?.5:-.5)});}catch(e){}hap(5);}} /* (2026-10-15) −8 → −4 : le « wom » grave sort à −34, juste au-dessus d'une pièce */
    if(!r.paye&&r.mv.length){let mm=r.mv[0];for(let j=1;j<r.mv.length;j++)if(r.mv[j].tours>mm.tours)mm=r.mv[j]; // CHAQUE TOUR SE SENT : le souffle qui tourne, un tic dans la main (tenue, le rythme accélère)
      const n9=Math.floor(Math.max(0,mm.th)/6.2832+.08);if(n9>(r.tourDit|0)){r.tourDit=n9;try{if(SONV2&&!sfx(figMat(mm.a),{vol:-2,st:echSt()}))sfx('fig.vrille',{vol:-6});}catch(e){} /* (session SON) repli : l'ancien tic tant que la banque n'a pas les trois matières — (2026-10-15, Sacha : « que les figures fassent plus de bruit que quand tu ramasses une pièce ») −8 → −2 : un tour sortait à −39, 9 dB SOUS une pièce ; le DOUM d'un tour sort à −32, 3 dB au-dessus */hap(6);if(n9>=2)sparkBurst(sparkGold,carGroup.position,6,7);}}}
  {const gl9=figGlisseOn(),b9=gl9?64:FDIR.on?128:32;if(FX2.img===8&&TCTL.on&&!((SAVE.d.ast|0)&b9)&&figTutoOk()&&!TUTO.on){SAVE.d.ast=(SAVE.d.ast|0)|b9;SAVE.mark();misBanniere('ASTUCE',TR(gl9?'Depuis NITRO, glisse puis lâche : ◄► un tail whip, ▲ ▼ un salto. Au sol, pousse le joystick en avant pour sauter.':FDIR.on?'En vol, tape 2 fois NITRO : pouce en AVANT, en ARRIÈRE ou sur le CÔTÉ — chaque geste a sa figure.':'En vol, touche une FIGURE : elle explose et fait tourner la caisse. Tiens pour un tour de plus !'),'','rotation');}} // (une fois) le geste des figures, dit au 1er vol — (2026-10-15) le joystick : un bit neuf, ceux qui ont lu l'ancienne la relisent — (le soir) les TROIS directions : encore un bit neuf (128)
  {let pv9=0;for(let i=0;i<C.figs.length;i++){const r=C.figs[i];if(!r.paye&&r.f&&r.f.piv){pv9=r.f.piv;break;}}FX2.pivK=(FX2.pivK||0)+(pv9-(FX2.pivK||0))*Math.min(1,dt*14);} // (2026-10-15) LE TAIL WHIP : le point fixe glisse du milieu vers le NEZ
  const q=C.q;if(q[3]<.9999995){const hc=(CARS[level].h||1.3)*.5,zp=(FX2.pivK||0)*(CARS[level].l||4.4)*.5;VEQ.pv.set(0,hc,zp).applyQuaternion(carGroup.quaternion);
    VEQ.qr.set(q[0],q[1],q[2],q[3]);carGroup.quaternion.multiply(VEQ.qr);
    VEQ.pv2.set(0,hc,zp).applyQuaternion(carGroup.quaternion);carGroup.position.add(VEQ.pv).sub(VEQ.pv2);FX2.pivD=VEQ.pv.distanceTo(VEQ.pv2);}else FX2.pivD=0; // pivD (banc) : de combien le milieu s'écarte pour garder le nez en place
  for(let i=0;i<fin.length;i++)figPaye(fin[i]);
}
/* L'AUTO-ÉCOLE : les figures y sont fermées, SAUF à l'étape FIGURE — la leçon (GENERAL) l'ouvre par `tutoFigOuverte()` (nom convenu, ne pas renommer) */
function figTutoOk(){return !TUTO.on||(typeof tutoFigOuverte==='function'&&!!tutoFigOuverte());}
function figLance(s,o){o=o||{};const C=FX2.corps;if(!FIGV2.on||!C||!window.FIG)return null;
  if(!started||gameOver||paused||introD||!figTutoOk()||mode!=='fall')return null;
  const S=figSlots();let f;if(o.f){f=o.f;s=-1;}else{s=Math.abs(s|0)%FIG_NB;if(!S[s]){if(o.strict){if(!o.muet)figRefus(s);return null;}for(let k=1;k<FIG_NB&&!S[s];k++)if(S[(s+k)%FIG_NB])s=(s+k)%FIG_NB;}if(!S[s])return null;f=FIG.par[S[s]];if(f&&FIG.oriente&&s<2)f=FIG.oriente(f,FIG_DIR[s]);}if(!f)return null; // o.f : une figure hors emplacement (L'IMPULSION du double-tap) — s = −1, aucun bouton · (2026-10-15, les directions) s = l'EMPLACEMENT (0 avant, 1 arrière, 2 côté) ; vide : le GESTE (o.strict) est refusé — jamais un tonneau au pouce en avant —, le reste prend un emplacement qui existe (voir figSlots) ; à l'avant / à l'arrière, la figure est ORIENTÉE (son salto dans ce sens : le rodéo avant ≠ le rodéo arrière)
  if(o.dispo!=null)o.douce=true; // la figure du SAUT NITRO part toute seule : le joueur ne l'a pas risquée (pas finie = pas payée, jamais une CHUTE)
  /* À L'IMAGE DU DÉCOLLAGE (le saut nitro, un doigt déjà posé) le viseur n'a pas encore mesuré le vol : une route qui plonge sous la caisse
     reprend la caisse en 0,1 s (MESURÉ au banc : le salto du saut nitro partait, puis s'annulait). La demande attend UNE image (16 ms). */
  if(FX2.img<2&&!o.attendu){FX2.att={s:s,o:Object.assign({},o,{attendu:true,dispo:null})};if(s>=0)FX2.cyc=(s+1)%FIG_NB;return {attente:true};}
  const nc9=figNitCout(o);if(nc9>0&&nitroR+nitroX+(o.double&&FLC.ok&&performance.now()-FLC.t<450?FLC.c:0)<nc9){figRefus(s);return null;} // (2026-10-17, LA FIGURE SE PAIE — loi 6 du réservoir) pas 20 % dans la jauge (le coup de réacteur du double-tap, qui sera rendu, compté) : elle ne part pas
  const bud=o.dispo!=null?o.dispo:figBudget(),D=figDose(f,bud);
  let ax=0;for(let i=0;i<f.m.length;i++){const m=f.m[i];if(!(m.a[0]!==0&&m.a[1]===0&&m.a[2]===0)){ax=Math.abs(m.a[2])>Math.abs(m.a[1])?2:1;break;}}
  const st9=o.dx!=null&&Math.abs(o.dx)>=.3?o.dx:steer; // (2026-10-15, les deux familles) le geste de CÔTÉ donne le pouce LUI-MÊME (figDirSlot) : la figure part de ce côté, sans attendre que le volant lissé l'ait rejoint
  let enC=null;if(o.sens==null&&Math.abs(st9)<=.25)for(let i=0;i<C.figs.length;i++){const r9=C.figs[i];if(r9.f===f&&!r9.paye&&r9.mv.length){enC=r9;break;}} // (L'IMPULSION) pouce au neutre pendant que la même figure tourne (même le tonneau AUTOMATIQUE du saut nitro) : on CONTINUE dans son sens — alterner l'ÉTEIGNAIT (MESURÉ au banc : tonneau ×3 annulé par le bouton TONNEAU)
  const sens=o.sens!=null?o.sens:Math.abs(st9)>.25?(ax===2?(st9>0?-1:1):(st9>0?1:-1))*(f.piv?-1:1):enC?enC.s:(FX2.sensAlt=-FX2.sensAlt); // (2026-10-15) f.piv, le TAIL WHIP : la POUPE part du côté du pouce (comme au GLISSER) // du côté où l'on braque (steer > 0 = à gauche) — o.sens : le GLISSER de Léo l'impose
  const bm9=C.mode==='prise'; // (COMBOS À TROIS) lancée pendant la PRISE de la précédente : l'enchaînement PILE
  let r=null;if(o.empile)for(let i=0;i<C.figs.length;i++){const r9=C.figs[i];if(r9.f===f&&!r9.paye&&r9.s===sens&&r9.mv.length){r=r9;break;}} // (L'IMPULSION) la même figure tourne encore dans ce sens : on EMPILE un tour (sur le tonneau du saut nitro aussi : le joueur le reprend en main, il n'est plus « automatique »)
  if(r){const el9=FIG.PHY&&FIG.PHY.elan,D2=el9?Math.min(f.D*1.35+Math.max(0,r.D-r.t),(bud-.35)*.72):figDose(f,bud-C.reste());if(r.mv[0].tours>=IMPU.max||D2<Math.max(.32,f.D*.5)){figRefus(s);return null;} /* (le coup net) le tour EMPILÉ se dose sur ce qui reste à CETTE figure (D2 = le temps pour TOUT finir) — MESURÉ : réserver le temps des autres figures refusait le DOUBLE SALTO du saut nitro */C.empile(r,D2);r.douce=false;}
  else{if(C.occupe()>=3||D<figDMin(f,o.douce)){figRefus(s);return null;} // trop tard pour la planter : rien ne part (« ça les pose automatiquement ») — (le coup net) jamais en moins de 0,32 s : le coup serait un flou
    r=C.lance(f,sens,D,{tient:s>=0&&!!o.tient&&!!FX2.tenus[s],douce:!!o.douce});if(r)r.bm=bm9;}
  if(s>=0){FX2.slots[s]=r;FX2.cyc=(s+1)%FIG_NB;}FX2.n++;VEQ.n++;
  {const D9=FIG.dirs?FIG.dirs(f):[];r.flD=f.sens==='avant'||(D9.length===1&&D9[0]==='avant')?'haut':f.sens==='arriere'||(D9.length===1&&D9[0]==='arriere')?'bas':((ax===2||f.piv)?(sens<0?'gauche':'droite'):(sens>0?'gauche':'droite'));} /* (le TAIL WHIP : la flèche montre le côté où part la POUPE, celui du pouce) */ // (HUD v4) la flèche du geste : ▲ ▼, ou le CÔTÉ où elle part (tonneau : sens −1 = à gauche ; toupie, hélico : +1 = à gauche)
  /* LE DOUBLE-TAP N'EST PAS UN BOOST (la règle des FIGURES LIBRES de GAMEPLAY, gardée) : son 1er appui avait allumé le réacteur en vol (+46,
     12 % de la jauge) — rendu, vitesse et nitro. Un appui seul reste le boost ; marteler fait tourner, pas filer. */
  if(o.double&&FLC.ok&&performance.now()-FLC.t<450){FLC.ok=false;if(FLC.k<1)fallVel.multiplyScalar(FLC.k);nitroR=Math.min(nitroCap(),nitroR+FLC.c);} // (le FLC des FIGURES LIBRES, posé au coup de réacteur)
  if(nc9>0)figNitPaye(nc9);r.nitN=(r.nitN|0)+1;FX2.nitL=(FX2.nitL|0)+1; /* (POSER UNE FIGURE RAPPORTE) le lancement compte pour la pose, plantée ou pas */ // (loi 6) les 20 % partent ; la figure (celle du SAUT NITRO aussi : le saut a payé) comptera pour la pose — un tour EMPILÉ compte pour une de plus
  // le SAUT NITRO a déjà son souffle et son motif dans la main (Léo) : l'explosion de la figure ne revibre pas par-dessus (une seule voix par événement)
  const sautN=performance.now()-VEQ.sautT<120;
  if(sautN){try{if(SONV2)sfx('fig.explose',{var:0,vol:-6});}catch(e){}}else figCoup(Math.hypot(r.imp[0],r.imp[1],r.imp[2])/10,false);figBtFx(s,'boum');fhLance(s,r,o); // (HUD des figures v3) son nom tombe en grand
  return r;}
/* LA FIGURE SE PAIE (2026-10-17, Sacha — loi 6 du réservoir, réglages dans NITRO2.figN) : 20 % de la jauge au lancement, 40 % par
   figure plantée rendus à la pose RÉUSSIE (figNitRend, appelée par tryLand et levreRattrape), perdus sinon. Offerte (rien à payer, elle
   rapporte quand même) : la figure du SAUT NITRO (le saut a déjà payé ses 20 %), sous NITRO INFINIE, au parc, à l'auto-école.
   `dbgFigNit()` : le prix, ce qui attend la pose, la jauge.
   POSER UNE FIGURE RAPPORTE DU NITRO (2026-10-17 soir, Sacha : « poser une figure doit rapporter du nitro ») — MESURÉ au banc (fignit.cjs,
   vraie partie) : la règle tournait, mais deux fuites l'avalaient. (1) LE PLAFOND : à la pose la jauge est souvent presque pleine (la pose
   elle-même la remplit d'abord) — 1,2 à rendre, 0,57 crédités, le reste s'évaporait. Le trop-plein passe désormais dans la RÉSERVE BLEUE
   (`nitroX`, plafond 2 comme les fruits) : rien n'est perdu, et il vole vers la partie bleue de la barre. (2) LA FIGURE PAS BOUCLÉE : un tour
   empilé, ou relayé, qui n'avait pas fini son dernier quart au contact (fréquent depuis la gravité ×1,45) était payé 20 % et ne rendait RIEN,
   sans un mot — 3 lancements, 1 rendu. Le compte de la pose est maintenant celui des LANCEMENTS du vol (`FX2.nitL`, celui qui a payé) :
   chaque figure lancée rend ses 40 % à une pose réussie. Pose ratée (en plein tour, de travers, à contresens) : rien, comme avant. La toupie
   automatique du drift ne passe pas par figLance : ni coût ni gain. Rend le nitro crédité (jauge + réserve). */
function figNitCout(o){return o.douce||pwrNitroT>0||PARK.on||TUTO.on?0:NITRO2.figN.cout*nitroCap();}
function figNitPaye(q){const av=nitroR+nitroX;if(nitroR>=q)nitroR-=q;else{nitroX=Math.max(0,nitroX-(q-nitroR));nitroR=0;}if(LIVRE.on)livre('n-:figure',av-nitroR-nitroX);} // (la réserve bleue après la jauge, comme le saut nitro)
function figNitRend(ok){const n=FX2.nitL|0;FX2.nitF=0;FX2.nitL=0;if(!ok||n<=0)return 0;
  const cap=nitroCap(),q=NITRO2.figN.rend*n*cap,av=nitroR,ax=nitroX;
  nitroGain(Math.min(q,Math.max(0,cap-nitroR)),'figure'); // la jauge d'abord
  const reste=q-(nitroR-av);if(reste>.001){nitroX=Math.min(2,nitroX+reste);const dx=nitroX-ax;if(LIVRE.on){livre('n+:figure.reserve',dx);livre('n0:figure',reste-dx);}if(dx>.03&&!volgNitro('x',dx))nbPrend('x');} // …le trop-plein dans la réserve bleue
  return (nitroR-av)+(nitroX-ax);}
window.dbgFigNit=function(){return {cout:+(NITRO2.figN.cout*nitroCap()).toFixed(3),aRendre:FX2.nitL|0,plantees:FX2.nitF|0,rendSiPose:+(NITRO2.figN.rend*(FX2.nitL|0)*nitroCap()).toFixed(3),jauge:+nitroR.toFixed(3),reserve:+nitroX.toFixed(3),cap:nitroCap(),mode:mode};};
function figRefus(s){try{if(SONV2)sfx('nitro.vide');}catch(e){}hap(6);figBtFx(s,'non');fhLegFx(s,true);}
/* LES COMBOS À TROIS (2026-10-14, Sacha à GAMEPLAY — « réfléchis à comment ça peut être parfait, peu de jeux l'ont fait ; jouissif ; plein
   de combinaisons de trois figures à partir des moves existants » — repris par GENERAL). Chaque TROISIÈME figure plantée d'un même vol
   ferme un TRIO (1-2-3, puis 4-5-6…). Son NOM dépend des AXES des trois figures, dans n'importe quel ordre : T le tonneau (l'axe de la
   caisse), P la toupie (l'axe vertical), S le salto (l'axe des roues), M le mixte (deux axes, un axe penché, un battement). Cela donne
   20 familles (COMBO_NOMS) : on les découvre avec ses trois emplacements, et chaque figure achetée en ouvre d'autres.
   · LA PRIME : de l'AURA = la moitié des trois figures. ×1,5 pour LE GYROSCOPE (les trois axes purs), +25 % par enchaînement PILE
     (la figure suivante lancée pendant la PRISE de la précédente : `r.bm`, posé par figLance), ×2 à la 1re fois. Elle entre dans la
     chaîne comme une figure (FX2.pts) : une pose ratée (figChute) l'emporte avec les autres. (Plus de nitro depuis la loi 6 : la pose paie.)
   · LE CARNET : `SAVE.d.combos` {famille: nombre}. Une famille neuve → bandeau « NOUVEAU COMBO » avec le compte « n / 20 ».
   `?combo=0` les éteint. `dbgCombo()` : le carnet, le trio en cours. */
const COMBO_ON=!/[?&]combo=0\b/.test(location.search);
const COMBO_NOMS={TTT:['LA PERCEUSE','THE DRILL'],PPP:['LE TOURBILLON','THE WHIRLWIND'],SSS:['LA GRANDE ROUE','THE FERRIS WHEEL'],MMM:['LE GRAND CHAOS','TOTAL CHAOS'],
  PTT:['LE TAILLE-CRAYON','THE SHARPENER'],STT:['LA CENTRIFUGEUSE','THE CENTRIFUGE'],MTT:['LE MIXEUR','THE BLENDER'],
  PPT:['LA TOUPIE FOLLE','THE MAD TOP'],PPS:['LE MOULINET','THE PINWHEEL'],MPP:['LE DERVICHE','THE DERVISH'],
  PSS:['LA MACHINE A LAVER','THE WASHER'],SST:['LA ROUE DU HAMSTER','THE HAMSTER WHEEL'],MSS:['LE CASCADEUR','THE STUNTMAN'],
  MMT:['LA TORNADE','THE TORNADO'],MMP:['LA BOULE DISCO','THE DISCO BALL'],MMS:['LE CRASH-TEST','THE CRASH TEST'],
  PST:['LE GYROSCOPE','THE GYROSCOPE'],MPT:['LE SATELLITE','THE SATELLITE'],MST:['LE BOOMERANG','THE BOOMERANG'],MPS:['LE KAMIKAZE','THE KAMIKAZE']};
const COMBO_K={part:.5,gyro:1.5,pile:.25,neuf:2};
function comboAxe(f){const m=f&&f.m||[];if(m.length!==1||!m[0].t)return 'M';const a=m[0].a;
  if(a[2]&&!a[0]&&!a[1])return 'T';if(a[1]&&!a[0]&&!a[2])return 'P';if(a[0]&&!a[1]&&!a[2])return 'S';return 'M';}
function comboNote(r){try{ // appelée par figPaye, figure plantée (en vol ou à la pose)
  if(!COMBO_ON||!r||!r.f||r.douce)return;const T=FX2.trio||(FX2.trio=[]); // (GAMEPLAY) jamais les figures AUTOMATIQUES (saut nitro, toupie de drift) : un saut nitro ne doit pas suffire
  T.push({ax:comboAxe(r.f),aura:Math.round(r.f.aura||60),bm:!!r.bm});
  if(T.length<3)return;
  const tr=T.splice(0,3),cle=tr.map(function(x){return x.ax;}).sort().join(''),nm=COMBO_NOMS[cle];if(!nm)return;
  const D=SAVE.d.combos||(SAVE.d.combos={}),neuf=!D[cle];D[cle]=Math.min(1e6,(D[cle]|0)+1);SAVE.mark();
  const pile=(tr[1].bm?1:0)+(tr[2].bm?1:0),K=COMBO_K,en=LANG==='en';
  const aura=Math.round((tr[0].aura+tr[1].aura+tr[2].aura)*K.part*(cle==='PST'?K.gyro:1)*(1+K.pile*pile)*(neuf?K.neuf:1));
  const txt=(en?nm[1]:nm[0])+(pile?(en?' · ON BEAT':' · PILE')+(pile>1?' ×2':''):'');
  FX2.aura=aura;const c0=CHA.pts;
  addTrick('fig_combo_'+cle,txt,Math.round(aura/16),3); // (dans la chaîne comme une figure : sa famille s'use à la redite, ×0,7)
  FX2.aura=0;FX2.pts+=Math.max(0,CHA.pts-c0);FX2.combos=(FX2.combos|0)+1;
  try{fhTrio(en?nm[1]:nm[0]);}catch(e){} // (2026-10-18, HUD des figures v5) le combo nommé s'ÉCRIT en grand, ses trois maillons soulignés — avant, seul le tout premier se voyait (la bannière NOUVEAU COMBO)
  hap([14,30,14,30,40]);
  try{sonCombo(cle,neuf);}catch(e){} // (SON) la signature sonore du combo : livrée par la session SON — muet tant qu'elle n'existe pas
  if(neuf){const n=Object.keys(D).filter(function(k){return COMBO_NOMS[k];}).length;
    try{misBanniere(en?'NEW COMBO':'NOUVEAU COMBO',(en?nm[1]:nm[0])+' · '+n+' / 20','+'+aura,'etoile');}catch(e){}
    try{if(SONV2)sfx('ui.debloque',{t:.6});}catch(e){}} // (SON) après le sceau de sonCombo, pas par-dessus
}catch(e){}}
function figPaye(r){const f=r&&r.f;if(!f)return;const reps=Math.max(1,r.reps|0),aura=Math.round((f.aura||60)*(reps>1?1+(reps-1)*1.25:1));
  FX2.aura=aura;const c0=CHA.pts;
  {const s9=CHA.sansPop;CHA.sansPop=true;try{addTrick('fig_'+f.id,figNom(f,reps,'fr'),Math.round(aura/16),aura>=120||reps>=2?2:1);}finally{CHA.sansPop=s9;}} // le nom français : TR le traduit (« TOUPIE 360 ×2 ») — (HUD des figures v3) plus de « TONNEAU +120 » au-dessus de la caisse : le HUD des figures le dit
  FX2.aura=0;FX2.pts+=Math.max(0,CHA.pts-c0);FX2.payees++;const neuf9=!FX2.cv.ids[f.id];figCvNote(f,reps);fhPlante(r,f,reps,neuf9); // (2026-10-15) LE COMBO DU VOL — (v4) une figure NEUVE dans le vol : sa pastille est plus grosse
  if(!r.douce){CAMV.zoom=Math.max(CAMV.zoom,.42);shake=Math.max(shake,.22);try{sparkBurst(sparkGold,carGroup.position,14,9);}catch(e){}} // (LE COUP NET) la plantée CLAQUE : un coup de zoom sec (le même que la pose PARFAITE, en petit), une gerbe d'or — pas de gel d'image (verdict du 26/09 : plus aucun ralenti)
  FX2.nitF+=r.nitN|0;FX2.nPay++; // (2026-10-17, loi 6) la figure plantée ne remplit plus le NITRO tout de suite (ASPHALT 8) : elle COMPTE, la pose réussie la rend — 40 % chacune
  hap([10,22,10]);
  comboNote(r);} // (2026-10-14) LES COMBOS À TROIS
function figChute(){if(FX2.pts>0&&CHA.n>0){CHA.pts=Math.max(0,CHA.pts-FX2.pts);chaHud(true,false);}FX2.pts=0;FX2.chutes++; // posée en plein tour : les figures du vol quittent la chaîne (BMX)
  if(FX2.cv.n>0)figCvFin(false,0);}
/* ===== L'IMPULSION + LE COMBO DU VOL (2026-10-15, Sacha : « refonte du système de figure : quand on fait une figure, le double-tap sur le
   nitro doit générer une sorte d'IMPULSION d'un côté de la voiture ; puis pour faire des figures, s'inspirer des jeux de BMX ou d'Asphalt 8
   pour pouvoir CUMULER plusieurs figures et faire des cumulés »).
   · L'IMPULSION (`figImpulsion`) : en vol, le double-tap NITRO ne joue plus « l'emplacement suivant » — il fait exploser UN FLANC de la caisse
     (le point d'explosion du tonneau, `FIG.boums`) : pouce à gauche, le flanc droit saute et elle roule vers la gauche ; à droite, l'inverse ;
     pouce au neutre, elle continue le tonneau en cours (à l'arrêt : un flanc, puis l'autre au vol suivant). Re-double-tap dans le MÊME sens pendant qu'elle roule : la poussée S'AJOUTE (`Corps.empile`) —
     TONNEAU ×2, ×3, ×4 (`IMPU.max`). Dans l'autre sens, l'explosion freine celle d'avant (la physique, pas une règle). Les trois boutons
     de figure restent : ce sont eux qui ajoutent une TOUPIE, un SALTO… par-dessus le tonneau — la caisse part en vrille composée.
     Un appui SEUL sur NITRO redresse toujours (après la fenêtre du double-tap : `figRedP`).
   · LE COMBO DU VOL (`FX2.cv`, `#figCombo`) — le BMX : chaque figure PLANTÉE du vol s'ajoute à la ligne (« TONNEAU×2 + TOUPIE + AVANT ») et
     fait monter le × : +0,5 par figure DIFFÉRENTE, +0,25 pour une redite (`IMPU.xVar`/`xRep`, plafond `xMax`) — varier paie, marteler la même
     ne paie presque pas. À la POSE propre, le combo s'ENCAISSE : la chaîne reçoit l'aura des figures du vol × (le × − 1), sous « COMBO ×2,5 ».
     Posée en plein tour (CHUTE) : « COMBO PERDU », tout s'envole (figChute). Le nitro à chaque figure plantée (Asphalt 8) ne change pas.
   `?impu=0` : le double-tap en vol rejoue l'emplacement suivant (les FIGURES v2 du 14/10). Console : `dbgImpu()`. */
const IMPU={on:!/[?&]impu=0\b/.test(location.search),max:4,xVar:.5,xRep:.25,xMax:4};
/* LE CHOIX AU JOYSTICK (2026-10-15, Sacha : « quand le joystick est vers l'avant, ça déclenche la figure 1, et quand il est sur les côtés, la
   figure 2 » — choisi : au DOUBLE-TAP NITRO, et plus de boutons à l'écran). Le pouce gauche au moment du double-tap : sur un CÔTÉ (l'horizontale
   domine) = l'emplacement 2, qui part de ce côté (figLance lit le braquage) ; vers l'avant — ou au repos, ou en arrière — = l'emplacement 1.
   Re-double-tap dans la même direction pendant qu'elle tourne : le tour S'EMPILE (×2, ×3, ×4 : `IMPU.max`), comme l'impulsion de la veille.
   Au clavier : ← → = 2, sinon 1 (les touches 1 · 2 jouent toujours leur emplacement). `?figdir=0` rend le 15/10 (boutons + impulsion de flanc).
   Console : `dbgFigDir(x,y)` = un double-tap en vol, le pouce en (x : le côté, y : l'avant). */
const FDIR={on:!/[?&]figdir=0\b/.test(location.search),force:null,x:0};
if(FDIR.on)document.body.classList.add('figDir');
function figDirSlot(){let x,y;
  if(FDIR.force){x=FDIR.force[0];y=FDIR.force[1];}
  else if(TCTL.act){x=TCTL.st;y=TCTL.sv;}
  else{x=(keys.KeyA||keys.KeyQ||keys.ArrowLeft?1:0)-(keys.KeyD||keys.ArrowRight?1:0);y=(keys.KeyW||keys.KeyZ||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);}
  FDIR.x=x;if(Math.abs(x)>=.3&&Math.abs(x)>=Math.abs(y)*.85)return 2;return y<=-.3?1:0;} // FDIR.x : le pouce lui-même, que figLance lit pour le côté (o.dx) — (2026-10-15 soir, la direction ARRIÈRE) ◄► = 2 · pouce vers le BAS = 1 (arrière) · vers le haut ou au repos = 0 (avant)
window.dbgFigDir=function(x,y){FDIR.force=[+x||0,+y||0];try{const s=figDirSlot(),r=figLance(s,{double:true,empile:true,dx:FDIR.x,strict:!TUTO.on});return r?(r.attente?'attente':'ok geste '+(s+1)+' '+r.f.id+(r.f.sens?' '+r.f.sens:'')+(r.s>0?'+':'-')):'refus';}finally{FDIR.force=null;}};
function figImpulsion(){const f=window.FIG&&FIG.par.tonneau;if(!f)return null;return figLance(-1,{f:f,double:true,empile:true});}
window.dbgSautFig=function(x,y){if(x==='cause')return {cause:mortCause,mode:mode,go:gameOver};FDIR.force=[+x||0,+y||0];let r;try{r=veqDouble();}finally{setTimeout(function(){FDIR.force=null;},250);} /* (banc, 2026-10-15 soir) un double-tap NITRO, le joystick en (x : le côté, y : l'avant) — au sol : le SAUT NITRO et la figure de cette direction */
  return {ok:!!r,mode:mode,hopY:+hopY.toFixed(2),hopV:+hopV.toFixed(2),pose:!!POSE_F,cd:Math.round(performance.now()-VEQ.sautT),nit:+(nitroR+nitroX).toFixed(2),slot:figDirSlot(),allonge:VEQ.allonge|0,dv:VEQ.dvDer||0,tPred:VEQ.tPred||0};};
/* ===== LA FIGURE AU GLISSÉ (2026-10-15, Léo : « une nouvelle manière de faire les tricks, changeable dans les réglages, là où ça devrait
   être : la figure se fait par une GLISSE vers un sens puis LÂCHÉE, depuis le bouton NITRO — la nitro toujours présente »). Le réglage :
   RÉGLAGES › JEU › FIGURES (et la PAUSE) — 2 TAPS (le double-tap, d'origine) · GLISSER (`SAVE.d.figG`, écrit par `figGBascule` seul).
   · EN GLISSER, le pouce se pose sur NITRO (le boost part, comme toujours, et tient tant que le pouce reste posé), GLISSE d'au moins
     `GLI.seuil` px, puis LÂCHE : la figure de ce SENS (Léo a choisi « le côté / l'axe ») — ← → = le TONNEAU de ce côté (l'IMPULSION de
     flanc de Sacha ; on recommence dans le même sens pendant qu'elle roule : TONNEAU ×2, ×3…), ↑ = SALTO ARRIÈRE, ↓ = SALTO AVANT
     (offerts à tous, comme le tonneau de l'impulsion). AU SOL : le SAUT NITRO, avec la figure du sens (Léo : « comme le double-tap »).
   · Revenu près du point d'appui avant de lâcher = rien (on a changé d'avis). Pendant le glissé, `#figGl` dit la figure qui partira.
   · Le double-tap et le redressement à un tap du BOUTON sont coupés (taper NITRO = booster, rien d'autre) ; le CLAVIER garde son double-tap
     (une touche ne glisse pas, LE CHOIX AU JOYSTICK de Sacha y vit). Le rappel « ↑ 1 · ◄► 2 » (`#fhLeg`, celui du double-tap) se tait en
     GLISSER (`body.figGlisse`) : il dirait un geste qui ne marche plus au doigt.
   Lu aux événements (doigt, souris du cadre de l'ordi), joué par la boucle (`GLI.req`, comme `VEQ.dReq`). Console : `dbgGlisse()`,
   `dbgGlisse('l'|'r'|'u'|'d')` (un glissé sans doigt), `dbgGlisse('on'|'off')`. */
const GLI={seuil:38,coup:90,req:null,reqT:0,n:0,refus:0,der:null,id:null,x0:0,y0:0,vu:null,el:null,tq:0,fait:false,part:false,coups:0};
function figGlisseOn(){return !!(SAVE.d&&SAVE.d.figG==='glisse');}
function figGBascule(){SAVE.d.figG=figGlisseOn()?'tap':'glisse';SAVE.flush();figGClasse();}
function figGClasse(){try{document.body.classList.toggle('figGlisse',figGlisseOn());}catch(e){}}
figGClasse();
function figGDir(dx,dy){const ax=Math.abs(dx),ay=Math.abs(dy);if(Math.max(ax,ay)<GLI.seuil)return null;return ax>=ay?(dx<0?'l':'r'):(dy<0?'u':'d');}
function figGFig(d){const F=window.FIG&&FIG.par;return F?(d==='l'||d==='r'?(F.tailwhip||F.toupie):d==='u'?F.saltoa:F.saltov):null;} // (2e passe, Léo : « en l'air 360 aussi ») ← → = le 360 à plat — (2026-10-15, Léo par le MANAGER) ← → EN L'AIR = le TAIL WHIP de ce côté (le nez reste, la poupe fait le tour)
function figGOpts(d){const f=figGFig(d);if(!f)return null;
  return {f:f,sens:f.piv?(d==='l'?-1:d==='r'?1:1):(d==='l'?1:d==='r'?-1:1),empile:true};} // (figLance, toupie : pouce à GAUCHE → sens +1, le nez part à gauche ; un salto garde son sens) — le TAIL WHIP : glissé à GAUCHE → la POUPE part à gauche (sens −1 : le nez tient, la queue fouette du côté du pouce)
function figGNom(d){if(mode==='drive')return d==='l'||d==='r'?'SLIDE 360':d==='u'?'WHEELIE':'STOPPIE';const f=figGFig(d);return f?sansAcc(LANG==='en'?f.en:f.n):'';} // ce que dit la flèche
function figGJoue(d){ // (la boucle) le glissé lâché
  if(!started||gameOver||paused||introD||(TUTO.on&&!tutoFigOuverte())){GLI.refus++;return false;}
  const o=figGOpts(d);let ok=false;
  if(o){if(mode==='drive')ok=gsolLance(d);else if(mode==='fall')ok=!!(FIGV2.on?figLance(-1,o):veqFigure());} // (2e passe) AU SOL : la figure se fait AU SOL (voir GSOL)
  if(ok){GLI.n++;GLI.der=d;if(TUTO.on)TUTO.sauts=(TUTO.sauts|0)+1;}else GLI.refus++;
  return ok;}
function figGVoit(d,x,y){ // la flèche du glissé : ce qui partira si on lâche ici
  if(!(d&&started&&!gameOver&&!paused))d=null;
  let el=GLI.el;if(!el){if(!d)return;el=GLI.el=document.createElement('div');el.id='figGl';el.setAttribute('aria-hidden','true');el.innerHTML='<i class="pxi"></i><b></b>';document.body.appendChild(el);}
  if(!d){if(GLI.vu){GLI.vu=null;el.classList.remove('on');}return;}
  if(GLI.vu!==d){GLI.vu=d;
    el.firstChild.className='pxi pxi-'+(d==='l'?'gauche':d==='r'?'droite':d==='u'?'haut':'bas');
    el.lastChild.textContent=figGNom(d);el.classList.add('on');try{hap(5);}catch(e){}}
  const k=d==='l'||d==='r'?1:0,sx=d==='l'?-1:d==='r'?1:0,sy=d==='u'?-1:d==='d'?1:0,W=VP.w||innerWidth,H=VP.h||innerHeight;
  const px=Math.max(70,Math.min(W-70,GLI.x0+sx*86)),py=Math.max(40,Math.min(H-40,GLI.y0+sy*86-(k?44:0)));
  el.style.transform='translate('+Math.round(px)+'px,'+Math.round(py)+'px) translate(-50%,-50%)';}
window.dbgGlisse=function(a){if(a==='on'||a==='off'){SAVE.d.figG=a==='on'?'glisse':'tap';figGClasse();return SAVE.d.figG;}
  if(a==='l'||a==='r'||a==='u'||a==='d')return figGJoue(a);
  if(a==='save')return {figs:SAVE.d.figs,figT0:SAVE.d.figT0,achat:ecoDebutAchat(),slots:figSlots(),tonneau:figPossede('tonneau'),tailwhip:figPossede('tailwhip'),prix:window.FIG&&FIG.par.tonneau?FIG.par.tonneau.p:null}; // (banc, TAIL WHIP) ce que la sauvegarde possède
  if(a==='nez'){const L=(CARS[level].l||4.4)*.5,n9=new THREE.Vector3(0,.5,L*.92),p9=new THREE.Vector3(0,.5,-L*.9);carGroup.localToWorld(n9);carGroup.localToWorld(p9); // (banc, TAIL WHIP) le nez, la poupe et le milieu dans le monde
    return [n9.toArray(),p9.toArray(),carGroup.position.toArray(),fallPos.toArray()].map(function(v){return v.map(function(x){return +x.toFixed(3);});});}
  return {mode:figGlisseOn()?'glisser':'2 taps',lances:GLI.n,refus:GLI.refus,dernier:GLI.der,seuil:GLI.seuil,doigt:GLI.id,vu:GLI.vu,jeu:mode,figures:FX2.n,coups:GLI.coups|0,pivK:+(FX2.pivK||0).toFixed(2),pivD:+(FX2.pivD||0).toFixed(2),fig:FX2.corps&&FX2.corps.der||null,sol:GSOL.k,solT:+GSOL.t.toFixed(2),solFaits:GSOL.n,solSauts:GSOL.sauts};};
/* ===== LES FIGURES AU SOL (2026-10-15, 2e passe — Léo : « pas obligé d'être en l'air pour faire une figure ; certaines te lancent en l'air,
   seulement lorsque le joueur fait FLÈCHE AVANT pendant le trick ; faites sur le sol, la voiture reste au sol tant qu'il ne pousse pas vers
   l'avant ; d'autres, comme le SLIDE 360, se font au sol et restent au sol » ; choix cochés : flèche avant = le JOYSTICK poussé vers l'avant,
   au sol la figure se fait AU SOL, ← → = le slide 360 au sol et le 360 en l'air). En GLISSER, au sol :
   · ← → = SLIDE 360 : la caisse fait un tour complet à PLAT sur la route (autour de la normale de la dalle, comme le power-slide), la gomme
     fume aux roues arrière ; elle ne quitte JAMAIS le sol. Payé à la fin (« SLIDE 360 »).
   · ↑ = WHEELIE (le nez se lève, pivot sur l'essieu ARRIÈRE) · ↓ = STOPPIE (le cul se lève, pivot sur l'essieu AVANT) : l'AMORCE du salto,
     posée sur la route. JOYSTICK VERS L'AVANT pendant les 4/5 de l'amorce (ou ↑ / W fraîchement appuyé au clavier) → le SAUT NITRO (veqSaut :
     coût, attente) et le salto de ce sens, fini en l'air ; la caisse emporte l'angle de l'amorce (figDepart). Sinon elle se repose (coup de
     nez du ressort SCOUP) et c'est payé « WHEELIE » / « STOPPIE ».
   Pose = une rotation de carGroup autour d'un pivot, rejouée à chaque image APRÈS sa pose sur la route (gsolPose) : la physique ne voit rien.
   Jamais sous la dalle (side < 0), une seule à la fois. */
const GSOL={k:null,t:0,D:0,s:1,saute:false,k0:false,n:0,sauts:0,ax:new THREE.Vector3(),pv:new THREE.Vector3(),v:new THREE.Vector3(),q:new THREE.Quaternion()};
function gsolHaut(){return !!(keys.ArrowUp||keys.KeyW||keys.KeyZ);}
function gsolLance(d){const G=GSOL;
  if(mode!=='drive'||side<0||G.k||hopY>0||POSE_F){try{if(SONV2)sfx('nitro.vide');}catch(e){}hap(6);return false;}
  G.k=d==='l'||d==='r'?'p':d==='u'?'w':'s';G.t=0;G.D=G.k==='p'?.72:G.k==='w'?.78:.6;G.s=d==='l'?1:-1;G.saute=false;G.k0=gsolHaut();
  if(G.k==='p'){try{if(SONV2&&!sfx('fig.toupie',{st:echSt()}))sfx('turbo.mini',{vol:-6});}catch(e){}hap([8,16]);}
  else{try{if(SONV2)sfx('turbo.mini',{vol:-6});}catch(e){}hap([10,20]);if(typeof sensCoup==='function')sensCoup(0,0,G.k==='w'?1.4:-1.4);}
  return true;}
function gsolCoupe(){GSOL.k=null;GSOL.t=0;}
function gsolTick(dt){const G=GSOL;if(!G.k)return; // (la boucle, en course)
  if(mode!=='drive'||gameOver||!started){gsolCoupe();return;}
  if(paused)return;
  G.t+=dt;
  if(G.k==='p'){if(Math.random()<dt*34){const sp=CARS[level]||CARS[0],sd=Math.random()<.5?-1:1; // la gomme fume aux roues arrière pendant le tour
      G.v.set(sd*sp.w*.45,.25,-sp.l*.38).applyQuaternion(carGroup.quaternion).add(carGroup.position);
      for(let k=0;k<3;k++)spawnP(dust,G.v.x,G.v.y,G.v.z,(Math.random()-.5)*5,1+Math.random()*2,(Math.random()-.5)*5,.35+Math.random()*.3);}}
  else if(!G.saute&&G.t<G.D*.8){ // FLÈCHE AVANT pendant l'amorce : elle SAUTE et finit le salto en l'air
    const h=gsolHaut();if(!h)G.k0=false;
    if((TCTL.act&&TCTL.sv>.35)||(h&&!G.k0)){G.saute=true;const o=figGOpts(G.k==='w'?'u':'d');
      if(o&&veqSaut(o)){G.sauts++;gsolCoupe();return;}}} // refusé (attente, nitro à sec) : elle reste au sol, un seul essai
  if(G.t>=G.D){const k=G.k;gsolCoupe();G.n++;
    if(k==='p'){try{chaineAura('SLIDE 360',70,'gslide',false,false);}catch(e){}hap([10,22,10]);}
    else{try{chaineAura(k==='w'?'WHEELIE':'STOPPIE',40,k==='w'?'gwheelie':'gstoppie',false,false);}catch(e){}
      if(typeof sensCoup==='function')sensCoup(0,k==='w'?2.4:-2,-1.2);hap([8,18]);}}} // elle retombe sur ses roues : le nez claque
function gsolPose(F){const G=GSOL;if(!G.k||mode!=='drive')return; // (conduite, chaque image, après la pose de la caisse sur la route)
  const x=Math.min(1,G.t/G.D),q=carGroup.quaternion,p=carGroup.position;
  if(G.k==='p'){G.q.setFromAxisAngle(F.n,G.s*6.2832*x*x*(3-2*x));q.premultiply(G.q);return;}
  const sp=CARS[level]||CARS[0],b=Math.pow(Math.sin(Math.PI*x),.75),a=(G.k==='w'?-.46:.34)*b,zp=(G.k==='w'?-1:1)*(sp.l||4.4)*.36;
  G.ax.set(1,0,0).applyQuaternion(q);G.pv.set(0,0,zp).applyQuaternion(q).add(p); // l'axe des roues, le pivot : l'essieu qui reste au sol
  G.q.setFromAxisAngle(G.ax,a);q.premultiply(G.q);p.sub(G.pv).applyQuaternion(G.q).add(G.pv);}
/* ===== LES FIGURES SUR LA ROUTE (2026-10-17, Sacha : « toutes les figures doivent pouvoir être exécutées sur route, c'est-à-dire sans
   s'envoler » — au questionnaire : « la caisse reste sur la route et tu gardes le volant ; seule la carrosserie fait un petit bond le temps de
   la figure, puis retombe sur ses roues ; pas de mode vol »). Avant : au sol, le double-tap NITRO faisait le SAUT NITRO (startFall : la caisse
   décolle, vole ~0,85 s, se pose) et la figure tournait EN VOL — ailes, chrono, viseur, et la route qui pouvait filer sous la caisse.
   · S'il y a une figure dans la direction tenue (▲ ou rien = l'avant, ▼ l'arrière, ◄► le côté), elle se fait SUR LA ROUTE : la conduite ne
     change pas (mode 'drive' : volant, vitesse, obstacles, pièces — la physique ne voit rien, comme les figures au sol du GLISSER) ; seule
     l'IMAGE de la caisse tourne, menée par le même moteur que le vol (`FIG.Corps`, dans un corps à elle : `FR.C`, le coup net et son planté),
     et fait un BOND le long de la normale de la route : un arc de saut (`FR.H`, la hauteur qu'il faut à la figure : salto ~1,9 m, tonneau
     ~0,7 m, toupie 0,35 m — `frHaut`) et jamais moins que ce qui garde la carrosserie hors du bitume (`frDegage` : le coin le plus bas de la
     boîte tournée). La caméra ne suit que 20 % du bond (`FR_K.cam`) : on VOIT la caisse quitter la route.
   · La durée (`frDuree`) : 65 % du catalogue, entre 0,4 et 0,72 s (le salto du saut tournait en ~0,36 s) ; le bond dure ×1,12 + le planté.
   · Le prix et la paie ne bougent pas : 20 % de la jauge au lancement (comme le saut, offert sous NITRO INFINIE, au parc, à
     l'auto-école ; à sec : le « tchk ») ; plantée = `figPaye` (l'aura, le HUD des figures, les missions, la leçon) ; la caisse retombée, la
     POSE d'un vol est rejouée pour la figure (`frEncaisse` : le combo, les 40 % rendus, les pièces du MOTEUR, le flow, la frénésie armée).
   · Rien dans la direction tenue : le SAUT NITRO d'avant, sans figure. Une figure sur la route à la fois. Décollage en pleine figure (une
     crête, le bord) : son corps passe au vol (`frDecolle`/`frVersVol`, dans startFall) et elle finit en l'air.
   · Le GLISSER de Léo n'est pas changé : au sol, slide 360 / wheelie / stoppie, et son salto part toujours avec le saut (joystick en avant).
   `?froute=0` = le saut nitro d'avant. Console : `dbgFRoute()` (l'état), `dbgFRoute(x,y)` (un double-tap au sol, le joystick en x, y). */
const FR_K={k:.65,dMin:.4,dMax:.72,hMin:.35,hMax:2.4,marge:.1,cam:.8};
const FR={ok:!/[?&]froute=0\b/.test(location.search),on:false,C:window.FIG&&FIG.Corps?new FIG.Corps():null,t:0,D:0,T:0,H:0,s:-1,r:null,f:null,pivK:0,lift:0,liftMax:0,n:0,fini:0,vols:0,
  qr:new THREE.Quaternion(),dq:new THREE.Quaternion(),pv:new THREE.Vector3(),pv2:new THREE.Vector3(),dv:new THREE.Vector3(),dv2:new THREE.Vector3(),cv:new THREE.Vector3(),
  p0:new THREE.Vector3(),p0ok:false,vel:new THREE.Vector3()};
function frDegage(q,zp){const sp=CARS[level]||CARS[0],w=(sp.w||2)*.5,h=sp.h||1.3,l=(sp.l||4.4)*.5,hc=h*.5;let m=0; // de combien le coin le plus bas de la boîte tournée (autour du milieu, ou du nez : zp) passe SOUS le bitume
  for(let i=0;i<8;i++){FR.dv.set(i&1?w:-w,(i&2?h:0)-hc,(i&4?l:-l)-zp).applyQuaternion(q);const y=FR.dv.y+hc;if(y<m)m=y;}
  return -m;}
function frHaut(f){let H=FR_K.hMin; // le sommet du bond : ce qu'il faut à la figure pour tourner sans toucher (chaque axe essayé sur son tour, ou sur l'amplitude d'un battement)
  for(let i=0;i<f.m.length;i++){const m=f.m[i],a=m.a,L=Math.hypot(a[0],a[1],a[2])||1,amp=m.t!=null?6.2832:Math.abs(m.b||0)*6.2832;FR.dv2.set(a[0]/L,a[1]/L,a[2]/L);
    for(let k=1;k<=16;k++){FR.dq.setFromAxisAngle(FR.dv2,amp*k/16);H=Math.max(H,frDegage(FR.dq,0)+FR_K.marge);}}
  return Math.min(FR_K.hMax,H);}
function frDuree(f){return Math.min(FR_K.dMax,Math.max(FR_K.dMin,figDMin(f,true),f.D*FR_K.k));}
function frLance(){ // le double-tap au sol : la figure de la direction tenue, SUR LA ROUTE — true lancée · false refusée · null rien dans cette direction (le saut nitro)
  if(!FR.ok||!FIGV2.on||!FR.C||!window.FIG||mode!=='drive')return null;
  const S=figSlots();let s=FDIR.on?figDirSlot():FX2.cyc;
  if(!S[s]){if(FDIR.on&&!TUTO.on)return null;for(let k=1;k<FIG_NB&&!S[s];k++)if(S[(s+k)%FIG_NB])s=(s+k)%FIG_NB;if(!S[s])return null;} // (comme le saut) l'auto-école et ?figdir=0 prennent un emplacement qui existe
  let f=FIG.par[S[s]];if(f&&FIG.oriente&&s<2)f=FIG.oriente(f,FIG_DIR[s]);if(!f)return null;
  if(FR.on||GSOL.k||DMT.act||performance.now()-VEQ.sautT<VEQ_K.sautCd*1000)return false; // une à la fois ; pas pendant un geste du GLISSER ni le demi-tour ; l'attente du saut
  const libre=pwrNitroT>0||PARK.on||startBoostT>0||TUTO.on,cout=libre?0:NITRO2.figN.cout*nitroCap();
  if(!libre&&nitroR+nitroX<cout){figRefus(s);return false;}
  if(cout>0)figNitPaye(cout);
  let ax=0;for(let i=0;i<f.m.length;i++){const m=f.m[i];if(!(m.a[0]!==0&&m.a[1]===0&&m.a[2]===0)){ax=Math.abs(m.a[2])>Math.abs(m.a[1])?2:1;break;}}
  const st9=FDIR.on&&Math.abs(FDIR.x)>=.3?FDIR.x:steer,sens=Math.abs(st9)>.25?(ax===2?(st9>0?-1:1):(st9>0?1:-1))*(f.piv?-1:1):(FX2.sensAlt=-FX2.sensAlt); // (comme figLance) elle part du côté du pouce
  const D=frDuree(f),C=FR.C;
  FX2.pts=0;FX2.nPay=0;if(FX2.cv.cle!=='fin')figCvRaz();else{FX2.cv.n=0;FX2.cv.dist=0;FX2.cv.ids={};FX2.cv.noms.length=0;}FX2.trio=[];FX2.nitF=0;FX2.nitL=0; // un « vol » neuf, sur la route (voir figDepart)
  C.vide();C.budget=9;C.poseK=0;const r=C.lance(f,sens,D,{douce:true});if(!r)return false; // douce : comme celle du saut — jamais une chute, pas de trio
  r.nitN=1;FX2.nitL=1;FX2.n++;VEQ.n++;FR.n++;FX2.cyc=(s+1)%FIG_NB;VEQ.sautT=performance.now();
  {const D9=FIG.dirs?FIG.dirs(f):[];r.flD=f.sens==='avant'||(D9.length===1&&D9[0]==='avant')?'haut':f.sens==='arriere'||(D9.length===1&&D9[0]==='arriere')?'bas':((ax===2||f.piv)?(sens<0?'gauche':'droite'):(sens>0?'gauche':'droite'));} // la flèche du HUD (voir figLance)
  FR.on=true;FR.t=0;FR.D=D;FR.T=D*1.12+FIG.PHY.retT+.08;FR.H=frHaut(f);FR.s=s;FR.r=r;FR.f=f;FR.pivK=0;FR.lift=0;FR.liftMax=0;FDC.a=frNez()<FDC.arme; /* (2026-10-19) LE DÉCOLLAGE AU MANCHE : le pouce qui a CHOISI la figure (en haut) doit revenir avant de faire décoller */
  figCoup(Math.hypot(r.imp[0],r.imp[1],r.imp[2])/10,false);fhLance(s,r,{}); // le coup de la figure (son, main, caméra) ; son nom tombe en grand, dans la couleur de son emplacement
  const p9=carGroup.position,sp9=CARS[level]||CARS[0];for(let k=0;k<14;k++){const a=Math.random()*6.2832; // le souffle contre la route, sous la caisse
    spawnP(k%3?flames:flameCore,p9.x+Math.cos(a)*sp9.w*.5,p9.y+.2,p9.z+Math.sin(a)*sp9.l*.4,FR.vel.x*.8+Math.cos(a)*(3+Math.random()*5),-1-Math.random()*2,FR.vel.z*.8+Math.sin(a)*(3+Math.random()*5),.16+Math.random()*.14);}
  sparkBurst(sparkGold,p9,8,8);
  return true;}
function frBoum(e){const k=Math.min(1.6,e.k||1),n=Math.round(14+16*k),vx=FR.vel.x*.86,vy=FR.vel.y*.86,vz=FR.vel.z*.86;figPoint(e); // l'explosion de la figure (figBoum, au sol : le souffle suit la caisse qui roule)
  for(let i=0;i<n;i++){const s9=8+Math.random()*14*k;spawnP(i%2?flames:flameCore,FX2.v.x,FX2.v.y,FX2.v.z,vx-FX2.d.x*s9+(Math.random()-.5)*6,vy-FX2.d.y*s9+(Math.random()-.5)*6,vz-FX2.d.z*s9+(Math.random()-.5)*6,.14+Math.random()*.2);}
  sparkBurst(sparkGold,FX2.v,Math.round(8+8*k),12);}
function frPaye(r){const c0=chainSeen['fig_'+r.f.id]|0;figPaye(r); // plantée : comme en vol — et le FLOW qu'addTrick ne donne qu'en l'air (celle du saut le nourrissait)
  if(mode==='drive'){const reps=Math.max(1,r.reps|0),a=(r.f.aura||60)*(reps>1?1+(reps-1)*1.25:1);flowAdd((a>=120||reps>=2?9:6)*Math.pow(.6,c0),'risque');}}
function frEncaisse(){ // la caisse est retombée sur ses roues : ce que la POSE d'un vol fait pour ses figures (tryLand), sans le vol — grade ordinaire
  const q=chainVal*Math.min(6,chainMult)*(1+FLOW.lv*.5)*(fever>0?2:1);
  if(chain>0&&q>0){flowAdd(4,'style','n');runStats.tricks++;poseSndT=performance.now();addCoins(Math.max(2,Math.min(18,Math.round(2+q/6))));boost=Math.max(boost,1.2);
    if(FREN.arme&&FLOW.lv<4)frenDeclenche();} // jauge pleine + figure posée : la FRÉNÉSIE part (comme à la pose)
  chain=0;chainVal=0;chainMult=1;chainSeen={};chainHud.style.opacity=0;caseHud.style.opacity=0;caseHud.className='';caseHot=false;
  figComboEncaisse();const g=figNitRend(true);if(SONV2&&g>.01)try{sfx('nitro.plein',{t:.2});}catch(e){}}
function frCoupe(){if(FR.C)FR.C.vide();FR.on=false;FR.lift=0;FX2.nitL=0;} // (la course s'arrête, la caisse explose) rien à rendre
function frFin(){const C=FR.C,P=C.pose();for(let i=0;i<P.payees.length;i++)frPaye(P.payees[i]); // le bond fini : ce qui reste se juge (une figure presque finie compte)
  FR.ecFin=+(C.ecart()*57.3).toFixed(1);C.vide();FR.on=false;FR.lift=0;FR.fini++;frEncaisse(); // (FX2.nitL gardé : frEncaisse rend ses 40 %) — ecFin (banc) : de combien elle se recale à la dernière image (°)
  sensCoup(0,.6,-1.4);hap([8,18]);try{if(SONV2)sfx('pose.nette',{t:.02});}catch(e){} // elle retombe : la suspension encaisse, le petit son de la pose
  const sp9=CARS[level]||CARS[0];for(const sd of [-1,1]){FX2.v.set(sd*sp9.w*.45,.2,0);carGroup.localToWorld(FX2.v);for(let k=0;k<4;k++)spawnP(dust,FX2.v.x,FX2.v.y,FX2.v.z,FR.vel.x*.7+(Math.random()-.5)*5,1+Math.random()*2,FR.vel.z*.7+(Math.random()-.5)*5,.3+Math.random()*.25);}}
function frTick(dt){if(!FR.on)return; // (la boucle, en course) le corps de la figure avance
  if(!started||gameOver||mode!=='drive'){frCoupe();return;}
  if(paused)return;
  const C=FR.C;FR.t+=dt;C.budget=Math.max(.05,FR.T-FR.t);C.poseK=FR.t>FR.D?1:0; // poseK : sa durée jouée, l'air la range VITE (un battement — le shimmy — mettait 1,3 s à se calmer, puis se recalait d'un coup)
  const fin=C.tick(dt);
  for(let i=0;i<C.evts.length;i++)frBoum(C.evts[i]);C.evts.length=0;
  for(let i=0;i<C.figs.length;i++){const r=C.figs[i];if(r.paye)continue; // CHAQUE TOUR SE SENT (comme en vol : le souffle de son axe, un tic dans la main) ; un battement, à chaque aller-retour
    if(r.mv.length){let mm=r.mv[0];for(let j=1;j<r.mv.length;j++)if(r.mv[j].tours>mm.tours)mm=r.mv[j];
      const n9=Math.floor(Math.max(0,mm.th)/6.2832+.08);if(n9>(r.tourDit|0)){r.tourDit=n9;try{if(SONV2&&!sfx(figMat(mm.a),{vol:-2,st:echSt()}))sfx('fig.vrille',{vol:-6});}catch(e){}hap(6);}}
    else if(r.osc&&r.t<r.D){const nb=Math.floor(r.t*r.osc.w/Math.PI);if(nb>(r.batDit|0)){r.batDit=nb;try{if(SONV2)sfx('fig.battement',{var:r.osc.z>.3?1:0,vol:-4,st:sonPdAR(ECH+(nb&1))});}catch(e){}hap(5);}}}
  {let pv9=0;for(let i=0;i<C.figs.length;i++){const r=C.figs[i];if(!r.paye&&r.f&&r.f.piv){pv9=r.f.piv;break;}}FR.pivK+=(pv9-FR.pivK)*Math.min(1,dt*14);} // le TAIL WHIP : le point fixe glisse vers le nez
  for(let i=0;i<fin.length;i++)frPaye(fin[i]);
  if(frEnvol())return; // (2026-10-19, Léo) LE DÉCOLLAGE AU MANCHE : le nez tiré vers le haut pendant le bond, la caisse quitte la route
  if(FR.t>=FR.T&&(C.ecart()<.03||FR.t>FR.T+.6))frFin();}
function frPose(F,dt){const p=carGroup.position; // (conduite, chaque image, après la pose de la caisse sur la route) la figure tourne autour du MILIEU de la caisse, le bond la soulève
  if(FR.p0ok&&dt>0){FR.vel.subVectors(p,FR.p0).multiplyScalar(1/dt);if(FR.vel.lengthSq()>16e4)FR.vel.set(0,0,0);}FR.p0.copy(p);FR.p0ok=true; // la vitesse de la caisse dans le monde : le souffle des explosions la suit
  if(!FR.on||mode!=='drive'){FR.lift=0;return;}
  const q=FR.C.q,sp=CARS[level]||CARS[0],hc=(sp.h||1.3)*.5,zp=FR.pivK*(sp.l||4.4)*.5;let dg=0;
  if(q[3]<.9999995){FR.qr.set(q[0],q[1],q[2],q[3]);FR.pv.set(0,hc,zp).applyQuaternion(carGroup.quaternion);carGroup.quaternion.multiply(FR.qr);
    FR.pv2.set(0,hc,zp).applyQuaternion(carGroup.quaternion);p.add(FR.pv).sub(FR.pv2);dg=frDegage(FR.qr,zp);}
  const x=Math.min(1,FR.t/FR.T);FR.lift=Math.max(FR.H*4*x*(1-x),dg>0?dg+FR_K.marge:0);if(FR.lift>FR.liftMax)FR.liftMax=FR.lift;
  p.addScaledVector(F.n,FR.lift);}
function frDecolle(){ // (startFall, AVANT ses remises à zéro) la caisse décolle en pleine figure sur la route
  if(!FR.on)return null;const k={nitL:0,lift:FR.lift}; // (2026-10-19) lift : le vol part d'où la caisse EST, le bond compris (elle retombait d'un coup sur le bitume)
  if(FR.r&&FR.r.paye)frEncaisse();else k.nitL=FX2.nitL|0; // déjà plantée : elle est posée sur la route ; sinon elle part avec le vol (et se paiera à SA pose)
  return k;}
function frVersVol(k){ // (startFall, APRÈS figDepart) le corps de la figure devient celui du vol : elle continue de tourner, en l'air
  const C0=FX2.corps;FX2.corps=FR.C;FR.C=C0;if(C0)C0.vide();FX2.corps.budget=9;FX2.nitL=(FX2.nitL|0)+k.nitL;FR.on=false;FR.lift=0;FR.vols++;}
/* LE DÉCOLLAGE AU MANCHE (2026-10-19, Léo : « chaque figure qui fait un saut en l'air — seulement quand la voiture est en l'air — laisse au
   joueur l'opportunité de décoller de la route avec le joystick qui oriente le nez vers le haut » ; au questionnaire : un geste PENDANT le
   bond, puis la caisse monte COMME UN AVION). Pendant le bond d'une figure sur la route, le manche du VOL poussé au-delà de la moitié de sa
   course (`frNez` = la lecture de pitT/wPitch : pouce HAUT par défaut, BAS en réglage PLONGE, ↓ au clavier) fait DÉCOLLER : startFall part
   d'où la caisse EST (le bond compris, `k.lift` de frDecolle), avec la vitesse du bond ; la figure continue en l'air (frDecolle/frVersVol)
   et se paie à SA pose ; tenu, le même manche fait monter la caisse (le cabré du vol tourne la trajectoire) ; lâché, elle retombe. Un vrai vol.
   · LE GESTE NEUF : le pouce déjà poussé au double-tap (il CHOISIT la figure avant) ne compte pas — il doit repasser sous `arme` (30 %)
     avant de repousser au-delà de `seuil` (55 %). Sans geste, rien ne change : la figure reste sur la route (le choix de Sacha du 17/10).
   · Seulement EN L'AIR (le bond ≥ `haut`, 20 cm). Pas sous la dalle (pendue à la route, décoller = tomber dans le vide : comme le saut
     nitro), ni à l'auto-école, ni pendant un rebond (hopY, la pose qui se tasse), ni pendant le demi-tour.
   · Gratuit (la figure a payé ses 20 %) ; la pose rend la nitro d'un SAUT NITRO (`VEQ.sautF`) ; le volant n'est pas verrouillé.
   `?fdecolle=0` = sans. Console : `dbgFDecolle()` (l'état), `dbgFDecolle(v)` = le manche forcé à v (null : rend la main au pouce). */
const FDC={ok:!/[?&]fdecolle=0\b/.test(location.search),arme:.3,seuil:.55,haut:.2,imp:6,a:false,n:0,force:null,dv:0,lift:0};
function frNez(){if(FDC.force!=null)return FDC.force; // le manche du vol lu sur la route : +1 = le nez en HAUT (le cabré), comme pitT/wPitch en vol
  if(TCTL.act)return -TCTL.sv*volSens();return (keys.KeyS||keys.ArrowDown?1:0)-(keys.KeyW||keys.KeyZ||keys.ArrowUp?1:0);}
function frEnvol(){ // (frTick, chaque image du bond) le manche tiré : la caisse quitte la route — true : elle vole
  const u=frNez();if(u<FDC.arme){FDC.a=true;return false;}
  if(!FDC.ok||!FDC.a||u<FDC.seuil||!FR.on||mode!=='drive'||FR.lift<FDC.haut||side<0||TUTO.on||hopY>0||hopV!==0||POSE_F||DMT.act)return false;
  const x=Math.min(1,FR.t/FR.T),vb=FR.H*4*(1-2*x)/Math.max(.1,FR.T)/SPD; // la vitesse du bond, dans les unités du vol (la position avance de fallVel × SPD)
  FDC.dv=Math.max(FDC.imp,vb);FDC.lift=FR.lift;FDC.a=false;FDC.n++;
  startFall(FDC.dv,1);VEQ.sautF=flightId;VEQ.l0=0; // un décollage VOULU : comme le saut nitro, le volant tenu continue de tourner, la pose rend la nitro d'un saut
  return true;}
window.dbgFDecolle=function(v){if(v!==undefined)FDC.force=v==null?null:+v;
  return {ok:FDC.ok,arme:FDC.a,nez:+frNez().toFixed(2),force:FDC.force,decolles:FDC.n,dv:+FDC.dv.toFixed(1),liftDecolle:+FDC.lift.toFixed(2),route:FR.on,lift:+FR.lift.toFixed(2),
    mode:mode,vol:mode==='fall'?+fallTR.toFixed(2):0,haut:mode==='fall'?+fallPos.y.toFixed(1):null};};
window.dbgFRoute=function(x,y){if(x!=null){FDIR.force=[+x||0,+y||0];let r;try{r=veqDouble();}finally{setTimeout(function(){FDIR.force=null;},250);}
    return {ok:!!r,route:FR.on,mode:mode,fig:FR.on&&FR.f?FR.f.id:null,saut:!FR.on&&mode==='fall',nit:+(nitroR+nitroX).toFixed(2)};}
  const C=FR.C;return {ok:FR.ok,on:FR.on,mode:mode,fig:FR.f?FR.f.id:null,t:+FR.t.toFixed(2),T:+FR.T.toFixed(2),H:+FR.H.toFixed(2),lift:+FR.lift.toFixed(2),liftMax:+FR.liftMax.toFixed(2),
    ecart:C?Math.round(C.ecart()*57.3):0,ecFin:FR.ecFin==null?null:FR.ecFin,lances:FR.n,finies:FR.fini,versVol:FR.vols,payees:FX2.payees|0,nit:+(nitroR+nitroX).toFixed(2)};};
function figCvX(){const c=FX2.cv;return c.n?Math.min(IMPU.xMax,1+IMPU.xVar*(c.dist-1)+IMPU.xRep*(c.n-c.dist)):1;}
function figCvTxtX(x){return '×'+String(Math.round(x*100)/100).replace('.',LANG==='en'?'.':',');}
function figCvNote(f,reps){if(!f)return;const c=FX2.cv;c.n++;if(!c.ids[f.id]){c.ids[f.id]=1;c.dist++;}
  c.noms.push(figNom(f,reps));c.cle=''; // (le maillon sonne déjà : addTrick → trickPop, et figPaye vibre)
  if(c.n>=2)fovPunch=Math.max(fovPunch,3+Math.min(4,figCvX()));}
function figCvRaz(){const c=FX2.cv;c.n=0;c.dist=0;c.ids={};c.noms.length=0;c.cle='raz';} // (≠ '' : le HUD repasse et s'éteint — MESURÉ au banc, il restait affiché après la pose)
function figComboEncaisse(){const c=FX2.cv;if(c.n<2||!(FX2.pts>0)){if(c.n===1&&FX2.pts>0)fhFin(true);figCvRaz();return;} // (à la pose propre) le combo du vol s'encaisse — (HUD v3) une figure seule s'envole aussi vers la chaîne
  const x=figCvX(),bonus=Math.round(FX2.pts*(x-1));let p=0;
  if(bonus>0)try{p=chaineAuraMuette('COMBO '+figCvTxtX(x),bonus,'combovol',true,false);}catch(e){} // (HUD v3) muette au-dessus de la caisse : la ligne du combo s'envole vers la chaîne, où « COMBO ×N +X » s'écrit
  hap([14,30,14,30,40]);figCvFin(true,p);}
function figCvFin(ok){fhFin(ok);figCvRaz();} // (HUD des figures v3) la pose : encaissé (la ligne s'envole) ou perdu (elle tombe)
/* ===== LE HUD DES FIGURES v3 (2026-10-15, Sacha : « retravaille l'HUD pour le système de figure, il est buggé et trop discret ; anime, mets de
   la couleur et tout pour les figures » — le pourquoi et le dessin sont dans <style id="figuresHud">). Remplace l'ancienne ligne #figCombo.
   `fhLance` (figLance : la figure PART, son nom tombe en grand) · `fhPlante` (figPaye : elle est PLANTÉE — éclair, confettis, une pastille de plus
   dans la ligne, le × grimpe) · `fhFin` (la pose : encaissée = la ligne flashe en or et s'envole vers la chaîne d'aura ; chute = rouge, tout tombe)
   · `fhTick` (chaque image, depuis figHud : les minuteries, AUCUNE écriture DOM tant que rien ne change) · `fhLegMaj`/`fhLegFx` (le rappel).
   Plus de texte au-dessus de la caisse pour une figure (CHA.sansPop dans figPaye) : ce HUD le dit, en mieux. */
/* ===== LE HUD DES FIGURES v4 (2026-10-15 soir, Sacha : « retravaille l'HUD des figures aussi, il faut que ce soit parfait : là c'est écrit en
   double et tout ; il faut des figures bien écrites, avec des moyens de rendre ça addictif »). RELEVÉ au banc (captures en temps réel) : deux
   « ×2 » à l'écran (« SALTO AVANT ×2 » = deux tours, « 100 ×2 » = la chaîne d'aura) ; le nom revenait en grand ET en pastille à la plantée ;
   à la pose, la ligne s'envolait PAR-DESSUS la carte moteur (« SALTO AVANTNEAU ») ; le rappel écrivait « ↑ AVANT » pour le SALTO AVANT ; un
   HÉLICO 720 tout simple partait sous « HÉLICO 720 ×2 » (le nombre de tours lu comme une répétition) ; rien ne disait de quel côté elle part.
   · LE NOM, une seule fois, bien écrit (`figNom`) : les tours se disent en mots ou en degrés — DOUBLE TONNEAU, TRIPLE SALTO AVANT, TOUPIE 720,
     HÉLICO 1440, QUADRUPLE TONNEAU (un DOUBLE TONNEAU doublé) ; jamais « ×2 », qui reste au combo et à la chaîne ;
   · LA FLÈCHE du geste devant le nom (▲ avant, ▼ arrière, ◄ ou ► : le côté où elle part) ;
   · LA LIGNE DU COMBO : une PASTILLE muette par figure plantée (sa couleur ; plus grosse pour une figure neuve dans le vol — varier paie) et
     « COMBO ×1,5 » ; au-delà du meilleur combo jamais posé (`SAVE.d.figRec`), « RECORD » bat à côté — battu à la pose, il est gardé ;
   · À LA POSE : la ligne flashe en or et s'éteint SUR PLACE (elle ne traverse plus l'écran) ; à la chute, elle tombe en rouge ;
   · LE RAPPEL (#fhLeg) écrit les vrais noms, et le geste que vise le pouce s'ALLUME en direct (`.arme`) : on voit ce qui va partir. */
const FIG_MULT={fr:['','','DOUBLE ','TRIPLE ','QUADRUPLE ','QUINTUPLE ','SEXTUPLE ','SEPTUPLE ','OCTUPLE '],en:['','','DOUBLE ','TRIPLE ','QUAD ','QUINT ','SEXT ','SEPT ','OCT ']};
function figNom(f,reps,lg){lg=lg||(LANG==='en'?'en':'fr');let n=sansAcc(lg==='en'&&f.en?f.en:f.n),k=Math.max(1,reps|0);if(k<2)return n;
  const deg=n.match(/^(.*?)(\d{3,4})$/);if(deg)return deg[1]+(+deg[2]*k); // TOUPIE 360 → TOUPIE 720 · HELICO 720 → HELICO 1440
  if(/^DOUBLE /.test(n)){n=n.slice(7);k*=2;} // DOUBLE TONNEAU doublé → QUADRUPLE TONNEAU
  const M=FIG_MULT[lg==='en'?'en':'fr'];return (M[k]||k+'X ')+n;}
function figRepsEnCours(r){const m=r&&r.mv&&r.mv[0];return m?Math.max(1,Math.round(m.tours/(r.base||m.tours))):1;} // les répétitions prévues (le tour EMPILÉ au double-tap compte)
/* ===== LE HUD DES FIGURES v5 (2026-10-18, Sacha : « retravaille le système de figure, notamment les combos de figures : c'est pas montré
   assez clairement ; et puis les bumps sur les bords de la route doivent être une figure à part entière, cumulable dans des combos ; aussi, en
   fonction de la rareté de la figure, écris-la dans une couleur et une police différente correspondant à la rareté » — au quiz : « une police
   par rareté », toutes en pixels, pour le nom des figures en course seulement). Le dessin est dans <style id="figuresHud"> (v5).
   · LA RARETÉ ÉCRITE (`figRarH`) : celle de la boutique (`cosmRar('figure')`, qui suit le prix) — COMMUNE gris Press Start 2P · RARE bleu
     Silkscreen · EXOTIQUE vert Jersey · ÉPIQUE violet Sixtyfour (halo) · LÉGENDAIRE or Jacquard, le gothique en pixels (un reflet la traverse).
     (2026-10-19, Sacha : « la police des figures légendaires est un peu illisible ») la LÉGENDAIRE s'écrit en MINUSCULES gothiques à capitale
     initiale — Salto Cosmique, Rodeo (`fhTitre`) : ce sont les CAPITALES gothiques qui ne se lisaient pas (« SALTO » se lisait « SALVD »).
     Même police, même or, même reflet ; sa chasse en minuscules (MESURÉE ,77 à ,89 em à k 1,9, contre 1,11 à 1,19 en capitales) → w ,9.
     `FIG_RP` : par rareté, k = la taille qui égale la hauteur de capitale de Press Start 2P, w = la largeur d'une lettre à cette taille
     (MESURÉ au canvas : capitale ,63 / ,54 / ,87 / ,57 em ; chasse ,69 / ,38 / 1 / ,56 em) — même nombres que --rk dans la feuille.
   · LA LIGNE DU COMBO SE LIT (`fhMaillon`, `fhCsCale`) : les pastilles muettes de la v4 sont remplacées par le NOM de chaque figure plantée,
     dans sa rareté, reliés par « + » — TONNEAU + SALTO AVANT + BUMP ; le × du combo en grand dessous ; « … » devant quand la ligne déborde.
     À LA POSE, les maillons s'allument l'un après l'autre (on voit ce qu'on encaisse) et le × claque ; à la chute, ils tombent en rouge.
   · LE COMBO À TROIS NOMMÉ (`fhTrio`, depuis comboNote) : LA PERCEUSE… s'écrit en grand, en arc-en-ciel, ses trois maillons soulignés d'or.
   · LE BUMP, FIGURE À PART ENTIÈRE (`figBumpNote`, au rebond sur la tranche, en vol) : il entre au COMBO DU VOL comme une figure (neuf +0,5 au ×,
     redite +0,25), ses points de chaîne entrent dans FX2.pts (multipliés à la pose, perdus à la chute, comme les autres) ; son nom s'écrit en
     haut (plus de « BUMP +30 » sur la caisse) ; un BUMP qui suit un BUMP grandit sur place : BUMP (commune) → DOUBLE BUMP (rare) → TRIPLE BUMP
     (exotique) → MEGA BUMP (épique). Le nitro et la valeur du bump (BUMP_VAL, ×0,6 par rebond) ne changent pas. `?bumpfig=0` = avant. */
const FIG_RP={commun:{k:1,w:1},rare:{k:1.59,w:1.1},exotique:{k:1.85,w:.7},epique:{k:1.15,w:1.15},legendaire:{k:1.9,w:.9},combo:{k:1,w:1}};
const BUMP_FIG={id:'bump',n:'BUMP',en:'BUMP',aura:30};
const BUMP_FIG_ON=!/[?&]bumpfig=0\b/.test(location.search);
try{if(document.fonts&&document.fonts.load)setTimeout(function(){['CC Silkscreen','CC Jersey','CC Sixtyfour','CC Jacquard'].forEach(function(f){document.fonts.load('20px "'+f+'"','BUMP').catch(function(){});});},2500);}catch(e){} // les quatre polices chargées d'avance (au menu) : la 1re figure rare ne s'écrit pas d'abord en Press Start 2P
function bumpNomH(k){return k>=4?'MEGA BUMP':k===3?'TRIPLE BUMP':k===2?'DOUBLE BUMP':'BUMP';}
function figRarH(f,k){if(!f)return 'commun';if(f.id==='bump')return k>=4?'epique':k===3?'exotique':k===2?'rare':'commun';
  let r='commun';try{r=cosmRar('figure',f);}catch(e){}return FIG_RP[r]?r:'commun';}
const FH={el:null,nom:null,b:null,d:null,cs:null,more:null,x:null,rec:null,legs:null,legCle:'',vu:false,nomT:0,fin:'',finT:0,xv:-1,ease:'',va:null,arme:-2,recBat:false,rp:'',rpT:'-',horsN:0,trioT:0,nomPl:false};
const FH_COUL=['var(--fh1)','var(--fhVert)','var(--fh2)','var(--fh0)']; // l'emplacement 1 (l'avant, cyan) · le 2 (l'arrière, vert — 2026-10-15 soir) · le 3 (le côté, magenta) · la figure que la caisse fait SEULE (or)
const FH_N=[26,22]; // le corps du nom (px) : couché · debout — plafonné par la largeur (police pixel : 1 em par lettre)
function fhEase(){if(!FH.ease){try{FH.ease=getComputedStyle(document.documentElement).getPropertyValue('--ease').trim();}catch(e){}FH.ease=FH.ease||'ease-out';}return FH.ease;}
function fhAnime(el,k,ms,o){if(!el||!el.animate)return null;if(REDUCED_MOTION&&!(o&&o.rm))return null; // « Réduire les animations » (iOS) : l'état final s'affiche, sans le mouvement
  try{return el.animate(k,Object.assign({duration:ms,easing:fhEase()},o||{}));}catch(e){return null;}}
function fhEl(){if(FH.el)return FH.el;const e=document.createElement('div');e.id='fh';e.setAttribute('aria-hidden','true');
  e.innerHTML='<div class="fhNom"><i class="pxi fhD"></i><b></b></div><div class="fhLigne"><u class="fhMore"></u><span class="fhCs"></span></div><div class="fhBas"><em class="fhX"></em><u class="fhRec"></u></div>';document.body.appendChild(e); /* (v5) la ligne des NOMS du combo, puis le × dessous */
  FH.el=e;FH.nom=e.firstChild;FH.d=FH.nom.firstChild;FH.b=FH.nom.lastChild;FH.cs=e.querySelector('.fhCs');FH.more=e.querySelector('.fhMore');FH.x=e.querySelector('.fhX');FH.rec=e.querySelector('.fhRec');return e;}
function fhNet(t){return sansAcc(String(t)).replace(/[<>&"]/g,'');}
function fhTitre(t,rp){return rp==='legendaire'?String(t).toLowerCase().replace(/(^|[\s'-])(\S)/g,function(m,a,c){return a+c.toUpperCase();}):t;} // (19/10) la LÉGENDAIRE en minuscules gothiques à capitale initiale (Salto Cosmique) : ses capitales gothiques ne se lisaient pas
function fhNom(t,c,g,dir,rp){const e=fhEl();t=fhNet(t);const b=FH.b;
  if(dir!==undefined){FH.d.className='pxi fhD'+(dir?' pxi-'+dir:' vide');} // (v4) la flèche du geste : ▲ ▼ ◄ ► (undefined = on garde celle d'avant : la plantée, le combo perdu)
  if(rp!==undefined){FH.rp=rp||'';if(rp)FH.nom.setAttribute('data-rp',rp);else FH.nom.removeAttribute('data-rp');} // (v5) la RARETÉ du nom : sa couleur et sa police ('' = Press Start 2P, la couleur c)
  t=fhTitre(t,FH.rp);
  if(b.textContent!==t||FH.rpT!==FH.rp){const K=FIG_RP[FH.rp]||FIG_RP.commun;FH.rpT=FH.rp;b.textContent=t;b.setAttribute('data-t',t); /* (v5) même hauteur de capitale que Press Start 2P (k), la largeur selon la chasse de SA police (w) */
    b.style.fontSize=Math.round(K.k*Math.max(12,Math.min(FH_N[VP.w>VP.h?0:1],Math.floor(VP.w*.8/Math.max(1,(t.length+1.5)*K.w))-2)))+'px';}
  if(c)FH.nom.style.setProperty('--fc',c);else FH.nom.style.removeProperty('--fc');FH.nom.className='fhNom on'+(g==='ko'?' ko':'');e.classList.add('on');if(!FH.vu)document.body.classList.add('fhOn');FH.vu=true;
  if(g==='in')fhAnime(FH.nom,[{transform:'scale(2.3) rotate(-7deg)',opacity:0,filter:'brightness(3)'},{transform:'scale(.92) rotate(2deg)',opacity:1,filter:'brightness(1.6)',offset:.45},
    {transform:'scale(1.05) rotate(0deg)',offset:.72},{transform:'none',opacity:1,filter:'none'}],460);
  else if(g==='pl')fhAnime(FH.nom,[{transform:'scale(1.4)',filter:'brightness(3.2)'},{transform:'scale(.94)',filter:'brightness(1.5)',offset:.5},{transform:'none',filter:'none'}],400);
  else if(g==='ko')fhAnime(FH.nom,[{transform:'none'},{transform:'translateX(-10px) rotate(-3deg)'},{transform:'translateX(9px) rotate(2deg)'},{transform:'translateX(-6px)'},{transform:'translateX(4px)'},{transform:'none'}],460,{easing:'steps(6)'});}
function fhMaillon(t,rp,o){fhEl();o=o||{};const i=document.createElement('i');i.className='fhM'; // (v5) un MAILLON par figure plantée : son nom, dans sa rareté (remplace la pastille muette de la v4)
  i.setAttribute('data-rp',rp);if(o.b)i.setAttribute('data-b','1');if(o.d)i.setAttribute('data-d','1');i.textContent=fhTitre(fhNet(t),rp);FH.cs.appendChild(i);fhCsCale();
  fhAnime(i,[{transform:'translateY(-26px) scale('+(o.neuf?2.2:1.7)+')',opacity:0,filter:'brightness(3)'},{transform:'translateY(2px) scale(.94)',opacity:1,offset:.55},{transform:'none',opacity:1,filter:'none'}],420);return i;}
function fhMaillonMaj(i,t,rp){i.setAttribute('data-rp',rp);i.textContent=fhTitre(fhNet(t),rp);fhCsCale(); // (v5) le BUMP qui suit un BUMP : le même maillon grandit (DOUBLE BUMP…)
  fhAnime(i,[{transform:'scale(1.7)',filter:'brightness(3)'},{transform:'scale(.94)',offset:.5},{transform:'none',filter:'none'}],380);}
function fhCsCale(){const L=FH.cs.children,ch=VP.w>VP.h?10:8,lim=Math.min(VP.w*.94,680)*.92; // (v5) la ligne tient en largeur : les plus anciens maillons sortent, « … » devant (estimé sur la chasse de chaque police — --fhCh, ×1,2, « + » et ses marges = 2 corps : aucune mise en page lue)
  let w=0,k=L.length;while(k>0){const e=L[k-1],n=e.textContent.length,K=FIG_RP[e.getAttribute('data-rp')]||FIG_RP.commun,ww=(n*K.w*1.2+2)*ch+n;if(k<L.length&&(w+ww>lim||L.length-k>=6))break;w+=ww;k--;}
  if(k>0){for(let j=0;j<k;j++)L[0].remove();FH.horsN+=k;}
  const m=FH.horsN?'…':'';if(FH.more.textContent!==m)FH.more.textContent=m;}
function figRec(){return +(SAVE.d&&SAVE.d.figRec)||0;} // le meilleur combo jamais POSÉ (le × du vol)
function fhXMaj(){const c=FX2.cv,x=c.n>=2?figCvX():0;fhEl();FH.el.classList.toggle('combo',c.n>=2);if(x===FH.xv)return;const monte=x>FH.xv;FH.xv=x; /* (v5) la ligne des noms n'existe qu'à partir de DEUX figures : une figure seule s'écrit une fois, en grand */
  FH.x.innerHTML=x?'<small>'+fhNet(TR('COMBO'))+'</small> '+figCvTxtX(x):'';FH.x.style.setProperty('--xc',x>=3?'var(--fhO)':x>=2?'var(--fh0)':'var(--fhVert)');FH.x.classList.toggle('max',x>=IMPU.xMax); // vert → or → orange → l'arc-en-ciel du plafond
  {const bat=x>0&&x>figRec()+1e-6;if(bat!==FH.recBat){FH.recBat=bat;FH.rec.textContent=bat?fhNet(TR('RECORD')):'';FH.rec.classList.toggle('on',bat);if(bat){fhAnime(FH.rec,[{transform:'scale(2.2)',opacity:0},{transform:'scale(.9)',opacity:1,offset:.6},{transform:'none'}],380);try{hap([6,20,6]);}catch(e){}}}} // (v4) le RECORD bat à côté du × : on le voit tomber en plein vol
  if(x&&monte)fhAnime(FH.x,[{transform:'scale(2.1)',filter:'brightness(2.6)'},{transform:'scale(.9)',offset:.5},{transform:'none',filter:'none'}],380);}
function fhLance(s,r,o){if(!r||!r.f||!window.FIG)return;if(LEFIL.on)filFig(figNom(r.f,figRepsEnCours(r)),figRarH(r.f),1); /* (LE FIL) le nom part dans la pastille ; #fh reste caché */
  const c=o&&o.douce?3:s>=0?Math.min(2,s):3;r.fhc=c; // (figLance) la figure part : son nom, en grand, dans la couleur de son emplacement
  if(FH.fin)fhRaz(); /* (v5) la ligne du vol d'avant s'éteignait encore : on repart à neuf (avant, son fondu « forwards » restait posé sur #fh — la figure suivante partait invisible) */
  fhNom(figNom(r.f,figRepsEnCours(r)),null,'in',r.flD||null,figRarH(r.f));FH.nomT=performance.now()+1900;FH.nomPl=false; /* (v4) le nom bien écrit (plus « HELICO 720 ×2 » pour un hélico simple) et la flèche du geste — (v5) dans la couleur et la police de SA RARETÉ (plus celle de l'emplacement) */
  if(s>=0)fhLegFx(s,false);}
function fhPlante(r,f,reps,neuf){if(!f||!window.FIG)return;const t=figNom(f,reps),rp=figRarH(f);if(LEFIL.on)filFig(t,rp,1); // (figPaye) plantée : elle claque et tombe dans la ligne
  if(FH.fin)fhRaz();
  const m=fhMaillon(t,rp,{neuf:neuf,d:!!(r&&r.douce)});fhXMaj(); /* (v5) son MAILLON entre dans la ligne du combo */
  fhSeule(t,rp,undefined,1000,m,Math.min(12,6+2*FX2.cv.n));}
function fhSeule(t,rp,dir,ms,m,nb){const n=performance.now(); // (v5) une figure SEULE claque en grand dans sa rareté (la ligne n'existe pas encore) ; dans un COMBO, le grand nom tombe dans la ligne
  if(FX2.cv.n<2){fhNom(t,null,'pl',dir,rp);FH.nomT=n+ms;FH.nomPl=true;try{pixBurst(FH.b,nb);}catch(e){}return;} //   (il s'éteint, son maillon arrive) : jamais écrit deux fois — Sacha, 15/10 : « là c'est écrit en double »
  if(FH.nom.classList.contains('on')&&FH.nomT>n+140&&(FH.nomPl||FH.b.textContent===fhNet(t)))FH.nomT=n+140; // le grand nom est celui d'une figure DÉJÀ dans la ligne (nomPl) : il s'éteint — une figure lancée, encore en l'air, garde le sien
  try{pixBurst(m,nb);}catch(e){}}
function fhBump(k,neuf){fhEl();const t=TR(bumpNomH(k)),rp=figRarH(BUMP_FIG,k);if(LEFIL.on)filFig(t,rp,1); // (v5) LE BUMP s'écrit comme une figure plantée : en grand s'il est seul, son maillon dans la ligne
  if(FH.fin)fhRaz();
  const L=FH.cs.lastElementChild;let m=L;if(k>1&&L&&L.getAttribute('data-b'))fhMaillonMaj(L,t,rp);else m=fhMaillon(t,rp,{neuf:neuf,b:1}); // collé au BUMP d'avant : le même maillon grandit
  fhXMaj();fhSeule(t,rp,null,1100,m,Math.min(10,4+2*k));}
function fhTrio(txt){if(LEFIL.on)fil(txt,FIL_RAR.combo,2);if(!FH.el||!FH.vu)return; // (v5, comboNote) LE COMBO À TROIS NOMMÉ : son nom en grand (arc-en-ciel), ses trois maillons soulignés d'or
  fhNom(txt,null,'in',null,'combo');FH.nomT=FH.trioT=performance.now()+1700;FH.nomPl=false;
  const L=FH.cs.children;let n=0;for(let i=L.length-1;i>=0&&n<3;i--){if(L[i].getAttribute('data-b')||L[i].getAttribute('data-d'))continue;L[i].classList.add('trio');n++;}}
function figBumpNote(k,pts){if(!FIGV2.on||!BUMP_FIG_ON||!figTutoOk())return; /* (2026-10-18, débogage) figTutoOk : pas de combo invisible payé pendant l'auto-école */ // (v5) LE BUMP, FIGURE À PART ENTIÈRE DU COMBO DU VOL — appelée au rebond sur la tranche (k = son rang dans le vol)
  FX2.pts+=Math.max(0,pts||0);const neuf=!FX2.cv.ids.bump;figCvNote(BUMP_FIG,1);fhBump(k,neuf);}
function fhFin(ok){const c=FX2.cv;if(!FH.el||!FH.vu||c.n<1)return;const n=performance.now(); // (la pose) — à appeler AVANT figCvRaz
  if(ok){if(!(FH.trioT>n))FH.nom.classList.remove('on');FH.el.classList.add('paye');FH.el.classList.remove('perdu'); // (v5) un combo NOMMÉ fermé par la pose reste écrit pendant l'encaissement
    const M=FH.cs.children,D=c.n>=2?1000+70*M.length:600;
    if(FH.xv>0)fhAnime(FH.x,[{transform:'scale(1)',filter:'none'},{transform:'scale(2)',filter:'brightness(3)',offset:.35},{transform:'scale(1)',filter:'none'}],420,{delay:70*M.length});
    for(let i=0;i<M.length;i++)fhAnime(M[i],[{transform:'none',filter:'none'},{transform:'translateY(-5px) scale(1.15)',filter:'brightness(3)',offset:.4},{transform:'none',filter:'none'}],300,{delay:i*70}); /* (v5) les maillons s'allument l'un après l'autre : on lit ce qu'on encaisse, puis le × claque */
    {const x=c.n>=2?figCvX():0;if(x>figRec()+1e-6){SAVE.d.figRec=Math.round(x*100)/100;SAVE.mark();}} // (v4) le RECORD battu à la pose est gardé
    FH.fin='efface';FH.finT=n+D;fhAnime(FH.el,[{opacity:1},{opacity:1,offset:.7},{opacity:0}],D,{fill:'forwards',rm:true});} /* (v4) elle s'éteint SUR PLACE : plus de vol à travers l'écran par-dessus la carte moteur */
  else{if(c.n>=2)fhNom(TR('COMBO PERDU'),'var(--fhKo)','ko',undefined,'');else FH.nom.classList.remove('on'); /* une figure seule : « FIGURE RATÉE ! » le dit déjà sur la caisse (flowCasse) — les maillons tombent, sans un 2e texte */
    FH.el.classList.add('perdu');FH.el.classList.remove('paye');
    const L=FH.cs.children;for(let i=0;i<L.length;i++)fhAnime(L[i],[{transform:'none',opacity:1},{transform:'translateY(46px) rotate('+(i%2?18:-16)+'deg)',opacity:0}],520,{delay:120+i*70,fill:'forwards',easing:'steps(5)'});
    FH.fin='efface';FH.finT=n+1050;}}
/* (v4) fhVole retirée : la ligne du combo ne traverse plus l'écran (elle passait par-dessus la carte moteur) */
function fhRaz(){if(FH.vu)document.body.classList.remove('fhOn');FH.vu=false;FH.fin='';FH.nomT=0;FH.xv=-1;FH.recBat=false;FH.horsN=0;FH.trioT=0;if(!FH.el)return;if(FH.va){try{FH.va.cancel();}catch(e){}FH.va=null;}
  try{FH.el.getAnimations().forEach(function(a){a.cancel();});}catch(e){}
  FH.el.className='';FH.nom.className='fhNom';FH.cs.textContent='';FH.more.textContent='';FH.x.textContent='';FH.x.classList.remove('max');FH.rec.textContent='';FH.rec.classList.remove('on');}
function fhTick(vol){if(!FH.vu)return;const n=performance.now(); // (chaque image, depuis figHud) rien n'est écrit tant que rien ne change
  if(FH.fin){if(n<FH.finT)return;fhRaz();return;}
  if(!vol){if(mode==='drive'&&!gameOver&&FH.cs.firstChild){FH.nom.classList.remove('on');FH.el.classList.add('paye');FH.fin='efface';FH.finT=n+500;fhAnime(FH.el,[{opacity:1},{opacity:0}],500,{fill:'forwards',rm:true});return;}fhRaz();return;} // (les figures plantées sont déjà dans la chaîne)
  if(FH.nomT&&n>FH.nomT){FH.nomT=0;FH.nom.classList.remove('on');} // le nom s'éteint ; la ligne du combo reste tant qu'on vole
  if(!FH.nomT&&!FH.cs.firstChild)fhRaz();}
function fhLegMaj(){const el=document.getElementById('fhLeg');if(!el||!window.FIG)return;const S=figSlots(),cle=S.join(',')+'|'+LANG;if(FH.legCle===cle)return;FH.legCle=cle; // (en vol) ↑ figure 1 · ◄► figure 2
  const I=['haut','bas','fleches']; // (2026-10-15, les directions) chaque figure avec le geste et la couleur de SON emplacement ; un emplacement vide ne s'affiche pas (le tonneau ne part que de côté)
  el.innerHTML=S.map(function(id,i){if(!id)return '';const f=FIG.par[id];return '<div class="fhL" data-s="'+i+'" style="--fc:'+FH_COUL[i]+'">'+pxi(I[i])+'<b data-rp="'+figRarH(f)+'">'+fhTitre(fhNet(figNom(f,1)),figRarH(f))+'</b></div>';}).join(''); /* (v4) les vrais noms : « SALTO AVANT », plus « AVANT » qui se lisait comme une direction */
  FH.legs=[];FH.arme=-2;[].forEach.call(el.children,function(c){FH.legs[+c.getAttribute('data-s')]=c;});} // rangés par EMPLACEMENT : un geste refusé ne secoue pas l'autre
function fhArme(){if(!FH.legs||figGlisseOn())return;const s=figDirSlot();if(s===FH.arme)return; // (v4, chaque image en vol) le geste que vise le pouce s'ALLUME
  const a=FH.legs[FH.arme];if(a)a.classList.remove('arme');FH.arme=s;const b=FH.legs[s];if(b)b.classList.add('arme');}
function fhLegFx(s,ko){const b=FH.legs&&FH.legs[s];if(!b||s<0)return;
  if(ko){b.classList.add('ko');clearTimeout(b._k);b._k=setTimeout(function(){b.classList.remove('ko');},460);
    fhAnime(b,[{transform:'none'},{transform:'translateX(-6px)'},{transform:'translateX(5px)'},{transform:'translateX(-3px)'},{transform:'none'}],400,{easing:'steps(4)'});}
  else fhAnime(b,[{transform:'scale(1.22)',filter:'brightness(2.8)'},{transform:'none',filter:'none'}],360);}
window.dbgImpu=function(a,n){if(a==='tap'){const r=figImpulsion();return r?(r.attente?'attente':'ok'):'refus';}if(a==='slot'){const r=figLance(n|0,{});return r?(r.attente?'attente':'ok'):'refus';}
  const C=FX2.corps,e=document.getElementById('fh');return {on:IMPU.on,dir:FDIR.on,mode:mode,go:gameOver,intro:!!introD,eta:+(+CAMV.eta).toFixed(2),combo:{n:FX2.cv.n,dist:FX2.cv.dist,x:figCvX(),noms:FX2.cv.noms.slice()},ptsVol:FX2.pts,
    hud:e?e.className+' : '+e.textContent:'',chaine:CHA.liste.slice(),chutes:FX2.chutes,
    figs:C?C.figs.map(function(r){return r.f.id+(r.s>0?'+':'-')+' tours '+(r.mv[0]?r.mv[0].tours:0)+(r.paye?' payée':r.fini?' finie':'');}):null};};
function figIco(f){let m=null;for(let i=0;i<f.m.length;i++)if(f.m[i].t!=null&&(!m||Math.abs(f.m[i].t)>Math.abs(m.t)))m=f.m[i];
  if(!m)return 'fgBa';let n=0;for(let i=0;i<f.m.length;i++)if(f.m[i].t!=null)n++;if(n>1)return 'fgCo';
  const a=m.a;if(Math.abs(a[0])>.9)return m.t>0?'fgAv':'fgAr';if(Math.abs(a[1])>.9)return 'fgTo';if(Math.abs(a[2])>.9)return 'fgTn';return 'fgCo';}
function figCourt(f){const c=LANG==='en'?(f.ce||f.en||f.n):(f.c||f.n);return String(c).split(' ')[0].slice(0,8);}
function figHudMaj(){const el=document.getElementById('tFig');if(!el||!window.FIG)return;const S=figSlots(),cle=S.join(',')+'|'+LANG;if(FX2.cle===cle)return;FX2.cle=cle;
  el.innerHTML=S.map(function(id,i){if(!id)return '';const f=i<2&&FIG.oriente?FIG.oriente(FIG.par[id],FIG_DIR[i]):FIG.par[id];return '<div class="tFigB" data-s="'+i+'" role="button" aria-label="'+sansAcc(TR(f.n)).replace(/"/g,'')+'">'
    +'<i class="pxi pxi-rotation '+figIco(f)+'" aria-hidden="true"></i><b>'+sansAcc(figCourt(f)).replace(/[<>&"]/g,'')+'</b><u>'+(i+1)+'</u></div>';}).join('');
  FX2.bts=[];[].forEach.call(el.children,function(b){FX2.bts[+b.getAttribute('data-s')]=b;});FX2.btOn[0]=FX2.btOn[1]=FX2.btOn[2]=false;} // (les deux familles) rangés par EMPLACEMENT : 1 = avant, 2 = côté
function figBtFx(s,c){const b=FX2.bts&&FX2.bts[s];if(!b)return;b.classList.remove('boum','non');void b.offsetWidth;b.classList.add(c);}
function figHud(){ // (chaque image) les boutons n'existent qu'en VOL ; « on » = tenu
  figRedP();const v=FIGV2.on&&started&&!gameOver&&mode==='fall'&&!introD&&figTutoOk();fhTick(v||FR.on);if(v&&FDIR.on)fhArme(); // (2026-10-17) la figure SUR LA ROUTE garde son HUD tant qu'elle tourne (le rappel des gestes, lui, reste au vol)
  if(v!==FX2.vis){FX2.vis=v;document.body.classList.toggle('figVol',v);if(v){if(FDIR.on)fhLegMaj();else figHudMaj();}} // (2026-10-15) au joystick : le RAPPEL ↑ 1 · ◄► 2, plus de boutons
  if(v&&FX2.bts)for(let i=0;i<FX2.bts.length;i++){if(!FX2.bts[i])continue;const r=FX2.slots[i],on=!!(r&&r.tient&&!r.paye);if(FX2.btOn[i]!==on){FX2.btOn[i]=on;FX2.bts[i].classList.toggle('on',on);}}}
/* LES TROIS BOUTONS : le doigt (et la souris, dans le cadre de l'ordi) — un appui = l'explosion, tenu = la poussée ; au clavier 1 · 2 · 3 */
(function(){const el=document.getElementById('tFig');if(!el)return;
  const tient=function(s,id){FX2.tenus[s]=true;FX2.ptr[s]=id;figLance(s,{tient:true});},lache=function(id){for(let s=0;s<3;s++)if(FX2.ptr[s]===id){FX2.tenus[s]=false;FX2.ptr[s]=null;}};
  el.addEventListener('touchstart',function(e){if(e.cancelable)e.preventDefault();e.stopPropagation();
    for(let i=0;i<e.changedTouches.length;i++){const t=e.changedTouches[i],b=document.elementFromPoint(t.clientX,t.clientY),bt=b&&b.closest&&b.closest('.tFigB');if(bt)tient(+bt.getAttribute('data-s'),'t'+t.identifier);}},{passive:false});
  const fin=function(e){for(let i=0;i<e.changedTouches.length;i++)lache('t'+e.changedTouches[i].identifier);};
  el.addEventListener('touchend',fin,{passive:false});el.addEventListener('touchcancel',fin,{passive:false});
  el.addEventListener('mousedown',function(e){const bt=e.target.closest&&e.target.closest('.tFigB');if(!bt)return;e.preventDefault();e.stopPropagation();tient(+bt.getAttribute('data-s'),'souris');});
  addEventListener('mouseup',function(){lache('souris');});
  const K={Digit1:0,Digit2:1,Digit3:2,Numpad1:0,Numpad2:1,Numpad3:2}; /* (2026-10-15 soir) trois emplacements : avant · arrière · côté */
  addEventListener('keydown',function(e){const s=K[e.code];if(s==null||e.repeat)return;tient(s,'k'+s);});
  addEventListener('keyup',function(e){const s=K[e.code];if(s!=null)lache('k'+s);});
})();
try{Object.assign(I18N,{'Depuis NITRO, glisse puis lâche : ◄► un tail whip, ▲ ▼ un salto. Au sol, pousse le joystick en avant pour sauter.':'From NITRO, slide then release: ◄► a tail whip, ▲ ▼ a flip. On the ground, push the joystick forward to jump.'});}catch(e){} // (2026-10-15) l'astuce du GLISSER (bit 64 de SAVE.d.ast — libre ; ⚠ san() plafonne ast à 255 : jamais de bit 256)
try{Object.assign(I18N,{'COMBO':'COMBO','RECORD':'RECORD'});}catch(e){} // (HUD des figures v4)
try{Object.assign(I18N,{'COMBO PERDU':'COMBO LOST','En vol, tape 2 fois NITRO : pouce en AVANT = figure 1, sur le CÔTÉ = figure 2.':'In the air, double-tap NITRO: thumb FORWARD = trick 1, to the SIDE = trick 2.','En vol, tape 2 fois NITRO : pouce en AVANT, en ARRIÈRE ou sur le CÔTÉ — chaque geste a sa figure.':'In the air, double-tap NITRO: thumb FORWARD, BACK or to the SIDE — each gesture has its trick.'});}catch(e){} // (2026-10-15) HUD des figures v3 + le choix au joystick
try{Object.assign(I18N,{'En vol, touche une FIGURE : elle explose et fait tourner la caisse. Tiens pour un tour de plus !':'In the air, tap a TRICK: it blasts and spins the car. Hold for one more turn!','TOUPIE DE DRIFT':'DRIFT SPIN','EMPLACEMENTS':'SLOTS','ÉQUIPÉE':'EQUIPPED','REMPLACE':'REPLACES','RETIRÉE':'REMOVED',
  'IL EN FAUT UNE':'KEEP AT LEAST ONE','EMPLACEMENT':'SLOT'});}catch(e){}
window.dbgFig=function(a,b){
  if(a==='lance')return !!figLance(b|0,{});
  if(a==='equipe')return figEquipe(b);
  if(a==='phy')return FIG.PHY;
  const C=FX2.corps;
  return {on:FIGV2.on,equipees:figEquipees(),slots:figSlots(),mode:C?C.mode:null,ecart:C?Math.round(C.ecart()*57.3):0,w:C?C.w.map(function(x){return +x.toFixed(2);}):null,
    figures:C?C.figs.map(function(r){return r.f.id+(r.paye?' payée':r.fini?' finie':'')+' '+r.mv.map(function(m){return (m.th/6.2832).toFixed(2);}).join('/');}):null,
    herite:FX2.herite,lancees:FX2.n,payees:FX2.payees,chutes:FX2.chutes,ptsVol:FX2.pts,budget:C?+(+C.budget).toFixed(2):0,boutons:document.body.classList.contains('figVol')};};
/* ===== LE FIL (2026-10-25, Sacha : « alléger visuellement le jeu, surtout le milieu, pour TikTok : un seul système qui donne l'impression
   d'avoir accompli quelque chose sans prendre l'écran ») — spec : docs/superpowers/specs/2026-10-25-le-fil-design.md =====
   UNE pastille, sous le compteur d'aura (dans #auraV2 : elle suit la place du compteur sur PC comme sur téléphone), qui remplace les
   textes jaillis de la caisse (`popTexte` devient un alias), le verdict de pose, la grande annonce des gestes, la ligne du HUD des figures.
   · UNE ligne, remplacée à chaque annonce (la règle de priorité de popTexte est gardée : un temps fort ne se fait pas voler la vedette
     dans les 650 ms) ;
   · les annonces qui tombent dans la même seconde FUSIONNENT : « TONNEAU · SALTO AVANT +60 » au lieu de deux textes ;
   · niveau 0 geste · 1 palier · 2 temps fort · 3 impact : le 3 grossit la pastille et allume les bords (flashEcran) — jamais au centre.
   `?fil=0` rend l'ancien affichage. Console : `dbgLeFil(txt,niv)` pour en forcer une. */
const LEFIL={on:!/[?&]fil=0\b/.test(location.search),el:null,parts:[],niv:0,t:0,p:0,pt:0,k:false,fen:1100};
try{document.documentElement.classList.toggle('fil',LEFIL.on);}catch(e){}
function filEl(){
  if(LEFIL.el&&LEFIL.el.isConnected)return LEFIL.el;
  const h=document.getElementById('auraV2');if(!h)return null;
  const e=document.createElement('div');e.id='fil';e.setAttribute('aria-hidden','true');h.appendChild(e);LEFIL.el=e;return e;
}
function filBase(s){return String(s).replace(/\s*[+×]\s*[\d.,$].*$/,'').trim();} /* le nom du geste, sans ses points ni son × */
function fil(txt,col,niv){
  if(!LEFIL.on)return false;
  niv=niv|0;const n9=performance.now();
  if(niv<(LEFIL.p|0)&&n9<LEFIL.pt)return false; /* un temps fort ne se fait pas voler la vedette par un palier dans les 650 ms */
  const e=filEl();if(!e)return false;
  const lb=sansAcc(TR(txt)).replace(/[<>&"]/g,'').trim();if(!lb)return false;
  if(n9-LEFIL.t<LEFIL.fen&&LEFIL.parts.length){ /* même seconde : on fusionne (le dernier mot reste le dernier) */
    const L9=LEFIL.parts.length-1;
    if(filBase(LEFIL.parts[L9])===filBase(lb)){if(lb.length>=LEFIL.parts[L9].length)LEFIL.parts[L9]=lb;} /* « TONNEAU » puis « TONNEAU +45 » : le même geste, on garde le plus complet */
    else LEFIL.parts.push(lb);
    LEFIL.niv=Math.max(LEFIL.niv,niv);
  }else{LEFIL.parts=[lb];LEFIL.niv=niv;}
  const mx=LEFIL.niv>=3?14:LEFIL.niv===2?17:20; /* des caractères que la colonne du compteur porte, selon la taille du niveau */
  while(LEFIL.parts.length>3||(LEFIL.parts.length>1&&LEFIL.parts.join(' · ').length>mx))LEFIL.parts.shift();
  LEFIL.t=n9;LEFIL.p=niv;LEFIL.pt=n9+650;
  const tx=LEFIL.parts.join(' · ');e.textContent=tx;e.style.setProperty('--fc',col||'#ffd75e');e.dataset.n=LEFIL.niv;
  e.style.setProperty('--sk',tx.length>mx?(mx/tx.length).toFixed(3):1); /* un nom seul trop long rétrécit au lieu de déborder */
  const k9=LEFIL.k=!LEFIL.k;e.classList.remove(k9?'on':'on2');e.classList.add(k9?'on2':'on'); /* deux animations jumelles : relance sans mise en page forcée */
  if(niv>=3)try{flashEcran('rgba(255,215,94,.2)');}catch(x){}
  return true;
}
const FIL_RAR={commun:'#dfeeff',rare:'#35e6ff',epique:'#ff4fc2',exotique:'#ffc93a',legendaire:'#ff9a3a',combo:'#ffd75e'}; /* la couleur de la rareté d'une figure (celle des pastilles de l'ancien HUD) */
function filFig(t,rp,niv){fil(t,FIL_RAR[rp]||FIL_RAR.commun,niv==null?1:niv);}
function filTrick(txt,tier){ /* trickMsg : les verdicts de pose, les figures en vol, les paliers du × — sans emoji, sans la vanne après le tiret */
  const p9=String(txt).replace(/[\u2190-\u2BFF\uD83C-\uDBFF\uDC00-\uDFFF\uFE0F]/g,'').split(' — '),t=(/^×\d/.test(p9[0])?p9.join(' '):p9[0]).replace(/\s{2,}/g,' ').trim();
  if(t)fil(t,tier===3?'#ff3ec8':tier===2?'#ff9ee6':tier===1?'#5ee6ff':'#ffd75e',tier===3||tier===2?3:tier===1?2:1);
}
window.dbgLeFil=function(t,n){return fil(t||'TONNEAU +45','#ffd75e',n|0);};
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
function secFig(){const k=secCarte();if(k.c==='ville'){SEC.villeFig++;if(SEC.villeFig>=SEC_K.lampadaire)secGagne('lampadaire');}} // une figure (addTrick)
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
function m2Cartes(){try{const u=[];for(const k of Object.keys(SF_CARTES)){if(SF_HORS[k])continue;const g=sfMapDe(k);if(u.indexOf(g)<0)u.push(g);}return u;}catch(e){return [];}} // (2026-10-18) les maps HORS DU TIRAGE n'y sont pas · (2026-10-25) CRYPTOVILLE : Crypto City et la ville comptent pour UNE map
function m2Vues(L){const K=m2Cartes(),S=[];for(const k of L){const g=sfMapDe(k);if(K.indexOf(g)>=0&&S.indexOf(g)<0)S.push(g);}return S.length;} // les maps jouées qui comptent (une map sortie du tirage ne compte plus ; les anciennes sauvegardes « crypto » et « ville » valent CRYPTOVILLE)
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
function m2Meteo(){const c=m2Etat().c,H=c.met||{};let n=0,tot=0,f=-1;for(const g of m2Cartes()){const P=[];for(const k of Object.keys(SF_CARTES)){if(SF_HORS[k]||sfMapDe(k)!==g)continue;for(const x of Object.keys((SF_CARTES[k].m)||{}))P.push([k,x]);}if(!P.length)continue;let j=0;for(const q of P)if((H[q[0]]||[]).indexOf(q[1])>=0)j++;if(j/P.length>f||(j/P.length===f&&P.length>tot)){f=j/P.length;n=j;tot=P.length;}}return {n:n,tot:tot};}
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
    case 'musP10':{const L=m2Musiques();let n=0;if(L)for(const id of c.musP10||[])if(L.indexOf(id)>=0)n++;return n;} /* (2026-10-25) les morceaux de la liste actuelle déjà joués jusqu'au palier 10 */
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
function m2Musiques(){try{const P=window.POUCE_JEU,L=P&&P.liste;return L&&L.length?L.map(function(e){return e.id;}):null;}catch(e){return null;}} /* (2026-10-25) les ids des morceaux de Pouce bleu ; null tant que la liste n'est pas chargée (1re partie) */
function m2Seuil(m){if(m.v==='prof')return M2K.prof;if(m.k==='musP10'){const L=m2Musiques();return L?L.length:9999;}if(m.v!=='tot')return m.v;
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
  if(mode==='drive'||mode==='fall'){s.c.kmTot=(s.c.kmTot||0)+kmh*dt/3600;if(SND.sfx||SND.music)M2R.sonne=true;if(SND.music&&((engTier|0)+1)>=10){const E=window.POUCE_JEU&&POUCE_JEU.joue()&&POUCE_JEU.E; /* (2026-10-25) le morceau de CETTE course, à son palier 10 */
    if(E&&E.id){const L=s.c.musP10||(s.c.musP10=[]);if(L.indexOf(E.id)<0&&L.length<80){L.push(E.id);SAVE.mark();}}}}
  {const k9=secCarte(),sg=k9.c+'/'+k9.m+'/'+(runStats.zones|0);if(M2R.lv!==sg){M2R.lv=sg;m2Niveau(k9);}} /* (2026-10-22, Sacha : « tableau des peintures ») un niveau entré */
  if(mode==='drive'&&side<0)m2Cpt('envers',kmh*dt/3600,100,'envers'); /* MONDE À L'ENVERS : 100 km sous la dalle (side < 0) */
  if(((engTier|0)+1)>=24)secGagne('guerrier'); /* SUPER GUERRIER : le palier 24 */
 /* (2026-10-22) les kilomètres à vie (LA QUEUE DE CANARD) ; SND : la partie a-t-elle eu du son ou de la musique (LA SILENCIEUSE) */
  if(nitroOn&&(mode==='drive'||mode==='fall')){s.c.nitS=(s.c.nitS||0)+dt;if(pwrNitroT>0)s.c.nmaxS=(s.c.nmaxS||0)+dt;SAVE.mark();} /* (2026-10-22) les secondes de nitro, et celles brûlées pendant une NITRO MAX */
  if(FLOW.lv===4){r.frenN=1;if(FREN.t>(r.frenT||0))r.frenT=FREN.t;}
  const k=secCarte().c;if(k&&s.c.cartes.indexOf(k)<0){s.c.cartes.push(k);SAVE.mark();}
  {const k9=secCarte();if(k9.c&&k9.m){const H=s.c.met||(s.c.met={}),L=H[k9.c]||(H[k9.c]=[]);if(L.indexOf(k9.m)<0){L.push(k9.m);SAVE.mark();}}} /* (2026-10-22) les temps joués, map par map (LA STRATOS) */
  if(k==='banquise'&&BANQ.sur>0){s.c.verglasKm=(s.c.verglasKm||0)+kmh*dt/3600;} /* (2026-10-22) les km sur le verglas du glacier (L'ICEBERG) */
  if(mode==='fall'){if(!JEAU.dans){M2R.volT+=dt;s.c.airS=(s.c.airS||0)+dt;SAVE.mark();}if(k==='nuages'&&M2R.volT>(r.vol||0))r.vol=M2R.volT;if(k==='ville')m2Tours(r);}
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
  if(M2R.ctl<M2K.debut&&(RUNX.t||0)<M2K.debut+4)m2Flag('mort3s'); /* (2026-10-24) M2R.ctl ne compte qu'après l'auto-école, RUNX.t toute la partie (leçon comprise) : mourir juste après le permis ou un PASSER n'est pas « mourir au départ » */
  if(cause==='arret')m2Flag('arret');
  if(cause==='air')m2Flag('air0'); // le chrono de vol est tombé à zéro (la boule de l'airtime)
  if(cause==='lave')m2Flag('lave');
  try{if(nitroR>=nitroCap()-.01)m2Flag('nitplein');}catch(e){}
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
/* ===== LES MISSIONS v2 — L'ÉCRAN (2026-10-16, Sacha : « un écran MISSIONS magnifique, bâti à partir de la vue garage qui existe déjà » ·
   « UNE SEULE LISTE, triée intelligemment » · « toucher une mission la SUIT, jusqu'à 3 » · « une mission réussie brille et propose
   RÉCUPÈRE ») =====
   Le décor reste : la caméra s'élève au-dessus de l'atelier (GMIS), la trame et le balayage de la vue caméra, le cadeau en tête.
   Le panneau (#gmListe.m2, placé par gmPlaceL : debout entre le titre et JOUER, couché dans la colonne de JOUER) porte UNE liste :
   À RÉCUPÉRER (elles brillent) → SUIVIES (filet or, 3 au plus) → presque finies (≥ 2/3) → en cours → pas commencées ; puis
   « TERMINÉES (n) », repliées, qu'on ouvre. Une ligne : l'icône de sa famille (la case qu'on coche : un coin d'or quand elle est suivie),
   le texte, la jauge et son chiffre, la vignette de la récompense (photo de la caisse, aperçu de l'habillage, montant en vert).
   Les SECRÈTES n'y sont pas, même en « ? ? ? » : trouvées, elles arrivent avec leur badge SECRÈTE (les dix couleurs secrètes de la
   palette aussi, dans les TERMINÉES). Les jauges se remplissent DEPUIS ce que l'écran a déjà montré (`SAVE.d.m2.vu`). */
const M2_FAM={exploit:{ic:'eclair'},aura:{ic:'etoile'},argent:{ic:'piece'},moteur:{ic:'flamme'},collection:{ic:'coffre'},exploration:{ic:'drapeau'},secret:{ic:'oeil'}};
const M2E={fin:false}; // les TERMINÉES dépliées (le temps de la session)
Object.assign(I18N,{'RÉCUPÈRE':'CLAIM','BIENTÔT':'SOON','RÉUSSIE':'DONE','SECRÈTE':'SECRET','TERMINÉES':'COMPLETED','MISSION SECRÈTE':'SECRET MISSION',
  'MISSION SECRÈTE TROUVÉE':'SECRET MISSION FOUND','FAIT':'DONE','PAS ENCORE':'NOT YET','TROIS MISSIONS SUIVIES AU PLUS':'3 TRACKED MISSIONS AT MOST',
  'TOUCHE UNE MISSION POUR LA SUIVRE · 3 AU PLUS':'TAP A MISSION TO TRACK IT · 3 MAX','RÉCOMPENSE À RÉCUPÉRER':'A REWARD IS WAITING',
  'TOUTES LES MISSIONS':'ALL MISSIONS','À RÉCUPÉRER':'TO CLAIM','BIENTÔT AU GARAGE':'COMING TO THE GARAGE SOON','RÉCOMPENSE À VENIR':'REWARD COMING SOON',
  'EST À TOI':'IS YOURS','SUIVIE':'TRACKED','VERSÉS AU COMPTE':'PAID INTO YOUR ACCOUNT','MISSIONS RÉUSSIES':'MISSIONS DONE'});
function m2Nb(x){return Math.max(0,Math.floor(x)).toLocaleString(LOC()).replace(/[  ]/g,' ');}
function m2Mn(x){x=Math.max(0,Math.floor(x));return Math.floor(x/60)+':'+String(x%60).padStart(2,'0');}
/* L'AVANCEMENT DE LA PARTIE (en course, l'écran de mort) : pour une mission « en une partie », ce que CETTE partie a fait — le record
   ne bouge pas tant qu'on ne le bat pas, la jauge de course doit bouger, elle ; le reste (à vie, collection) : m2Val */
function m2ValCourse(m){try{switch(m.k){case 'aura':return Math.round(auraRun)||0;case 'parf':return M2R.parf;case 'fig':return Math.max(M2R.figV,M2R.figMax);
  case 'vie':return M2R.vie;case 'frenT':return FLOW.lv===4?FREN.t:(RUNX.frenMax||0);case 'eng':return (engTier|0)+1;case 'kmh':return Math.round(runStats.vmax)||0;
  case 'tours':return M2R.tourV.length;case 'airP':return M2R.airPm;}}catch(e){}return m2Val(m);}
function m2Frac(m,v,t){return t>0?Math.max(0,Math.min(1,v/t)):0;}
function m2Prog(m,v,t){v=Math.min(v,t); // « 3 / 5 », « 42 000 / 100 000 $ », « 4,2 / 5 S », « 1:12 / 5:00 »
  switch(m.u){case 's':return decFr(Math.floor(v*10)/10,1)+' / '+t+' S';case 'kmh':return m2Nb(v)+' / '+m2Nb(t)+' KM/H';case 'km':return m2Nb(Math.floor(v))+' / '+m2Nb(t)+' KM';
    case '$':return m2Nb(v)+' / '+m2Nb(t)+' $';case 'aura':return fmtAura(v)+' / '+fmtAura(t);case 'mn':return m2Mn(v)+' / '+m2Mn(t);
    case 'b':return v>=t?TR('FAIT'):TR('PAS ENCORE');}
  return m2Nb(v)+' / '+m2Nb(t);}
function m2RecNom(m){const r=m.r||{};if(r.cash)return '+'+fmtC(r.cash);if(r.car)return TR(r.car);
  if(r.cat){const d=(COSM[r.cat]||[]).find(function(x){return x.id===r.id;});return d?TR(d.n):'';}return TR('RÉCOMPENSE À VENIR');}
function m2NbPret(){const s=m2Etat();let n=0;for(const id of s.ok)if(s.pr.indexOf(id)<0&&m2Pret(id))n++;return n;}
function m2SecPal(){const o=(SAVE.d.shop&&SAVE.d.shop.own)||[];return COSM.peinture.filter(function(d){return d.sec&&o.indexOf('peinture:'+d.id)>=0;});} // les couleurs secrètes TROUVÉES (le pack n'en fait pas des missions… mais on ne sait pas d'où elles viennent : elles comptent)
function m2Compte(){const s=m2Etat(),p=m2SecPal().length;let vis=0,sec=0,ok=0;for(const m of M2){if(!m2Dispo(m))continue;const r=s.ok.indexOf(m.id)>=0;if(r)ok++;if(m.f!=='secret')vis++;else if(r)sec++;}
  return {ok:ok+p,tot:vis+sec+p};} // (2026-10-19) ok : les réussies qu'on VOIT (une cachée par m2Dispo ne compte ni en haut ni en bas)
/* les lignes, triées : 0 à récupérer · 1 suivies · 2 les autres, PAR FAMILLE (M2_ORDRE), la plus avancée d'abord · 9 terminées
   (2026-10-17, Sacha : « les exploits en haut, pas les COLLECTE ») — avant, le reste se triait à l'avancement seul : les COLLECTE (déjà à
   1 / 3 avec la caisse du départ) passaient au-dessus des exploits à 0, et un nouveau joueur ne voyait d'abord que des « COLLECTE ». */
const M2_ORDRE={exploit:0,aura:1,moteur:2,exploration:3,secret:4,argent:5,collection:6}; // ce qui se joue en course d'abord, ce qui s'accumule ensuite
function m2Lignes(){const s=m2Etat(),L=[],fo=function(x){const o=M2_ORDRE[x.m.f];return o==null?9:o;};
  for(const m of M2){const ok=s.ok.indexOf(m.id)>=0;if((m.f==='secret'&&!ok)||!m2Dispo(m))continue;let v=0;try{v=m2Val(m);}catch(e){}
    const t=m2Seuil(m),p=ok?1:m2Frac(m,v,t),pr=s.pr.indexOf(m.id)>=0,su=s.su.indexOf(m.id),vide=!!(m.r&&m.r.vide);
    const rg=ok?(!pr&&!vide?0:9):su>=0?1:2;L.push({m:m,v:v,t:t,p:p,ok:ok,pr:pr,su:su,rg:rg});}
  L.sort(function(a,b){return a.rg-b.rg||(a.rg===1?a.su-b.su:a.rg===2?fo(a)-fo(b):0)||b.p-a.p||M2.indexOf(a.m)-M2.indexOf(b.m);});return L;}
function m2CarVoir(m){const r=m.r||{};if(r.car){const i=m2CarIdx(r.car);return i>=0&&!carRetiree(i)?{car:i}:null;}
  if(r.cat){const j=(COSM[r.cat]||[]).findIndex(function(x){return x.id===r.id;});return j>=0?{cat:r.cat,i:j}:null;}return null;}
/* LA VIGNETTE : la caisse en photo (photoFile, une par image, au garage), l'aile en photo sur ta caisse (aileFile), la peinture en pastille
   et la traînée en ruban (objFig, ceux de l'écran de mort), l'argent en vert, « ? » pour la récompense encore à définir */
function m2Vign(m){const r=m.r||{};
  if(r.cash)return '<b class="m2Cash">+'+fmtC(r.cash)+'</b>';
  if(r.vide)return '<i class="m2Vide">?</i>';
  if(r.car){const i=m2CarIdx(r.car);const ph=i>=0&&PHOTO.cache[i];return '<i class="m2Ph">'+pxi('voiture')+'<img alt=""'+(ph?' src="'+ph+'"':i>=0&&!carRetiree(i)?' data-ph="'+i+'"':'')+'></i>';}
  if(r.cat==='aile')return '<i class="m2Ph">'+pxi('aile')+'<img alt="" data-ai="'+r.id+'"></i>';
  if(r.cat){const j=(COSM[r.cat]||[]).findIndex(function(x){return x.id===r.id;});return j>=0?objFig({cat:r.cat,i:j}):'<i class="m2Vide">'+pxi(r.cat==='trainee'?'trainee':'pinceau')+'</i>';}
  return '';}
function m2Ligne(x,k,s){const m=x.m,F=M2_FAM[m.f]||M2_FAM.exploit,pret=x.rg===0,suiv=x.su>=0&&!x.ok,vu=s.vu[m.id],voir=!!m2CarVoir(m);
  const w0=Math.round(100*Math.min(x.p,vu!=null?vu:x.p)),w1=Math.round(100*x.p);
  let bas;
  if(pret)bas=m2Pret(m.id)?'<span class="m2Pr" aria-hidden="true"><span>'+pxi('cadeau')+' '+TR('RÉCUPÈRE')+'</span></span>':'<small class="m2Bt">'+TR('BIENTÔT AU GARAGE')+'</small>';
  else bas='<small>'+(x.ok?TR('RÉUSSIE'):(suiv?TR('SUIVIE')+' · ':'')+m2Prog(m,x.v,x.t))+'</small>';
  return '<div class="m2L m2F-'+m.f+(suiv?' f':'')+(x.ok?' ok':'')+(pret?' pret':'')+'" data-m2="'+m.id+'" role="button" tabindex="0" aria-pressed="'+suiv+'" style="--i:'+Math.min(k,12)+'">'
    +'<span class="m2Ic">'+pxi(x.ok&&!pret?'coche':F.ic)+(suiv?'<i class="m2Ck"></i>':'')+'</span>'
    +'<div class="glTx"><b>'+(m.f==='secret'?'<i class="m2Sec">'+TR('SECRÈTE')+'</i> ':'')+m2TxtH(m)+'</b>'
    +(x.ok?'':'<u><em style="width:'+w0+'%" data-w="'+w1+'"></em></u>')+bas+'</div>'
    +'<div class="m2R'+(voir?' voir':'')+'" aria-label="'+sansAcc(m2RecNom(m)).replace(/"/g,'')+'">'+m2Vign(m)+'</div></div>';}
function m2LignePal(d){ // une couleur secrète de la palette, trouvée : son indice devient sa mission
  const j=COSM.peinture.indexOf(d);return '<div class="m2L m2F-secret ok" data-pal="'+d.id+'"><span class="m2Ic">'+pxi('coche')+'</span>'
    +'<div class="glTx"><b><i class="m2Sec">'+TR('SECRÈTE')+'</i> '+sansAcc(TR(d.ind||'')).toUpperCase()+'</b><small>'+TR('RÉUSSIE')+'</small></div>'
    +'<div class="m2R voir">'+objFig({cat:'peinture',i:j})+'</div></div>';}
/* (2026-10-22, Sacha : « enlève le défi du jour, enlève toutes les catégories en haut, c'est trop compliqué : plus simple, plus beau, chaque bouton mieux placé »)
   Deux colonnes, rien d'autre. À GAUCHE (.glB) : la carte de la SÉRIE de sept jours (sous le titre et le compte, RETOUR en bas).
   À DROITE (.glA) : UNE liste, triée — À RÉCUPÉRER (elles brillent), SUIVIES (filet or, 3 au plus), puis les autres, les exploits d'abord —
   au-dessus de JOUER. Les titres de groupe n'apparaissent que s'il y a plusieurs groupes. Plus de défi du jour, plus de filtres de famille. */
Object.assign(I18N,{'SUIVIES':'TRACKED'});
const M2_GROUPES=[[0,'À RÉCUPÉRER','vert','cadeau'],[1,'SUIVIES','or','cible'],[2,'MISSIONS','','']];
function m2Render(vu){
  const el=$('gmNoeuds'),sv=$('gmFils');if(!el)return;if(sv)sv.innerHTML='';
  const old=$('gmListe'),sc0=old?old.scrollTop:0,a0=old&&old.querySelector('.glA'),sc1=a0?a0.scrollTop:0,b0=old&&old.querySelector('.glB'),sc2=b0?b0.scrollTop:0;
  const s=m2Etat(),L=m2Lignes(),pal=m2SecPal();let k=0,hb='',h='<div class="glA m2A">';
  try{hb=serieHtml();}catch(e){console.warn('serieHtml',e);} /* la série de sept jours (missions/aujourdhui.js) */
  const gr=M2_GROUPES.map(function(g){return {g:g,ls:L.filter(function(x){return x.rg===g[0];})};}).filter(function(o){return o.ls.length;});
  for(const o of gr){if(gr.length>1)h+='<h4 class="m2Hd'+(o.g[2]?' '+o.g[2]:'')+'">'+(o.g[3]?pxi(o.g[3])+' ':'')+sansAcc(TR(o.g[1]))+' <b>'+(o.g[0]===1?o.ls.length+' / 3':o.ls.length)+'</b></h4>';
    for(const x of o.ls)h+=m2Ligne(x,k++,s);}
  const fin=L.filter(function(x){return x.rg===9;}),nf=fin.length+pal.length;
  if(nf){h+='<div class="m2Fin'+(M2E.fin?' on':'')+'" role="button" tabindex="0" aria-expanded="'+M2E.fin+'">'+pxi('coche')+'<span>'+sansAcc(TR('TERMINÉES'))+' ('+nf+')</span>'+pxi(M2E.fin?'haut':'bas')+'</div>';
    if(M2E.fin){h+='<div class="m2FinL">';fin.forEach(function(x,j){h+=m2Ligne(x,j,s);});pal.forEach(function(d){h+=m2LignePal(d);});h+='</div>';}}
  if(!k&&!nf)h+='<div class="m2Rien">'+TR('TOUTES LES MISSIONS')+'</div>';
  h+='</div>';
  el.innerHTML='<div id="gmListe" class="m2'+(vu?' vu':'')+'">'+(hb?'<div class="glB m2B">'+hb+'</div>':'')+h+'</div>';
  GMIS.cards=[];GMIS.pts=[];GMIS.paths=[];GMIS.last=null;GMIS.lw=0;
  const c=m2Compte(),sous=$('gmSous'),hd=$('gmHead');if(sous)sous.textContent=c.ok+' / '+c.tot;if(hd)hd.style.setProperty('--m2P',Math.round(100*c.ok/Math.max(1,c.tot))+'%'); /* le compte, et sa jauge sous le titre */
  const aide=$('gmAide');if(aide)aide.textContent=s.su.length?'':sansAcc(TR('TOUCHE UNE MISSION POUR LA SUIVRE · 3 AU PLUS'));
  try{gmPlaceL(VP.w,VP.h);}catch(e){}
  const nl=$('gmListe');if(nl){nl.scrollTop=sc0;const a1=nl.querySelector('.glA'),b1=nl.querySelector('.glB');if(a1)a1.scrollTop=sc1;if(b1)b1.scrollTop=sc2;}
  if(typeof GAR!=='undefined'&&GAR.aMisId){const id9=GAR.aMisId;GAR.aMisId=null;setTimeout(function(){const r9=document.querySelector('#gmListe .m2L[data-m2="'+id9+'"]');if(r9){try{r9.scrollIntoView({block:'center'});}catch(e){}r9.classList.add('flash');}},REDUCED_MOTION?0:380);} // VOIR LA MISSION hors du garage
  /* les photos : une à la fois (photoFile tourne au garage), posées si la ligne est encore là */
  el.querySelectorAll('img[data-ph]').forEach(function(im){const i=+im.getAttribute('data-ph');photoFile(i,function(u){if(u&&im.isConnected)im.src=u;});});
  el.querySelectorAll('img[data-ai]').forEach(function(im){try{aileFile(im.getAttribute('data-ai'),function(u){if(u&&im.isConnected)im.src=u;});}catch(e){}});
  /* les jauges se remplissent depuis ce que l'écran avait montré (après une partie : on voit ce qu'elle a fait) */
  const ems=el.querySelectorAll('.m2L u em[data-w]'),go=function(){ems.forEach(function(e){e.style.width=e.getAttribute('data-w')+'%';});};
  if(REDUCED_MOTION||vu)go();else setTimeout(function(){requestAnimationFrame(go);},420);
  let ch=false;for(const x of L){const p=Math.round(x.p*1000)/1000;if(s.vu[x.m.id]!==p){s.vu[x.m.id]=p;ch=true;}}if(ch)SAVE.mark();
  m2Portes();m2RevAuto(700);}
function m2Voir(m){const o=m2CarVoir(m);if(!o){uiClic('refus');return;}uiClic('nav');
  ecranWipe(function(){garMode('boutique');if(o.car!=null){shopTab('voiture');garageShow(o.car);}else{shopTab(o.cat);shopShow(o.cat,o.i);}});}
function m2Recupere(id,row){
  if(!m2Pret(id)){uiClic('refus');try{gSecoue(row);}catch(e){}toast(pxi('horloge')+' '+TR('BIENTÔT AU GARAGE'));return;}
  const o=m2Prend(id);if(!o){uiClic('refus');return;}
  row.classList.add('pris');const vg=row.querySelector('.m2R');
  try{pixBurst(row.querySelector('.m2Pr')||row,12);if(vg)pixBurst(vg,10);}catch(e){}
  try{if(SONV2){sfx(o.cash?'ui.achat':'ui.debloque');if(!REDUCED_MOTION)sfx('ui.tampon',{t:.27});}else uiClic('ok');}catch(e){}
  hap([12,40,18,40,30]);
  if(o.car!=null){try{carSnapshot();}catch(e){}toast(pxi('voiture')+' '+TR(CARS[o.car].name)+' — '+TR('EST À TOI'),true);}
  else if(o.cat){const d=(COSM[o.cat]||[]).find(function(x){return x.id===o.hab;});toast(pxi('coche')+' '+(d?TR(d.n):'')+' — '+TR('EST À TOI'),true);}
  else toast(pxi('piece')+' +'+fmtC(o.cash)+' '+TR('VERSÉS AU COMPTE'),true);
  try{gBankPaint();}catch(e){}try{m2Portes();}catch(e){}
  setTimeout(function(){if(garageOn&&gEl&&gEl.classList.contains('missions'))m2Render(true);else m2Portes();},REDUCED_MOTION?0:560);}
function m2Clic(e){const t=e.target;if(!t||!t.closest)return;
  if(t.closest('.m2Serie')){aujClic(t);return;} /* (2026-10-20) la carte de la série dit ce qu'elle donne */
  const fin=t.closest('.m2Fin');if(fin){M2E.fin=!M2E.fin;uiClic(M2E.fin?'on':'off');hap(8);m2Render(true);
    if(M2E.fin){const f2=document.querySelector('#gmListe .m2Fin');if(f2&&f2.scrollIntoView)try{f2.scrollIntoView({block:'start',behavior:REDUCED_MOTION?'auto':'smooth'});}catch(x){}}return;}
  const pal=t.closest('[data-pal]');if(pal){const j=COSM.peinture.findIndex(function(d){return d.id===pal.getAttribute('data-pal');});if(j<0)return;uiClic('nav');
    ecranWipe(function(){garMode('boutique');shopTab('peinture');shopShow('peinture',j);});return;}
  const row=t.closest('.m2L');if(!row)return;const id=row.getAttribute('data-m2'),m=m2Def(id);if(!m)return;const s=m2Etat();
  if(t.closest('.m2R.voir')&&!t.closest('.m2Pr')){m2Voir(m);return;}
  if(row.classList.contains('pret')){if(m.f==='secret'&&m2Revele(id))return;m2Recupere(id,row);return;} // une SECRÈTE qui brille : sa révélation
  if(s.ok.indexOf(id)>=0){uiClic('refus');return;}
  const k=s.su.indexOf(id);
  if(k>=0)s.su.splice(k,1);
  else{if(s.su.length>=3){uiClic('refus');try{gSecoue(row);}catch(x){}toast(pxi('cible')+' '+TR('TROIS MISSIONS SUIVIES AU PLUS'));return;}s.su.push(id);}
  SAVE.flush();uiClic(k>=0?'off':'on');hap(10);m2Render(true);
  const r2=document.querySelector('#gmListe .m2L[data-m2="'+id+'"]');if(r2){r2.classList.add('flash');if(k<0&&r2.scrollIntoView)try{r2.scrollIntoView({block:'nearest'});}catch(x){}}}
/* LE POINT VERT DES PORTES (à la place des trois pastilles du carnet) : une récompense attend d'être récupérée */
function m2Portes(){const n=m2NbPret();
  document.querySelectorAll('#gvMis,.ghT[data-h="mis"],#mHome [data-m="mis"]').forEach(function(d){let p=d.querySelector(':scope>.m2Pt');
    if(!p){if(!n)return;p=document.createElement('i');p.className='m2Pt';p.setAttribute('aria-hidden','true');try{if(getComputedStyle(d).position==='static')d.style.position='relative';}catch(e){}d.appendChild(p);}
    p.hidden=!n;});}
/* LES MISSIONS SUIVIES, EN COURSE (#m2Focus, à la place de #misFocus) : trois lignes au plus, discrètes — consigne · avancement · jauge
   fine ; verte quand elle tombe. Le DOM n'est écrit que si un texte ou une jauge change (4 fois par seconde au plus, m2Tick). */
const MIS_FOCUS_OFF=true; // (2026-10-20, Sacha : « enlève ce truc de mission ») plus aucune mission suivie affichée en course ; false = on la rallume
function m2FocusMaj(){let e=document.getElementById('m2Focus');const on=!MIS_FOCUS_OFF&&misOn()&&!TUTO.on;
  const s=on?m2Etat():null,L=on?s.su.filter(function(id){return m2Dispo(m2Def(id))&&!!m2Def(id);}):[];
  if(!L.length){if(e&&e._on){e.classList.remove('on');e._on=0;}return;}
  if(!e){e=document.createElement('div');e.id='m2Focus';e.setAttribute('aria-hidden','true');(document.getElementById('hud')||document.body).appendChild(e);e._k='';e.r=[];}
  const k9=L.join(',');
  if(e._k!==k9){e._k=k9;e.innerHTML=L.map(function(){return '<div class="m2FR"><i></i><span></span><b></b><u><em></em></u></div>';}).join('');
    e.r=[].map.call(e.children,function(r){return {el:r,i:r.children[0],sp:r.children[1],b:r.children[2],em:r.children[3].firstChild,t:'',p:'',w:'',ic:'',ok:null};});}
  L.forEach(function(id,j){const m=m2Def(id),R=e.r[j],ok=s.ok.indexOf(id)>=0;let v=0;try{v=m2ValCourse(m);}catch(x){}const t=m2Seuil(m);
    const tx=sansAcc(m2Txt(m)),pg=ok?TR('RÉUSSIE'):m2Prog(m,v,t),w=Math.round(100*(ok?1:m2Frac(m,v,t)))+'%',ic=ok?'coche':(M2_FAM[m.f]||M2_FAM.exploit).ic;
    if(R.t!==tx){R.t=tx;R.sp.textContent=tx;}if(R.p!==pg){R.p=pg;R.b.textContent=pg;}if(R.w!==w){R.w=w;R.em.style.width=w;}
    if(R.ic!==ic){R.ic=ic;R.i.innerHTML=pxi(ic);}if(R.ok!==ok){R.ok=ok;R.el.classList.toggle('ok',ok);}});
  if(!e._on){e.classList.add('on');e._on=1;}}
/* LA CARTE MISSIONS DE L'ÉCRAN DE MORT : les missions réussies pendant la partie, puis l'avancement des suivies (la jauge se remplit
   sous les yeux) ; à défaut, celle qui est la plus proche de tomber. Une SECRÈTE trouvée ne dit pas son nom (sa révélation est à venir).
   Le point vert : une récompense attend. Touchée : l'écran MISSIONS. */
function objRenderV2(el){const s=m2Etat(),L=[];
  for(const id of M2R.run){const m=m2Def(id);if(m&&m2Dispo(m)&&L.length<2&&!L.some(function(x){return x.m===m;}))L.push({m:m,ok:1});}
  for(const id of s.su){const m=m2Def(id);if(!m||!m2Dispo(m)||L.length>=3||L.some(function(x){return x.m===m;}))continue;L.push({m:m,ok:s.ok.indexOf(id)>=0?1:0});}
  if(!L.length){let b=null,bp=-1;for(const m of M2){if(m.f==='secret'||m.f==='collection'||s.ok.indexOf(m.id)>=0||!m2Dispo(m))continue;let v=0;try{v=m2Val(m);}catch(x){}
    const p=m2Frac(m,v,m2Seuil(m));if(p<1&&p>bp){bp=p;b=m;}}if(b)L.push({m:b,ok:0});}
  const nP=m2NbPret(),c=m2Compte();
  el.className='mObj misPorte m2Ob';el.setAttribute('data-m','mis');el.style.removeProperty('--rc');
  let h='<div class="obHd"><span>'+pxi('cible')+' '+TR('MISSIONS')+(nP?' <i class="m2Pt in"></i>':'')+'</span><b class="m2Cpt">'+c.ok+' / '+c.tot+'</b></div>';
  for(const x of L){const m=x.m;
    if(m.f==='secret')h+='<div class="obM ok sec">'+pxi('oeil')+'<span>'+sansAcc(TR('MISSION SECRÈTE TROUVÉE'))+'</span></div>';
    else if(x.ok)h+='<div class="obM ok">'+pxi('coche')+'<span>'+sansAcc(m2Txt(m))+'</span><em>'+sansAcc(m2RecNom(m))+'</em></div>';
    else{let v=0;try{v=m2ValCourse(m);}catch(q){}const t=m2Seuil(m);
      h+='<div class="obM">'+pxi((M2_FAM[m.f]||M2_FAM.exploit).ic)+'<span>'+sansAcc(m2Txt(m))+'</span><b>'+m2Prog(m,v,t)+'</b></div><div class="obBar"><i style="width:0%" data-w="'+(100*m2Frac(m,v,t)).toFixed(1)+'"></i></div>';}}
  h+='<div class="obFt"><span>'+sansAcc(TR(nP?'À RÉCUPÉRER':'TOUTES LES MISSIONS'))+'</span><span>'+TR('VOIR')+' '+pxi('droite')+'</span></div>';
  el.innerHTML=h;
  const bars=el.querySelectorAll('.obBar i');
  if(bars.length&&!REDUCED_MOTION&&TCTL.mortT&&objRenderV2._k!==TCTL.mortT){objRenderV2._k=TCTL.mortT;setTimeout(function(){try{if(started&&gameOver&&overlay.style.display!=='none'&&el.isConnected)sfx('ui.jauge');}catch(e){}},520);}
  setTimeout(function(){requestAnimationFrame(function(){bars.forEach(function(i){i.style.width=i.getAttribute('data-w')+'%';});});},REDUCED_MOTION?0:520);
  m2RevAuto(1400);} // une SECRÈTE trouvée pendant la partie : sa révélation, par-dessus l'écran de mort
/* ===== LES MISSIONS v2 — LA BOUTIQUE ET LE GARAGE (2026-10-16, Sacha : « une voiture ou un habillage qui se gagne par mission affiche, à
   la place du prix, SE DÉBLOQUE : texte de la mission, avec sa barre d'avancement, plus un bouton qui mène directement à la mission dans
   l'écran MISSIONS (et la suit) » · « voitures secrètes : dans la boutique, elles n'apparaissent qu'en silhouette noircie, avec écrit
   MISSION SECRÈTE. Aucun indice, aucune barre. Elles ne s'affichent ni en 3D ni en couleur tant qu'elles ne sont pas gagnées ») =====
   · rayon VOITURES (bqPieces) : les caisses à pièces, puis celles des missions, puis les secrètes (silhouettes : `.m2sec`, nom « ? ? ? »,
     rareté « MISSION SECRÈTE », pastille SECRÈTE) ;
   · une SECRÈTE touchée n'est jamais construite : le plateau se vide (`GBQ.sec`, la ligne de garageRender qui montre la caisse la tait),
     l'étiquette dit MISSION SECRÈTE, le bouton est éteint ;
   · une caisse ou un habillage de mission : l'étiquette au-dessus de l'objet porte SE DÉBLOQUE + la jauge (m2DebloqueHtml), le bouton dit
     VOIR LA MISSION (bqEtat 'mis' → m2VaMission : la mission SUIVIE, l'écran MISSIONS, la ligne amenée en vue) ; la fiche de la console
     (#gDesc) aussi, avec son bouton (`data-m2voir`). */
function m2DeCaisse(i){const u=CAR_UNLOCK[i];return u&&u.k==='mis'?m2Def(u.id):null;}
function m2DeHab(cat,d){return d&&d.mis2?m2Def(d.mis2):null;}
function m2Secrete(i){const m=m2DeCaisse(i);return !!(m&&m.f==='secret'&&!carUnlockedVrai(i));}
Object.assign(I18N,{'SE DÉBLOQUE':'UNLOCKS','VOIR LA MISSION':'SEE THE MISSION','RÉCUPÈRE DANS MISSIONS':'CLAIM IT IN MISSIONS',
  "Ne s'achète pas : elle se gagne par une mission.":'Not for sale: it is earned through a mission.',
  "Ne s'achète pas : elle vient avec le CHAT POP-TART.":'Not for sale: it comes with the POP-TART CAT.',
  'PACK CHAT':'CAT PACK','AVEC LE CHAT':'WITH THE CAT','+ ARC-EN-CIEL':'+ RAINBOW','+ TRAÎNÉE ARC-EN-CIEL':'+ RAINBOW TRAIL','+ TRAÎNÉE ARC-EN-CIEL INCLUSE':'+ RAINBOW TRAIL INCLUDED'}); // (2026-10-18 soir) le pack du chat (voir chatPackI) ; (2026-10-20) la pastille de la vitrine (voir shArcHtml)
function m2DebloqueHtml(m,sansBouton){if(!m)return '';const s=m2Etat(),ok=s.ok.indexOf(m.id)>=0;let v=0;try{v=m2Val(m);}catch(e){}const t=m2Seuil(m),p=ok?1:m2Frac(m,v,t);
  return '<span class="m2Deb"><span class="m2DebT">'+pxi('cible')+' '+sansAcc(TR('SE DÉBLOQUE'))+' : '+m2TxtH(m)+'</span>'
    +'<span class="m2DebB"><u><em style="width:'+Math.round(p*100)+'%"></em></u><b>'+(ok?sansAcc(TR('RÉCUPÈRE DANS MISSIONS')):m2Prog(m,v,t))+'</b></span>'
    +(sansBouton?'':'<span class="m2DebV" role="button" tabindex="0" data-m2voir="'+m.id+'">'+sansAcc(TR('VOIR LA MISSION'))+' '+pxi('droite')+'</span>')+'</span>';}
function m2TxtH(m){return sansAcc(m2Txt(m)).replace(/\d[\d ]*\d/g,function(x){return '<span class="m2Nw">'+x+'</span>';});} // les nombres ne se coupent pas en fin de ligne (« 1 / 000 »)
function m2SecretHtml(){return '<span class="m2Deb sec"><span class="m2DebT">'+pxi('oeil')+' '+sansAcc(TR('MISSION SECRÈTE'))+'</span></span>';}
/* VOIR LA MISSION : l'écran MISSIONS, la mission SUIVIE (trois le sont déjà : la plus ancienne laisse sa place), sa ligne amenée en vue */
function m2VaMission(id){const m=m2Def(id);if(!m||m.f==='secret')return;const s=m2Etat();
  if(s.ok.indexOf(id)<0&&s.su.indexOf(id)<0){if(s.su.length>=3)s.su.shift();s.su.push(id);SAVE.flush();}
  uiClic('nav');hap(8);
  const va=function(){garMode('missions');setTimeout(function(){const r=document.querySelector('#gmListe .m2L[data-m2="'+id+'"]');if(r){try{r.scrollIntoView({block:'center'});}catch(e){}r.classList.add('flash');}},REDUCED_MOTION?0:380);};
  if(!garageOn){GAR.aMisId=id;garMissionsOuvre();return;}
  ecranWipe(function(){
    if(GBQ.on||GMODE.m==='shop')try{gGarageReplie();GBQ.on=GBQ.veut=false;GBQ.bascule=true;bqClasses(false);try{garBqAmbiance(false);bqSonCoupe(.4);}catch(e){}GBQ.lueur=0;GBQ.sec=null;SHOP.prev=null;buildCar(CARS[equippedCar()]);}catch(e){} // la boutique rangée d'un coup sous le voile (la recette de son ◀ depuis l'accueil)
    va();});}
document.addEventListener('click',function(e){const t=e.target&&e.target.closest&&e.target.closest('[data-m2voir]');if(!t)return;e.stopPropagation();e.preventDefault();
  if(typeof GAR!=='undefined'&&(GAR.go||ecranWipe._on))return;try{uiPop(t);}catch(x){}m2VaMission(t.getAttribute('data-m2voir'));},true);
/* ===== LES MISSIONS v2 — LA RÉVÉLATION D'UNE SECRÈTE (2026-10-16, Sacha : « pour une SECRÈTE, une vraie scène de révélation : la silhouette
   noire se remplit de couleur, avec le nom de la voiture et l'intitulé de la mission enfin dévoilé. C'est le moment fort ») =====
   #m2Rev, par-dessus tout : la nuit et ses rayons ; MISSION SECRÈTE ; la caisse en SILHOUETTE NOIRE (sa photo de studio, `carPhoto`) ;
   0,7 s plus tard la couleur la remplit de bas en haut sous une ligne de lumière à la couleur de sa rareté (1,4 s, `ui.debloque`) ; son
   NOM tombe (gerbe de pixels) ; l'INTITULÉ de la mission s'écrit lettre à lettre (`ui.lettre`) ; RÉCUPÈRE — la caisse est à toi (`m2Prend`,
   `ui.achat` + `ui.tampon`). Toucher avant la fin = aller au bout ; Entrée / Espace / Échap aussi.
   LA FILE (m2RevFile) : les secrètes réussies dont la caisse n'est pas encore à toi, et déjà au garage (une retirée qui n'est pas encore
   revenue attend). Elle se joue sur l'écran de mort (1,4 s après lui), en ouvrant l'écran MISSIONS, en touchant une secrète qui brille,
   ou à la console (dbgMissions('gagne',id)). Une à la fois ; la suivante enchaîne. « Réduire les animations » : tout est posé d'un coup. */
const M2REV={on:false,id:null,t:0};
Object.assign(I18N,{'CONTINUER':'CONTINUE'});
function m2RevFile(){const s=m2Etat();return M2.filter(function(m){return m.f==='secret'&&!!(m.r&&m.r.car)&&s.ok.indexOf(m.id)>=0&&s.pr.indexOf(m.id)<0&&m2Pret(m.id);}).map(function(m){return m.id;});}
function m2RevAuto(delai){if(M2REV.on||!m2RevFile().length)return;clearTimeout(M2REV.t);
  M2REV.t=setTimeout(function(){if(M2REV.on||m2EnC())return;if(m2RevAttend()){m2RevAuto(400);return;}const L=m2RevFile();if(L.length)m2Revele(L[0]);},delai||0);}
/* ===== LA RÉVÉLATION ATTEND SON TOUR (24/10, relecture : « une secrète réussie pendant la partie couvrait l'offre de seconde chance ») =====
   Ouverte 1,4 s après l'écran de fin, plein écran (z-index 95), elle passait PAR-DESSUS la plaque CONTINUER de la seconde chance, qui n'a que
   5,5 s : le joueur regardait la caisse se remplir de couleur pendant que l'offre filait. La machine FINAL SPIN attendait déjà l'offre
   (chanceAttend) ; la révélation l'attend aussi, et attend que la machine (z-index 250, par-dessus elle) soit refermée. Elle repasse toutes les 0,4 s. */
function m2RevAttend(){try{return !!((typeof chanceAttend==='function'&&chanceAttend())||(typeof SPIN!=='undefined'&&SPIN.ouvert));}catch(e){return false;}}
function m2Revele(id){const m=m2Def(id);if(!m||M2REV.on||m2EnC())return false;const i=m2CarIdx((m.r||{}).car);if(i<0||carRetiree(i))return false;
  M2REV.on=true;M2REV.id=id;
  let el=document.getElementById('m2Rev');if(!el){el=document.createElement('div');el.id='m2Rev';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.appendChild(el);}
  const ri=rarInfo(carRar(i));el.style.setProperty('--rc',ri.c);el.setAttribute('aria-label',sansAcc(TR('MISSION SECRÈTE')));
  el.innerHTML='<div class="m2RvFond"></div><div class="m2RvRayons"></div>'
    +'<div class="m2RvBloc"><div class="m2RvHd">'+pxi('oeil')+' '+sansAcc(TR('MISSION SECRÈTE'))+'</div>'
    +'<div class="m2RvPh"><img class="c" alt=""><img class="n" alt=""><i class="m2RvLigne"></i></div>'
    +'<div class="m2RvRar">'+sansAcc(TR(ri.n1))+'</div><div class="m2RvNom">'+sansAcc(TR(CARS[i].name))+'</div>'
    +'<div class="m2RvTx"><span></span></div>'
    +'<div class="pbtn pb-gold m2RvBt" role="button" tabindex="0"><span>'+pxi('cadeau')+' '+sansAcc(TR('RÉCUPÈRE'))+'</span></div></div>';
  el.className='';void el.offsetWidth;el.classList.add('on');
  try{if(SONV2)sfx('ui.volet');}catch(e){}hap(10);
  const imC=el.querySelector('img.c'),imN=el.querySelector('img.n');
  const go=function(url){if(!M2REV.on||M2REV.id!==id)return;if(url){imC.src=url;imN.src=url;}else el.querySelector('.m2RvPh').classList.add('vide');
    const T=function(f,ms){setTimeout(function(){if(M2REV.on&&M2REV.id===id)f();},REDUCED_MOTION?0:ms);};
    T(function(){el.classList.add('plein');try{if(SONV2)sfx('ui.debloque');}catch(e){}hap([20,60,20,60,60]);},700);        // la silhouette se remplit de couleur
    T(function(){el.classList.add('nom');try{pixBurst(el.querySelector('.m2RvNom'),12);}catch(e){}},2000);                      // le nom tombe
    T(function(){el.classList.add('tx');m2RevTape(el.querySelector('.m2RvTx span'),sansAcc(m2Txt(m)),id);},2500);             // l'intitulé, enfin dévoilé
    T(function(){el.classList.add('bt');},3300);};
  try{carPhoto(i,go);}catch(e){go(null);} // la photo de studio (asynchrone) : la scène part quand elle est prête
  return true;}
function m2RevTape(sp,t,id){if(!sp)return;if(REDUCED_MOTION){sp.textContent=t;return;}let k=0;
  const pas=function(){if(!M2REV.on||M2REV.id!==id)return;k++;sp.textContent=t.slice(0,k);if(k%3===1)try{if(SONV2)sfx('ui.lettre',{vol:-8});}catch(e){}if(k<t.length)setTimeout(pas,28);};pas();}
function m2RevFerme(){const el=document.getElementById('m2Rev'),id=M2REV.id,m=m2Def(id);if(!M2REV.on||!el)return;
  if(!el.classList.contains('bt')){el.classList.add('plein','nom','tx','bt');const sp=el.querySelector('.m2RvTx span');if(sp&&m)sp.textContent=sansAcc(m2Txt(m));return;} // pas fini : au bout
  m2Prend(id);try{carSnapshot();}catch(e){}
  try{pixBurst(el.querySelector('.m2RvBt'),12);}catch(e){}try{if(SONV2){sfx('ui.achat');if(!REDUCED_MOTION)sfx('ui.tampon',{t:.2});}else uiClic('ok');}catch(e){}hap([12,40,30]);
  el.classList.add('fin');M2REV.on=false;M2REV.id=null;
  setTimeout(function(){el.className='';el.innerHTML='';
    try{if(garageOn&&gEl.classList.contains('missions'))m2Render(true);}catch(e){}try{m2Portes();}catch(e){}
    try{const ob=document.querySelector('.mObj.misPorte');if(ob&&started&&gameOver)objRenderV2(ob);}catch(e){}
    m2RevAuto(500);},REDUCED_MOTION?0:420);}
document.addEventListener('click',function(e){const el=document.getElementById('m2Rev');if(!el||!M2REV.on||!el.contains(e.target))return;e.stopPropagation();e.preventDefault();m2RevFerme();},true);
document.addEventListener('keydown',function(e){if(!M2REV.on)return;if(e.code==='Enter'||e.code==='Space'||e.code==='Escape'){e.preventDefault();e.stopPropagation();m2RevFerme();}},true);
// rampCd empêche de re-déclencher un bec de glace en reposant dessus ; fallStartSide mémorise la FACE de décollage (la bascule du bord).
let rampCd=0,fallStartSide=1;
let bounceN=0,airFlash=0; // BUMPS : rebonds sur la tranche de la dalle pendant CE vol
let runStats={tricks:0,bumps:0,zones:0,vmax:0,chainMax:0,gaps:0,surv:0}; // bilan de la run (écran de fin) + les exploits versés aux compteurs À VIE qui débloquent les caisses
let hopY=0,hopV=0,POSE_F=null; // petit saut de dos d'âne — (2026-10-01) POSE_F : le contact d'une pose déclarée en l'air (voir « LA POSE SANS SAUT »)
let nitroR=2,nitroX=0,nitroOn=false,nitroBlue=false,nitroHeldT=0;
/* ---------- LA NITRO v3 — « LE COUP » (2026-09-27, vague 3) ----------
   Sacha : « Les effets de nitro sont un peu faiblards, travaille-les correctement comme dans Asphalt. »
   MESURÉ avant d'écrire : à l'allumage AU SOL il ne se passait RIEN d'un coup — le champ glissait en 0,2 s de lissage, la plume passait
   de 1,1 à 2,3 m (vue à 45° par la caméra de poursuite : un cornet de 60 px), le seul son était le sifflet du turbo. Asphalt tient en
   TROIS TEMPS, rejoués ici sans une lumière, un programme ni une passe de plus (tout vit dans des objets créés à l'init, des uniforms
   de l'ACES et des réserves de particules qui partagent le programme `pt2E`) :
   · L'ALLUMAGE (`nitroAllume`, le front montant) : une ONDE qui part des tuyères (`NFX.ring`, même programme que la plume), la caméra
     TIRÉE en arrière puis le champ qui s'ouvre d'un coup, les bords de l'image qui prennent la couleur de la nitro (`uNit`/`uNitF`
     dans l'ACES), une gerbe de filés, le nez qui se lève, et un WHOOMP (souffle brun qui s'ouvre + coup de poitrine + ruée d'air).
     Rejoué en plus petit au passage en RÉSERVE BLEUE : c'est un deuxième étage, il doit se sentir.
   · LA TENUE : plume longue aux diamants de choc, stries de vent 3D qui filent près de l'objectif (`ventN`), frisson continu, bords
     teintés — et AUCUNE flaque ronde au sol (verdict du 25/09).
   · L'EXTINCTION (`nitroEteint`) : dernière bouffée aux pots + pétarade, et le champ qui RETOMBE en douceur au lieu de claquer.
   Couleurs de la bible « L'encre et l'or » : feu #ff7a24, réserve #5b7dff, pad turbo or #ffd75e.
   ⚠ la POUSSÉE et la CONSOMMATION ne bougent pas d'un iota : ici on ne travaille que le RESSENTI. */
/* (2026-10-14, passe graphismes · neon-residuel) LA COULEUR DE LA POUSSÉE sur l'image (bords, onde) : blanc-or chaud ; la réserve bleue reste un bleu froid
   DÉSATURÉ (#aebfd8, teinte 215°) ; la nitro infinie (violet #9d4dff avant) y devient un blanc-or plus clair : son violet reste dans la plume et le HUD. */
const NFX_C={n:0xffcf8a,b:0xaebfd8,i:0xffe3bd,p:0xffd98a};
const NFX={ign:0,ignK:1,air:false,off:0,t0:-9,sT:-9,len:0,edge:0,col:new THREE.Color(0xff7a24),cT:new THREE.Color(),blanc:new THREE.Color(0xffffff),ringT:9,ringK:1,
  vAcc:0,s:0x2f6b1a3,v:new THREE.Vector3(),d:new THREE.Vector3(),cR:new THREE.Vector3(),cU:new THREE.Vector3(),ring:null};
{ // L'ONDE D'ALLUMAGE : un anneau de choc peint (liseré franc + lueur intérieure), posé à la tuyère DANS le plan perpendiculaire à la
  // caisse — il s'ouvre et recule en 0,4 s. ⚠ MÊMES paramètres de programme que la plume (`jetShellM` : carte, sans brouillard, double
  // face) : three r128 réutilise son programme, il n'en compile AUCUN de plus (vérifié au grand tour).
  const s=128,cv=document.createElement('canvas');cv.width=cv.height=s;const c=cv.getContext('2d');
  const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.05)');g.addColorStop(.78,'rgba(255,255,255,.32)');
  g.addColorStop(.9,'rgba(255,255,255,1)');g.addColorStop(.95,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g;c.fillRect(0,0,s,s);
  NFX.ring=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),color:0xff7a24,transparent:true,
    opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,side:THREE.DoubleSide,fog:false})); // (2026-09-28) sans test de profondeur : la route coupait l'onde en FER À CHEVAL
  NFX.ring.visible=false;NFX.ring.frustumCulled=false;NFX.ring.renderOrder=3;scene.add(NFX.ring);
}
/* ===== AUJOURD'HUI — LA SÉRIE DE SEPT JOURS ET LE DÉFI DU JOUR (2026-10-20, Léo coche, séance « ce qu'on n'a jamais vraiment travaillé » :
   « une série de jours qui vaut le coup » · « le défi du jour, taillé pour toi ») =====
   Bâti SUR le retour du jour de Sacha (son/mute-cadeau.js, 14/10 : le ×2 de la 1re partie du jour, la série comptée par jourEtat/jourCommit) :
   rien de son horloge ne change, seule la PRIME de la série est remplacée.
   1. LA SÉRIE DE SEPT JOURS (`SERIE7`) — la prime de série valait 25 à 100 $ (une caisse coûte 1 500 $ à 2,5 M) : on ne la voyait pas, elle ne
      faisait revenir personne. Désormais un CALENDRIER de sept cases, en tête de l'écran MISSIONS : 150 $ · 250 $ · 1 JETON · 400 $ · 600 $ ·
      1 JETON · et au 7e jour UNE PEINTURE EXCLUSIVE (quatre, une par semaine : elles ne s'achètent pas, ni en boutique ni à la boutique du
      jour ; toutes à toi → 2 jetons). Le jour se gagne comme avant : la 1re partie COMPTÉE du jour (jourCommit, ≥ 15 s de course). Après le 7e,
      le calendrier repart au 1er jour (la série, elle, continue de se compter) ; un jour sauté le remet au 1er jour. Un jeton = un tirage de la
      machine FINAL SPIN (≈ 1 700 $ d'espérance, la seconde chance, le départ boosté, le jackpot) : c'est lui qui donne envie.
      Mesuré au modèle de Sacha (outils/jour-modele.cjs) : un joueur moyen gagne 350 à 700 $ par jour ; la semaine pleine verse 1 400 $ + 2 jetons
      + la peinture, contre 375 $ avant. `?serie=ancien` rend la prime de Sacha (0 · 25 · … · 100, JOUR.prime, que le modèle lit toujours).
   2. LE DÉFI DU JOUR (`DJ`, SAVE.d.dj) — UN défi par jour, tiré au 1er regard du jour, gardé jusqu'à minuit (heure de l'appareil) :
      · LA FAMILLE suit TON style : figures dans un saut, temps de vol posé, vitesse, survie, aura, poses parfaites d'affilée, frénésie (si tu l'as
        déjà atteinte) — chacune pèse 1 + ton record ÷ sa référence (plafonné à 3) : qui saute beaucoup reçoit plus de défis de figures. Jamais
        la même famille deux jours de suite. Le tirage vient de la date (même défi toute la journée, sur le même appareil).
      · LE SEUIL est calé sur TON meilleur (les records des missions, m2Etat().r) : égaler ton record pour les petits comptes (figures, poses),
        ~90 % pour le reste ; un plancher de débutant (2 figures, 3 s de vol, 45 s, 250 km/h, 1 500 d'aura, 2 poses, 8 s de frénésie).
      · Il se joue EN UNE PARTIE (les mesures de la course : m2ValCourse) ; réussi → +1 JETON tout de suite et la ligne du bas en course
        (« DÉFI DU JOUR RÉUSSI · +1 JETON ») — la machine FINAL SPIN s'ouvre à l'écran de fin. Rien en balade, bac à sable, parc ni auto-école.
   L'AFFICHAGE : la carte de la série (serieHtml, colonne de gauche de l'écran MISSIONS) — le titre (la série en cours), les sept cases (cochées, celle d'aujourd'hui
   qui bat, DEMAIN annoncé quand la case du jour est prise) et une phrase. L'écran de fin dit ce que la série a donné (jourFinTexte).
   (2026-10-22, Sacha : « enlève le défi du jour, je t'avais dit de l'enlever ») LE DÉFI DU JOUR EST ÉTEINT : `DJ.on` faux sauf `?defijour=1` — plus de tirage, de ligne
   ni de jeton ; le moteur (djTire, djTick…) reste là, intact, pour le rallumer. Seule la série de sept jours garde son affichage.
   Console : dbgSerie() · dbgSerie('jour',n) (pose la série à n jours, prise hier) · dbgDefiJour() · ('force','fig') · ('reussi') · ('demain'). */
const SERIE7={on:!/[?&]serie=ancien\b/.test(location.search),
  lots:[{cash:150},{cash:250},{jeton:1},{cash:400},{cash:600},{jeton:1},{exclu:1}],
  exclu:[],plein:{jeton:2}}; /* (2026-10-22, Sacha : « tableau des peintures ») les quatre peintures de la série passent à l'achat (1 €) : le 7e jour ne donne plus que le plein de jetons */
/* LES QUATRE PEINTURES DE LA SÉRIE — `serie:1` : ni prix, ni mission ; shopOwned / m2HabAMoi ne les donnent qu'une fois gagnées ; hors des lots « toutes » des missions (m2HabReco) */
COSM.peinture.push(
  {id:'srBraise',n:'BRAISE FIDÈLE',eur:'1 €',r:'epique',g:'o',grad:[0xb3141c,0xff5a1c,0xffc23a],d:'Sept jours d\'affilée sur l\'asphalte, la laque en garde la chaleur.'},
  {id:'srAurore',n:'AURORE BORÉALE',eur:'1 €',r:'epique',g:'c',grad:[0x3cffc0,0x6fb8ff,0xc77dff],d:'Le ciel du Grand Nord, pour ceux qui reviennent chaque jour.'},
  {id:'srLagon',n:'LAGON INTERDIT',eur:'1 €',r:'epique',g:'g',grad:[0x01404f,0x00b3c7,0x9ff7ff],d:'Une eau que personne n\'a le droit de voir. Toi si.'},
  {id:'srEtoile',n:'NUIT ÉTOILÉE',eur:'1 €',r:'epique',g:'c',grad:[0x2a1f8f,0x8f5bff,0xff7ad9],d:'La nuit entière sur ta carrosserie, une semaine de plus.'});
function serieCase(n){return ((Math.max(1,n|0)-1)%7)+1;} /* le jour de série n → sa case du calendrier (1 … 7) */
function serieLot(c){const L=SERIE7.lots[c-1]||SERIE7.lots[0];if(!L.exclu)return L;const id=serieExclu();return id?{exclu:id}:SERIE7.plein;}
function serieExclu(){const o=(SAVE.d.shop&&SAVE.d.shop.own)||[];for(const id of SERIE7.exclu)if(o.indexOf('peinture:'+id)<0)return id;return '';} /* la prochaine peinture pas encore à toi */
function serieDonne(n){ /* appelée par jourCommit (la 1re partie comptée du jour) : verse le lot de la case du jour n, rend {c, cash, jeton, exclu} */
  const c=serieCase(n),L=serieLot(c),o={c:c,cash:0,jeton:0,exclu:''};
  if(L.cash){SAVE.d.bank=Math.min(1e30,bank()+L.cash);gagneAjoute(L.cash);bankMaxMaj();o.cash=L.cash;}
  if(L.jeton){SAVE.d.spinJ=Math.min(9,(SAVE.d.spinJ|0)+L.jeton);o.jeton=L.jeton;}
  if(L.exclu){const k='peinture:'+L.exclu;if(SAVE.d.shop.own.indexOf(k)<0)SAVE.d.shop.own.push(k);o.exclu=L.exclu;
    setTimeout(function(){try{toast(pxi('pinceau')+' '+serieLotTxt(L)+' — '+TR('EST À TOI'),true);}catch(e){}},1400);} /* le 7e jour : la peinture se dit, après l'entrée de l'écran de fin */
  SAVE.mark();return o;}
function serieLotTxt(L){ /* « +$ 150 » · « +1 JETON » · « BRAISE FIDÈLE » */
  if(L.cash)return '+'+fmtC(L.cash);if(L.jeton)return '+'+L.jeton+' '+TR(L.jeton>1?'JETONS':'JETON');
  const d=COSM.peinture.find(function(x){return x.id===(L.exclu||'');});return d?TR(d.n):'';}
function serieVue(){ /* l'état du calendrier pour l'affichage : {c : la case du jour (1-7) · pris : la case du jour est déjà gagnée · faits : cases cochées · n : la série vivante} */
  const a=jourAuj();if(!a||!JOUR.on)return null;const e=jourEtat(a);
  if(e.dispo)return {c:serieCase(e.suiv),pris:false,faits:serieCase(e.suiv)-1,n:e.n,casse:e.n>0&&e.suiv===1};
  return {c:serieCase(e.n),pris:true,faits:serieCase(e.n),n:e.n,casse:false};}

/* ---- LE DÉFI DU JOUR ---- */
const DJ={on:/[?&]defijour=1\b/.test(location.search),t:0, /* (2026-10-22, Sacha : « enlève le défi du jour, je t'avais dit de l'enlever ») éteint : ni tirage, ni ligne, ni jeton ; ?defijour=1 le rallume */
  fam:[{k:'fig',  u:'',    ref:4,    min:2,   K:1,   t:'FAIS {v} FIGURES DANS UN SEUL SAUT',en:'LAND {v} TRICKS IN A SINGLE JUMP'},
       {k:'airP', u:'s',   ref:5,    min:3,   K:.9,  t:'TIENS {v} S EN L\'AIR ET POSE-TOI PROPREMENT',en:'STAY {v} S IN THE AIR AND LAND CLEAN'},
       {k:'vie',  u:'mn',  ref:120,  min:45,  K:.9,  t:'SURVIS {v} EN UNE PARTIE',en:'SURVIVE {v} IN ONE RUN'},
       {k:'kmh',  u:'kmh', ref:500,  min:250, K:.95, t:'ATTEINS {v} KM/H',en:'HIT {v} KM/H'},
       {k:'aura', u:'aura',ref:15000,min:1500,K:.85, t:'FAIS {v} D\'AURA EN UNE PARTIE',en:'SCORE {v} AURA IN ONE RUN'},
       {k:'parf', u:'',    ref:3,    min:2,   K:1,   t:'ENCHAÎNE {v} POSES PARFAITES',en:'CHAIN {v} PERFECT LANDINGS'},
       {k:'frenT',u:'s',   ref:20,   min:8,   K:.8,  t:'TIENS LA FRÉNÉSIE {v} S',en:'HOLD FRENZY FOR {v} S'}]};
function djHache(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function djArrondi(f,x){if(f.u==='kmh'||f.u==='mn')return Math.round(x/10)*10;if(f.u==='aura'){const p=Math.pow(10,Math.max(0,Math.floor(Math.log10(Math.max(1,x)))-1));return Math.round(x/p)*p;}
  return Math.round(x);}
function djRecord(f){try{return +m2Val({k:f.k})||0;}catch(e){return 0;}} /* le record à vie (les missions le tiennent) */
function djTire(jour,hier){ /* le défi d'un jour : la famille (ton style, tirée sur la date), le seuil (ton meilleur) */
  const s=m2Etat(),R=[];let tot=0;
  for(const f of DJ.fam){if(f.k===hier)continue;if(f.k==='frenT'&&!(s.r&&s.r.frenN))continue;const w=1+Math.min(2,djRecord(f)/f.ref);R.push([f,w]);tot+=w;}
  let x=(djHache('dj:'+jour)%100000)/100000*tot,f=R[0][0];for(const q of R){x-=q[1];if(x<=0){f=q[0];break;}}
  const b=djRecord(f),v=Math.max(f.min,djArrondi(f,b*f.K));return {d:jour,k:f.k,v:v,b:0,ok:0,y:hier||''};}
function djFam(k){for(const f of DJ.fam)if(f.k===k)return f;return DJ.fam[0];}
function djEtat(){ /* le défi d'AUJOURD'HUI (tiré s'il le faut) ; null si l'horloge est illisible ou le défi éteint */
  if(!DJ.on)return null;const a=jourAuj();if(!a)return null;const S=SAVE.d.dj;
  if(S.d!==a){const n=djTire(a,S.d?S.k:'');SAVE.d.dj=n;SAVE.mark();return n;}return S;}
function djTxt(D){const f=djFam(D.k),v=D.v,x=f.u==='mn'?m2Mn(v):f.u==='aura'?fmtAura(v):m2Nb(v);return String(LANG==='fr'?f.t:f.en).replace('{v}',x);}
function djM(D){const f=djFam(D.k);return {id:'dj',k:f.k,u:f.u,v:D.v,t:f.t,en:f.en};} /* le défi habillé en mission (m2Txt, m2Prog le lisent) */
function djTick(dt){ /* m2Tick (chaque image de course, missions allumées) : le meilleur essai du jour, la réussite */
  if(!DJ.on||(DJ.t-=dt)>0)return;DJ.t=.25;
  const D=djEtat();if(!D||D.ok)return;let v=0;try{v=m2ValCourse(djM(D))||0;}catch(e){return;}
  if(v>D.b){D.b=Math.min(D.v,D.k==='airP'||D.k==='vie'||D.k==='frenT'?Math.floor(v*10)/10:Math.floor(v));SAVE.mark();}
  if(v>=D.v){D.ok=1;D.b=D.v;SAVE.d.spinJ=Math.min(9,(SAVE.d.spinJ|0)+1);SAVE.flush();
    try{if(m2EnC()){M2L.q.unshift({k:'dj',tx:sansAcc(TR('RÉUSSI')),p:'+1 '+TR('JETON')});if(!M2L.on)m2LigneSuit();} /* la ligne du bas, EN TÊTE de la file : jamais fondue dans « n MISSIONS RÉUSSIES » */
      else toast(pxi('coche')+' '+TR('DÉFI DU JOUR RÉUSSI')+' · +1 '+TR('JETON'),true);}catch(e){}
    try{hap([12,40,18]);}catch(e){}}}
function djReste(){const t=new Date(),m=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1);return Math.max(0,m-t);} /* ms jusqu'à minuit (l'appareil) */
function djResteTxt(){const mn=Math.max(1,Math.ceil(djReste()/6e4)),h=Math.floor(mn/60);return h?h+' H':mn+' MIN';}

/* ---- LA SÉRIE DE SEPT JOURS, en carte à côté de la liste des missions ---- */
/* (2026-10-22, Sacha : « enlève le défi du jour… plus simple ») plus de bloc AUJOURD'HUI ni de ligne de défi : une carte — le titre (la série en
   cours), les sept cases, une phrase (ce qui attend demain, ou comment gagner la case du jour). */
function serieHtml(){
  const S=SERIE7.on?serieVue():null;if(!S)return '';
  try{spinSprites();}catch(e){}
  let cs='';
  for(let c=1;c<=7;c++){const L=serieLot(c),fait=c<=S.faits,auj=c===S.c,dem=S.pris&&c===serieCase(S.c+1)&&c!==S.c;
    let ico;if(L.cash)ico='<b class="m2Cash">'+m2Nb(L.cash)+'</b>'; /* le chiffre seul : le vert dit déjà l'argent du jeu (« $ 150 » ne tenait pas dans la case) */else if(L.jeton)ico=(typeof spinIco==='function'?spinIco(5):'')+(L.jeton>1?'<b>×'+L.jeton+'</b>':'');
    else{const d=COSM.peinture.find(function(x){return x.id===L.exclu;}),hx=function(c){return '#'+((c>>>0)&0xffffff).toString(16).padStart(6,'0');};
      ico=d?'<b class="srSw" style="background:'+(d.grad?'linear-gradient(160deg,'+d.grad.map(hx).join(',')+')':hx(d.c||0))+'"></b>':pxi('etoile');}
    cs+='<i class="srC'+(fait?' fait':'')+(auj&&!S.pris?' auj':'')+(dem?' dem':'')+(L.exclu?' ex':'')+'" style="--i:'+c+'"><em>'+(LANG==='en'?'D':'J')+c+'</em>'+ico+(fait?'<s>'+pxi('coche')+'</s>':'')+'</i>';}
  const tit=S.n&&!S.casse?TR('SÉRIE')+' '+S.n+' '+TR(S.n>1?'JOURS':'JOUR'):TR('SÉRIE'),
    bas=S.pris?TR('DEMAIN')+' : '+serieLotTxt(serieLot(serieCase(S.c+1))):S.casse?TR('SÉRIE PERDUE · ON REPART AU 1ER JOUR'):TR('JOUE UNE PARTIE POUR LA CASE DU JOUR');
  return '<div class="m2Serie" data-aj="serie" role="button" tabindex="0"><b>'+pxi('flamme')+' '+sansAcc(tit)+'</b><div class="srL">'+cs+'</div><small>'+sansAcc(bas)+'</small></div>';}
function aujClic(t){const a=t.closest&&t.closest('[data-aj]');if(!a)return false;
  try{uiClic('nav');}catch(e){}try{hap(8);}catch(e){}
  const S=serieVue();if(S)try{const L=serieLot(S.pris?serieCase(S.c+1):S.c);toast(pxi('flamme')+' '+(S.pris?TR('DEMAIN')+' : ':TR('AUJOURD\'HUI')+' : ')+serieLotTxt(L));}catch(e){}
  return true;}
Object.assign(I18N,{'DÉFI DU JOUR':'DAILY CHALLENGE','DÉFI DU JOUR RÉUSSI':'DAILY CHALLENGE DONE','JETON':'TOKEN','JETONS':'TOKENS','RÉUSSI':'DONE','MEILLEUR ESSAI':'BEST TRY',
  'NOUVEAU DÉFI DANS':'NEW CHALLENGE IN','NOUVEAU DANS':'NEW IN','AUJOURD\'HUI':'TODAY','DEMAIN':'TOMORROW','REVIENS DEMAIN':'COME BACK TOMORROW','JOUR':'DAY',
  'SÉRIE PERDUE · ON REPART AU 1ER JOUR':'STREAK LOST · BACK TO DAY 1','JOUE UNE PARTIE POUR LA CASE DU JOUR':'PLAY A RUN FOR TODAY\'S BOX','UNE PARTIE POUR LE RÉUSSIR':'ONE RUN TO DO IT',
  'FAIS {v} FIGURES DANS UN SEUL SAUT':'LAND {v} TRICKS IN A SINGLE JUMP','BRAISE FIDÈLE':'FAITHFUL EMBER','AURORE BORÉALE':'NORTHERN LIGHTS','LAGON INTERDIT':'FORBIDDEN LAGOON','NUIT ÉTOILÉE':'STARRY NIGHT',
  'Sept jours d\'affilée sur l\'asphalte, la laque en garde la chaleur.':'Seven days in a row on the asphalt, and the paint keeps the heat.',
  'Le ciel du Grand Nord, pour ceux qui reviennent chaque jour.':'The sky of the far north, for those who come back every day.',
  'Une eau que personne n\'a le droit de voir. Toi si.':'Water nobody is allowed to see. Except you.',
  'La nuit entière sur ta carrosserie, une semaine de plus.':'The whole night on your body panels, one more week.'});
window.dbgSerie=function(a,n){ /* (banc) l'état du calendrier · ('jour',n) : la série à n jours, prise HIER (la case suivante est à jouer) · ('pris',n) : prise aujourd'hui */
  if(a==='jour'||a==='pris'){const t=new Date();if(a==='jour')t.setDate(t.getDate()-1);const y=t.getFullYear(),m=t.getMonth()+1,d=t.getDate();
    SAVE.d.jour={d:y+'-'+(m<10?'0':'')+m+'-'+(d<10?'0':'')+d,n:Math.max(0,n|0)};SAVE.flush();}
  const S=serieVue();return {actif:SERIE7.on,vue:S,lotDuJour:S?serieLot(S.c):null,demain:S?serieLot(serieCase(S.c+1)):null,exclusive:serieExclu(),jetons:SAVE.d.spinJ|0};};
window.dbgDefiJour=function(a,k){ /* (banc) le défi d'aujourd'hui · ('force','fig') : cette famille · ('reussi') · ('demain') : retirer le défi (le prochain regard en tire un neuf) */
  if(a==='force'){const f=djFam(k),b=djRecord(f);SAVE.d.dj={d:jourAuj(),k:f.k,v:Math.max(f.min,djArrondi(f,b*f.K)),b:0,ok:0,y:''};SAVE.flush();}
  else if(a==='reussi'){const D=djEtat();if(D&&!D.ok){D.ok=1;D.b=D.v;SAVE.d.spinJ=Math.min(9,(SAVE.d.spinJ|0)+1);SAVE.flush();}}
  else if(a==='demain'){SAVE.d.dj.d='';SAVE.flush();}
  const D=djEtat();if(!D)return 'éteint';const m=djM(D);
  return {jour:D.d,famille:D.k,texte:djTxt(D),seuil:D.v,meilleurDuJour:D.b,reussi:!!D.ok,record:djRecord(djFam(D.k)),hier:D.y,poids:DJ.fam.map(function(f){return f.k+' '+(1+Math.min(2,djRecord(f)/f.ref)).toFixed(2);}),jetons:SAVE.d.spinJ|0};};
/* LES STRIES DE VENT : des points POSÉS dans le monde (vitesse nulle), devant l'objectif et décalés de l'axe du regard — la caisse les
   traverse à pleine vitesse, le shader `pt2E` les étire dans leur vitesse RELATIVE : des filets d'air qui passent à 2-8 m de la caméra,
   avec la parallaxe que les filés 2D n'ont pas. Même programme que les étincelles (aucun de plus), fondu près de l'objectif. */
const ventN=makePool(64,1,0xfff0dc,1,true,{a:[.12,.4,1,1],etire:1,str:.05,v:.35,pr:[1.4,4.5,16,520]});
ventN.mesh.material.blending=THREE.AdditiveBlending;ventN.mesh.material.map=sparkTex;
// son PROPRE tirage (mulberry32) : ces effets purement visuels ne consomment pas le Math.random du jeu — les parcours de test
// (grand tour, pilote auto) restent identiques à ce qu'ils étaient sans eux
function nfxR(){let t=(NFX.s=(NFX.s+0x6D2B79F5)|0);t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}
/* (2026-10-09) L'ÉMISSION À LA SECONDE — les flammes d'échappement, le jet du réacteur en vol, les traits d'air et la fumée de drift
   naissaient PAR IMAGE : à 30 i/s (l'iPhone bridé) on en voyait la MOITIÉ — nitro « faiblarde », vitesse moins sentie, alors que le jeu
   se juge à 60 sur PC. `emiN` rend le nombre d'« images à 60 Hz » écoulées : 1 à 60 i/s, 2 à 30, 1,5 en moyenne à 40. JAMAIS moins d'1 :
   au-dessus de 60 (écrans 120/144 Hz) on garde l'émission d'avant au pixel près — ce qu'on voyait sur un PC rapide ne change pas. */
const EMI={};
/* (2026-10-23, audit mobile) L'ÉMISSION TAILLÉE SUR LE PALIER : à 30 i/s un ANCIEN émettait autant par seconde qu'un 60 i/s (jamais moins d'1 par image) —
   fumée, flammes, jet et traits d'air additifs, ce que le remplissage d'une vieille puce paie le plus cher. `emiK` = la part d'émission gardée
   [ANCIEN .6, MOYEN .8, RÉCENT 1] ; au palier RÉCENT (K = 1) le code est celui d'avant, au bit près. Sous 1, le report fractionnaire fait la moyenne. */
PAL.B.emiK=[.6,.8,1];
function emiN(k,dt){const K=PAL.b('emiK',1);if(K>=1){const a=(EMI[k]||0)+Math.min(dt,.067)*60,n=Math.max(1,Math.round(a));EMI[k]=Math.max(-.5,a-n);return n;}
  const a=(EMI[k]||0)+Math.min(dt,.067)*60*K,n=Math.max(0,Math.round(a));EMI[k]=Math.max(-.5,a-n);return n;} // le reste reporté (−0,5 au plus) : 60 par seconde pile à 30, 40 ou 50 i/s ; au-dessus de 60, une émission par image comme avant
function nfxVent(dt,dir,kmh){ // `dir` : le sens de la course (cap au sol, vitesse en vol) — sème autour de la caméra, devant elle
  const v9=Math.max(20,kmh/3.6);NFX.vAcc+=dt*(nitroBlue?52:40)*(1+NFX.ign*NFX.ignK*1.5);
  NFX.cR.setFromMatrixColumn(camera.matrixWorld,0);NFX.cU.setFromMatrixColumn(camera.matrixWorld,1);
  while(NFX.vAcc>=1){NFX.vAcc-=1;
    const d=Math.max(9,v9*.1)+nfxR()*Math.max(18,v9*.22),cx=(nfxR()<.5?-1:1)*(2.6+nfxR()*6.5),cy=-3.2+nfxR()*6.4; // sur les CÔTÉS de l'image (le centre reste à la caisse)
    spawnP(ventN,camera.position.x+dir.x*d+NFX.cR.x*cx+NFX.cU.x*cy,camera.position.y+dir.y*d+NFX.cR.y*cx+NFX.cU.y*cy,
      camera.position.z+dir.z*d+NFX.cR.z*cx+NFX.cU.z*cy,0,0,0,.3+nfxR()*.2);
  }
}
/* <<<FEU QUI RUGIT>>> (2026-10-16, session « Effets sonores nitro et flamme » — Sacha : « il faut un bruit de flamme et de nitro beaucoup
   plus travaillé pour le nitro ; il faut que ce soit jouissif de cramer du nitro »)
   AVANT : la nitro tenue, c'était un grondement BRUN étouffé (passe-bas 620 Hz — et coupé sous 85/120 Hz depuis le « bruit assourdissant »
   du 12/10) + des « plops » bruns à 600 Hz : sur un haut-parleur de téléphone, un « ffff » sourd, toujours pareil, qui ne monte jamais.
   L'allumage avait son WHOOMP ; la coupure, quelques pops de bruit filtré.
   LE NITRO EN QUATRE TEMPS — ce qui rend le geste jouissif, c'est l'ATTENTE qui monte puis la RÉCOMPENSE de fin :
   · L'ALLUMAGE (`rugAllume`) : le PSSHT du protoxyde (bruit blanc, une bande qui descend 6,5 → 2,6 kHz : LE son du nitro) ; le coup de poitrine (subBoom), la ruée d'air et le sifflet du 2e étage sont ceux d'avant.
    · LA GORGE (`RUG.roar`) : le RUGISSEMENT de la flamme, la couche qui manquait — un bruit rose agité par deux turbulences (5 et 21 Hz :
     la flamme n'est jamais stable), percé de pointes de jet (le « crackle » d'une tuyère : des pointes positives, loi de Pareto — beaucoup
     de petites, quelques grosses), deux bosses de résonance (250 Hz le corps, 1,15 kHz la déchirure), saturé (la tôle). Une boucle de
     3,7 s jouée DEUX fois à deux endroits, l'une à gauche, l'autre à droite : large, et jamais deux fois la même seconde.
   · LA MONTÉE (`RUG.h`/`RUG.k`) : tenir le nitro, ça MONTE — en 2,5 s la flamme s'ouvre (passe-bas 700 → 1 800 Hz à 250 km/h), sa hauteur
     grimpe (≈ +4 demi-tons, plus la vitesse), elle enfle (+10 dB) et le crépitement s'épaissit ; et pendant qu'elle s'installe elle PULSE (whoum-whoum-wum-brrr :
     7 → 19 Hz, une pulsation qui accélère et s'efface) — l'allumage d'une postcombustion. Lâcher une fraction de seconde ne perd pas la
     montée (elle redescend 3 fois plus vite qu'elle ne monte).
   · LA COUPURE : la flamme se REFERME (passe-bas qui retombe à 380 Hz, 0,14 s de queue : un dernier « whouff », plus une coupure) et
     l'échappement PÈTE (`rugPetarade`) — un BANG si on a tenu, puis des « pap-pap-pap… pap » qui s'égrènent, de plus en plus espacés,
     répartis dans la stéréo ; plus on a brûlé longtemps, plus il y en a. La soupape du turbo (blowOff) part en même temps.
   Tout est CALCULÉ une fois (`rugTampons`, en morceaux après initAudio : aucun fichier, rien dans la banque), puis joué en boucle :
   les 25 « plops » par seconde d'avant (4 nœuds WebAudio chacun) sont remplacés par une boucle de crépitement (`RUG.crep`).
   Les gains suivent `dk` (les grands moments creusent le mix) et passent par les PORTES (débranchés hors nitro : coût nul).
   `?nitroson=ancien` = le son d'avant, intact. */
const RUG_SON=!/[?&]nitroson=ancien/.test(location.search);
const NIT_ANC=/[?&]nitro=ancien\b/.test(location.search); // (2026-10-21, Léo : « c'est le nitro ») A/B : le nitro d'AVANT le 20/10 16h35 (gorge .14, grave de la flamme, vent, sifflement, grave du téléphone)
const RUG_NIV={rg:.07,cr:.04,rr:.11,crac:.11,pssht:.015,pap:.15,bang:.2}; // (2026-10-20, Sacha : « on dirait juste du vent, je veux des flammes GRAVES ») gorge plus forte (elle est bien plus basse), crépitement et PSSHT blanc baissés // les niveaux (voir le journal : mesurés contre l'ancien au banc)
if(NIT_ANC)Object.assign(RUG_NIV,{rg:.14,cr:.14,pssht:.05});
/* (2026-10-17, Léo : « dès que j'appuie, ça explose et ça fait un bruit qui n'a aucun rapport avec le boost, qui pourrait détruire les
   oreilles des joueurs — écouteurs », sur iPhone ET sur Mac). MESURÉ au banc muet avec SA sauvegarde : deux sons d'EXPLOSION se mêlaient au boost.
   · LA BOULE DE FEU à chaque appui (un BWOUMF saturé, son coup grave qui plonge 170 → 48 Hz, par-dessus le subBoom) — c'est
     une explosion, pas un boost. RETIRÉE : l'allumage garde le PSSHT, le coup de poitrine et la ruée d'air.
   · LA PANNE SÈCHE SOUS LE DOIGT (`NSEC`) : le nitro tenu vide la jauge en ~4-6 s, puis se coupe et se rallume en boucle (hystérésis à ,3)
     — à chaque coupure la pétarade (BANG + pap-pap) et la soupape, à chaque rallumage un coup d'allumage complet : une explosion toutes les
     ~1,5 s tant qu'on tient. Désormais, tant que le doigt ne s'est pas levé : la toux `nitro.sec` seule à la coupure, la gorge qui reprend
     au rallumage — la pétarade et le coup d'allumage reviennent au prochain VRAI appui / à la vraie relâche. */
const NSEC={sous:false,etage:false}; // sous : la jauge a lâché sous le doigt, et ce doigt n'est pas encore levé · etage : le 2e étage (réserve bleue) a déjà sonné pendant cet appui
/* (même jour) LE 2e ÉTAGE NE SE REJOUE PAS EN BOUCLE : un fruit ramassé nitro tenu remplit un peu la jauge, on ressort de la réserve bleue, on y
   retombe une seconde plus tard — et le coup d'allumage du 2e étage repartait à CHAQUE fruit (MESURÉ : 7 à 12 coups en 30 s de nitro tenu).
   Il sonne désormais une fois par appui ; le reste (onde, champ, couleur) suit comme avant. */
const RUG_CORPS=NIT_ANC?.7:.45; /* (2026-10-20, Sacha : « on dirait un frottement, plus rond, plus ASMR, qui ronronne ») le bruit brun recule : c'est le RONRON qui porte */ /* (2026-10-20) le grondement brun (grave) remonte */ // le grondement brun d'avant (`jrG`, le corps de la flamme) à 70 % quand la gorge chante : sinon la tenue passait 6 dB au-dessus de l'ancienne
const RUG={pret:false,ac:null,d:null,tel:false,h:0,k:0,rs:[],cs:[],paps:null,bangs:null,blanc:null,stt:null};
function rugBq(t,f,q,g,sr){ // les coefficients d'un biquad (RBJ) : 'lp' 'hp' 'bp' 'pk'
  const w=2*Math.PI*Math.min(f,sr*.45)/sr,c=Math.cos(w),s=Math.sin(w),al=s/(2*q),A=Math.pow(10,(g||0)/40);let b0,b1,b2,a0,a1,a2;
  if(t==='lp'){b0=(1-c)/2;b1=1-c;b2=b0;a0=1+al;a1=-2*c;a2=1-al;}
  else if(t==='hp'){b0=(1+c)/2;b1=-(1+c);b2=b0;a0=1+al;a1=-2*c;a2=1-al;}
  else if(t==='bp'){b0=al;b1=0;b2=-al;a0=1+al;a1=-2*c;a2=1-al;}
  else{b0=1+al*A;b1=-2*c;b2=1-al*A;a0=1+al/A;a1=-2*c;a2=1-al/A;}
  return {b0:b0/a0,b1:b1/a0,b2:b2/a0,a1:a1/a0,a2:a2/a0,x1:0,x2:0,y1:0,y2:0};}
function rugRun(o,x){const y=o.b0*x+o.b1*o.x1+o.b2*o.x2-o.a1*o.y1-o.a2*o.y2;o.x2=o.x1;o.x1=x;o.y2=o.y1;o.y1=y;return y;}
function rugRose(){let b0=0,b1=0,b2=0;return function(){const w=Math.random()*2-1;b0=.99765*b0+w*.099046;b1=.963*b1+w*.2965164;b2=.57*b2+w*1.0526913;return (b0+b1+b2+w*.1848)*.2;};} // Kellett
function rugNorme(X,pic){let m=0;for(let i=0;i<X.length;i++){const a=Math.abs(X[i]);if(a>m)m=a;}const g=pic/(m||1);for(let i=0;i<X.length;i++)X[i]*=g;return X;}
function rugRoar(sr,dur){ // LA GORGE : la boucle du rugissement (voir l'en-tête)
  const n=Math.round(sr*dur),F=Math.round(.12*sr),N=n+F,T=new Float32Array(N),E=new Float32Array(N),R=Math.random;
  {let a=0,b=0,c=0,d=0,s1=0,s2=0;const k1=1-Math.exp(-2*Math.PI*5/sr),k2=1-Math.exp(-2*Math.PI*21/sr),e2=new Float32Array(N);
   for(let i=0;i<N;i++){a+=(R()*2-1-a)*k1;b+=(a-b)*k1;c+=(R()*2-1-c)*k2;d+=(c-d)*k2;E[i]=b;e2[i]=d;s1+=b*b;s2+=d*d;}
   s1=Math.sqrt(s1/N)||1;s2=Math.sqrt(s2/N)||1;
   for(let i=0;i<N;i++)E[i]=Math.max(.12,Math.min(1.45,.62+.26*E[i]/s1+.17*e2[i]/s2));} // la TURBULENCE : la flamme n'est jamais stable
  const rose=rugRose(),hp=rugBq('hp',105,.7,0,sr),pA=rugBq('pk',250,.9,6,sr),pB=rugBq('pk',1150,.8,3.5,sr),lp=rugBq('lp',5200,.7,0,sr);
  const dec=Math.exp(-1/(sr*.00045)),pc=70/sr;let cr=0,s=0;
  for(let i=0;i<N;i++){if(R()<pc)cr+=Math.min(1.1,.06*Math.pow(R()+1e-6,-1/1.7));cr*=dec; // les POINTES DE JET (Pareto)
    const y=rugRun(lp,rugRun(pB,rugRun(pA,rugRun(hp,(rose()+cr*.55)*E[i]))));T[i]=y;s+=y*y;}
  s=Math.sqrt(s/N)||1;let s2=0;
  for(let i=0;i<N;i++){T[i]=Math.tanh(T[i]/s*.55);s2+=T[i]*T[i];} // la TÔLE : saturation douce
  const g=.25/(Math.sqrt(s2/N)||1),X=new Float32Array(n);
  for(let i=0;i<n;i++)X[i]=T[i]*g;
  for(let i=0;i<F;i++){const a=i/F;X[i]=(T[i]*Math.sin(a*Math.PI/2)+T[n+i]*Math.cos(a*Math.PI/2))*g;} // la COUTURE : la boucle n'a pas de clic
  return X;}
function rugCrep(sr,dur){ // LE CRÉPITEMENT : la boucle des pops (une queue qui dépasse la fin repart au début : couture parfaite)
  const n=Math.round(sr*dur),X=new Float32Array(n),R=Math.random;
  const pose=function(t0,L,f){for(let j=0;j<L;j++)X[(t0+j)%n]+=f(j);};
  for(let k=0,nt=Math.round(32*dur);k<nt;k++){const L=sr*(.0003+R()*.0009),a=.05+.22*Math.pow(R(),3),h=rugBq('hp',2600,.7,0,sr); // les TICS : le grésillement
    pose((R()*n)|0,Math.round(L*5),function(j){return rugRun(h,(R()*2-1)*a*Math.exp(-j/L));});}
  for(let k=0,np=Math.round(11*dur);k<np;k++){const L=sr*(.0015+R()*.005),a=Math.min(1,.16*Math.pow(R()+1e-6,-.55)),b=rugBq('bp',600+R()*1500,1.4,0,sr); // les POPS
    pose((R()*n)|0,Math.round(L*5),function(j){return rugRun(b,(R()*2-1))*a*Math.exp(-j/L)*(1-Math.exp(-j/(sr*.0002)))*2.2;});}
  for(let k=0,nq=Math.round(1.4*dur);k<nq;k++){const L=sr*.012,a=.5+.5*R(),l=rugBq('lp',1100,.7,0,sr),f0=120+R()*60;let ph=0; // les PAPS : la bouffée sourde
    pose((R()*n)|0,Math.round(L*5),function(j){ph+=2*Math.PI*f0/sr;return (rugRun(l,R()*2-1)*1.6+Math.sin(ph)*.25)*a*Math.exp(-j/L)*(1-Math.exp(-j/(sr*.0004)));});}
  let s=0;for(let i=0;i<n;i++)s+=X[i]*X[i];const g=.1/(Math.sqrt(s/n)||1);for(let i=0;i<n;i++)X[i]=Math.tanh(X[i]*g*2.2)/2.2; // −20 dB RMS, crêtes arrondies
  return X;}
function rugPap(sr,gros){ // un PET d'échappement : le CLAC, le PAP (bande), la bouffée, le coup sourd
  const n=Math.round(sr*(gros?.32:.12)),X=new Float32Array(n),R=Math.random;
  const bp=rugBq('bp',gros?420+R()*200:560+R()*420,1.2,0,sr),lp=rugBq('lp',gros?1500:2400,.7,0,sr),hc=rugBq('hp',2000,.7,0,sr);
  const fq=gros?150:110+R()*40,f1=gros?50:80;let ph=0;
  for(let i=0;i<n;i++){const t=i/sr,a=1-Math.exp(-t/.0003);
    let x=rugRun(hc,R()*2-1)*Math.exp(-t/.0009)*.9;
    x+=rugRun(bp,R()*2-1)*Math.exp(-t/(gros?.03:.011))*a*2.4;
    x+=rugRun(lp,R()*2-1)*Math.exp(-t/(gros?.06:.02))*a*(gros?1.2:.5);
    const f=f1+(fq-f1)*Math.exp(-t/(gros?.07:.03));ph+=2*Math.PI*f/sr;x+=Math.sin(ph)*Math.exp(-t/(gros?.09:.03))*(gros?1:.55)*a;
    X[i]=Math.tanh(x*(gros?2:1.7));}
  const F=Math.round(.01*sr);for(let i=0;i<F;i++)X[n-1-i]*=i/F;
  return rugNorme(X,.95);}
function rugTampons(ac,d,o){ // calcule les tampons et branche le graphe, EN MORCEAUX (un par tâche : jamais un long gel au premier toucher)
  if(RUG.ac)return;RUG.ac=ac;RUG.d=d;RUG.tel=!!o.tel;RUG.stt=o.stt||function(p,v,t,tc){p.setTargetAtTime(v,t,tc);};
  const sr=24000,mk=function(X){const b=ac.createBuffer(1,X.length,sr);b.getChannelData(0).set(X);return b;};
  const pan=function(v){if(!ac.createStereoPanner)return ac.createGain();const p=ac.createStereoPanner();p.pan.value=v;return p;};
  const kr=function(p){try{p.automationRate='k-rate';}catch(e){}}; // piloté à chaque image : k-rate (voir initAudio)
  const etapes=[
    function(){ // la GORGE + la PULSATION
      const b=mk(rugRoar(sr,3.7));
      RUG.rgF=ac.createBiquadFilter();RUG.rgF.type='lowpass';RUG.rgF.frequency.value=650;RUG.rgF.Q.value=.55;kr(RUG.rgF.frequency);
      RUG.rgF2=ac.createBiquadFilter();RUG.rgF2.type='lowpass';RUG.rgF2.frequency.value=850;RUG.rgF2.Q.value=.6;kr(RUG.rgF2.frequency); // deux passe-bas : la pente raide (−24 dB/oct.) — le mordant vient du crépitement, jamais d'un souffle aigu continu (la fatigue vit à 2-4 kHz)
      const h=ac.createBiquadFilter();h.type='highpass';h.frequency.value=NIT_ANC?(RUG.tel?190:95):(RUG.tel?150:40);h.Q.value=.7; // un téléphone ne rend rien sous 150 Hz : ce grave ne ferait que pomper le compresseur
      RUG.rgG=ac.createGain();RUG.rgG.gain.value=0;
      for(let c=0;c<2;c++){const s=ac.createBufferSource();s.buffer=b;s.loop=true;const p=pan(c?.55:-.55);s.connect(p);p.connect(RUG.rgF);s.start(0,c?b.duration*.47:0);RUG.rs.push(s);}
      RUG.rgF.connect(RUG.rgF2);RUG.rgF2.connect(h);h.connect(RUG.rgG);RUG.rgG.connect(d);
      RUG.thO=ac.createOscillator();RUG.thO.type='sine';RUG.thO.frequency.value=7;kr(RUG.thO.frequency);
      RUG.thG=ac.createGain();RUG.thG.gain.value=0;RUG.thO.connect(RUG.thG);RUG.thG.connect(RUG.rgG.gain);RUG.thO.start();
      if(o.porte)o.porte(RUG.rgG,d,RUG.thG);},
    function(){ // le CRÉPITEMENT
      const b=mk(rugCrep(sr,3.3));
      RUG.crF=ac.createBiquadFilter();RUG.crF.type='highpass';RUG.crF.frequency.value=NIT_ANC?(RUG.tel?600:300):(RUG.tel?300:120);RUG.crF.Q.value=.7;
      RUG.crG=ac.createGain();RUG.crG.gain.value=0;
      for(let c=0;c<2;c++){const s=ac.createBufferSource();s.buffer=b;s.loop=true;const p=pan(c?.35:-.35);s.connect(p);p.connect(RUG.crF);s.start(0,c?b.duration*.53:0);RUG.cs.push(s);}
      RUG.crF.connect(RUG.crG);RUG.crG.connect(d);
      if(o.porte)o.porte(RUG.crG,d);
      RUG.pret=true;},
    function(){ // l'allumage
      const w=new Float32Array(Math.round(sr*.3));for(let i=0;i<w.length;i++)w[i]=Math.random()*2-1;RUG.blanc=mk(w);
      },
    function(){ // (2026-10-20) LE RONRON + LES CRÉPITEMENTS DE BOIS (voir rrPas)
      rrConstruit(ac,d,sr,mk,pan,kr,o);},
    function(){ // la pétarade
      RUG.paps=[mk(rugPap(sr,0)),mk(rugPap(sr,0)),mk(rugPap(sr,0)),mk(rugPap(sr,0)),mk(rugPap(sr,0))];RUG.bangs=[mk(rugPap(sr,1)),mk(rugPap(sr,1))];}];
  let i=0;const suite=function(){try{etapes[i++]();}catch(e){console.warn('feu qui rugit',e);return;}if(i<etapes.length)setTimeout(suite,o.vite?0:30);};
  if(o.vite)for(;i<etapes.length;)etapes[i++]();else setTimeout(suite,60);}
function rugPas(dt,o){ // à chaque image : o = {on, air, bleu, v (km/h), dk}
  if(!RUG.pret)return;const t=RUG.ac.currentTime,S=RUG.stt,on=!!o.on,b=o.bleu?1:0,air=o.air?1:0,v=Math.max(0,o.v||0);
  RUG.h=on?Math.min(4,RUG.h+dt):Math.max(0,RUG.h-dt*3);const k=RUG.k=1-Math.exp(-RUG.h/.9); // LA MONTÉE : 63 % en 0,9 s, 93 % en 2,4 s — elle continue APRÈS la queue de l'allumage
  const gR=on?RUG_NIV.rg*(.3+.7*k)*(air?.85:1)*(1+.15*b)*o.dk:0;
  S(RUG.rgG.gain,gR,t,on?.06:.14); // coupée : 0,14 s de queue
  const fc=NIT_ANC?(on?Math.min(3000,700+900*k+v*.9+b*450):380):(on?Math.min(650,240+180*k+v*.12+b*80):150); /* (2026-10-20) GRAVE : la flamme ne s'ouvre plus jusqu'à 3 kHz (c'était le « vent ») */S(RUG.rgF.frequency,fc,t,on?.09:.12);S(RUG.rgF2.frequency,fc*1.3,t,on?.09:.12); // elle S'OUVRE en montant (700 → 1 800 Hz à 250 km/h) ; coupée, elle se referme — le dernier « whouff »
  const r=NIT_ANC?(on?.86+.2*k+Math.min(.12,v/3000)+b*.07:.8):(on?.62+.12*k+Math.min(.1,v/4000)+b*.05:.55); /* (2026-10-20) la boucle jouée plus lentement : tout le rugissement descend */S(RUG.rs[0].playbackRate,r,t,.12);S(RUG.rs[1].playbackRate,r*1.013,t,.12); // la hauteur MONTE (≈ +4 demi-tons) et suit la vitesse
  S(RUG.thO.frequency,7+12*k,t,.05);S(RUG.thG.gain,on?gR*.45*(1-k):0,t,.06); // la PULSATION accélère et s'efface
  S(RUG.crG.gain,on?RUG_NIV.cr*(.3+.7*k)*(air?.75:1)*o.dk:0,t,on?.06:.1);
  rrPas(dt,o,on,b,air,v);
  const rc=NIT_ANC?(on?.88+.3*k+b*.12:.9):(on?.6+.2*k+b*.08:.6); /* (2026-10-20) crépitement plus grave */S(RUG.cs[0].playbackRate,rc,t,.1);S(RUG.cs[1].playbackRate,rc*.97,t,.1);} // plus chaude, elle crépite plus vite et plus clair
/* ===== LE RONRON DU NITRO (2026-10-20, Sacha : « on dirait plus un frottement, essaie plus rond, plus ASMR, qui ronronne, avec des
   variations : si on appuie longtemps ça change ; il faut qu'il y ait des crépitements et tout ») =====
   Le cœur du son n'est plus du BRUIT (le frottement) mais un TON grave et rond : deux triangles (fondamentale + octave) et une quinte sinus,
   saturés doucement, sous un passe-bas — et HACHÉS par une pulsation (le RONRON : 13 → 26 Hz, le grain d'un chat ou d'un V8 au ralenti).
   Par-dessus, des CRÉPITEMENTS de feu de bois (tics secs + pops boisés, chacun à sa place dans la stéréo) posés un par un.
   TROIS TEMPS si on tient (RR.tH, le temps tenu, remis à zéro 0,35 s après le lâcher) :
   · 0-1 s    : le ronron s'installe, lent et doux (44 Hz, pulsation 13 Hz), quelques crépitements ;
   · 1-2,5 s  : il MONTE — la hauteur grimpe (≈ +5 demi-tons), la pulsation accélère, le filtre s'ouvre, le feu prend (crépitements ×2) ;
   · après 2,5 s : PLEIN RÉGIME — de grandes houles lentes (0,3 Hz) qui gonflent et dégonflent, un vibrato, des RAFALES de crépitements.
   La réserve bleue joue une quinte plus haut. Le téléphone (pas de grave sous 150 Hz) joue tout une octave plus haut. */
/* (2026-10-20 soir, Léo : « un audio parfois sur mon tel et mon ordi, qu'il n'y a pas sur le tel ni l'ordi de Sacha, sur le main — lié au boost,
   un son qui n'a rien à voir ») LE RONRON NE VIT PLUS DANS LE SUB. MESURÉ au banc muet avec SA sauvegarde (vu-mètre dbgVu, tenue de 5 s) :
   la chaîne du ronron sortait à −23/−26 dB RMS — ~10 dB AU-DESSUS de la gorge du nitro (−35) et 12-15 dB au-dessus du grondement
   (−40/−44), aussi fort que tout le moteur — et tout ce niveau tenait entre 22 Hz (la sous-octave `sine ×.5`) et 86 Hz. Un haut-parleur
   d'ordi ou d'iPhone ne rend rien là-dessous : Sacha, sur ses enceintes, n'entendait rien de plus ; Léo, au casque, recevait un bourdon
   grave qui vrombit (haché à 13 → 28 Hz, vibrato, houles) sans rapport avec la flamme. Désormais : (1) un passe-haut à 70 Hz sur la chaîne
   (la sous-octave et le 44 Hz s'effacent, les harmoniques 88-176 Hz qui font le « ronron » restent, le téléphone — déjà une octave plus
   haut — ne change pas) ; (2) le niveau `rr` ,11 → ,045 : le ronron se range au rang de la gorge (mesuré après : −33/−36 dB), il porte
   encore, il ne couvre plus. Les trois temps, les houles, le vibrato, les crépitements : intacts. `?ronron=ancien` = v740 tel quel ;
   `?ronron=0` = muet (A/B). dbgRonron() rend aussi `hp`. */
/* (2026-10-20, plus tard — Léo, en détail : « quand je booste, ça apparaît, ça évolue, puis ça devient une sorte de TROMPETTE horrible qui
   fait bugger la musique ») = les trois temps du ronron (il s'installe, il monte, puis plein régime : filtre ouvert + vibrato sur des
   triangles saturés — un timbre de cuivre). Baissé, il restait une trompette. LE RONRON EST COUPÉ PAR DÉFAUT : `?ronron=1` = le ronron
   régulé (passe-haut + niveau), `?ronron=ancien` = la v740 de Sacha telle quelle. Le reste du FEU QUI RUGIT (gorge, crépitement, pssht,
   pétarade) joue comme avant. À trancher entre Léo et Sacha. */
const RR_MODE=(/[?&]ronron=(ancien|0|1)\b/.exec(location.search)||[])[1]||'';
const RR_ON=RR_MODE==='1'||RR_MODE==='ancien';
if(RR_MODE!=='ancien')RUG_NIV.rr=.045;
const RR={pret:false,tH:0,off:0,crT:0,raf:0,ph:0};
function rrCrac(sr,pop){const R=Math.random,n=Math.round(sr*(pop?.06:.016)),X=new Float32Array(n);
  if(!pop){const bp=rugBq('bp',1300+R()*2200,.9,0,sr),tau=sr*(.0006+R()*.0016);for(let i=0;i<n;i++)X[i]=rugRun(bp,R()*2-1)*Math.exp(-i/tau);}
  else{const lp=rugBq('lp',500+R()*400,.8,0,sr),f0=120+R()*70;let ph=0;for(let i=0;i<n;i++){const t=i/sr,a=1-Math.exp(-t/.0005);ph+=2*Math.PI*(f0*(.6+.4*Math.exp(-t/.02)))/sr;
    X[i]=(rugRun(lp,R()*2-1)*1.4*Math.exp(-t/.008)+Math.sin(ph)*.8*Math.exp(-t/.018))*a;}}
  const F=Math.round(.002*sr);for(let i=0;i<F;i++)X[n-1-i]*=i/F;return rugNorme(X,.9);}
function rrConstruit(ac,d,sr,mk,pan,kr,o){
  RR.o=[];const mix=ac.createGain();mix.gain.value=1;
  for(const [ty,m,g] of [['triangle',1,1],['triangle',2,.42],['sine',1.5,.22],['sine',.5,.5]]){const os=ac.createOscillator();os.type=ty;os.frequency.value=44*m;kr(os.frequency);
    const og=ac.createGain();og.gain.value=g;os.connect(og);og.connect(mix);os.start();RR.o.push([os,m]);}
  const sh=ac.createWaveShaper(),cv=new Float32Array(512);for(let i=0;i<512;i++){const x=i/511*2-1;cv[i]=Math.tanh(1.8*x)/Math.tanh(1.8);}sh.curve=cv;sh.oversample='2x';
  RR.lp=ac.createBiquadFilter();RR.lp.type='lowpass';RR.lp.frequency.value=320;RR.lp.Q.value=.9;kr(RR.lp.frequency);
  RR.am=ac.createGain();RR.am.gain.value=.6; /* le ronron : la pulsation hache le ton */
  RR.pO=ac.createOscillator();RR.pO.type='sine';RR.pO.frequency.value=13;kr(RR.pO.frequency);RR.pG=ac.createGain();RR.pG.gain.value=.4;RR.pO.connect(RR.pG);RR.pG.connect(RR.am.gain);RR.pO.start();
  RR.hl=ac.createGain();RR.hl.gain.value=1; /* les houles du plein régime */
  RR.hO=ac.createOscillator();RR.hO.type='sine';RR.hO.frequency.value=.3;RR.hG=ac.createGain();RR.hG.gain.value=0;RR.hO.connect(RR.hG);RR.hG.connect(RR.hl.gain);RR.hO.start();
  RR.vO=ac.createOscillator();RR.vO.frequency.value=4.7;RR.vG=ac.createGain();RR.vG.gain.value=0;RR.vO.connect(RR.vG);for(const [os] of RR.o)RR.vG.connect(os.detune);RR.vO.start();
  RR.g=ac.createGain();RR.g.gain.value=0;
  RR.hp=null;if(RR_MODE!=='ancien'){RR.hp=ac.createBiquadFilter();RR.hp.type='highpass';RR.hp.frequency.value=70;RR.hp.Q.value=.7;} /* (2026-10-20 soir) le sub part : voir RR_MODE */
  mix.connect(sh);sh.connect(RR.lp);RR.lp.connect(RR.am);RR.am.connect(RR.hl);if(RR.hp){RR.hl.connect(RR.hp);RR.hp.connect(RR.g);}else RR.hl.connect(RR.g);RR.g.connect(d);
  if(o.porte)o.porte(RR.g,d);
  RR.tics=[];RR.pops=[];for(let i=0;i<8;i++)RR.tics.push(mk(rrCrac(sr,0)));for(let i=0;i<5;i++)RR.pops.push(mk(rrCrac(sr,1)));
  RR.pan=pan;RR.pret=true;}
function rrCraque(t,pop,vol){const ac=RUG.ac,s=ac.createBufferSource(),L=pop?RR.pops:RR.tics;s.buffer=L[(Math.random()*L.length)|0];s.playbackRate.value=.85+.3*Math.random();
  const g=ac.createGain();g.gain.value=vol;const p=RR.pan((Math.random()-.5)*1.4);s.connect(g);g.connect(p);p.connect(RUG.d);s.start(t);}
function rrPas(dt,o,on,b,air,v){
  if(!RR.pret||!RR_ON)return;const t=RUG.ac.currentTime,S=RUG.stt;
  if(on){RR.tH+=dt;RR.off=0;}else{RR.off+=dt;if(RR.off>.35)RR.tH=0;}
  const T=RR.tH,m1=Math.min(1,T/1),m2=Math.max(0,Math.min(1,(T-1)/1.5)),m3=Math.max(0,Math.min(1,(T-2.5)/1.5)); /* les trois temps */
  const oct=RUG.tel?2:1,f=(44*Math.pow(2,(5*m2+1.5*m3)/12)+Math.min(10,v*.012))*(b?1.5:1)*oct;
  for(const [os,mm] of RR.o)S(os.frequency,f*mm,t,.18);
  S(RR.lp.frequency,(260+220*m2+160*m3+(b?120:0))*oct,t,.2);
  S(RR.pO.frequency,13+8*m2+5*m3+3*Math.sin(t*.9)*m3,t,.15);S(RR.pG.gain,.42-.08*m3,t,.2);
  S(RR.hG.gain,.32*m3,t,.3);S(RR.vG.gain,9*m3,t,.3);
  S(RR.g.gain,on?RUG_NIV.rr*(.45+.35*m1+.2*m2)*(air?.85:1)*o.dk:0,t,on?(T<.3?.12:.08):.16); /* lâché : le ronron s'éteint en ~0,4 s */
  if(on){ /* LES CRÉPITEMENTS : de plus en plus serrés, puis des rafales */
    const tx=(3+7*m1+8*m2+6*m3)*(air?.7:1);RR.crT+=dt*tx;
    while(RR.crT>=1){RR.crT-=1+(Math.random()-.5)*.6;const pop=Math.random()<.22;rrCraque(t+Math.random()*.04,pop,RUG_NIV.crac*(pop?.9:.5+.5*Math.random())*o.dk);}
    if(m3>0&&Math.random()<dt*.6*m3){for(let i=0,n=3+(Math.random()*4|0);i<n;i++)rrCraque(t+.02+i*(.025+Math.random()*.03),Math.random()<.3,RUG_NIV.crac*.7*o.dk);}
  }}
window.dbgRonron=function(){return {pret:RR.pret,on:RR_ON,mode:RR_MODE||'coupe',hp:RR.hp?RR.hp.frequency.value:0,tenu:+RR.tH.toFixed(2),gain:RR.g?+RR.g.gain.value.toFixed(4):null,hz:RR.o?+RR.o[0][0].frequency.value.toFixed(1):null,pulse:RR.pO?+RR.pO.frequency.value.toFixed(1):null};};
function rugAllume(k,bleu,air){ // LE PSSHT (le reste du coup d'allumage est dans nitroWhoomp)
  if(!RUG.blanc)return false;const ac=RUG.ac,t0=ac.currentTime;
  {const s=ac.createBufferSource();s.buffer=RUG.blanc;const f=ac.createBiquadFilter();f.type='bandpass';f.Q.value=1.3;
   f.frequency.setValueAtTime(bleu?7600:6500,t0);f.frequency.exponentialRampToValueAtTime(2600,t0+.18);
   const g=ac.createGain();g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(Math.max(.0002,RUG_NIV.pssht*k),t0+.004);g.gain.exponentialRampToValueAtTime(.001,t0+.22);
   s.connect(f);f.connect(g);g.connect(RUG.d);s.start(t0);s.stop(t0+.25);}
  return true;}
function rugPetarade(q){ // LA PÉTARADE de la coupure : q 0..1, ce qu'on a brûlé
  if(!RUG.paps)return false;const ac=RUG.ac,t0=ac.currentTime+.02,R=Math.random;let t=0;
  const joue=function(b,dt,v,p){const s=ac.createBufferSource();s.buffer=b;s.playbackRate.value=.9+.2*R();const g=ac.createGain();g.gain.value=v;s.connect(g);
    let x=g;if(ac.createStereoPanner){x=ac.createStereoPanner();x.pan.value=p;g.connect(x);}x.connect(RUG.d);s.start(t0+dt);};
  if(q>.3){joue(RUG.bangs[(R()*RUG.bangs.length)|0],0,RUG_NIV.bang*(.7+.3*q),(R()-.5)*.3);t=.075+R()*.03;}
  for(let i=0,n=2+Math.round(q*5+R()*1.5);i<n;i++){joue(RUG.paps[(R()*RUG.paps.length)|0],t,RUG_NIV.pap*Math.pow(.84,i)*(.7+.3*R()),(R()-.5)*.8);t+=.04+.025*R()+i*i*.006;}
  return true;}
window.dbgRug=function(){const r=function(p,n){return p?+p.value.toFixed(n):null;};return {son:RUG_SON,pret:RUG.pret,tampons:!!(RUG.blanc&&RUG.paps),h:+RUG.h.toFixed(2),k:+RUG.k.toFixed(2),gorge:r(RUG.rgG&&RUG.rgG.gain,4),crepite:r(RUG.crG&&RUG.crG.gain,4),pulse:r(RUG.thO&&RUG.thO.frequency,1),fc:r(RUG.rgF&&RUG.rgF.frequency,0)};}; // l'état du rugissement (banc, console)
/* <<<FIN FEU QUI RUGIT>>> */
function nitroWhoomp(k,bleu,air){ // LE « WHOOMP » d'allumage — 8 à 10 nœuds, tous arrêtés en moins d'une seconde (rien ne s'empile)
  if(!sfxOk())return;
  const n9=performance.now();if(n9-NFX.sT<150)return;NFX.sT=n9; // une rafale de taps ne fait pas une rafale de souffles
  try{
    const t0=AC.currentTime;
    // 1) LE SOUFFLE QUI S'OUVRE : bruit BRUN (rond, jamais un chuintement), passe-bas qui s'ouvre d'un coup puis se referme
    // (2026-10-16) LE FEU QUI RUGIT le remplace : le PSSHT du protoxyde puis la BOULE DE FEU (rugAllume) — celui-ci reste pour ?nitroson=ancien
    if(!(RUG_SON&&rugAllume(k,bleu,air))){
    const s=AC.createBufferSource();s.buffer=brownBuf(1);
    const f=AC.createBiquadFilter();f.type='lowpass';f.Q.value=1.4;
    f.frequency.setValueAtTime(TEL_NATIF?420:170,t0);f.frequency.exponentialRampToValueAtTime(bleu?3600:2600,t0+.09);
    f.frequency.exponentialRampToValueAtTime(TEL_NATIF?700:420,t0+.75);
    const g=AC.createGain();g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.42*k,t0+.025);g.gain.exponentialRampToValueAtTime(.001,t0+.85);
    s.connect(f);f.connect(g);g.connect(MASTER);s.start(t0);s.stop(t0+.9);}
    // 2) LE COUP DE POITRINE (le « MP ») — subBoom : dédoublonné et calé pour le haut-parleur du téléphone
    subBoom((air?.2:.26)*k);
    // 3) LA RUÉE D'AIR : bande de bruit blanc qui MONTE — la vitesse qui arrive (c'est elle qu'un haut-parleur de téléphone rend)
    const s2=AC.createBufferSource();s2.buffer=noiseBuf(.6);
    const b=AC.createBiquadFilter();b.type='bandpass';b.Q.value=.9;b.frequency.setValueAtTime(900,t0);b.frequency.exponentialRampToValueAtTime(bleu?6200:4800,t0+.45);
    const g2=AC.createGain();g2.gain.setValueAtTime(.0001,t0);g2.gain.exponentialRampToValueAtTime(.075*k,t0+.12);g2.gain.exponentialRampToValueAtTime(.001,t0+.55);
    s2.connect(b);b.connect(g2);g2.connect(MASTER);s2.start(t0);s2.stop(t0+.6);
    if(bleu){ // le 2e étage SONNE : un sifflet bref qui monte — la turbine passe la surmultipliée
      const o=AC.createOscillator(),go=AC.createGain();o.type='triangle';
      o.frequency.setValueAtTime(700,t0);o.frequency.exponentialRampToValueAtTime(1900,t0+.22);
      go.gain.setValueAtTime(.0001,t0);go.gain.exponentialRampToValueAtTime(.04*k,t0+.03);go.gain.exponentialRampToValueAtTime(.001,t0+.3);
      o.connect(go);go.connect(MASTER);o.start(t0);o.stop(t0+.32);}
    duckT=Math.max(duckT,.35*k); // la poussée passe DEVANT le mix une fraction de seconde
  }catch(e){}
}
function nitroAllume(bleu,etage){ // LE COUP — au front montant de `nitroOn` (sol ET vol) ; `etage` : le passage en réserve bleue, en plus petit
  const n9=performance.now(),rep=n9-NFX.t0<650;NFX.t0=n9; // réservoir vide qu'on tient appuyé (hystérésis) : des rallumages rapprochés, un coup plus petit
  const k=(etage?.6:1)*(rep?.45:1);
  NFX.ign=1;NFX.ignK=k;NFX.off=0;NFX.ringT=0;NFX.ringK=k;NFX.air=mode==='fall';NFX_FIL.arme=true; // (la gerbe de filés : voir nfxFiles)
  NFX.col.setHex(bleu?NFX_C.b:NFX_C.n); // la teinte de l'onde et des bords est juste dès la première image
  try{nfeuCoup(k);}catch(e){} // (2026-10-15) le feu de pixels : une boule de feu par pot
  fovPunch=Math.max(fovPunch,(NFX.air?8:7)*k);     // le champ S'OUVRE d'un coup (lu au sol comme en vol) — un COUP au-dessus de l'ouverture de la nitro (+15°), pas un second zoom : à 14 la caisse fondait de moitié
  hap(bleu?[8,16,8]:[14,26,10]);
  if(!NSEC.sous&&!(etage&&NSEC.etage))nitroWhoomp(k,bleu,NFX.air); // (2026-10-17) rallumé sous le même doigt (panne sèche), ou 2e étage déjà sonné pendant cet appui : la gorge reprend, pas de second coup d'allumage (voir NSEC)
  if(etage)NSEC.etage=true;
  if(!POST_ON)flashEcran(bleu?'rgba(91,125,255,.45)':'rgba(255,122,36,.45)'); // sans l'ACES (post coupé), le coup de couleur passe par le calque DOM
}
function nitroEteint(sous){ // LA DERNIÈRE BOUFFÉE : une langue de feu aux pots + la pétarade — puis le champ retombe en douceur (`NFX.off`) — `sous` : la jauge a lâché SOUS le doigt (panne sèche) : la langue de feu oui, la pétarade non (voir NSEC)
  NFX.off=1;
  if(nitroHeldT<.25||mode==='boom')return; // un simple tap ne mérite pas la cérémonie
  const VC=PT_U.uVc.value;
  for(let i=0;i<8;i++){potMonde(CAR_POTS[i%CAR_POTS.length]||CAR_POT_C,NFX.v);
    spawnP(flames,NFX.v.x,NFX.v.y,NFX.v.z,VC.x-hsF.x*(9+nfxR()*9)+(nfxR()-.5)*2.4,VC.y-hsF.y*9+nfxR()*1.4,VC.z-hsF.z*(9+nfxR()*9)+(nfxR()-.5)*2.4,.1+nfxR()*.08);
    if(i<4)spawnP(embers,NFX.v.x,NFX.v.y,NFX.v.z,VC.x-hsF.x*(4+nfxR()*5)+(nfxR()-.5)*3,VC.y+1+nfxR()*2.5,VC.z-hsF.z*(4+nfxR()*5)+(nfxR()-.5)*3,.2+nfxR()*.15);}
  if(!sous)try{if(!(RUG_SON&&sfxOk()&&rugPetarade(Math.min(1,(nitroHeldT-.25)/1.75))))crackle(.7);}catch(e){} // (2026-10-16) LE FEU QUI RUGIT : la PÉTARADE (un bang, puis des pap-pap-pap qui s'égrènent, à la mesure de ce qu'on a brûlé)
  try{nfeuFin();}catch(e){} // (2026-10-15) le feu de pixels : la dernière bouffée, lente et sale
}
/* (2026-10-14, sensations · nitro) LA POUSSÉE SE SENT DANS LES RESSORTS. L'allumage avait tout (cabrage, onde, champ, vibration, whoomp) ;
   la COUPURE, elle, n'avait que du son et une langue de feu : la caisse accroupie (pitch9 −1,7°) se relevait en fondu, sans poids.
   `sensNitro` ne fait que REGARDER (nitroOn, nitroHeldT, engGear, VPAL.n) et répond par les outils communs : elle ne calcule rien du jeu.
   Appelée une fois par image, juste avant la remise à zéro de `nitroHeldT`. `on` : l'état de l'image d'avant. */
const SENS_NI={on:false,ts:0,h:0,g:1,tg:0,c:99};
function sensNitro(dt,veut){
  const n9=performance.now();
  if(!nitroOn&&SENS_NI.on&&mode!=='boom'&&!gameOver){
    /* LA PANNE SÈCHE HOQUETTE : le doigt tient encore, la jauge lâche — le son tousse (`nitro.sec`) mais rien ne le disait à la main ni à la
       tôle. DEUX RATÉS : le nez pique sec, 130 ms plus tard il repique plus petit ; la main reçoit les deux mêmes coups ([12,118,12], moyen),
       l'écran un frémissement (moitié en vol, où la panne coûte le plané). Au plus une fois par 1,2 s : doigt tenu, le réservoir se rallume
       à ,3 et retombe à sec en boucle — le hoquet ne doit pas devenir un bourdon. Elle REMPLACE alors le transfert de charge ci-dessous. */
    if(veut&&n9-(SENS_NI.ts||0)>1200){SENS_NI.ts=n9;SENS_NI.h=.13;
      if(!REDUCED_MOTION)sensCoup(0,1.1,-.3);
      sensHap([12,118,12],2);sensSecoue(.1);}
    else
    if(nitroHeldT>.35){ /* LE TRANSFERT DE CHARGE : la poussée lâche, le poids repasse sur l'avant — le nez PLONGE d'un coup (≈ 1,6° après un coup
        bref → 3,6° après 1,5 s tenue), la caisse se tasse (1 → 2 cm), puis se repose seule ; un tic léger dans le pouce qui vient de lâcher */
      const k=Math.min(1,(nitroHeldT-.35)/1.15);
      if(!REDUCED_MOTION)sensCoup(0,.6+.8*k,-(.25+.25*k));
      sensHap(9,1);}
  }
  if(SENS_NI.h>0){SENS_NI.h-=dt; // le 2e raté de la panne sèche (compté en secondes : même écart à 30, 60 et 120 i/s) — annulé si la flamme est revenue ou si la caisse a sauté
    if(SENS_NI.h<=0&&!nitroOn&&mode!=='boom'&&!gameOver){if(!REDUCED_MOTION)sensCoup(0,.7,-.2);sensSecoue(.07);}}
  /* LE RAPPORT PASSE DANS LA CAISSE : chaque passage claquait déjà à l'oreille, au pouce (hap 5) et au champ (+1,8°) — la carrosserie, elle,
     ne bronchait pas. Le couple se coupe un instant : le nez SALUE (≈ 1,2°), puis la poussée le reprend. Vu à l'image suivante (la boîte
     tourne plus bas dans la boucle). Un seul cran monté (un recalage de palier en saute plusieurs, ou retombe en 1re : muet), au plus un
     tous les 350 ms comme la cérémonie sonore, et pas pendant le cabrage de l'allumage (il le contredirait). Aucune vibration : elle existe. */
  if(engGear===SENS_NI.g+1&&mode==='drive'&&n9-SENS_NI.tg>350&&NFX.ign<.3){SENS_NI.tg=n9;if(!REDUCED_MOTION)sensCoup(0,.45,0);}
  SENS_NI.g=engGear;
  /* LE MUR D'AIR APPUIE : chaque centaine criée (« 400 KM/H ! ») avait son texte, son champ, sa vibration, son son — la caisse traversait
     le mur sans le sentir. Elle s'ÉCRASE d'un coup sur ses roues (≈ 2 cm à 300 → 3,5 cm passé 700 : l'appui grandit, puis plafonne), le nez
     un rien levé, et se repose. Lu sur `VPAL.n` (la centaine déjà criée par vpalTick) ; sa remise à zéro de début de partie est muette. */
  if(VPAL.n>SENS_NI.c&&!REDUCED_MOTION)sensCoup(0,-.3,-(.5+.1*Math.min(4,VPAL.n-3)));
  SENS_NI.c=VPAL.n;
  SENS_NI.on=nitroOn;
}
/* LE BOOST JOUE UN ARPÈGE (2026-10-03, Léo : « que le boost joue directement un instrument qu'on peut SPAMMER, APPUYER LONGTEMPS,
   ACCORDÉ à la musique » · puis « mille fois plus discret » · puis « pas cool comme instrument : bien filtré, vise plutôt un ARPÈGE et
   une HARMONIE »). Un piano électrique doux (sinus + modulation FM qui s'éteint, filtré sous 1,8 kHz, comme les Rhodes du CIEL) égrène
   les notes d'un ACCORD de la tonalité du morceau (`sonTonSuit._t` = la gamme majeure relative, comme tous les sons du jeu) :
   · APPUI = l'arpège part sur l'accord suivant de la grille I · vi · IV · V (accords de neuvième : l'harmonie de VAPEUR) — SPAMMER = la
     grille défile, toujours juste ; un appui bref joue au moins 3 notes ;
   · TENIR = l'arpège monte et redescend en doubles croches et passe à l'accord suivant toutes les 2 boucles ;
   · LÂCHER = plus de nouvelles notes, celles qui sonnent s'éteignent seules. La grille repart du I après 2,5 s sans appui.
   Discret (≈ −30 dB sous une voix pleine), un écho en croche pointée. Par MASTER (curseur EFFETS) : marche aussi sur iPhone.
   `dbgInstru()` : état · `dbgInstru(0|1)` coupe / rallume · `dbgInstru('essai')` (banc muet : les fréquences jouées). */
/* (2026-10-12, Léo : « enlève le boost instrument, il fait un bruit horrible qui casse tout ») : la phrase est COUPÉE (`on:false`) — elle
   lisait la musique du CIEL (instruMusiqueOk regardait la SOURCE du lecteur, pas s'il jouait) et partait donc aussi sous une autre musique
   (simulateur, GLISSE V2…), à contretemps et hors tonalité. Tout le code reste : `dbgInstru(1)` la rallume pour l'écouter. */
const INSTRU={fins:[],der:0,on:false,tient:false,k:0,n:0,tNote:0,tDer:0,bus:null,iv:0,vu:[],pas:.15,off:null,queue:0,mel:14,vel:1,acc:0};
/* LA PHRASE DU BOOST v3 (2026-10-03, Léo : « toujours un blanc entre les arpèges ; complexifie la structure pour qu'on puisse appuyer
   longtemps et que ça donne une MÉLODIE accordée à la musique du jeu ; si le joueur lâche, ça ne doit pas tout casser »).
   LE BLANC : le réservoir de nitro qui se vide pendant l'appui éteignait la nitro puis la rallumait (hystérésis) → l'arpège s'arrêtait
   et repartait de zéro. La phrase suit désormais LE DOIGT (`wantN`, front montant/descendant dans la boucle), pas la flamme.
   UNE PHRASE QUI CONTINUE : un compteur de doubles croches `k` qui ne repart de zéro qu'après 2,5 s de silence. Lâcher n'arrête pas
   net : la phrase va au bout du temps en cours + un temps, en s'éteignant (`queue`) ; réappuyer REPREND là où elle était, sur la grille.
   TROIS COUCHES, sur le tempo et la grille du morceau (`instruTempo`/`instruGrille`), dans sa tonalité (`sonTonSuit._t`) :
   · l'ARPÈGE (doubles croches, doux) : un des 5 dessins par demi-mesure, l'accord avance à chaque MESURE (I · vi · IV · V) ;
   · la MÉLODIE (au-dessus, plus présente) : un rythme par mesure (6 cellules), sur les temps forts une note de l'ACCORD, entre les deux
     des pas dans la pentatonique, vers un contour de 4 mesures (monte · monte · sommet · redescend) ; registre sol3-do5 ;
   · la BASSE douce sur les temps, à partir de la 3e mesure tenue.
   Chaque nouvel appui (spam) frappe un ACCENT : la note de mélodie suivante part tout de suite, plus fort. */
const INSTRU_MOTIFS=[[0,1,2,3,4,3,2,1],[0,2,1,3,2,4,3,1],[4,3,2,1,0,1,2,3],[0,1,2,4,3,2,4,1],[0,2,4,2,1,3,4,3]];
const INSTRU_RYTHMES=[[1,0,1,0,1,0,1,1],[1,0,0,1,0,0,1,0],[1,1,0,1,1,0,1,0],[1,0,1,1,0,1,0,0],[1,0,0,0,1,0,1,1],[1,1,1,0,1,0,0,0]]; // croches de la mesure : 1 = une note
/* LA PHRASE LIT LE MORCEAU (2026-10-03, Léo : « encore plus harmonieux et accordé à CHAQUE musique de la liste (important), parce que ça
   va au début mais c'est pire à la fin »). Deux causes : la phrase inventait SA grille d'accords (I · vi · ii · V) sans savoir où en était
   celle du morceau (ASCENSEUR finit sur un La7♭9 : do#, si♭ — tout frottait), et le tempo n'était calé qu'à l'appui (l'écart grandissait
   au fil d'un long appui). Désormais `CC_HARMONIE` (atelier-son/harmonie.py : tempo, position des temps et, TEMPS PAR TEMPS, les notes qui
   sonnent dans le morceau — vérifié sur les grilles connues de VAPEUR, ASCENSEUR, CIEL) : la phrase ne joue QUE les notes que le morceau
   joue à cet instant, et se recale sur sa position de lecture à CHAQUE note (zéro dérive, même après 2 minutes d'appui).
   Morceau inconnu (frénésie, un nouveau fichier) : la pentatonique de `SON_TON`, comme avant — et une ligne de plus dans harmonie.py. */
function instruH(){ // la fiche du morceau qui joue (ou null)
  const H=window.CC_HARMONIE;if(!H||!musicEl||!musicEl.src)return null;
  const nom=decodeURIComponent(musicEl.src.split('/').pop().split('?')[0]).replace(/\.[a-z0-9]+$/i,'');return H[nom]||null;
}
function instruTempo(){ // la double croche du morceau qui joue, et son horloge vue de l'audio
  const H=instruH();INSTRU.H=H;let bpm=H?H.bpm:0;
  if(!bpm&&typeof BCLK!=='undefined'&&BCLK.conf>.5&&BCLK.per>.3&&BCLK.per<1)bpm=60/BCLK.per;
  if(!bpm)bpm=100;let pas=60/bpm/4;while(pas<.1)pas*=2;while(pas>.2)pas/=2;           // une note entre ~.1 et ~.2 s
  INSTRU.pas=pas;instruHorloge();
}
function instruHorloge(){ // recalée à CHAQUE passage du planificateur : la phrase ne dérive jamais du morceau
  INSTRU.off=(musicEl&&!musicEl.paused&&musicEl.currentTime>0&&(musicEl.playbackRate||1)===1)?AC.currentTime-musicEl.currentTime+(INSTRU.H?INSTRU.H.ph:0):null;
}
function instruGrille(t){ // la prochaine note de la grille du morceau à partir de t
  if(INSTRU.off==null)return t;const p=INSTRU.pas,x=(t-INSTRU.off)/p;return INSTRU.off+Math.ceil(x-.02)*p;
}
function instruTons(t){ // les notes (classes 0 = do) qui sonnent dans le morceau à l'instant t — et la tonique de repli
  const H=INSTRU.H;
  if(H&&INSTRU.off!=null){const tb=60/H.bpm;let b=Math.floor((t-INSTRU.off)/tb);b=Math.max(0,Math.min(H.m.length-1,b));const m=H.m[b],o=[];
    for(let i=0;i<12;i++)if(m>>i&1)o.push(i);if(o.length>=2)return o;
    if(H.gamme&&H.gamme.length)return H.gamme.filter(function(x,i){return i%2===0;});} // temps creux : la gamme, une note sur deux
  const r=(4+(sonTonSuit._t|0)+120)%12;return [0,2,4,7,9].map(function(x){return(r+x)%12;}); // repli : la pentatonique du morceau
}
function instruHz(m){return 440*Math.pow(2,(m-69)/12);}
function instruDans(tons,lo,hi){const o=[];for(let m=lo;m<=hi;m++)if(tons.indexOf(m%12)>=0)o.push(m);return o;}
/* LE RENDU PREMIUM (2026-10-03, Léo : « on n'entend pas assez, et c'est pas parfait parfait : perfectionne, rendu premium ») :
   · la TOUCHE : deux porteuses à ±4 cents (le chorus d'un vrai Rhodes, ouvertes en stéréo), un modulateur dont l'indice suit la
     FORCE de frappe (doux = rond, fort = qui « tinte »), un corps d'octave qui s'éteint vite, un peu d'humain (±4 ms, ±8 % de force) ;
   · le BUS : une compression douce qui soude les trois couches → le filtre sous 2 kHz (« parfaitement filtré ») → une SALLE (réverbe
     à convolution calculée, 1,8 s, sombre) + un ÉCHO en croche pointée CALÉ SUR LE TEMPO du morceau, filtré et en ping-pong ;
   · le niveau : +5 dB (il passe devant les effets, toujours sous la musique). */
function instruBus(){
  if(INSTRU.bus||!AC||!MASTER)return INSTRU.bus;
  const g=AC.createGain();g.gain.value=1;
  const so9=AC.createGain();so9.gain.value=1;so9.connect(MASTER);INSTRU.sortie=so9; /* (2026-10-07) LA PORTE de l'instrument : tout ce qu'il joue sort par là (voir instruCoupe) */
  const cp=AC.createDynamicsCompressor();cp.threshold.value=-20;cp.ratio.value=3;cp.attack.value=.008;cp.release.value=.18;cp.knee.value=12;
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1600;lp.Q.value=.5;
  const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=160;
  const sec=AC.createGain();sec.gain.value=1.05;                                         // (Léo : « plus fondu et effacé ») −3,5 dB sec, la salle porte le reste
  g.connect(cp);cp.connect(hp);hp.connect(lp);lp.connect(sec);sec.connect(so9);
  try{ // LA SALLE : du bruit qui s'éteint, assombri avec le temps (calculé une fois, 1,8 s)
    const n=Math.floor(AC.sampleRate*1.8),ir=AC.createBuffer(2,n,AC.sampleRate);
    for(let c=0;c<2;c++){const d=ir.getChannelData(c);let lo=0;for(let i=0;i<n;i++){const x=i/n,a=Math.pow(1-x,3.2),k=.25+.7*x;lo+=(Math.random()*2-1-lo)*(1-k);d[i]=lo*a*(i<AC.sampleRate*.012?i/(AC.sampleRate*.012):1);}}
    const cv=AC.createConvolver();cv.buffer=ir;const rv=AC.createGain();rv.gain.value=.55;const pd=AC.createDelay(.2);pd.delayTime.value=.035;INSTRU.salle=pd;const rh=AC.createBiquadFilter();rh.type='highpass';rh.frequency.value=320;lp.connect(rh);rh.connect(pd); /* la salle ne prend plus le grave (la « résonance ») */pd.connect(cv);cv.connect(rv);rv.connect(so9); // pré-délai 35 ms : l'attaque de chaque note passe AVANT la salle
  }catch(e){}
  try{ // L'ÉCHO PING-PONG en croche pointée, recalé sur le tempo à chaque appui (instruTempo)
    const dL=AC.createDelay(2),dR=AC.createDelay(2),fb=AC.createGain(),df=AC.createBiquadFilter(),mg=AC.createChannelMerger(2),eg=AC.createGain();
    df.type='lowpass';df.frequency.value=1300;const dh=AC.createBiquadFilter();dh.type='highpass';dh.frequency.value=300;fb.gain.value=.3;eg.gain.value=.26;
    lp.connect(dh);dh.connect(df);df.connect(dL);dL.connect(dR);dR.connect(fb);fb.connect(dL);dL.connect(mg,0,0);dR.connect(mg,0,1);mg.connect(eg);eg.connect(so9);
    INSTRU.dL=dL;INSTRU.dR=dR;
  }catch(e){}
  try{ // (2026-10-03, Léo : « à chaque note un peu plus d'individualité, fais-les ressortir un peu du fondu ») LE CONTOUR : l'attaque de chaque
    // touche (un « tine » d'harmoniques, 40 ms) passe à côté du filtre sombre, de la salle et de l'écho — la note se dessine, le halo reste.
    const ct=AC.createGain();ct.gain.value=1;const ch=AC.createBiquadFilter();ch.type='bandpass';ch.frequency.value=2600;ch.Q.value=.7;
    ct.connect(ch);ch.connect(so9);INSTRU.contour=ct;
  }catch(e){}
  try{ // LE BUS ÉTINCELLE (la 4e mesure et après) : clair, aéré — pas le filtre sombre ; un peu de salle
    const eb=AC.createGain();eb.gain.value=1;const eh=AC.createBiquadFilter();eh.type='highpass';eh.frequency.value=350;
    const el=AC.createBiquadFilter();el.type='lowpass';el.frequency.value=7000;const es=AC.createGain();es.gain.value=.5;
    eb.connect(eh);eh.connect(el);el.connect(so9);el.connect(es);if(INSTRU.salle)es.connect(INSTRU.salle);INSTRU.etin=eb;
  }catch(e){}
  INSTRU.bus=g;return g;
}
function instruEcho(){try{const t=Math.min(.9,INSTRU.pas*6);if(INSTRU.dL){INSTRU.dL.delayTime.setTargetAtTime(t/2,AC.currentTime,.05);INSTRU.dR.delayTime.setTargetAtTime(t/2,AC.currentTime,.05);}}catch(e){}}
/* LE TING (2026-10-03) : l'arpège change d'instrument — une petite cloche de verre / célesta (sinus + FM au rapport 3,5 qui s'éteint en
   ~60 ms, scintillement ×4 au contact, déclin .35 s), sur le bus clair de l'étincelle (350 Hz – 7 kHz, un peu de salle). Aucun grave. */
function instruTing(f,t,pan,vel){
  const bus=instruBus();if(!bus||vel<.03)return;
  if(!INSTRU.essai){t+=(Math.random()-.5)*.006;vel*=.92+Math.random()*.16;}t=Math.max(t,AC.currentTime);
  INSTRU.fins=INSTRU.fins.filter(function(x){return x>t;});if(INSTRU.fins.length>=12)return;
  if(INSTRU.essai||!INSTRU.etin){INSTRU.vu.push(Math.round(f));if(INSTRU.vu.length>200)INSTRU.vu.shift();return;}
  INSTRU.fins.push(t+.25);
  const c=AC.createOscillator(),m=AC.createOscillator(),mg=AC.createGain(),g=AC.createGain(),sc=AC.createOscillator(),sg=AC.createGain(),p=AC.createStereoPanner?AC.createStereoPanner():null;
  c.frequency.value=f;m.frequency.value=f*3.5;mg.gain.setValueAtTime(f*1.1,t);mg.gain.setTargetAtTime(0,t,.06);m.connect(mg);mg.connect(c.frequency);
  sc.frequency.value=f*4;sg.gain.setValueAtTime(0,t);sg.gain.linearRampToValueAtTime(.3,t+.002);sg.gain.setTargetAtTime(0,t+.004,.035);sc.connect(sg);sg.connect(g);
  const pk=.062*vel;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+.003);g.gain.setTargetAtTime(0,t+.008,.35); // (2026-10-04) −1 dB, et il se pose ensuite (voir niv9)
  c.connect(g);if(p){p.pan.value=pan;g.connect(p);p.connect(INSTRU.etin);}else g.connect(INSTRU.etin);
  [c,m,sc].forEach(function(o){o.start(t);o.stop(t+1.8);});INSTRU.vu.push(Math.round(f));if(INSTRU.vu.length>200)INSTRU.vu.shift();
}
function instruMelodie(k,tons){ // la note de mélodie (MIDI) de la croche k, ou -1 — seulement des notes qui sonnent dans le morceau
  const mes=k>>4,cr=(k>>1)&7,ry=INSTRU_RYTHMES[(mes*5+(mes>>2))%INSTRU_RYTHMES.length];
  if(!ry[cr]&&!INSTRU.acc)return -1;
  const prev=INSTRU.mel,cible=[67,70,74,69][mes&3]+((mes>>2)&1?2:0),dispo=instruDans(tons,62,79);if(!dispo.length)return -1;
  let n;
  if(cr%2===0||INSTRU.acc){ // temps fort : la note la plus proche du chemin vers la cible ; un accent (spam) BOUGE toujours
    let bd=1e9;n=dispo[0];for(const v of dispo){if(INSTRU.acc&&v===prev&&dispo.length>1)continue;const d=Math.abs(v-prev)+.5*Math.abs(v-cible);if(d<bd){bd=d;n=v;}}
  }else{ // entre deux : la note voisine vers la cible (parfois un pas de côté — la phrase respire)
    let bi=0,bd=1e9;for(let i=0;i<dispo.length;i++){const d=Math.abs(dispo[i]-prev);if(d<bd){bd=d;bi=i;}}
    const dir=cible>prev?1:cible<prev?-1:((k*7)%3)-1;
    bi=Math.max(0,Math.min(dispo.length-1,bi+(((k*13+mes)%5)===0?-dir:dir)));n=dispo[bi];
  }
  INSTRU.mel=n;return n;
}
/* (2026-10-07, audit GRAPHISME : « des ting ressortent pendant le 3-2-1 après une pause ») LA PAUSE COUPE LA PHRASE. Avant, la pause la
   « lâchait » comme un doigt levé (4 à 7 notes de queue) : mais le contexte audio s'endort 70 ms plus tard, l'horloge se fige avec les notes
   déjà posées, l'écho et la salle pleins — et tout repartait au 3-2-1. Désormais : file vidée, minuterie arrêtée, et la PORTE de l'instrument
   (`INSTRU.sortie`) se ferme en même temps que la sortie du jeu ; elle ne se rouvre qu'au prochain appui de nitro (instruOn), quand les
   restes figés ont eu le temps de s'éteindre derrière elle. */
function instruCoupe(d){
  INSTRU.queue=0;INSTRU.tient=false;clearTimeout(INSTRU.att);if(INSTRU.iv){clearInterval(INSTRU.iv);INSTRU.iv=0;}
  try{if(AC&&INSTRU.sortie){const p=INSTRU.sortie.gain,T=AC.currentTime+(d||0);p.cancelScheduledValues(T);p.setTargetAtTime(0,T,.012);INSTRU.ferme=1;}}catch(e){}}
function instruPlanifie(){ // regard d'avance de 120 ms : les notes tombent pile, même si une image tousse
  if(!AC){clearInterval(INSTRU.iv);INSTRU.iv=0;return;}
  if(paused&&!INSTRU.essai){instruCoupe(0);loop._iW=false;return;} /* (2026-10-07) en pause : la phrase est coupée, pas laissée en suspens (voir instruCoupe) — (audit) et le doigt encore posé la relance à la reprise (loop._iW) */
  if(INSTRU.tient&&(gameOver||paused||mode==='boom'||(!INSTRU.essai&&!instruMusiqueOk()))){instruOff();loop._iW=false;} // (la musique change de map : la phrase se termine)      // la partie s'arrête : la phrase se termine
  if(!INSTRU.essai){if(INSTRU.H!==instruH())instruTempo();else instruHorloge();}        // le morceau a changé ? on relit sa fiche ; sinon on se recale
  const fin=INSTRU.essai?1e9:AC.currentTime+.12;
  while(INSTRU.tNote<fin){
    if(!INSTRU.tient){if(INSTRU.queue<=0){clearInterval(INSTRU.iv);INSTRU.iv=0;return;}INSTRU.queue--;INSTRU.vel*=.84;} // lâché : la phrase s'éteint en finissant le temps
    if(INSTRU.essai&&INSTRU.n>=INSTRU.essaiN)return;
    const k=INSTRU.k,mes=k>>4;
    if(INSTRU.tient)INSTRU.monte=(INSTRU.monte||0)+1;                                   // compte les notes depuis l'appui
    /* (2026-10-04, Léo : « le son du nitro qui englobe par-dessus la musique : cool au début, ça fait un petit effet, mais là c'est trop fort —
       régule ») : la phrase ENTRE (fondu sur 6 notes), garde son effet ~1 mesure, puis SE POSE à 55 % sous la musique (en 2 mesures). */
    const mo9=INSTRU.monte==null?99:INSTRU.monte,niv9=mo9<6?.35+.65*mo9/6:(mo9<16?1:Math.max(.55,1-.45*(mo9-16)/32));
    const t=Math.max(INSTRU.tNote,AC.currentTime),temps=k%4===0,V=INSTRU.vel*((mes&3)>=2?.85:1)*niv9; // mesures 3-4 un peu plus bas
    const tons=instruTons(t+.01);                                                       // l'accord du MORCEAU, maintenant
    const fen=instruDans(tons,62,86),mot=INSTRU_MOTIFS[((k>>3)*3+(mes>>2))%INSTRU_MOTIFS.length];
    let a9=fen.length?fen[mot[k%8]%Math.min(5,fen.length)]:-1;                          // l'arpège : les 5 premières notes de l'accord au-dessus de sol3
    if(a9>=0&&(mes&3)===3&&a9+12<=88)a9+=12;const arpK=(mes&3)===3?1.45:1;               // 4e mesure : il monte d'une octave (Léo : « plus aigu »)
    if(a9>=0&&BTEST!=='melodie')instruTing(instruHz(a9),t,k%2?.35:-.35,V*arpK*(temps?1:.8));                 // l'arpège : le TING (Léo : « plus en mode ting, l'instrument n'est peut-être pas le bon »)
    if(INSTRU.intro>0&&k%2===0&&BTEST!=='arpege'){INSTRU.intro--;INSTRU.acc=1;const m9=instruMelodie(k,tons);INSTRU.acc=0; // (2026-10-03, Léo : « quelques notes un peu MÉLODIQUES dès qu'on appuie, sans déranger la musique ») : l'appel — 3 notes qui chantent, en ting
      if(m9>=0)instruTing(instruHz(m9),t,0,.8);}
    
    // (2026-10-03, Léo : « l'arpège crée une résonance grave à la fin, c'est dérangeant ») : plus de basse — le morceau a la sienne
    INSTRU.der=INSTRU.tNote;INSTRU.k++;INSTRU.n++;
    INSTRU.tNote=INSTRU.off!=null&&!INSTRU.essai?instruGrille(INSTRU.tNote+INSTRU.pas*.5):INSTRU.tNote+INSTRU.pas; // la note suivante, SUR la grille du morceau
  }
}
/* LES VERSIONS D'ÉCOUTE (2026-10-03, Léo : « ça ne doit pas passer par-dessus la musique, ça accompagne ; il y a une partie qui gêne —
   trouvons-la ») : `?boost=` dans l'adresse coupe UNE couche du boost, pour l'isoler à l'oreille :
   sans (pas de phrase) · arpege (l'arpège seul) · melodie (la mélodie seule) · feu0 (la flamme du nitro muette : grondement, pops,
   turbo). */
const BTEST=(function(){try{return new URLSearchParams(location.search).get('boost')||'';}catch(e){return '';}})();
function instruMusiqueOk(){ // la phrase du boost n'existe que sur la musique pour laquelle elle est dessinée : le CIEL (niveaux 1 à 5, et le morceau entier)
  /* (2026-10-08, Léo : « les boosts n'ont plus leur musique ») depuis 822cdf9, PLAY lance la partie SANS FIN, qui joue le CIEL ENTIER
     (`ciel-complet.m4a`, MUSIC_CIEL_TOUT) : le garde-fou ne connaissait que ciel-n1…n5, la phrase se taisait à chaque boost. Le morceau
     entier a sa fiche dans harmonie.js (tempo, notes temps par temps) : la phrase y reste accordée comme sur les niveaux. */
  return !!(musicEl&&musicEl.src&&/\/ciel-(n[1-5]|complet)\.m4a/.test(musicEl.src));
}
function instruOn(){
  if(!INSTRU.on||!AC||!SND.sfx||(AC.state!=='running'&&!INSTRU.essai)||paused)return; // (2026-10-03, Léo) un VRAI appui pendant le boost de départ lance la phrase (le départ seul, lui, ne la lance jamais : elle lit le doigt)
  if(BTEST==='sans')return;
  if(INSTRU.essai)return instruDemarre();
  if(!instruMusiqueOk())return; // (2026-10-04, Léo : « les effets du boost musical seront dessinés pour CHAQUE map et sa musique : seulement avec la musique des 5 premiers niveaux du CIEL ») 
  INSTRU.doigt=true;clearTimeout(INSTRU.att);
  instruDemarre(); // (2026-10-03, Léo : « l'activer dès qu'on appuie sur ESPACE, quand ça commence à booster — et en maintenant sur iPhone ») : plus d'attente de 0,22 s ; l'entrée en fondu suffit
}
function instruDemarre(){
  if(!AC||paused)return;
  const t=performance.now(),neuve=t-INSTRU.tDer>2500&&!INSTRU.iv;INSTRU.tDer=t;
  instruTempo();instruBus();instruEcho();if(INSTRU.ferme&&INSTRU.sortie){try{const p=INSTRU.sortie.gain;p.cancelScheduledValues(AC.currentTime);p.setTargetAtTime(1,AC.currentTime,.01);}catch(e){}INSTRU.ferme=0;} /* (2026-10-07) la porte se rouvre à l'appui */INSTRU.tient=true;INSTRU.vel=1;INSTRU.acc=0;INSTRU.n=0;INSTRU.intro=3;if(neuve||!INSTRU.iv)INSTRU.monte=0;
  if(neuve){INSTRU.k=0;INSTRU.mel=67;INSTRU.tNote=instruGrille(AC.currentTime+.005);}  // une phrase NEUVE (silence de 2,5 s)
  else if(!INSTRU.iv){INSTRU.tNote=instruGrille(Math.max(AC.currentTime+.005,INSTRU.der+.09));} // elle REPREND où elle en était
  if(INSTRU.tNote-AC.currentTime>.5)INSTRU.tNote=instruGrille(AC.currentTime+.005);   // garde-fou (horloges qui ont dérivé)
  if(INSTRU.essai){INSTRU.tient=!!INSTRU.essaiTenu;if(!INSTRU.tient)INSTRU.queue=3;instruPlanifie();INSTRU.tient=false;return;}
  if(!INSTRU.iv)INSTRU.iv=setInterval(instruPlanifie,25);instruPlanifie();
}
function instruOff(){INSTRU.doigt=false;clearTimeout(INSTRU.att);if(!INSTRU.tient)return;INSTRU.tient=false;INSTRU.tDer=performance.now();INSTRU.queue=(4-INSTRU.k%4)%4+4;} // lâché : on finit le temps + un temps, en s'éteignant
function nfxTick(dt){ // chaque image (après hsF/hsU) : l'onde, la teinte des bords, les enveloppes
  const vit=running&&!gameOver&&mode!=='boom';
  NFX.ign=Math.max(0,NFX.ign-dt/.55);NFX.off=Math.max(0,NFX.off-dt/1.2);
  NFX.len+=((vit&&nitroOn?1:0)-NFX.len)*Math.min(1,dt*(nitroOn?9:5));
  if(NFX.ringT<.45&&vit){NFX.ringT+=dt;const u=Math.min(1,NFX.ringT/.42),e=1-(1-u)*(1-u)*(1-u),R=NFX.ring;
    R.visible=u<1;potMonde(CAR_POT_C,R.position).addScaledVector(hsF,-(.15+.8*e)); // l'onde RECULE en s'ouvrant : elle part vers l'arrière
    R.quaternion.copy(carGroup.quaternion); // son plan : perpendiculaire à la caisse (au sol comme en vrille)
    const sc=(.35+1.55*e)*(.65+.35*NFX.ringK);R.scale.set(sc,sc,1); // ≤ 1,9 m : un halo de choc AUTOUR de la poupe — plus grand, il passait devant l'objectif en croissant géant
    R.material.opacity=(1-u)*(1-u)*1.7*NFX.ringK;R.material.color.copy(NFX.col);}
  else if(NFX.ring.visible)NFX.ring.visible=false;
  // LES BORDS DE L'IMAGE prennent la couleur de la poussée — orange feu, bleu réserve, or du pad turbo (plus discret)
  const eT=vit?(nitroOn?((nitroBlue?.26:.28)):(boost>0?(.12):0)):0; // (neon-residuel) bords ≤ .3 : de la lueur chaude, plus un voile de couleur
  NFX.edge+=(eT-NFX.edge)*Math.min(1,dt*(eT>NFX.edge?8:2.6));
  NFX.cT.setHex(nitroBlue?NFX_C.b:(nitroOn?(pwrNitroT>0?(NFX_C.i):NFX_C.n):NFX_C.p));
  if(NYAN.on&&!FX_EFF&&nitroOn&&!nitroBlue&&!(pwrNitroT>0))NFX.cT.setHSL((performance.now()*.00045)%1,1,.58); // (2026-10-07) LE BOOST DU CHAT : l'onde et les bords de l'image tournent dans l'arc-en-ciel
  NFX.col.lerp(NFX.cT,Math.min(1,dt*12));
  if(acesPass){const U=acesPass.uniforms,b9=NFX.dbgB==null?1:NFX.dbgB;
    U.uNit.value.set(NFX.col.r,NFX.col.g,NFX.col.b,NFX.edge*(REDUCED_MOTION?.5:1)*b9);
    U.uNitF.value=vit?NFX.ign*NFX.ign*NFX.ignK*(REDUCED_MOTION?.25:(.4))*b9:0;} // le COUP : un éclair de couleur sur tout le cadre, parti en ~0,3 s
}
// LE BOOST DE DÉPART (2026-09-05) : 3 s de nitro OFFERTE au lancement d'une partie (voir
// `resetGame`) — ne consomme PAS `nitroR` (même garde que `pwrNitroT`, le pouvoir « nitro infinie »)
// et décroît en douceur : si le joueur ne touche à rien, la poussée s'arrête à 0 et la traînée
// normale (frottement) reprend la main — le boost est un CADEAU ponctuel, pas un état permanent.
let startBoostT=0;
// `fireLaunchBoost()` — LE GESTE DU DÉPART, un seul écrivain (2026-09-05) : armé depuis `resetGame`
// (rejeu direct) ET depuis la fin du LÂCHER du garage (`GAR.go`, prembattre le tout premier départ)
// pour que le geste soit identique dans les deux cas, sans dupliquer le minuteur du logo.
function fireLaunchBoost(){
  // (2026-09-24) la nitro OFFERTE avait été désarmée à la fusion (« la caisse qui s'arrache toute seule au gaz auto »)…
  // (2026-09-29) …elle REVIENT, comme sur la branche de Léo : c'est la suite du RIDEAU DE FLAMMES du garage.
  startBoostT=(typeof TUTO!=='undefined'&&TUTO.on)?0:3;paintMoney(); // (2026-09-29, repris de la branche de Léo, 28/09 : « le boost dès le début de la partie a disparu ») 3 s de nitro OFFERTE — on sort des flammes du garage EN flammes · (2026-10-08, Léo) plus de la nitro : un ÉLAN, la même poussée sans flamme, ni son, ni traînée (voir la conduite) ; pas à l'auto-école (sa leçon, c'est d'appuyer soi-même)
  // LE LOGO + SON HALO (agrandis 2026-09-05, « plus impressionnant ») : les DEUX partagent la MÊME
  // classe `.on` et le MÊME minuteur — un flash sans le mot, ou le mot sans le flash, ferait deux
  // demi-effets au lieu d'un seul coup net.
  const ll9=$('launchLogo'),lg9=$('launchGlow');
  if(ll9){ll9.classList.remove('on');void ll9.offsetWidth;ll9.classList.add('on');try{sfx('depart.logo',{vol:-4});}catch(e){}} /* (console de son) le logo CLAQUE : sub + accord d'or — (2026-10-16) −4 dB : il remettait un coup de sub juste après le piqué */
  if(lg9){lg9.classList.remove('on');void lg9.offsetWidth;lg9.classList.add('on');}
  clearTimeout(fireLaunchBoost._t);fireLaunchBoost._t=setTimeout(function(){
    if(ll9)ll9.classList.remove('on');if(lg9)lg9.classList.remove('on');
    if(!started||gameOver)return; /* (24/10, relecture) la course est déjà finie ou quittée (QUITTER, mort dans les 1,9 s) : la bannière « NIVEAU n » ne vient plus après coup sur l'écran de fin ou le garage */
    if(TUTO.on&&TUTO.attente&&started&&!gameOver){TUTO.attente=false;tutoAffiche();}else // l'auto-école prend la parole pile quand le logo s'efface
    lvlAnnonce(); // LE LOGO PASSE LE RELAIS : « NIVEAU 1 — … » arrive quand CASH CAR s'efface (au même endroit, jamais par-dessus)
  },1900);
}
let pwrNitroT=0,pwrAirT=0,pwrSpdT=0; // POUVOIRS : nitro infinie · airtime infini · speed up +60%
/* (2026-10-17, session « Physique et gameplay fluides ») LE ×2 DE VITESSE QUI SE PREND ET SE REND : l'avance au sol passait de ×1 à ×2 en UNE
   image au ramassage, et de ×2 à ×1 à l'expiration — un coup de frein de 50 % sans rien toucher. `pwrSpdK` (0 → 1) suit le pouvoir en
   exponentielle (τ 1/6 s : 95 % en 0,5 s) ; vitMult le lit. Durée du pouvoir inchangée. */
let pwrSpdK=0;
let pwrMagT=0,pwrAurT=0;  // (pouvoirs v2) aimant · aura ×2 (le bouclier est retiré le 29/09) — voir PWR_DEFS
const MAG_R=50; // (2026-09-29, Sacha) le RAYON de l'aimant, en mètres, dans toutes les directions — voir « L'AIMANT v3 »
let gameOver=false,paused=false,running=false,started=false,best=0;
best=SAVE.d.best;
const fallPos=new THREE.Vector3(),fallVel=new THREE.Vector3();
const prevTv=new THREE.Vector3();let prevTvalid=false;
const $=id=>document.getElementById(id);
const elSpeed=$('speedVal'),elName=$('carName'),elLvl=$('carLevel'),elMoney=$('moneyTxt'),
      elCp=$('cpDist'),elFill=$('cpFill'),elMsg=$('msg'),elTurn=$('turnHint'),
      elRecord=$('record'),elNR=$('nitroR'),elNX=$('nitroX'),elNB=$('tNitro'),
      trickBox=$('trickBox'),chainHud=$('chainHud'),caseHud=$('caseHud'),airPie=$('airPie'),pieCtx=airPie.getContext('2d'),
      elStyleF=$('styleFill'),feverGlow=$('feverGlow'),flashEl=$('flash'),
      overlay=$('overlay'),ovSub=$('ovSub'),finalScore=$('finalScore'),goTxt=$('goTxt'),tagline=$('tagline'),bestChip=$('bestChip'),
      auraHudEl=$('auraHud'),auraValEl=$('auraVal'),auraBarEl=$('auraBarF'),
      auraSubEl=$('auraSub'),auraComboEl=$('auraCombo'),auraGlowEl=$('auraGlow');
const elLb=$('lbBox'),nameEntry=$('nameEntry'),nameInput=$('nameInput'),nameSave=$('nameSave');
const speedFx=$('speedFx'),cloudFxEl=$('cloudFx'),runStatsEl=$('runStats'),pwrChip=$('pwrChip');
if(IS_MOBILE&&pwrChip)document.body.appendChild(pwrChip); // (HUD v4) la colonne de droite du tableau de bord (hors de la jauge de nitro)
const slCv=$('slCv'),slCtx=slCv.getContext('2d');
// ⚠ DÉCLARÉ ICI, avec slCv : le dimensionnement juste en dessous s'en sert, et un `const`
// déclaré plus bas dans le fichier est en ZONE MORTE TEMPORELLE — on y accède, ça jette.
const juiceCv=$('juiceCv'),juiceCx=juiceCv?juiceCv.getContext('2d'):null;
slCv.width=innerWidth;slCv.height=innerHeight;if(juiceCv){juiceCv.width=innerWidth;juiceCv.height=innerHeight;}
/* FILÉS v2 (2026-09-26, passe graphique) : les traits étaient TIRÉS AU HASARD À CHAQUE IMAGE — 30 bâtons qui changeaient de place 60 fois
   par seconde, un grésillement plus qu'un mouvement. Désormais chaque filé VIT : il naît loin du centre, FILE vers le bord en ~0,3 s,
   s'allume et s'éteint en douceur (enveloppe sinus), puis renaît ailleurs. Plus FINS (0,5-1,3 px), plus longs, en COMÈTE (tête franche
   vers l'extérieur, queue qui s'étire vers le centre). Mémoire fixe (tableaux typés), un seul tirage par naissance, zéro allocation.
   Quand la vitesse retombe, les filés en vol finissent leur course au lieu de disparaître d'un coup. */
const SLN=44,SL={a:new Float32Array(SLN),r:new Float32Array(SLN),v:new Float32Array(SLN),t:new Float32Array(SLN),T:new Float32Array(SLN),
  w:new Float32Array(SLN),l:new Float32Array(SLN),al:new Float32Array(SLN),vivants:0};
/* LE VENT (2026-10-21, Léo : « les traits de vitesse font encore un peu enfantin, fais-moi un truc mieux, adapté à notre gameplay ») :
   les filés d'anime (44 bâtons qui jaillissent du CENTRE DE L'ÉCRAN) sont remplacés par des particules d'AIR posées dans le MONDE.
   Elles ne bougent pas : c'est la caméra qui les traverse, donc vraie perspective (fines au loin, elles s'étirent et accélèrent en
   passant), vraie parallaxe, et le point de fuite est la DIRECTION RÉELLE du vol (en l'air, il suit la trajectoire, pas le milieu de
   l'écran). Chaque trait va du point d'air à sa position d'il y a τ secondes : sa longueur dit la vitesse. Fins, comète lumineuse à tête
   franche ; couleur = état de la caisse (air froid · or au-delà de la croisière · feu nitro · bleu réserve · violet nitro infinie · rouge
   frénésie), choisie à la NAISSANCE du trait (la teinte change en ~0,5 s, sans à-coup). Le milieu de l'écran reste net (on vise) et un
   masque épargne la caisse. L'allumage de la nitro = une SURVITESSE (`VENT.pic`) au lieu de la gerbe radiale. Même canvas 2D, zéro
   programme GPU, zéro allocation. `?vent=ancien` ou `dbgVent(false)` = les anciens filés. */
const VENT_N=64,VENT={ancien:false,pic:0,wx:new Float32Array(VENT_N*3),pal:new Uint8Array(VENT_N),lg:new Float32Array(VENT_N),ep:new Float32Array(VENT_N),
  pxP:0,pyP:0,pzP:0,vx:0,vy:0,vz:0,init:false,vivants:0,sp:null};
try{if(new URLSearchParams(location.search).get('vent')==='ancien')VENT.ancien=true;}catch(e){}
window.dbgVent=function(on){if(on===undefined)return {ancien:VENT.ancien,vitesse:Math.hypot(VENT.vx,VENT.vy,VENT.vz),pic:VENT.pic};VENT.ancien=!on;if(on)VENT.init=false;return !VENT.ancien;};
function ventSprites(){ // 6 comètes cuites UNE fois : queue transparente → corps teinté → tête presque blanche → bord net ; profil doux en travers
  const mk=function(c,h){const cv=document.createElement('canvas');cv.width=256;cv.height=8;const x=cv.getContext('2d');
    const g=x.createLinearGradient(0,0,256,0),q='rgba('+c+',',t='rgba('+h+',';
    g.addColorStop(0,q+'0)');g.addColorStop(.5,q+'.28)');g.addColorStop(.84,q+'.8)');g.addColorStop(.94,t+'1)');g.addColorStop(.995,t+'.9)');g.addColorStop(1,t+'0)');
    x.fillStyle=g;x.fillRect(0,0,256,8);x.globalCompositeOperation='destination-in';
    const v=x.createLinearGradient(0,0,0,8);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.38,'rgba(0,0,0,.85)');v.addColorStop(.5,'rgba(0,0,0,1)');v.addColorStop(.62,'rgba(0,0,0,.85)');v.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=v;x.fillRect(0,0,256,8);return cv;};
  return [mk('176,194,255','255,255,255'),mk('255,214,120','255,250,226'),mk('255,122,36','255,236,200'),mk('91,125,255','214,226,255'),mk('157,77,255','243,230,255'),mk('255,42,61','255,206,210')];
}
function ventPose(i,loin){ // (re)nait un trait : un point de l'écran (loin du centre) à une profondeur, posé dans le monde
  const tf=Math.tan(camera.fov*.0087266),as=camera.aspect,e=camera.matrixWorld.elements;
  const a=Math.random()*6.2832,rf=.36+.82*Math.pow(Math.random(),.8),d=loin?(34+Math.random()*42):(8+Math.random()*68);
  const nx=Math.cos(a)*rf,ny=Math.sin(a)*rf,xv=nx*d*tf*as,yv=ny*d*tf,zv=-d;
  VENT.wx[i*3]=e[0]*xv+e[4]*yv+e[8]*zv+e[12];VENT.wx[i*3+1]=e[1]*xv+e[5]*yv+e[9]*zv+e[13];VENT.wx[i*3+2]=e[2]*xv+e[6]*yv+e[10]*zv+e[14];
  VENT.lg[i]=.55+Math.random()*.9;VENT.ep[i]=.7+Math.random()*.8;
}
/* (2026-10-24, passe perf 2e tour) LE VENT SUR LES VIEUX TÉLÉPHONES : chaque trait est un drawImage tourné, en mélange additif, dans une toile 2D plein écran
   effacée à chaque image (mesuré : 3,3 % du processeur de la boucle au banc ×4, à grande vitesse nitro tenue). [ANCIEN, MOYEN, RÉCENT] : la moitié, 70 %, tous. */
PAL.B.ventK=[.5,.7,1];
function ventDessine(kmh,nitro,dt){
  const W=slCv.width,H=slCv.height;dt=Math.min(dt||.016,.05);
  const vcL=vCroisiere();
  let k=Math.max(0,(kmh-vcL*.6)/vcL)+(nitro?.6:0);if(mode==='boom'||gameOver)k=0;
  VENT.pic=Math.max(0,VENT.pic-dt*2.6);
  slCtx.setTransform(1,0,0,1,0,0);
  // la vitesse de la CAMÉRA dans le monde (c'est elle qui traverse l'air), lissée ; une téléportation (portail, replacement) remet l'air à neuf
  camera.updateMatrixWorld();camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
  const P=camera.position,jump=Math.hypot(P.x-VENT.pxP,P.y-VENT.pyP,P.z-VENT.pzP);
  if(!VENT.init||jump>160){VENT.init=true;for(let i=0;i<VENT_N;i++){ventPose(i,false);VENT.pal[i]=0;}VENT.vx=VENT.vy=VENT.vz=0;}
  else if(dt>0){const g=1-Math.exp(-dt*10);VENT.vx+=((P.x-VENT.pxP)/dt-VENT.vx)*g;VENT.vy+=((P.y-VENT.pyP)/dt-VENT.vy)*g;VENT.vz+=((P.z-VENT.pzP)/dt-VENT.vz)*g;}
  VENT.pxP=P.x;VENT.pyP=P.y;VENT.pzP=P.z;
  k=Math.min(1.35,k);const cible=Math.min(VENT_N,(k*46+(VENT.pic>0?VENT.pic*18:0))*PAL.b('ventK',1)); // (2026-10-24, passe perf) ventK : moins de traits sur les vieux téléphones
  if(cible<=.05&&!VENT.vivants){if(drawSpeedLines._had){slCtx.clearRect(0,0,W,H);drawSpeedLines._had=false;slCv.style.visibility='hidden';}return;}
  slCtx.clearRect(0,0,W,H);if(!drawSpeedLines._had){drawSpeedLines._had=true;slCv.style.visibility='visible';}
  const spr=VENT.sp||(VENT.sp=ventSprites());
  const pal=nitro?(nitroBlue?3:(pwrNitroT>0?4:2)):(FLOW.lv===4?5:(k>.95?1:0));
  const m=camera.matrixWorldInverse.elements,tf=Math.tan(camera.fov*.0087266),as=W/H,foc=H*.5/tf;
  // la vitesse dans le repère de la caméra : de combien l'air a glissé il y a τ secondes
  const vvx=m[0]*VENT.vx+m[4]*VENT.vy+m[8]*VENT.vz,vvy=m[1]*VENT.vx+m[5]*VENT.vy+m[9]*VENT.vz,vvz=m[2]*VENT.vx+m[6]*VENT.vy+m[10]*VENT.vz;
  const tau=(.04+.05*Math.min(1,k))*(1+VENT.pic*1.4),capPx=Math.min(W,H)*.62;
  // la caisse à l'écran : rien ne passe SUR elle
  const cg=carGroup.position,cxw=m[0]*cg.x+m[4]*cg.y+m[8]*cg.z+m[12],cyw=m[1]*cg.x+m[5]*cg.y+m[9]*cg.z+m[13],czw=m[2]*cg.x+m[6]*cg.y+m[10]*cg.z+m[14];
  let carX=-9e3,carY=-9e3,carR=1;if(czw<-.5){carX=(.5+cxw/(-czw)/(tf*as)*.5)*W;carY=(.5-cyw/(-czw)/tf*.5)*H;carR=Math.max(40,foc*2.6/(-czw));}
  slCtx.globalCompositeOperation='lighter';let viv=0;
  for(let i=0;i<VENT_N;i++){
    const x=VENT.wx[i*3],y=VENT.wx[i*3+1],z=VENT.wx[i*3+2];
    const xv=m[0]*x+m[4]*y+m[8]*z+m[12],yv=m[1]*x+m[5]*y+m[9]*z+m[13],zv=m[2]*x+m[6]*y+m[10]*z+m[14];
    const d=-zv,inv=d>.01?1/d:0;let nxs=xv*inv/(tf*as),nys=yv*inv/tf;
    if(d<1.6||Math.abs(nxs)>2.1||Math.abs(nys)>2.1||d>96){ventPose(i,true);VENT.pal[i]=pal;continue;} // passé derrière, sorti du champ : il renaît loin devant, à la teinte du moment
    if(i>=cible)continue; // les traits en trop attendent (ils vivent quand même : l'air est là, on ne l'éclaire pas)
    viv++;
    const tx=xv+vvx*tau*VENT.lg[i],ty=yv+vvy*tau*VENT.lg[i],tz=zv+vvz*tau*VENT.lg[i];
    if(tz>-.4)continue;
    const hx=(.5+nxs*.5)*W,hy=(.5-nys*.5)*H,ti=1/(-tz),qx=(.5+tx*ti/(tf*as)*.5)*W,qy=(.5-ty*ti/tf*.5)*H;
    let dx=hx-qx,dy=hy-qy,L=Math.hypot(dx,dy);if(L<5)continue;
    if(L>capPx){const c=capPx/L;dx*=c;dy*=c;L=capPx;}
    const ddx=hx-carX,ddy=hy-carY,mk=Math.sqrt(ddx*ddx*.8+ddy*ddy)/carR;if(mk<1.25){ if(mk<.7)continue; }
    const fl=Math.min(1,(cible-i)),eloin=d>46?Math.max(0,(78-d)/32):1,epr=Math.min(1,(d-1.6)/5),
      cen=Math.min(1,Math.hypot(nxs,nys)*1.5-.35); // le milieu de l'écran reste net : on y vise
    let a=.5*fl*eloin*epr*Math.max(0,cen)*Math.min(1,k+.3);if(mk<1.25)a*=(mk-.7)/.55;if(a<.02)continue;
    const w=Math.max(.9,Math.min(3.2,.036*foc*VENT.ep[i]*inv))*2.4;
    slCtx.globalAlpha=Math.min(.95,a);const ang=Math.atan2(dy,dx),co=Math.cos(ang),si=Math.sin(ang);
    slCtx.setTransform(co,si,-si,co,qx,qy);slCtx.drawImage(spr[VENT.pal[i]],0,-w*.5,L,w);
  }
  VENT.vivants=viv;slCtx.setTransform(1,0,0,1,0,0);slCtx.globalAlpha=1;slCtx.globalCompositeOperation='source-over';
}
function drawSpeedLines(kmh,nitro,dt){ // speed lines façon anime : traits radiaux fuyant le centre — (2026-10-21) remplacées par LE VENT ci-dessus, sauf ?vent=ancien
  if(!VENT.ancien){ventDessine(kmh,nitro,dt);return;}
  const W=slCv.width,H=slCv.height;dt=dt||.016;
  const vcL=vCroisiere();
  let k=Math.max(0,(kmh-vcL*.6)/vcL)+(nitro?.6:0); // (2026-09-25) « un peu » en croisière, beaucoup plus au momentum, au boost, en nitro
  slCtx.setTransform(1,0,0,1,0,0);
  if(k<=.03&&!SL.vivants){if(drawSpeedLines._had){slCtx.clearRect(0,0,W,H);drawSpeedLines._had=false;slCv.style.visibility='hidden';}return;} // rien à tracer : on n'efface le plein écran qu'UNE fois (plus de clearRect/frame à basse vitesse)
  slCtx.clearRect(0,0,W,H);if(!drawSpeedLines._had){drawSpeedLines._had=true;slCv.style.visibility='visible';} // une écriture de style par TRANSITION, jamais par image
  k=Math.min(1.35,k);
  const cx=W/2,cy=H*.46,m9=Math.min(W,H),cible=Math.floor(k*30);
  // (2026-09-25) DEUX SPRITES CUITS UNE FOIS (blanc chaud / cyan nitro) : le ramasse-miettes du téléphone faisait des micro-saccades.
  // (v2) profil COMÈTE (queue longue, tête franche) et bords doux en travers : un trait fin reste net, un trait épais ne fait pas bâton.
  const spr=drawSpeedLines.spr||(drawSpeedLines.spr=(function(){const mk=function(r,g,b){const c=document.createElement('canvas');c.width=128;c.height=8;
    const x=c.getContext('2d'),gr=x.createLinearGradient(0,0,128,0),q='rgba('+r+','+g+','+b+',';
    gr.addColorStop(0,q+'0)');gr.addColorStop(.55,q+'.55)');gr.addColorStop(.86,q+'1)');gr.addColorStop(1,q+'0)');
    x.fillStyle=gr;x.fillRect(0,2,128,4);x.globalAlpha=.35;x.fillRect(0,1,128,6);return c;};return {w:mk(255,248,236),c:mk(255,226,184),b:mk(176,190,212)};})());
  const im9=nitro?(nitroBlue?spr.b:spr.c):spr.w;          // NITRO : filés chauffés à la couleur de la poussée — (vague 3) feu / réserve bleue de la bible (ils étaient cyan néon)
  slCtx.globalCompositeOperation='lighter';
  let viv=0;
  for(let i=0;i<SLN;i++){
    if(SL.t[i]>=SL.T[i]){ // mort : il renaît si la vitesse en réclame
      if(viv>=cible)continue;
      SL.a[i]=Math.random()*6.2832;SL.r[i]=m9*(.28+Math.random()*.46);  // ils NAISSENT loin du centre → le milieu reste net
      SL.v[i]=m9*(1.1+Math.random()*1.3)*(.6+.4*k);SL.t[i]=0;SL.T[i]=.22+Math.random()*.2;
      SL.l[i]=(110+Math.random()*260)*(.5+.5*k);SL.w[i]=.5+Math.random()*.8*Math.min(1,k);SL.al[i]=.06+Math.random()*.14;
    }
    SL.t[i]+=dt;const u=SL.t[i]/SL.T[i];if(u>=1)continue;viv++;
    const ca=Math.cos(SL.a[i]),sa=Math.sin(SL.a[i])*.82,d9=Math.hypot(ca,sa),r=SL.r[i]+SL.v[i]*SL.t[i];
    slCtx.globalAlpha=SL.al[i]*Math.sin(u*3.1416)*Math.min(1,k+.25); // s'allume, file, s'éteint
    slCtx.setTransform(ca/d9,sa/d9,-sa/d9,ca/d9,cx+ca*r,cy+sa*r);slCtx.drawImage(im9,0,-SL.w[i]*1.5,SL.l[i]*d9,SL.w[i]*3);
  }
  SL.vivants=viv;
  slCtx.setTransform(1,0,0,1,0,0);slCtx.globalAlpha=1;slCtx.globalCompositeOperation='source-over';
}
/* (vague 3, NITRO) LA GERBE DE FILÉS DE L'ALLUMAGE : 18 traits qui JAILLISSENT près du centre et filent vers les bords en 0,3 s, dans
   le calque des filés (dessinés après eux, seulement quand il est actif — la nitro l'allume toujours). Leurs PROPRES emplacements et
   leur propre tirage (`nfxR`) : les filés de `drawSpeedLines` et le Math.random du jeu restent exactement ceux d'avant. */
const NFX_FN=18,NFX_FIL={a:new Float32Array(NFX_FN),r:new Float32Array(NFX_FN),v:new Float32Array(NFX_FN),t:new Float32Array(NFX_FN).fill(9),
  T:new Float32Array(NFX_FN).fill(1),l:new Float32Array(NFX_FN),w:new Float32Array(NFX_FN),arme:false};
function nfxFiles(dt){
  const S=NFX_FIL,spr=drawSpeedLines.spr;
  if(!VENT.ancien){if(S.arme){S.arme=false;VENT.pic=1;}return;} // LE VENT : l'allumage = une survitesse de l'air, plus une gerbe radiale
  if(S.arme){S.arme=false;const m9=Math.min(slCv.width,slCv.height),k=NFX.ignK;
    for(let i=0;i<NFX_FN;i++){S.a[i]=nfxR()*6.2832;S.r[i]=m9*(.12+nfxR()*.22);S.v[i]=m9*(2.2+nfxR()*1.6)*(.7+.3*k);
      S.t[i]=-nfxR()*.1;S.T[i]=.2+nfxR()*.16;S.l[i]=(180+nfxR()*260)*(.6+.4*k);S.w[i]=.8+nfxR()*1.1;}}
  if(!spr||!drawSpeedLines._had){for(let i=0;i<NFX_FN;i++)S.t[i]+=dt;return;} // calque éteint : rien à dessiner, mais la gerbe s'use quand même
  const cx=slCv.width/2,cy=slCv.height*.46,im9=nitroBlue?spr.b:spr.c;let on=false;
  for(let i=0;i<NFX_FN;i++){if(S.t[i]>=S.T[i])continue;S.t[i]+=dt;const u=S.t[i]/S.T[i];if(u<=0||u>=1)continue;if(!on){on=true;slCtx.globalCompositeOperation='lighter';}
    const ca=Math.cos(S.a[i]),sa=Math.sin(S.a[i])*.82,d9=Math.hypot(ca,sa),r=S.r[i]+S.v[i]*S.t[i];
    slCtx.globalAlpha=.55*Math.sin(u*3.1416);
    slCtx.setTransform(ca/d9,sa/d9,-sa/d9,ca/d9,cx+ca*r,cy+sa*r);slCtx.drawImage(im9,0,-S.w[i]*1.5,S.l[i]*d9,S.w[i]*3);}
  if(on){slCtx.setTransform(1,0,0,1,0,0);slCtx.globalAlpha=1;slCtx.globalCompositeOperation='source-over';}
}
let pendingScore=null;
let leaders=SAVE.d.leaders; // même tableau que la sauvegarde : les mutations coulent dedans
function saveLeaders(){SAVE.d.leaders=leaders;SAVE.flush();}
function lbEsc(x){return String(x).replace(/[<>&]/g,function(c){return c==='<'?'&lt;':c==='>'?'&gt;':'&amp;';});}
function lbQualifies(sc){return sc>0&&(leaders.length<10||sc>leaders[leaders.length-1].s);}
function renderLeaders(hl){
  var trophy=pxi('trophee')+' TOP 10';
  // ⚠ DEUX AFFICHAGES, UNE SEULE ÉCRITURE (2026-09-05) : `#lbBoxG` (garage, premier écran vu depuis
  // que la porte s'ouvre après le splash) montre le MÊME Top 10 que `#lbBox` (menu classique) — on ne
  // maintient pas un second calcul, juste un second réceptacle du même HTML.
  var elLbG=$('lbBoxG');
  var html;
  if(!leaders.length){html='<div class="lbTitle">'+trophy+'</div><div class="lbEmpty">'+TR('Aucun score — sois le premier !')+'</div>';}
  else{
    html='<div class="lbTitle">'+trophy+'</div>';
    for(var i=0;i<leaders.length;i++){var e=leaders[i];
      html+='<div class="lbRow'+(i===hl?' hl':'')+'"><span class="lbRank">'+(i+1)+'</span><span class="lbName">'+lbEsc(e.n==='TOI'?TR('TOI'):e.n)+'</span><span class="lbScore">'+fmt(e.s)+'</span></div>';}
  }
  elLb.innerHTML=html;
  if(elLbG)elLbG.innerHTML=html;
}
/* ⚠ « MEILLEURE CAISSE » A ÉTÉ RETIRÉ (2026-08-18). C'était un vestige de l'époque où les caisses se
   gagnaient DANS L'ORDRE : le plus haut index atteint valait alors un titre de gloire. Depuis
   qu'elles s'achètent, « meilleure caisse » ne veut plus rien dire — c'est juste la plus chère qu'on
   ait payée, ce qui ne se félicite pas. Le chip annonce donc le RECORD, et le COMPTE EN BANQUE, qui
   est la vraie mesure d'avancement entre deux parties.
   ⚠ `SAVE.d.bestCar` reste écrit et lu ailleurs (il sert d'indicateur interne et de plancher à la
   clause de grand-père) : on retire l'AFFICHAGE, pas la donnée. */
function setBestChip(){
  bestChip.textContent=(best>0?(TR('RECORD')+'  '+fmt(best)):TR('AUCUN RECORD — À TOI DE JOUER'))+
    (bank()>0?('  ·  '+TR('COMPTE')+' '+fmtC(bank())):'')+
    ((SAVE.d.aura||0)>0?('  ·  ✦ '+(auraSansNom()?fmtAura(SAVE.d.aura||0):auraRankName())):'');
}
function commitName(){
  if(pendingScore==null)return;
  try{uiClic('');}catch(e){} // (2026-10-14, session SON) VALIDER son nom (bouton ou Entrée) était muet : l'appui principal, comme tout « valider »
  var nm=(nameInput.value||'').trim().toUpperCase().replace(/\s+/g,' ').slice(0,8);
  if(!nm)nm='???';
  SAVE.d.pseudo=nm;
  leaders.push({n:nm,s:pendingScore});
  leaders.sort(function(a,b){return b.s-a.s;});
  if(leaders.length>10)leaders.length=10;
  saveLeaders();
  best=Math.max(best,leaders[0].s); // (2026-09-28) jamais à la baisse : le record d'une partie abandonnée reste le record
  var idx=leaders.findIndex(function(e){return e.n===nm&&e.s===pendingScore;});
  pendingScore=null;nameEntry.style.display='none';goTxt.style.display='';nameInput.value='';
  nameInput.blur(); // on lâche le focus : ENTRÉE peut désormais REJOUER (sinon le champ avale la touche)
  renderLeaders(idx);
  paintMoney();
  elRecord.textContent=TR('record : ')+fmt(best);
  setBestChip();
}
nameSave.addEventListener('click',function(e){e.stopPropagation();commitName();});
nameEntry.addEventListener('click',function(e){e.stopPropagation();});
// ENTRÉE dans le champ nom : 1er appui = valider le nom · 2e appui (nom déjà validé) = REJOUER direct
nameInput.addEventListener('blur',function(){setTimeout(function(){try{scrollTo(0,0);}catch(e){}},60);}); // (2026-09-29) iOS laissait la page remontée après le clavier : REJOUER coupé en bas
nameInput.addEventListener('keydown',function(e){e.stopPropagation();if(e.code==='Enter'||e.key==='Enter'||e.keyCode===13){ /* (24/10, relecture) le clavier logiciel de l'iPhone peut laisser `code` vide : la touche Retour se lit aussi par `key` */e.preventDefault();if(pendingScore!=null)commitName();else if(gameOver)playViaGarage();}});
// (2026-09-28) le record MONTE en direct pendant la course (voir la boucle : `money>best`), même d'une partie abandonnée
// (RECOMMENCER/QUITTER) qui n'entre pas au Top 10. L'écraser par `leaders[0]` au chargement faisait redescendre le record
// après une relance — et « NOUVEAU RECORD ! » revenait à tort. On garde le plus haut des deux, ici comme à la signature.
best=Math.max(SAVE.d.best||0,leaders.length?leaders[0].s:0);
const mmCanvas=$('minimap'),mmCtx=mmCanvas.getContext('2d');
const mmBg=document.createElement('canvas');mmBg.width=mmCanvas.width;mmBg.height=mmCanvas.height;const mmBgCtx=mmBg.getContext('2d'); // calque STATIQUE : piste + portail pré-rendus une fois par zone (plus de ~240 segments/frame)
let mmMinX=0,mmMaxX=1,mmMinZ=0,mmMaxZ=1,mmSc=1,mmOx=0,mmOy=0;
const mmX=x=>mmOx+x*mmSc, mmY=z=>mmOy+z*mmSc; // repère carte partagé (compute + draw)
function computeMinimap(){
  if(!pts||!pts.length)return;
  let minX=1e9,maxX=-1e9,minZ=1e9,maxZ=-1e9;
  for(let i=0;i<NP;i++){const p=pts[i];if(p.x<minX)minX=p.x;if(p.x>maxX)maxX=p.x;if(p.z<minZ)minZ=p.z;if(p.z>maxZ)maxZ=p.z;}
  mmMinX=minX;mmMaxX=maxX;mmMinZ=minZ;mmMaxZ=maxZ;
  const W=mmCanvas.width,H=mmCanvas.height,m=12;
  const bw=(mmMaxX-mmMinX)||1,bh=(mmMaxZ-mmMinZ)||1;
  mmSc=Math.min((W-2*m)/bw,(H-2*m)/bh);
  mmOx=(W-bw*mmSc)/2-mmMinX*mmSc; mmOy=(H-bh*mmSc)/2-mmMinZ*mmSc;
  // PRÉ-RENDU du décor fixe (piste + portail) dans le calque hors-écran : blitté tel quel chaque frame
  const c=mmBgCtx;c.clearRect(0,0,W,H);
  c.strokeStyle='rgba(160,160,170,.9)';c.lineWidth=2;c.lineJoin='round';c.beginPath();
  const step=Math.max(1,Math.floor(NP/240));
  for(let i=0;i<NP;i+=step){const p=pts[i],cx=mmX(p.x),cy=mmY(p.z);if(i===0)c.moveTo(cx,cy);else c.lineTo(cx,cy);}
  c.stroke();
  const pe=pts[NP-1];c.fillStyle='#ff4fd8';c.beginPath();c.arc(mmX(pe.x),mmY(pe.z),3.6,0,7);c.fill(); // portail (fin de zone)
}
let msgT=0;
// TR() est appliqué ICI plutôt qu'aux ~40 points d'appel : une seule porte d'entrée pour tout ce qui
// s'affiche au centre de l'écran, et les phrases de saveur (tirées par pickL) passent par là aussi.
function showMsg(t,c){elMsg.textContent=TR(t);elMsg.style.color=c||'#ffd75e';elMsg.style.opacity=1;msgT=2.2;}
// LA JAUGE ROSE NE VIENT PLUS DES FIGURES (2026-07-30) : trop dur à remplir, et illisible (« pourquoi
// ça monte ? »). Elle mesure désormais UNE seule chose, limpide : le TEMPS DE BOOST TENU SANS LÂCHER
// (voir `styleFromBoost`). Les figures, elles, multiplient déjà le SCORE via chainVal/chainMult.
// addStyle() est conservée (elle est appelée d'une douzaine d'endroits) mais n'alimente plus la jauge.
function addStyle(n){}
/* ---- L'AURA SE GAGNE (2026-08-17) ------------------------------------------------------------
   Trois sources, et trois seulement — celles qui demandent du panache, jamais de la patience :
     1. LES FIGURES   : chaque maillon de chaîne, à sa valeur.
     2. LA VITESSE TENUE : pas la vitesse de pointe (elle se touche par accident en tombant) mais le
        fait de la MAINTENIR. D'où une accumulation par seconde, au carré de la part au-dessus du
        seuil : rouler à 95 % de sa vmax rapporte beaucoup plus que le double de 48 %.
     3. LES DÉCOLLAGES : le braquage, geste le plus engageant du jeu.
   ⚠ `auraRun` est le compteur de la PARTIE ; il ne part en persistant qu'à `endGame`. Créditer
   directement `SAVE.d.aura` ferait écrire sur le disque à chaque figure, et surtout garderait
   l'aura d'une partie qu'on n'a pas fini de jouer. */
/* ⚠ REFONTE (2026-08-18) — L'AURA NE COULE PLUS, ELLE ÉCLATE.
   1re version : une accumulation par seconde dès qu'on roulait vite. Verdict en jouant : « ça monte
   trop, ça augmente dès que je suis en mouvement ». Le défaut n'était pas le dosage mais la NATURE
   de la source — un robinet ouvert récompense le fait d'exister, pas le fait de bien jouer. On ne
   se souvient pas d'un robinet.
   L'aura ne vient donc plus QUE d'ÉVÉNEMENTS qu'on va chercher, et qui ont chacun un nom :
     · PURE SPEED  — tenir la nitro à fond, au sol, à plus de 400 km/h.
     · RÉCOLTE     — enchaîner les ramassages sans laisser retomber le combo.
     · COMBO       — enchaîner les FIGURES dans une fenêtre courte. C'est la grosse source.
   Chacun affiche son propre éclat : on doit pouvoir dire À VOIX HAUTE pourquoi on vient de gagner. */
let auraRun=0,auraPop=0,auraFlash=0,auraLastTxt='';
let figCombo=0,figComboT=0,figComboAura=0; // le COMBO DE FIGURES : compteur, fenêtre restante, cumul
/* LA VITESSE MULTIPLIE, ELLE NE PRODUIT PAS (2026-08-18).
   La question posée : « plus on va vite, plus on gagne d'aura, puisque plus on risque de perdre ? »
   Le principe est juste — la vitesse EST le risque — mais la 1re version en avait fait une SOURCE
   (tant d'aura par seconde au-dessus d'un seuil), et ça donnait exactement le robinet qu'on a
   supprimé : on était payé pour tenir la manette, pas pour jouer.
   La vitesse devient donc un MULTIPLICATEUR sur les événements. Réussir un combo à 900 km/h vaut
   plus que le même combo à 300, parce que c'est le même geste dans des conditions pires. Et ça ne
   se farme pas : sans événement, un compteur à fond ne rapporte toujours RIEN.
   ⚠ indexé sur `vmaxShow()` (la vmax du palier moteur), pas sur une valeur absolue : sinon la
   caisse de départ ne pourrait jamais y toucher et l'endgame l'aurait en permanence. */
function auraMultVitesse(){
  const vm=vmaxShow();if(!(vm>0))return 1;
  const part=Math.abs(vA)*3.6*SPD/vm;
  if(part<=.5)return 1;                       // moitié de sa vmax : régime normal, aucun bonus
  return 1+Math.min(1,(part-.5)/.5)*.85;      // jusqu'à ×1,85 à fond — sensible, jamais dominant
}
function addAura(n,titre,brut){ // brut : n est DÉJÀ multiplié par la vitesse (le DAUPHIN)
  // ⚠ RIEN EN FREESTYLE : le parc n'a pas de mort. Une monnaie de panache ne se gagne pas la ou
  // l'on ne risque rien — sinon le mode d'entrainement devient la meilleure facon de monter en rang.
  if(!(n>0)||!running||gameOver||(typeof PARK!=='undefined'&&PARK.on))return;
  n=(brut?Math.round(n):Math.round(n*auraMultVitesse()))*auraDragonK(); // (pouvoirs v2) AURA ×2
  auraRun+=n;livre('a:direct'+(titre?'.'+String(titre).split(' ')[0]:''),n);
  auraPop=Math.min(1,auraPop+n/90);
  if(titre){ // un gain NOMMÉ : il claque à l'écran, avec sa raison
    auraFlash=1;auraLastTxt=titre+' +'+n;
    trickMsg('✦ '+titre+'  +'+n,n>=250?3:2);
    try{chimeNote(noteP(Math.min(6,figCombo),1),0,.13,.20);}catch(e){}
  }
}
/* ===== L'AURA v2 — LA CHAÎNE (2026-09-26, user : « on ne voit pas le compteur d'aura ni clairement quelle figure rapporte combien
   de points ; invente tout un système avec des multiplicateurs quand tu enchaînes ») =====
   UNE chaîne, au sol comme en l'air. Chaque geste de style y entre avec SES points, écrits à l'écran (« 360° +45 ») ; chaque
   geste DIFFÉRENT ajoute ×1 au multiplicateur (plafond ×10) ; refaire le même rapporte 30 % de moins à chaque fois et ne fait
   pas monter le ×. La chaîne reste ouverte tant qu'on enchaîne : 3,5 s AU SOL pour placer le geste suivant, horloge GELÉE en
   l'air (le vol EST l'enchaînement). Quand le temps tombe, elle s'ENCAISSE d'un coup : points × multiplicateur, dans le compteur
   (en haut à droite, toujours visible). Exploser la chaîne ouverte = tout perdre. Barème (base, avant ×) :
     AIR : 180° de vrille +45 par demi-tour · BIG AIR +50 · AIR MONSTRE +110 · MÉTÉORE +100 · DAUPHIN +80 (+ ce qu'il monte en direct) · BUMP +30
     POSE : PARFAITE +70 · DIVINE +120 · GAP +120 · ARRACHÉE +120 · AU CHEVEU +220
     ROUTE : VIRAGE SERRÉ +45 · FRÔLÉ/SLALOM +20 · RASE-BORD +40 · MINI/SUPER/ULTRA TURBO +50/100/180 · RÉCOLTE +30 · PURE SPEED +120 */
/* (2026-10-01, Sacha : « rends parfait tout le gameplay : l'argent gagné, le flow, l'aura, le nitro ») LA CHAÎNE SE FERME.
   MESURÉ (LE GRAND LIVRE, pilote de mesure, 45 s) : sur la route comme dans la boucle décoller / se poser, AUCUNE chaîne n'était
   encaissée — la RÉCOLTE (toutes les 5 pièces), la RAFALE de fruits et les paliers de NITROOO (toutes les 2 s) relançaient les 3,5 s
   sans fin, et en vol l'horloge est gelée. Deux issues, toutes deux fausses : mourir chaîne ouverte = « AURA 0 » à l'écran de fin ;
   ou encaisser d'un coup une chaîne à ×10 gonflée par ces robinets (~100 points par seconde × 10 : un rang MYTHE en une minute).
   · LES ROBINETS SORTENT DE LA CHAÎNE (`rob`, 6e argument de chaineAura : RÉCOLTE, RAFALE, paliers de NITROOO, et la NAGE du dauphin —
     « DAUPHIN EN VOL ») : ce qui coule en continu tombe DIRECTEMENT dans le compteur, sans ×, sans relancer l'horloge. La chaîne ne
     porte plus que des GESTES (figure, drift, frôlé, fronde, pose…) : eux seuls la gardent en vie et font monter le ×. MESURÉ avec les
     robinets encore dans la chaîne (boucle de sauts au ras de la route, 0 mort) : 34 600 d'aura encaissée en 26 s — la nage du dauphin
     (4 100 points) multipliée par ×7 ; un rang MYTHE en 40 s.
   · LEUR TARIF EST RECALÉ sur leur fréquence d'aujourd'hui (LA LIGNE PARFAITE pose un fruit toutes les 2,4 s et tient la NITROOO) :
     RÉCOLTE 30 → 20 · RAFALE 40+30r → 15+6r · palier de NITROOO 60+40p → 15+8p. Mesuré avant : ces trois-là faisaient 76 % des points
     de chaîne de la route (5 300 sur 6 990 en 48 s), loin devant les gestes.
   · UNE CHAÎNE VIT `CHA_VIE` SECONDES AU PLUS (vol compris) : passé ce temps elle s'encaisse au sol — tout de suite si on roule, à la
     pose si on vole (exploser avant = perdue, la règle ne change pas). On ne joue plus toute une partie sur une seule chaîne : on
     risque au plus CHA_VIE secondes de gains, et le ×10 redevient un exploit (dix gestes différents en 25 s). */
const CHA={pts:0,x:0,fam:{},n:0,t:0,age:0,liste:[],v:0,vAff:-1,rec:0,recB:false,recP:-1,urg:false},CHA_FEN=3.5,CHA_XMAX=10,CHA_VIE=25;
let trkBigA=false,trkMonstre=false,virT=0,virPaye=false,virC=0,virD=false;
const avEl={};
function avE(id){return avEl[id]||(avEl[id]=document.getElementById(id));}
/* (2026-09-28, nuit — Sacha : « réduis la taille des HUD, c'est compliqué de voir la route ») l'échelle des ANNONCES (slam, verdict, geste sur la
   caisse) : un cran plus douce que celle du tableau de bord (--hudK, <style id="hudTaille">) — ce sont les moments de fête, ils restent gros,
   mais ne couvrent plus la caisse. Couché (l'ordi, un téléphone tourné) : plus petit encore. Même seuil que la media du paysage. */
/* (2026-09-29, 3e verdict — Sacha : « les textes de figure sont beaucoup trop gros et bloquent la vue ») encore un cran : .82/.72 → .60/.52 pour
   les annonces du couloir (BOOST, ×8 DÉMENT, +AURA, CHAÎNE PERDUE, IMPACT MÉTÉORE…), .72/.62 → .56/.48 pour les textes de figure. */
function annK(){return (VP.w>VP.h&&VP.h<=540)?.52:.60;}
/* (même nuit, Sacha : « c'est surtout les textes de figure et de MONSTRE qui dérangent ») les TEXTES DE FIGURE — le geste qui suit la caisse
   (popTexte) et le verdict de pose (MONSTRE, MÉTÉORE…) — un cran plus petits que les annonces : ils passent SUR la route, souvent. */
function figK(){return (VP.w>VP.h&&VP.h<=540)?.48:.56;}
function fmtAura(n){return Math.round(n).toLocaleString(LOC()).replace(/[  ]/g,' ');} // (2026-09-28) au format de la LANGUE (« 12,500 » en anglais), et des espaces que la police pixel sait dessiner
function sansAcc(t){return String(t).normalize('NFD').replace(/[̀-ͯ]/g,'');} // la police pixel n'a pas de capitales accentuées (« MÉTÉORE » s'afficherait « MéTéORE »)
/* (2026-09-29, Sacha : « liste des textes qui s'affichent au milieu de l'écran, il y en a trop » — il a rayé les n° 1 VIRAGE SERRÉ,
   2 FRÔLÉ, 4 PORTE, 5 RASE-BORD, 13 MINI/SUPER/ULTRA TURBO, 29 les pastilles sous le verdict). Le geste rapporte toujours son aura (le
   compteur en haut à gauche monte) ; il ne s'ÉCRIT plus au-dessus de la caisse. */
/* LA FRONDE (2026-09-30, Sacha : « trouve des moyens de rendre le jeu plus fun quand tu roules »). Mesuré au pilote auto (route-journal.js,
   moteur 8, 90 s au sol) : ~290 événements par minute, jamais plus de 2,5 s sans rien — la route ne manque pas d'ÉVÉNEMENTS. Ce qui manquait :
   que bien PILOTER rende de la VITESSE qu'on sent. Le VIRAGE SERRÉ (charge latérale > 32 tenue 0,9 s) ne rendait que de l'aura muette.
   Désormais, pris SANS GLISSER, il catapulte à la SORTIE (la charge retombe sous 12) : élan, flamme d'or, champ qui s'ouvre, son de fronde.
   Sa force monte avec la TENUE (0,9 → 2,7 s) et avec la CORDE (le temps passé sur la moitié intérieure du virage, au-delà de 20 % de la
   demi-route) : l'intérieur, c'est la ligne de course. Deux styles, deux paiements : le drift a son MINI-TURBO, l'adhérence sa FRONDE
   (un virage où l'on a glissé — drift, flaque — ne tire pas). Aucun texte au centre : l'aura passe par la chaîne muette. */
const FRONDE={on:true,dv:16,k0:.9,kT:1.8,corde:.6,cd:0,n:0,pMax:0};
function frondeLache(t,c){
  if(!FRONDE.on||introD||PARK.on||mode!=='drive'||FRONDE.cd>0||!(vA>8)||!running||gameOver)return;
  const k=THREE.MathUtils.clamp((t-FRONDE.k0)/FRONDE.kT,0,1),co=t>0?Math.min(1,c/t):0,p=(.4+.6*k)*(1+FRONDE.corde*co); /* 0,4 (tenu juste) → 1,6 (tenu long, à la corde) */
  vA+=FRONDE.dv*p;boost=Math.max(boost,.45+.45*p);momT=Math.min(4.3,momT+.6*p);nitroGain(.05+.07*p,'fronde'); /* un pad donne +18 : la fronde pleine en vaut une et demie */
  fovPunch=Math.max(fovPunch,5+6*p);shake=Math.max(shake,.1+.08*p);hap(p>1.1?[10,24,16]:[10,20]);
  flowAdd(4+6*p,'route');FRONDE.cd=.8;FRONDE.n++;FRONDE.pMax=Math.max(FRONDE.pMax,p);
  try{if(SONV2)sfx('fronde',{st:sonPd(Math.round(p*3))});else boostSnd(1+.2*p);}catch(e){}
  try{chaineAuraMuette('FRONDE',Math.round(30+40*p),'fronde',false,SONV2);}catch(e){}
  try{const sp9=CARS[level];for(const sd of [-1,1]){DRIFT_V.set(sd*sp9.w*.22,.43,-sp9.l*.5-.2);carGroup.localToWorld(DRIFT_V);sparkBurst(sparkGold,DRIFT_V,3+Math.round(3*p),7);}}catch(e){} /* la gerbe d'or aux pots : on la voit partir */
}
/* LE TRAIN DE BOOSTS (même demande) : les pads vivent sur trois voies (gauche, axe, droite) — les prendre TOUS, À LA SUITE, sans en rater
   un, pousse de plus en plus fort : +18 → +38 d'élan, la poussée dure plus longtemps, la plaque sonne un degré plus haut à chaque maillon
   (pentatonique), BOOST ×2, ×3… dans la MÊME annonce (pas de texte en plus). Un pad passé sans le prendre (à côté, ou survolé) casse le
   train : le suivant repart à ×1. Plafond de la poussée au 5e maillon ; le compte, lui, continue. */
const PADCH={on:true,n:0,sL:null,max:0};
function padTrain(sp){
  if(!PADCH.on)return 1;
  let rate=PADCH.sL==null||sp<PADCH.sL;
  if(!rate)for(let j=0;j<PADS.length;j++){const q=PADS[j];if(q>PADCH.sL+8&&q<sp-8){rate=true;break;}}
  PADCH.n=rate?1:PADCH.n+1;PADCH.sL=sp;if(PADCH.n>PADCH.max)PADCH.max=PADCH.n;
  return PADCH.n;
}
function chaineAuraMuette(nom,base,fam,brut,muet){const s9=CHA.sansPop;CHA.sansPop=true;try{return chaineAura(nom,base,fam,brut,muet);}finally{CHA.sansPop=s9;}}
function chaineAura(nom,base,fam,brut,muet,rob){ // rob : un ROBINET (récolte, rafale, palier de NITROOO, nage du dauphin) — payé au compteur, hors chaîne · brut : pas de décote de redite (les échelles qui grimpent déjà : vrilles, bumps) · muet : l'appelant sonne déjà (figure en vol, pose)
  if(!(base>0)||!running||gameOver||(typeof PARK!=='undefined'&&PARK.on))return 0;
  if(rob){ /* (2026-10-01) LE ROBINET : au compteur, tel quel — ni chaîne, ni ×, ni horloge (voir LA CHAÎNE SE FERME) */
    const p=Math.max(1,Math.round(base*auraDragonK()));auraRun+=p;livre('a:robinet.'+(fam||nom),p);auraPop=Math.min(1,auraPop+p/90);
    if(TCTL.on&&!CHA.sansPop&&!LEFIL.on)popTexte(sansAcc(TR(nom))+' +'+p,'#ffd75e',0); /* (LE FIL) un robinet est un flux : le compteur pulse (auraPop), rien ne s'écrit */
    if(!muet)try{chimeNote(noteP(1,1),0,.10,.16);}catch(e){}
    return p;}
  fam=fam||nom;const k=CHA.fam[fam]|0;CHA.fam[fam]=k+1;
  const p=Math.max(1,Math.round(base*(brut?1:Math.pow(.7,k))*auraDragonK())); // (pouvoirs v2) AURA ×2
  const x0=CHA.x;if(k===0)CHA.x=Math.min(CHA_XMAX,CHA.x+1);
  if(CHA.x>(runStats.xMax|0))runStats.xMax=CHA.x; // le meilleur × de la partie : l'écran de fin le montre
  if(!CHA.n)CHA.age=0;CHA.pts+=p;CHA.n++;CHA.t=CHA_FEN;livre('ab:'+fam,p);
  const lb9=sansAcc(TR(nom));CHA.liste.unshift(lb9+' +'+p);if(CHA.liste.length>2)CHA.liste.length=2; // (vague 2, H4) 2 lignes, la dernière en or : la mémoire de la chaîne, pas une 3e voix
  chaHud(true,CHA.x>x0);
  if(TCTL.on&&!CHA.sansPop)popTexte(lb9+' +'+p,CHA.x>x0?'#ff9ee6':'#ffd75e',0); // au-dessus de la caisse : le geste ET ce qu'il rapporte — (v5) sauf à la pose du dauphin : son récapitulatif parle seul
  if(!muet&&!(SONV2&&CHA.x>x0&&(CHA.x===5||CHA.x===8||CHA.x===10)))try{if(SONV2){if(mode==='fall')sfx('fig.maillon',{st:echSt()});else sfx('aura.geste',{st:sonPdAR(CHA.x)});}else chimeNote(noteP(Math.min(7,CHA.x),1),0,.10,.16);}catch(e){} // (console) en l'air, le geste prend l'échelle du vol ; au sol, la gamme de l'aura (marimba) — (2026-10-15) sonPdAR : ×10 jouait +24 (deux octaves), l'octave suffit
  if(pwrAurT>0)try{dragonJus();}catch(e){} // (fruit du dragon) chaque geste fait GICLER le fruit
  return p;
}
/* HUD v3 : LA GRANDE ANNONCE qui claque au centre haut (BOOST, pouvoirs, paliers du ×) — une seule à la fois, la dernière gagne */
function slam(txt,sous,c1,c2,taille,prio,fete){
  // (vague 2) l'annonce prend son tour dans la FILE DU COULOIR (hautPasse) : priorité 0 geste · 1 encaissement · 2 pouvoir · 3 impact ;
  // le compte à rebours de reprise (9) passe devant tout, sans attendre
  prio=prio|0;
  if(prio>=9){engBigCoupe();slamMontre(txt,sous,c1,c2,taille,fete);return;} // (la file garde ses cartes : elles passeront après la reprise ; la carte moteur, elle, a fini sa vie pendant la pause)
  hautPasse(function(){slamMontre(txt,sous,c1,c2,taille,fete);},1450,'slam',Math.min(3,prio));
}
function slamMontre(txt,sous,c1,c2,taille,fete){
  let e=avE('slam9');if(!e){e=document.createElement('div');e.id='slam9';e.setAttribute('aria-hidden','true');document.body.appendChild(e);avEl.slam9=e;}
  const t9=sansAcc(TR(txt)).replace(/[<>&"]/g,''),tl9=Math.min(Math.round((taille||36)*annK()),Math.floor((VP.w-28)*annK()/Math.max(1,t9.length))-2); // (HUD v4) police pixel = 1 em par lettre : l'annonce TIENT dans l'écran
  e.classList.remove('compte');
  e.innerHTML='<b style="font-size:'+tl9+'px" data-t="'+t9+'">'+t9+'</b>'+(sous?'<small>'+sansAcc(TR(sous)).replace(/[<>&]/g,'')+'</small>':''); // data-t : la LÈVRE claire en biseau (H9, voir le CSS)
  e.style.setProperty('--s1',c1||'#ffd75e');e.style.setProperty('--s2',c2||'#ff5ec8');
  e.classList.remove('on');void e.offsetWidth;e.classList.add('on');
  // (HUD v4) UNE voix au centre : tant que l'annonce passe, le niveau, le dauphin et les contrats du même couloir s'effacent
  document.body.classList.add('slamOn');clearTimeout(slam._h);slam._h=setTimeout(function(){document.body.classList.remove('slamOn');},1400);
  if(fete)setTimeout(function(){try{pixBurst(e.querySelector('b'),fete);}catch(x){}},140); // (2026-09-26) les annonces HEUREUSES éclatent en confettis pixel
}
function flashEcran(col){ // un coup de couleur sur les bords : le boost, le pouvoir, le gros encaissement
  /* (2026-09-30) « RÉDUIRE LES ANIMATIONS » (iOS) : 33 appels passent par ici — pouvoirs, cratère, record, pulsations de NITROOO toutes les
     0,62 s, rentrée d'orbite toutes les 0,45 s… Sous REDUCED_MOTION : UN coup par seconde au plus, et jamais plus de 40 % d'opacité
     (l'alpha de la couleur est plafonné). Rien ne change quand l'option est éteinte. */
  if(REDUCED_MOTION){const n=performance.now();if(n-(flashEcran._t||-1e9)<1000)return;flashEcran._t=n;
    col=String(col).replace(/rgba?\(([^,]+),([^,]+),([^,)]+)(?:,([^)]+))?\)/,function(m,r,g,b,a){return 'rgba('+r+','+g+','+b+','+Math.min(.4,a==null||!isFinite(+a)?1:+a)+')';});}
  let e=avE('flash9');if(!e){e=document.createElement('div');e.id='flash9';e.setAttribute('aria-hidden','true');document.body.appendChild(e);avEl.flash9=e;}
  /* (2026-10-14, OPTIMISATION — profil d'une course : 36 ms de « mise en page forcée » en 8 s de NITROOO, une toutes les 0,62 s) relancer
     l'animation en ALTERNANT deux animations identiques (flash9 / flash9b) au lieu de `void offsetWidth` : même coup de couleur, à la même
     image, sans recalcul synchrone de toute la page. */
  e.style.setProperty('--ff',col);if(e._vu)return;e._vu=1;Promise.resolve().then(function(){e._vu=0;}); // deux appels dans la même tâche = UNE relance (comme avant)
  const a9=e.classList.contains('on');e.classList.remove(a9?'on':'on2');e.classList.add(a9?'on2':'on');
}
/* ===== (vague 3, 2026-09-27) LE VERDICT DE POSE SUR TÉLÉPHONE — user : « rajoute les textes monster et tout » =====
   `trickMsg` écrit dans #trickBox, que l'ÉCRAN NU masque : sur téléphone, MONSTRE / DOUBLE / TRIPLE MONSTRE ne se
   lisaient plus — l'annonceur les criait dans le vide. `trickMsg` reste LE point d'entrée (aucune ligne d'appel touchée) : sur
   téléphone, il remet ses textes ici.
   · UN LOT PAR IMAGE : la pose appelle trickMsg plusieurs fois dans la même image (PILE AU CENTRE, À RECULONS, FACE CACHÉE ×2, puis le
     verdict) — on les ramasse et on les solde en fin de tâche (microtâche) : UNE carte, le verdict en titre, les bonus en pastilles ;
   · UN GESTE = UN TEXTE : ce que le texte sur la caisse dit déjà (PARFAIT, DIVIN, AU CHEVEU, les figures en vol et leurs points
     d'aura, la RAFALE) ne se répète pas ici ; le portail, le moteur, les pouvoirs ont leur propre voix. Montent au couloir :
     le verdict de pose et ses bonus, et la voiture de police qui saute ;
   · UNE VOIX AU CENTRE : la carte passe par la file du couloir (`hautPasse`, famille « ver ») — le rang fixe la priorité ;
   · le montant est LU dans le texte du verdict (jamais recalculé ici : l'économie reste seule maîtresse des chiffres) ;
   · le texte TIENT dans 84 % de l'écran (police pixel : 1 em par lettre + l'interlettrage). */
const VERD={buf:[],pend:false,el:null,h:0,t:0};
const VERD_DEF=[ // [texte de l'annonceur, rang, mot du dessus, mot du rang, couleur] — du plus long au plus court
  ['TRIPLE MONSTRE',3,'TRIPLE','MONSTRE','#ffd75e'],['DOUBLE MONSTRE',2,'DOUBLE','MONSTRE','#ff3ec8'],
  ['MONSTRE',1,'','MONSTRE','#5ee6ff']];
const VERD_TAG=[[/^FACE CACH/,'#ffd75e'],[/^PILE AU CENTRE/,'#5ee6ff']];   // les bonus de pose (pastilles)
const VERD_SEUL=[[/^💥 /,'#ff3b5c',1]]; /* (2026-09-29) reconnu par l'emoji : « IS TOAST! » en anglais */                         // les cartes simples [motif, couleur, priorité]
const VERD_TAILLE=[22,30,34,38,40,44]; // le mot du rang (px) : carte simple · MONSTRE < DOUBLE < TRIPLE — plafonné par la largeur
HAUT_MIN.ver=700; // le temps de lecture garanti d'un verdict (le mot, puis le montant)
HAUT_COUPE.ver=function(){if(VERD.el)VERD.el.classList.remove('on');document.body.classList.remove('verdOn');clearTimeout(VERD.t);};
Object.assign(I18N,{'MONSTRE':'MONSTER','METEORE':'METEOR','POSÉ LOURD':'HEAVY LANDING'});
function verdNet(t){ // traduit, sans emoji (la police pixel n'en a pas), sans la vanne après le tiret, sans capitale accentuée
  return sansAcc(String(TR(t)).replace(/[\u2190-\u2BFF\uD83C-\uDBFF\uDC00-\uDFFF\uFE0F]/g,'').split(' — ')[0]).replace(/[<>&"]/g,'').trim();
}
function verdPousse(txt,tier){VERD.buf.push(String(txt));if(!VERD.pend){VERD.pend=true;Promise.resolve().then(verdSolde);}}
function verdSolde(){
  VERD.pend=false;const b=VERD.buf;VERD.buf=[];
  if(!running||gameOver||mode==='boom')return;
  let v=null,seul=null;const tags=[];
  for(const t of b){
    const i=t.lastIndexOf('  +'),tete=(i>=0?t.slice(0,i):t).trim(); // le verdict : [grade] + mot de l'annonceur + « ␣␣+ » + montant
    const d=VERD_DEF.find(function(q){return tete===q[0]||tete.endsWith(' '+q[0]);});
    if(d){v={d:d,mt:i>=0?t.slice(i+3).trim():'',lourd:/LOURD/.test(tete)};continue;}
    const g=VERD_TAG.find(function(q){return q[0].test(t);});if(g){tags.push([verdNet(t),g[1]]);continue;}
    const s=VERD_SEUL.find(function(q){return q[0].test(t);});if(s&&!seul)seul=[verdNet(t),s[1],s[2]];
  }
  tags.length=0; // (2026-09-29, Sacha) plus de pastilles FACE CACHÉE ×2 / PILE AU CENTRE / POSÉ LOURD : le verdict parle seul
  if(v){verdMontre(v.d[2],v.d[3],v.d[4],v.d[1],v.mt,tags,0);} // PARFAIT / DIVIN : c'est le texte sur la caisse qui le dit
  else if(tags.length)verdMontre('',tags[0][0],tags[0][1],0,'',tags.slice(1),0);
  else if(seul)verdMontre('',seul[0],seul[1],0,'',[],seul[2]);
}
function verdMontre(l1,l2,col,rang,mt,tags,pS){
  hautPasse(function(){verdAffiche(l1,l2,col,rang,mt,tags);},rang?1400:1100,'ver',rang?(rang>=5?3:rang>=3?2:1):pS,rang?{ttl:1600}:null); // un verdict attend jusqu'à 1,6 s (une carte de défi en cours) : « +$ » se lit encore juste après la pose
}
function verdAffiche(l1,l2,col,rang,mt,tags){
  let e=VERD.el;
  if(!e){e=VERD.el=document.createElement('div');e.id='verdHud';e.setAttribute('aria-hidden','true');document.body.appendChild(e);}
  const W=VP.w*.84,fit=function(t,max,ls){return Math.max(10,Math.min(max,Math.floor(W/Math.max(1,t.length))-ls));},
    T1=l1?verdNet(l1):'',T2=verdNet(l2),base=Math.round((VERD_TAILLE[rang]||22)*Math.max(.8,Math.min(1,VP.h/800))*figK()); // écran court (SE) : un cran plus petit, la caisse reste libre
  let h='';
  if(T1)h+='<b class="vK" style="font-size:'+fit(T1,Math.round(base*.56),2)+'px" data-t="'+T1+'">'+T1+'</b>';
  h+='<b class="vT" style="font-size:'+fit(T2,base,2)+'px" data-t="'+T2+'">'+T2+'</b>';
  if(mt){const m='+'+String(mt).replace(/[<>&"]/g,'');h+='<em class="vM" style="font-size:'+fit(m,Math.round((rang>=3?20:18)*figK()),1)+'px">'+m+'</em>';}
  if(tags.length)h+='<span class="vTags">'+tags.map(function(g){return '<i style="--tc:'+g[1]+'">'+g[0]+'</i>';}).join('')+'</span>';
  e.innerHTML=h;e.style.setProperty('--vc',col);e.dataset.r=rang;
  e.classList.remove('on');void e.offsetWidth;e.classList.add('on');
  VERD.h=e.offsetHeight; // lu UNE fois par verdict : le geste sur la caisse se pose dessous (popSuit)
  document.body.classList.add('verdOn');clearTimeout(VERD.t);VERD.t=setTimeout(function(){document.body.classList.remove('verdOn');},rang?1350:1050);
  if(rang>=3)setTimeout(function(){try{pixBurst(e.querySelector('.vT'),rang>=5?12:rang>=4?10:8);}catch(x){}},120); // les gros rangs éclatent en confettis
}
// (2026-09-28, HUD v5) l'échelle du × de chaîne est CELLE DES SHIFT LIGHTS du flow : blanc, cyan, or, rose, violet, puis le rouge du feu
// (le vert, couleur de l'ARGENT, ne dit plus « ×3 »)
const X_COUL=['#dfeeff','#dfeeff','#35e6ff','#ffc93a','#ff4fc2','#9b6bff','#ff3924','#ff3924','#ff3924','#ff3924','#ff3924'];
const ENG_V9=new THREE.Vector3();
/* (2026-09-28, user : « le moteur doit apparaître au niveau de la voiture, au-dessus, et donner l'impression de rétrécir et de rentrer
   dans le capot ») LA CARTE SUIT LA CAISSE. Le capot (repère de la caisse, `userData.capot`) et le haut de la caisse sont projetés à
   l'écran à chaque image ; le moteur flotte juste AU-DESSUS (le titre et le nom au-dessus de lui : le capot reste visible avant la plongée), suit la voiture au sol comme en vol
   (lissé : les secousses de caméra ne font pas trembler les textes), et reste dans l'écran. À la plongée, le moteur fonce vers le
   CAPOT en accélérant, rétrécit à 10 %, tourne de plus en plus vite (la scène d'atelier, armée pour ça), et tout ce qui passe sous la
   ligne du capot s'efface (`uClipY`) : il s'enfonce dans la tôle. Les textes, eux, s'effacent au début de la plongée. */
const ENG_V8=new THREE.Vector3();
/* ===== LA CARTE MOTEUR ET LE GESTE SUIVENT LA CAISSE EN TRANSFORM (2026-10-24, passe perf PC : « le HUD prend trop de capacité ») =====
   engBigSuit et popSuit écrivaient left/top à CHAQUE image où la caisse bouge d'un pixel (950 ms par geste, toute la carte moteur) : une
   mise en page + une peinture par image. Sous html.han (sauf ?hudanim=0), left/top sont posés à 0 une fois et la place exacte (les mêmes
   pixels entiers) passe par la propriété `translate`, qui se compose AVANT le `transform` des animations (translate(-50%) scale…) :
   même image, sans mise en page. */
const PCF_HAN_SUIT=document.documentElement.classList.contains('han');
/* left/top sont arrondis au pixel PHYSIQUE par la mise en page (Chrome compte en pixels d'écran : 422 px × 3,072 = 1296,4 → 1296), une
   translation non : on arrondit pareil, sinon le texte glisse d'une fraction de pixel (vu à la preuve du chef, densité 3,07). */
function pcfHanPlace(el,l9,t9,o){const v9=l9+' '+t9;if(o._hv===v9&&el.style.left==='0px')return;o._hv=v9;
  const k9=window.devicePixelRatio||1,a9=function(s){return Math.round(parseFloat(s)*k9)/k9+'px';};
  if(el.style.left!=='0px')el.style.left='0px';if(el.style.top!=='0px')el.style.top='0px';el.style.translate=a9(l9)+' '+a9(t9);}
/* banc (dev) : `dbgPcfSuit(el,'412px','180px')` pose un élément comme popSuit / engBigSuit le feraient (translate sous html.han, left/top sinon) */
window.dbgPcfSuit=function(el,l9,t9){if(PCF_HAN_SUIT)pcfHanPlace(el,l9,t9,{});else{el.style.left=l9;el.style.top=t9;}return PCF_HAN_SUIT?'translate':'left/top';};
function engBigSuit(){ // le moteur 3D de la carte : OÙ le recoller dans l'image, à quelle taille, avec quelle opacité (lu par engQuadDraw)
  if(!engBig.on){ENG_Q.op=0;return;}
  const n=performance.now(),t=n-engBig.t0,RM=REDUCED_MOTION;
  // le CAPOT et le HAUT DE LA CAISSE à l'écran
  const cp=carGroup.userData.capot||[0,1,1.2];
  ENG_V9.set(cp[0],cp[1],cp[2]).applyMatrix4(carGroup.matrixWorld).project(camera);
  const hx=(ENG_V9.x*.5+.5)*VP.w,hy=(-ENG_V9.y*.5+.5)*VP.h;engBig.hx=hx;engBig.hy=hy;
  ENG_V8.copy(carGroup.position).addScaledVector(camera.up,1.9).project(camera);
  const yHaut=Math.min(hy,(-ENG_V8.y*.5+.5)*VP.h);
  // (v5) le MOTEUR POSÉ SUR LE TOIT : le bas de sa silhouette (~1,25 × la hauteur de la scène) effleure la caisse ; l'étiquette et le nom
  // au-dessus de lui ; la carte suit la voiture partout (au sol, en vol), bornée seulement par les bords de l'écran — plus par le couloir
  // des annonces, qui la faisait flotter haut au milieu de la route
  const S=engBig.s||1,hC=(engBig.hC||104)*S,wC=(engBig.wC||150)*S;
  const yS=yHaut-(engBig.ph||75)*.42;
  let cx=THREE.MathUtils.clamp(hx,wC/2+8,VP.w-wC/2-8),cy=Math.max(hC/2+8,yS-(engBig.ry||0)*S);
  if(engBig.sx==null||engBig.plonge){if(engBig.sx==null){engBig.sx=cx;engBig.sy=cy;}}
  else{const k9=Math.min(1,(n-(engBig._n||n))/1000*14);engBig.sx+=(cx-engBig.sx)*k9;engBig.sy+=(cy-engBig.sy)*k9;}
  engBig._n=n;
  const el=engBig.el;if(el&&!engBig.plonge){const l9=engBig.sx.toFixed(0)+'px',t9=engBig.sy.toFixed(0)+'px';
    if(PCF_HAN_SUIT)pcfHanPlace(el,l9,t9,engBig);else{if(el.style.left!==l9)el.style.left=l9;if(el.style.top!==t9)el.style.top=t9;}} // (perf) on n'écrit que ce qui a bougé d'un pixel
  let s=1,op=1,x=engBig.sx+(engBig.rx||0)*S,y=engBig.sy+(engBig.ry||0)*S;
  if(t<220&&!RM){const u=t/220,e=1-(1-u)*(1-u)*(1-u);s=.55+.45*e;op=Math.min(1,u*6);} // l'entrée — (v5.1) opaque en 40 ms, il GRANDIT depuis la caisse : le fondu depuis le transparent se lisait « fantôme gris » sur les captures
  ENG_Q.fl=RM?0:Math.max(0,1-t/260); // (v4) l'éclat d'apparition (lu par engQuadDraw)
  if(!RM&&!engBig.plonge)y+=Math.sin(t*.0041)*3; // il FLOTTE au-dessus de la caisse (±3 px, un souffle d'1,5 s)
  let clip=-1;
  if(engBig.plonge){ // LA PLONGÉE : vers le CAPOT, en accélérant, en rétrécissant — et il s'enfonce sous la ligne du capot
    const u=Math.min(1,(n-engBig.plonge)/ENG_PLONGE),e=u*u;
    x+=(hx-x)*e;y+=(hy-y)*e;s*=1-.9*e;op*=RM?0:1-Math.max(0,(u-.9)/.1);
    if(!RM&&u>.15)clip=Math.max(0,(VP.h-hy)*curDPR); // sous la ligne du capot : dans la tôle
  }
  engCarteMat.userData.uClip.value=clip;
  ENG_Q.x=x;ENG_Q.y=y;ENG_Q.w=engBig.pw*s*ENG_QK;ENG_Q.h=engBig.ph*s*ENG_QK;ENG_Q.op=op;
}
function laneY(){ // où tombe le couloir des annonces (--laneA, safe area comprise) — relu seulement quand la hauteur d'écran change
  if(!laneY.v||laneY.h!==VP.h){laneY.h=VP.h;let p=avE('laneProbe');
    if(!p){p=document.createElement('div');p.id='laneProbe';p.style.cssText='position:fixed;left:0;top:var(--laneA);width:0;height:0;visibility:hidden;pointer-events:none';document.body.appendChild(p);avEl.laneProbe=p;}
    laneY.v=p.getBoundingClientRect().top||VP.h*.4;}
  return laneY.v;
}
const POP_V9=new THREE.Vector3();
function popSuit(){ // (HUD v4) le geste JAILLIT DE LA CAISSE : tant que le texte vit, il suit la voiture à l'écran — au sol comme en vol
  if(!(performance.now()<(popTexte._s||0)+950))return;const e=avE('popTxt');if(!e)return;
  const la=laneY();
  // AU-DESSUS de la caisse s'il y a la place sous le couloir des annonces (au sol, toujours) ; sinon DESSOUS (en vol, la caméra
  // centre la caisse : au-dessus, le geste se posait sur l'annonce)
  POP_V9.copy(carGroup.position).addScaledVector(camera.up,2.6).project(camera);const yH=(-POP_V9.y*.5+.5)*VP.h,xC=(POP_V9.x*.5+.5)*VP.w; // le TOIT de la caisse à l'écran
  POP_V9.copy(carGroup.position).addScaledVector(camera.up,-1.4).project(camera);const yB=(-POP_V9.y*.5+.5)*VP.h;  // son bas de caisse
  const mini=la+(HAUT.cur&&performance.now()<HAUT.fin?(HAUT.cur.k==='ver'?Math.max(64,VERD.h-44):64):34); // (vague 2) une voix occupe le couloir (annonce, niveau, défi) : le geste se pose plus bas · (vague 3) sous le VERDICT, plus haut qu'une annonce
  /* (2026-09-29, Sacha : « les textes de figure bloquent la vue ») EN VOL, le dessous de la caisse, c'est la RÉCEPTION qu'on vise : le geste ne s'y
     pose plus. Pas la place au-dessus (une annonce occupe le couloir) → il s'efface : la liste des figures, à gauche, le garde. Au sol : comme avant. */
  const vol9=mode==='fall',haut9=yH-56>=mini;if(vol9!==!!popSuit._v||haut9!==!!popSuit._h){popSuit._v=vol9;popSuit._h=haut9;e.classList.toggle('cache',vol9&&!haut9);}
  const y=haut9?Math.min(yH-56,VP.h*.64):THREE.MathUtils.clamp(yB+24,mini,VP.h*.74);
  const t9=y.toFixed(0)+'px';if(!PCF_HAN_SUIT&&e.style.top!==t9)e.style.top=t9; // (perf) on n'écrit que ce qui a bougé d'un pixel
  // (vague 2, H5) il suit aussi la caisse en LARGEUR, mais borné : « AUPHIN EN VOL +8 » sortait de l'écran par la gauche
  const hw=(popTexte._w||0)*.58+8,x=Math.max(hw,Math.min(VP.w-hw,xC)),l9=x.toFixed(0)+'px';if(PCF_HAN_SUIT)pcfHanPlace(e,l9,t9,popSuit);else if(e.style.left!==l9)e.style.left=l9; // .58 : le rebond d'entrée (×1,15) compris
}
/* (HUD v4) LE RECORD À BATTRE — la meilleure partie (SAVE.d.auraMax) s'affiche sous le compteur, avec sa jauge : on la voit se
   remplir, elle BAT à 85 %, et le jour où on la dépasse EN COURSE, le jeu le crie (une fois par partie). C'est le « encore une ». */
function recInit(){CHA.rec=SAVE.d.auraMax||0;CHA.recB=false;CHA.recP=-1;
  const r=avE('avRec');if(!r)return;r.className=CHA.rec>0?'':'vide';
  avE('avRecT').textContent=TR('RECORD')+' '+fmtAura(CHA.rec);avE('avRecF').style.setProperty('--r','0');}
function recMaj(a){
  if(!(CHA.rec>0)||CHA.recB)return;const p=Math.min(1,a/CHA.rec),p2=Math.round(p*100);if(p2===CHA.recP)return;CHA.recP=p2;
  avE('avRecF').style.setProperty('--r',p.toFixed(2));avE('avRec').classList.toggle('presque',p>=.85);
  // (HUD v5) À PORTÉE, la ligne ne dit plus le record : elle dit ce qu'il MANQUE — « ENCORE 120 » (le crochet qui fait tenter le coup)
  avE('avRecT').textContent=p>=.85?TR('ENCORE')+' '+fmtAura(Math.max(0,Math.ceil(CHA.rec-a))):TR('RECORD')+' '+fmtAura(CHA.rec);
}
function recBattu(){
  CHA.recB=true;const r=avE('avRec');
  // (vague 2, H3) « NOUVEAU RECORD ! » voulait dire trois choses (l'aura, le meilleur palier, l'écran de mort) : ici, seule l'ANNONCE
  // crie « RECORD BATTU » ; la ligne du tableau de bord devient ce qu'on a DE PLUS que le record, et elle grimpe avec le compteur
  if(r){r.classList.remove('presque');r.classList.add('battu');recSurplus(CHA.vAff|0);avE('avRecF').style.setProperty('--r','1');}
  // l'annonce passe par la file (priorité 3) — à moins d'une seconde d'une carte MOTEUR, elle devient son ruban (hautFusion)
  const f9=function(){slamMontre('RECORD BATTU !','AURA '+fmtAura(auraRun),'#ffd75e','#ff7ad5',38,30);if(SONV2)sfx('aura.record');}; // (console de son) le son part quand la carte S'AFFICHE…
  hautPasse(f9,1450,'rec',3,{ru:'AURA '+fmtAura(auraRun)});
  if(SONV2&&!(HAUT.cur&&HAUT.cur.f===f9)&&!HAUT.q.some(function(w){return w.f===f9;}))sfx('aura.record'); // …sauf si elle a FUSIONNÉ dans la carte MOTEUR (hautFusion) : jamais montrée seule, elle sonne maintenant
  flashEcran('rgba(255,215,94,.5)');hap([20,50,20,50,40]);
  if(!SONV2)try{chimeNote(noteP(4,1),0,.12,.2);chimeNote(noteP(6,1),.1,.12,.2);chimeNote(noteP(8,1),.2,.14,.4);}catch(e){} /* (console) aura.record, joué avec la carte */
}
function recSurplus(a){const t=avE('avRecT');if(!t)return;const s='+'+fmtAura(Math.max(0,a-CHA.rec))+' '+TR('AU-DESSUS');if(t.textContent!==s)t.textContent=s;}
// (vague 2) les libellés neufs du HUD de course (police pixel : capitales SANS accent)
Object.assign(I18N,{'NOUVEAU SOMMET':'NEW PEAK','AU-DESSUS':'ABOVE','ASTUCE':'TIP'});
Object.assign(I18N,{'AU PIED DES TOURS':'AT THE FOOT OF THE TOWERS','IL PLEUT ENTRE LES VILLES':'RAIN BETWEEN THE CITIES','VILLE VITRÉE':'GLASS CITY','LE CIEL DANS LES VITRES':'THE SKY IN THE GLASS','REFLETS DORES':'GOLDEN REFLECTIONS','LES TOURS S EMBRASENT':'THE TOWERS CATCH FIRE','LES BUREAUX BRILLENT':'THE OFFICES GLOW'}); // (2026-10-17) LA VILLE VITRÉE
Object.assign(I18N,{'NOUVEL ATH !':'NEW ATH!','JACKPOT !':'JACKPOT!','CRYPTOCITY':'CRYPTOCITY','CRYPTO CITY':'CRYPTO CITY','BULL RUN':'BULL RUN','LA VILLE NE DORT JAMAIS':'THE CITY NEVER SLEEPS'}); // (2026-10-13) CRYPTOCITY — (2026-10-15) CRYPTO CITY, une map du tirage
Object.assign(I18N,{'PLUIE DE BILLETS':'CASH RAIN','AIMANT À PIÈCES':'COIN MAGNET','CAISSE EN FEU':'CAR ON FIRE'}); // (2026-09-30) les capacités moteur, dans le titre de la carte
function avPlusPop(t){const e=avE('avPlus');if(!e)return;e.textContent=t;e.classList.remove('on');void e.offsetWidth;e.classList.add('on');}
/* LE HUD DISCRET — la veille des plaques qui DURENT (voir hudDA §9, repris de Léo) : présente depuis plus de 3 s → `.discret` ; cachée →
   remise à zéro ; `hudReveil(id)` = un événement fort, elle se rallume et repart pour 3 s. Lecture de classes seulement (aucune mise en
   page forcée), à chaque image. */
const HUDD={DUREE:3000,L:[
  {id:'avCh',el:function(){return avE('avCh');},vu:function(e){return e.classList.contains('on');}},
  {id:'pwrChip',el:function(){return typeof pwrChip!=='undefined'?pwrChip:null;},vu:function(e){return e.style.display==='block';},
    fort:function(){return !!(loop._pwEl&&loop._pwEl.some(function(x){return x._f;}));}}, // la fin d'un pouvoir clignote EN PLEIN
  {id:'campChip',el:function(){return document.getElementById('campChip');},vu:function(e){return e.classList.contains('on');},
    fort:function(e){return e.classList.contains('alerte');}}]};
function hudDiscretTick(){const now=performance.now();
  for(const x of HUDD.L){const e=x.el();if(!e)continue;
    if(!x.vu(e)){if(x.t0){x.t0=0;e.classList.remove('discret');}continue;}
    if(!x.t0)x.t0=now;
    const d=now-x.t0>HUDD.DUREE&&!(x.fort&&x.fort(e));if(d!==e.classList.contains('discret'))e.classList.toggle('discret',d);}}
function hudReveil(id){for(const x of HUDD.L)if(x.id===id&&x.t0){x.t0=performance.now();const e=x.el();if(e)e.classList.remove('discret');}}
function chaineTick(dt){
  hudDiscretTick(); // (2026-09-30) LE HUD DISCRET (repris de Léo)
  engBigSuit();popSuit();
  // le COMPTEUR : il grimpe vers la vraie valeur (on voit l'aura TOMBER dedans), une écriture DOM seulement quand le chiffre change
  CHA.v+=(auraRun-CHA.v)*Math.min(1,dt*7);if(Math.abs(auraRun-CHA.v)<1)CHA.v=auraRun;
  const a9=Math.round(CHA.v);if(a9!==CHA.vAff){CHA.vAff=a9;const e9=avE('avVal');if(e9){const t9=fmtAura(a9);e9.textContent=t9;const n9=t9.length>=8?'l2':t9.length>=6?'l1':'';if(e9.dataset.l!==n9)e9.dataset.l=n9;}recMaj(a9);if(CHA.recB)recSurplus(a9);} // (2026-09-28) data-l : le compteur resserre son corps quand le nombre s'allonge (il passait à la ligne : « 1 » puis « 418 »)
  if(!CHA.recB&&CHA.rec>0&&auraRun>CHA.rec&&running&&!gameOver&&!TUTO.on)recBattu(); // (2026-09-29) pas de « RECORD BATTU » pendant la leçon
  if(!CHA.n)return;
  if(mode!=='fall'&&mode!=='boom')CHA.t-=dt; // en l'air, l'horloge est GELÉE
  CHA.age+=dt; // (2026-10-01) l'âge de la chaîne, lui, court partout
  if(CHA.t<=0||(CHA.age>=CHA_VIE&&mode==='drive')){chaineEncaisse();return;}
  const b9=avE('avBarF');if(b9){const s9='scaleX('+(mode==='fall'?1:Math.max(0,CHA.t/CHA_FEN)).toFixed(3)+')';if(b9._tf!==s9){b9._tf=s9;b9.style.transform=s9;}} // (2026-10-14, passe perf mobile) écrite seulement quand elle change (en l'air elle est figée à 1 : plus une écriture de style par image)
  const u9=mode!=='fall'&&CHA.t<1.1;if(u9!==CHA.urg){CHA.urg=u9;if(b9&&b9.parentNode)b9.parentNode.classList.toggle('urg',u9);} // la dernière seconde : la barre rougit et clignote
}
function chaineEncaisse(){
  const g=Math.round(CHA.pts*Math.max(1,CHA.x));
  if(g>0&&running&&!gameOver){
    auraRun+=g;livre('a:chaine',g);auraPop=Math.min(1,auraPop+g/90);
    // (HUD v4) la chaîne S'ENVOLE dans le compteur, ce qu'elle verse s'affiche à côté ; une grosse chaîne prend aussi le couloir
    avPlusPop('+'+fmtAura(g));{const c9=avE('avCh');if(c9){c9.classList.remove('vole','perdu');void c9.offsetWidth;c9.classList.add('vole');}}
    /* (2026-10-15, Sacha : « enlève les inscriptions qui se mettent au milieu de l'écran, comme + 2000 AURA, qui est écrit ailleurs de toute façon ») plus de
       « +X AURA » au centre : la chaîne s'envole dans le compteur et « +X » s'écrit à côté (avPlusPop) — le son, l'éclaboussure et le flash restent */
    const t9=document.querySelector('#auraV2 .avTot');if(t9){t9.classList.remove('pulse');void t9.offsetWidth;t9.classList.add('pulse');}
    if(g>=300)try{pixBurst(avE('avVal'),Math.min(14,4+Math.round(g/250)));}catch(e){} // (2026-09-26) la chaîne tombe DANS le compteur : il éclabousse
    if(g>=500)flashEcran('rgba(177,75,255,.5)');
    hap(CHA.x>=4?[12,30,24]:12);try{if(SONV2)sfx(g>=2000?'aura.encaisse3':g>=600?'aura.encaisse2':'aura.encaisse1',{vol:2});else{ /* (2026-10-14, session SON) +2 : l'encaissement (−30/−28/−26) était conçu 4 dB au-dessus de la pièce ; depuis son +4 le petit encaissement sonnait AU NIVEAU d'une pièce (−30) */chimeNote(noteP(Math.min(9,CHA.x+2),1),0,.18,.22);if(CHA.x>=4)sparkle(.1,.08);
      // (2026-09-26, audit son) une chaîne ×10 à 3 000 sonnait comme un +45 : l'accord s'étoffe avec la somme
      if(g>=600)chimeNote(noteP(Math.min(10,CHA.x+4),1),.07,.14,.26);
      if(g>=2000){chimeNote(noteP(Math.min(10,CHA.x+6),1),.14,.14,.34);sparkle(.14,.1);}}}catch(e){} /* (console) aura.encaisse1/2/3 */
  }
  chaReset();
}
function chainePerdue(parMort){ // exploser la chaîne ouverte : tout part avec la caisse · parMort : appelée par explode (l'explosion couvre tout)
  if(!CHA.n)return;const g=Math.round(CHA.pts*Math.max(1,CHA.x));
  if(SONV2&&!parMort)sfx('aura.perdue'); // (console de son)
  slam('CHAÎNE PERDUE','-'+fmtAura(g)+' AURA','#ff5e7a','#b0102a',24,2); // (HUD v4) elle se BRISE sous les yeux, et le couloir dit combien — (2026-09-29) 30 → 24
  {const c9=avE('avCh');if(c9){c9.classList.remove('vole','perdu');void c9.offsetWidth;c9.classList.add('perdu');}}chaReset();
}
function chaReset(){CHA.pts=0;CHA.x=0;CHA.fam={};CHA.n=0;CHA.t=0;CHA.age=0;CHA.liste.length=0;if(CHA.urg){CHA.urg=false;const b9=avE('avBarF');if(b9&&b9.parentNode)b9.parentNode.classList.remove('urg');}chaHud(true,false);}
function chaHud(fort,monte){
  const ch=avE('avCh');if(!ch)return;if(CHA.n>0)ch.classList.remove('vole','perdu');ch.classList.toggle('on',CHA.n>0);
  if(!fort||!CHA.n)return;
  avE('avPts').textContent=fmtAura(CHA.pts);
  const x9=avE('avX'),xv=Math.max(1,CHA.x);x9.textContent='×'+xv;x9.style.setProperty('--xc',X_COUL[Math.min(10,xv)]);x9.classList.toggle('feu',xv>=5);
  if(monte){x9.classList.remove('up');void x9.offsetWidth;x9.classList.add('up');hudReveil('avCh'); /* un × de plus : la plaque se RALLUME (HUD discret) */
    const pal={5:'EN FEU !!',8:'DEMENT !!!',10:'MAX !!!'}[xv]; // (vague 2, H4) plus de « ×3 CHAUD ! » au centre : le × du tableau de bord bat déjà — le couloir ne parle qu'à partir de ×5
    if(pal){if(SONV2)sfx('aura.x'+xv); /* (2026-10-15, Sacha : « écrit ailleurs de toute façon ») plus de « ×5 EN FEU / ×8 DÉMENT / ×10 MAX » au centre : le × de la chaîne bat déjà (.up, .feu) — le son, le flash et la main restent */flashEcran(xv>=8?'rgba(255,57,36,.55)':'rgba(255,94,200,.45)');hap(xv>=8?[14,40,24,40,30]:[12,30,20]);}}
  avE('avList').innerHTML=CHA.liste.map(function(l){return '<li>'+String(l).replace(/[<>&]/g,'')+'</li>';}).join('');
}
/* `dbgHud(k,n)` — (HUD v4) forcer un état du tableau de bord pour le juger sur capture : 'flow' n · 'idle' s · 'chaine' n ·
   'encaisse' · 'perdue' · 'record' v · 'pwr' · 'slam' txt. Sans argument : l'état lu. */
window.dbgHud=function(k,n){
  if(k==='flow'){flowAdd(n==null?30:n);return {v:FLOW.v,lv:FLOW.lv};}
  if(k==='idle'){FLOW.idle=n==null?2.5:n;return FLOW.idle;}
  if(k==='chaine'){const N=['VIRAGE SERRÉ','FRÔLÉ','RASE-BORD','SUPER TURBO','BIG AIR','PARFAIT'];
    for(let i=0;i<(n||3);i++)chaineAura(N[i%6],[45,20,40,100,50,70][i%6],N[i%6]);return {pts:CHA.pts,x:CHA.x};}
  if(k==='encaisse'){chaineEncaisse();return Math.round(auraRun);}
  if(k==='perdue'){chainePerdue();return 'ok';}
  if(k==='record'){CHA.rec=n||500;CHA.recB=false;CHA.recP=-1;const r=avE('avRec');if(r)r.className='';
    avE('avRecT').textContent=TR('RECORD')+' '+fmtAura(CHA.rec);return CHA.rec;}
  if(k==='pwr'){pwrNitroT=6;pwrSpdT=4.5;return 'ok';}
  if(k==='slam'){slam(n||'BOOST','','#ffd75e','#ff7a24',44,0);return 'ok';}
  // (vague 2) le texte sur la caisse · une carte d'astuce · la bannière de niveau · l'état de la FILE du couloir
  if(k==='pop'){popTexte(n||'DAUPHIN EN VOL +80','#ffd75e',0);return popTexte._w;}
  if(k==='mis'){misBanniere('ASTUCE',TR("En l'air : pouce en HAUT = plonge, en BAS = monte."),'','eclair');return 'ok';}
  if(k==='lvl'){lvlAnnonce();return 'ok';}
  if(k==='plonge'){engPlonge();return engBig.on;}
  if(k==='verdict'){ // (vague 3) un verdict de pose tel que tryLand l'écrit : 'm1' 'm2' 'm3' · 'tags' (+ bonus) · 'lourd'
    const V={m1:'MONSTRE',m2:'DOUBLE MONSTRE',m3:'TRIPLE MONSTRE',lourd:'MONSTRE'}[n]||'DOUBLE MONSTRE';
    if(n==='tags'){trickMsg('PILE AU CENTRE 🎯',false);trickMsg('FACE CACHÉE ×2',2);}
    trickMsg((n==='lourd'?'POSÉ LOURD — AÏE… ':n==='m1'?'PARFAIT ! ':'')+V+'  +'+fmtC(denom()*({m1:12,m2:60,m3:180}[n]||60)),3);return 'ok';}
  if(k==='file'){const c=HAUT.cur,t=performance.now();return {voix:c&&t<HAUT.fin?c.k+':'+c.p:null,attente:HAUT.q.map(function(q){return q.k+':'+q.p;}),moteur:engBig.on?(engBig.plonge?'plonge':'couloir'):null};}
  return {flow:{v:FLOW.v,lv:FLOW.lv,idle:FLOW.idle},cha:{pts:CHA.pts,x:CHA.x,n:CHA.n,t:CHA.t},rec:CHA.rec,recB:CHA.recB,aura:Math.round(auraRun)};
};
/* `dbgFren(k,n)` — (2026-09-28) LA FRÉNÉSIE au banc : 'v' n = pose le remplissage (le palier suit, zone rouge comprise ; 100 = y entrer
   par le vrai chemin) · 'nourrit' n = une goutte de style de n points · 'idle' s = s secondes sans style. Rend l'état : zone, emblème.
   (v3) rend aussi `nit` (le nitro gèle la jauge), `tenue` (s de la frénésie en cours), `record` (SAVE.d.frenRec), `partie` {fren, max}. */
window.dbgFren=function(k,n,t){
  if(k==='v'){FLOW.v=Math.max(0,Math.min(100,+n||0));FLOW.idle=0;
    if(FLOW.v>=100&&FLOW.lv<4){FLOW.v=99.9;flowAdd(1);}                      // la jauge pleine : par le vrai chemin (v4 : elle ARME — dbgFren('entre') déclenche)
    else if(FLOW.lv<4)FLOW.lv=Math.min(3,Math.floor(FLOW.v/25));              // les paliers ordinaires : posés sans annonce
    flowTick(0);}
  else if(k==='nourrit')flowAdd(n==null?3:n);
  else if(k==='risque'||k==='route'||k==='style')flowAdd(n==null?10:n,k,t);   // un geste d'une famille : dbgFren('risque',12) · (v5) signé d'un trait : dbgFren('risque',12,'m')
  else if(k==='faute')flowFaute(n||'n',6,.5); // (v5) une faute : dbgFren('faute','n')
  else if(k==='vit')FLOW.vitF=n==null?null:+n;                                 // forcer la vitesse du flow (null = la vraie)
  else if(k==='journal'){if(n===0){FLOW.jr=null;return 'journal fermé';}FLOW.jr=FLOW.jr||[];return FLOW.jr.slice();}
  else if(k==='idle'){FLOW.idle=n==null?2.5:n;flowTick(0);}
  else if(k==='trait'){if(n&&n.length===1)frenTrait(n,1);else if(n)FREN.tr[n[0]]=+n.slice(1)||0;} // (v4) dbgFren('trait','m') nourrit · dbgFren('trait','m0') le vide
  else if(k==='pose')flowCasse(!!n); // (v4) simule une pose ratée (n vrai = à contresens)
  else if(k==='entre'){if(FLOW.lv<4)frenDeclenche();}
  else if(k==='drift'){driftCd=0;driftC=1.5;driftLv=n==null?2:+n;driftTick(0,false);} // (loi 20) relâche un turbo de niveau n (2 SUPER · 3 ULTRA) : en ville, il fait partir la frénésie armée
  else if(k==='racc'){flowRaccourci(n==null?120:+n,true);if(FLOW2.decl.racc&&FREN.arme&&FLOW.lv<4)frenDeclenche();} // (loi 20) un raccourci de n m posé (comme tryLand) : en ville, il déclenche
  else if(k==='cash')frenCash(n==null?denom()*6:+n,carGroup.position); // (×3) le RETOUR d'un gain en frénésie (bande, « ×3 », butin) — le compte n'est pas touché // (v4) la frénésie tout de suite (comme une figure posée jauge pleine)
  const tr=frenEl();
  return {v:+FLOW.v.toFixed(2),lv:FLOW.lv,vit:+FLOW.vit.toFixed(2),revele:FLOW.revele,musique:FRENM.sw?'triade':FRENM.surm?'surmultipliee':'radio',seuil:FREN.seuil,zone:+Math.max(0,Math.min(1,(FLOW.v-FREN.seuil)/(100-FREN.seuil))).toFixed(3),
    idle:+FLOW.idle.toFixed(2),triade:tr?tr.className:null,hud:FLOW.el?FLOW.el.className:null,
    nit:FLOW.nit,tenue:+FREN.t.toFixed(1),triade:{n:+FREN.tr.n.toFixed(1),m:+FREN.tr.m.toFixed(1),p:+FREN.tr.p.toFixed(1),k:FREN.k},poseA:FLOW.poseA,arme:FREN.arme,lieu:FLOW2.lieu,decl:FLOW2.decl,record:SAVE.d.frenRec||0,partie:{fren:RUNX.fren|0,max:+(RUNX.frenMax||0).toFixed(1)},nitro:+nitroR.toFixed(2),mult:flowMult(),butin:Math.round(FREN.butin)}; // (v3) le gel du nitro, la tenue, le record
};
/* ---- LE TITRE DE LA FRÉNÉSIE : « TRIPLE MONSTER » (2026-09-28, Sacha : « quand on passe en frénésie, ça doit déclencher la voix et
   l'écriture TRIPLE MONSTER en rouge dégradé, avec une police un peu sataniste, et du sang qui coule du texte »).
   Les lettres sont GOTHIQUES, dessinées au pixel dans la grille du jeu (cornes en tête, fûts épais, pieds fendus en pointe : la gothique
   d'une pochette de métal), ombrées en bandes rouges (pâle en tête, sang au pied), cernées d'encre ; du SANG coule de leurs pieds — des
   filets qui s'allongent par crans, puis une goutte qui se détache. Il naît avec l'emblème DARK TRIAD : un observateur guette
   `#triade.on` (posé par la logique de la frénésie) — rien à appeler côté jeu. Pendant qu'il parle, la grande annonce et le verdict se
   taisent (`body.ftOn`). */
const FT_G={
  T:['.#.....#.','##.....##','#########','.#######.','...###...','...###...','...###...','...###...','...###...','...###...','...###...','..#####..','.##...##.','.#.....#.'],
  R:['#........','##.......','#######..','###..###.','###...##.','###..###.','######...','###.##...','###..##..','###..###.','###...##.','###...###','##.....##','#.......#'],
  I:['#...#','##.##','#####','.###.','.###.','.###.','.###.','.###.','.###.','.###.','.###.','#####','##.##','#...#'],
  P:['#........','##.......','#######..','###..###.','###...###','###..###.','#######..','###......','###......','###......','###......','####.....','##.......','#........'],
  L:['#........','##.......','###......','###......','###......','###......','###......','###......','###......','###......','###......','#######.#','##.....##','#.......#'],
  E:['#......#.','##....##.','########.','###......','###......','###..#...','######...','###..#...','###......','###......','###......','########.','##....##.','#......#.'],
  M:['#.........#','##.......##','###.#.#.###','###########','###.###.###','###..#..###','###.....###','###.....###','###.....###','###.....###','###.....###','###.....###','##.......##','#.........#'],
  O:['....#....','...###...','.#######.','###...###','###...###','###...###','###...###','###...###','###...###','###...###','###...###','.#######.','...###...','....#....'],
  N:['#.......#','##.....##','###...###','####..###','###.#.###','###..####','###...###','###...###','###...###','###...###','###...###','###...###','##.....##','#.......#'],
  S:['.......#.','.#######.','###...###','###....#.','###......','.######..','..######.','......###','......###','.#....###','###...###','.#######.','.#.......','#........']
};
// une ligne de lettres → { d : le chemin SVG (une rangée de cases fusionnée en rectangles), w : largeur en cases, pieds : colonnes où coule le sang }
function ftLigne(mot){let x=0,d='',pieds=[];
  for(const ch of mot){if(ch===' '){x+=4;continue;}const g=FT_G[ch];if(!g)continue;const w=g[0].length;
    for(let y=0;y<g.length;y++){const r=g[y];let a=-1;for(let i=0;i<=w;i++){const on=i<w&&r[i]==='#';if(on&&a<0)a=i;if(!on&&a>=0){d+='M'+(x+a)+' '+y+'h'+(i-a)+'v1h-'+(i-a)+'z';a=-1;}}}
    const bas=g[g.length-1];for(let i=0;i<w;i++)if(bas[i]==='#')pieds.push(x+i); // le sang coule des POINTES des pieds
    x+=w+1;}
  return {d:d,w:x-1,pieds:pieds};}
function frenTitreEl(){
  let el=document.getElementById('frenTitre');if(el)return el;
  el=document.createElement('div');el.id='frenTitre';el.setAttribute('aria-hidden','true');
  const grad='<defs><linearGradient id="ftGr" x1="0" y1="0" x2="0" y2="14" gradientUnits="userSpaceOnUse">'
    +'<stop offset=".143" stop-color="#ffe1e4"/><stop offset=".143" stop-color="#ff6a78"/><stop offset=".43" stop-color="#ff6a78"/><stop offset=".43" stop-color="#ff2a3d"/>'
    +'<stop offset=".71" stop-color="#ff2a3d"/><stop offset=".71" stop-color="#c4001f"/><stop offset=".857" stop-color="#c4001f"/><stop offset=".857" stop-color="#7a0012"/></linearGradient>'
    +'<linearGradient id="ftSang" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a0012"/><stop offset=".6" stop-color="#c4001f"/><stop offset="1" stop-color="#ff2a3d"/></linearGradient></defs>';
  const svg=function(mot,cls,nSang,graine,defs){const L=ftLigne(mot);let s='';
    // le SANG : quelques pieds tirés (graine fixe : le même dessin à chaque frénésie), un filet de 3 à 9 cases, sa goutte au bout
    const P=L.pieds.slice();let r=graine;const rnd=function(){r=(r*9301+49297)%233280;return r/233280;};
    for(let k=0;k<nSang&&P.length;k++){const i=Math.floor(rnd()*P.length),x=P.splice(i,1)[0],l=3+Math.floor(rnd()*7),dl=(.15+rnd()*.5).toFixed(2);
      s+='<rect class="ftFilet" x="'+x+'" y="14" width="1" height="'+l+'" style="--d:'+dl+'s"/><rect class="ftGoutte" x="'+(x-.15)+'" y="'+(14+l-.2)+'" width="1.3" height="1.3" style="--d:'+dl+'s"/>';}
    return '<svg class="'+cls+'" viewBox="-1 -1 '+(L.w+2)+' 27" preserveAspectRatio="xMidYMin meet" shape-rendering="crispEdges">'+(defs?grad:'')
      +'<path class="ftLettres" d="'+L.d+'" fill="url(#ftGr)"/>'+s+'</svg>';};
  el.innerHTML=svg('TRIPLE','ftL1',4,7,true)+svg('MONSTER','ftL2',8,11,false)+'<b class="ftSous">'+sansAcc(TR('FRÉNÉSIE'))+'</b>';
  document.body.appendChild(el);return el;}
function frenTitre(){ try{
  const el=frenTitreEl();{const sb9=el.querySelector('.ftSous');if(sb9)sb9.textContent=sansAcc(TR('FRÉNÉSIE'));} // (passe qualité) construit une fois : il gardait la 1re langue
  el.classList.remove('on');void el.offsetWidth;el.classList.add('on'); /* (débogage 29/09) cette ligne était COLLÉE derrière le // ci-dessus : le titre TRIPLE MONSTER ne s'allumait plus, mais body.ftOn taisait quand même annonces et verdicts 2,7 s */
  document.body.classList.add('ftOn');clearTimeout(frenTitre._t);
  frenTitre._t=setTimeout(function(){el.classList.remove('on');document.body.classList.remove('ftOn');},2700);
}catch(e){} }
(function(){const tr=document.getElementById('triade');if(!tr||!window.MutationObserver)return;let av=tr.classList.contains('on');
  new MutationObserver(function(){const on=tr.classList.contains('on');if(on&&!av)frenTitre();av=on;}).observe(tr,{attributes:true,attributeFilter:['class']});})();
/* ---- LA RÉCOLTE DE FRUITS EN RAFALE (2026-08-18) ---------------------------------------------
   Croquer un fruit isolé, c'est un « ploc ». En croquer cinq en rafale, ça doit être un CARNAGE :
   le jus gicle de plus en plus, le crunch monte dans les aigus, et l'aura tombe.
   ⚠ le CRUNCH est synthétisé, pas samplé : il doit changer de hauteur à chaque fruit (c'est
   l'escalade qui se lit à l'oreille), et un sample fixe rejoué cinq fois de suite sonne comme un
   bug. Du bruit filtré en bande étroite qui monte, plus un claquement sec — de la matière qui cède. */
let fruitRaf=0,fruitRafT=0;
const FRUIT_FENETRE=2.6;
/* ⚠ RENFORCÉ (2026-08-18) — « je n'ai pas tellement vu le crunch ». Il était noyé : trop court,
   trop doux, et dans la même bande de fréquences que la pluie de billets et les pièces, donc
   masqué par elles. Trois corrections, et la troisième est la vraie :
     · plus fort et plus long (.16 → .26 s), attaque plus franche ;
     · DEUX COUCHES — un CRAQUEMENT haut (la peau qui cède) et un IMPACT bas (la pulpe) : c'est
       l'écart entre les deux qui fait « morsure » plutôt que « bruit blanc » ;
     · ⚠ il DUCK le reste du mix (`duckT`) pendant 120 ms. C'est ça qui le rend audible : ne pas
       monter le volume par-dessus la bouillie, mais creuser un trou pour lui. */
function crunchSfx(rang){
  if(!sfxOk()||!MASTER)return;
  try{
    const t=AC.currentTime, dur=.26;
    // --- la peau qui CÈDE : bruit déchiré, bande étroite qui monte avec la rafale
    const n=AC.createBufferSource(),b=AC.createBuffer(1,(AC.sampleRate*dur)|0,AC.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<d.length;i++){const u=i/d.length;
      // le CRÉPITEMENT : des micro-ruptures, pas un souffle régulier — c'est ce qui fait « croquer »
      const gr=(Math.random()<.35+rang*.05)?1:.25;
      d[i]=(Math.random()*2-1)*gr*Math.pow(1-u,1.7)*(u<.03?u/.03:1);}
    n.buffer=b;
    const f=AC.createBiquadFilter();f.type='bandpass';
    f.frequency.setValueAtTime(1100+rang*340,t);
    f.frequency.exponentialRampToValueAtTime(340+rang*110,t+dur);
    f.Q.value=1.2; // (2026-09-28) 2.2 → 1.2 : une bande plus large croque sans siffler
    const g=AC.createGain();
    g.gain.setValueAtTime(.0001,t);
    /* (2026-09-28) RAMENÉ DANS LE RANG. À .46→.95 sur une bande 1,1-3,1 kHz (là où l'oreille est la plus sensible), plus un thump à .42,
       c'était le son ponctuel le plus fort du jeu — une vingtaine de dB au-dessus d'une pièce. Le trou creusé par `duckT` suffit à le
       faire entendre ; il n'a pas besoin de crier par-dessus. */
    g.gain.exponentialRampToValueAtTime(Math.min(.45,.24+rang*.04),t+.006);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    n.connect(f);f.connect(g);g.connect(MASTER);n.start(t);n.stop(t+dur);
    // --- la PULPE : un thump grave sous le craquement, pour que ça ait du corps
    const o=AC.createOscillator(),og=AC.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(190+rang*26,t);
    o.frequency.exponentialRampToValueAtTime(58,t+.13);
    og.gain.setValueAtTime(.0001,t);
    og.gain.exponentialRampToValueAtTime(.26,t+.008); // (2026-09-28) .42 → .26
    og.gain.exponentialRampToValueAtTime(.0001,t+.16);
    o.connect(og);og.connect(MASTER);o.start(t);o.stop(t+.17);
    duckT=Math.max(duckT,.12); // ON CREUSE LE MIX : c'est ça qui le sort de la bouillie
  }catch(e){}
}
/* ---- LE JUS SUR L'OBJECTIF (2026-08-18) : des TACHES peintes en 2D par-dessus l'image (plus de particules 3D). Ce qui fait « projection »,
   c'est l'IRRÉGULARITÉ (le rayon bruité), les SATELLITES et la COULURE — les trois ensemble, sinon ça reste un rond. */
/* LE JUS v2 — DES GOUTTES PIXEL (2026-09-26, vague 2, « L'ENCRE ET L'OR »). Verdict du directeur artistique : les taches (un polygone
   plein, d'UNE couleur, bord dur, à 85 % sur l'écran — moutarde, gris, mauve selon le fruit) se lisaient comme un BUG D'INTERFACE, pas
   comme du jus sur l'objectif. Désormais chaque tache est une GOUTTE dessinée dans la langue du HUD :
   · la forme (le rayon bruité, les satellites, la coulure) est posée sur une GRILLE DE 4 px ;
   · TROIS TONS sur le corps du fruit (SATURÉ — éclairci vers le blanc, il virait au papier beige) : un CŒUR clair, un liseré d'ENCRE
     #1c0430 de 2 px (la même encre que les contours d'arcade), un REFLET blanc en haut à gauche (c'est lui qui dit « liquide sur une
     vitre ») ; le corps est plus transparent que son liseré — une goutte, pas un autocollant ;
   · opacité ≤ .55 : on voit la route à travers, toujours.
   Chaque goutte est cuite UNE fois à sa naissance dans une petite toile RÉUTILISÉE (la file plafonne à 14 taches) — la coulure s'y
   allonge au fil des images, à pleine opacité (pas de double couche à la jointure) — puis la toile est recopiée ×2 au pixel près, sans
   lissage. Plus aucun tracé de chemin par image. */
/* LE JUS v3 — PLUS GROS, PLUS OPAQUE (2026-09-28, Sacha : « les taches de jus de fruit doivent être plus opaques et grosses »).
   · la TAILLE se prend sur la plus PETITE dimension de l'écran (la même goutte en vertical et en paysage — sur la largeur, le paysage
     les gonflait au plafond) et monte d'environ ×1,5 : rayon ~37-73 px sur un téléphone (24-49 avant), plafond 90 (60) ;
   · l'OPACITÉ : pleine (.9) pendant la première moitié de sa vie, puis elle s'efface — au lieu de ≤ .55 en fondu dès l'impact ;
     corps .94 / cœur .9 dans la goutte (80 / 77 % avant), coulure .95 ; le liseré d'encre et le reflet restent pleins ;
   · le COULOIR de conduite reste dégagé : l'ellipse interdite s'élargit de la taille de la goutte (une grosse goutte posée au bord
     de l'ellipse y débordait) ; `JUS_N` (le brouillon) passe de 128 à 192 cellules pour les plus grosses. */
/* LE JUS v3b (même soir, Sacha : « elles sont trop sur les côtés ; un peu plus grosses, et pouvoir apparaître PARTOUT sur l'écran ») :
   plus d'ellipse interdite ni de bande du haut — la goutte tombe n'importe où (le HUD reste dessiné par-dessus) ; rayon ×1,25 encore
   (~46-91 px sur téléphone, plafond 110), `JUS_N` 240. Le couloir dégagé de la vague 2 est donc ABANDONNÉ, à sa demande. */
/* LE JUS v4 — DISCRET ET HORS DE LA ROUTE (2026-09-29, Sacha : « les trois », après la passe « jeu pro » : DEUX critiques indépendantes
   classaient les taches n°1 des défauts — « on dirait un bug d'affichage », une goutte rose couvrait la moitié de la caisse en pleine nitro,
   huit « sucettes » orange envahissaient l'écran en ORBITE). La goutte pixel garde son dessin (encre, cœur, reflet) mais :
   · rayon ÷3 environ (~11-34 px sur un téléphone, plafond 40 — c'était 46-91, plafond 110) ;
   · elle ne tombe plus sur la zone de CONDUITE (une ellipse autour de la caisse et de la route devant elle) : la couronne et les coins ;
   · 6 à la fois au plus (14), vie 0,7-1,1 s (1,1-1,8), pleine .8 le premier tiers puis s'efface (.9 la moitié), coulure courte (plus de « tige »). */
/* LE JUS v5 — UN PEU PLUS VISIBLE, ET GÊNANT (2026-09-30, Sacha à la session INTERFACE : « rends un peu plus visibles et gênantes à l'écran
   les taches de jus de fruit »). Entre la v4 (discrète, hors de la route) et la v3b (jugée trop) :
   · rayon ×1,7 environ (~19-57 px sur un téléphone, plafond 68 — v4 : 11-34 / 40, v3b : 46-91 / 110), coulure un peu plus longue ;
   · GÊNANTES : plus de la moitié tombent n'importe où, route et caisse comprises (55 %) ; les autres gardent la couronne ;
   · 8 à la fois au plus (v4 : 6, v3b : 14 — avec la LIGNE PARFAITE, un fruit toutes les ~2,4 s : le plafond reste), vie 0,9-1,4 s,
     pleines .86 les premiers 40 % puis elles s'effacent. */
/* LE JUS v6 — GROS ET DÉRANGEANT (2026-09-30, Sacha : « les taches de fruit éclaté sur l'écran ne sont pas assez grosses et
   dérangeantes »). Retour vers la v3b (qu'il avait voulue) et plus loin dans la gêne :
   · rayon ~45-90 px sur un téléphone, plafond 112 (v5 : 19-57 / 68 ; v3b : 46-91 / 110) ; coulure plus longue ;
   · OÙ : 35 % tombent EXPRÈS sur la zone de conduite (la caisse et la route devant elle), 45 % n'importe où, 20 % dans la couronne ;
   · 10 à la fois au plus (8), vie 1,3-2 s (0,9-1,4), pleines .93 les premiers 55 % (.86 / 40 %) ;
   · elles GLISSENT : passé 0,3 s, la goutte descend l'écran (12-34 px/s, par pas de 4 px) — du jus qui coule sur la vitre. */
/* LE JUS v7 — LA ROUTE DÉGAGÉE (2026-10-07, Sacha : « améliore la visibilité de la route, notamment en enlevant les taches de fruit écrasé
   du milieu de l'écran »). La v6 en jetait EXPRÈS 35 % sur la caisse et la route (et 45 % n'importe où) : la route était sous le jus.
   Désormais AUCUNE tache ne se pose dans la ZONE DE LA ROUTE (`JUS_ZONE` : une ellipse autour de la caisse et de la route devant elle,
   centrée (½ W, 0,56 H), demi-axes 0,33 W × 0,37 H, élargie du rayon de la goutte) : elles vivent sur les BORDS et dans les coins.
   Elles gardent leur taille (v6) et leur dessin, mais ni leur glissade ni leur coulure n'entrent dans la zone (`gm`, coulure raccourcie).
   `dbgJus` rend aussi la part de la zone repeinte (visée : 0). */
const JUS_ZONE={cx:.5,cy:.56,a:.33,b:.37};
function jusHors(x,y,m,W,H){const ex=(x-W*JUS_ZONE.cx)/(W*JUS_ZONE.a+m),ey=(y-H*JUS_ZONE.cy)/(H*JUS_ZONE.b+m);return ex*ex+ey*ey>1;} // le point (x, y), gonflé de m px, est-il HORS de la route ?
const JUS_N=240,JUS=[],JUS_PX=4,JUS_TOILE=[],JUS_BLANC=new THREE.Color(1,1,1),JUS_ENCRE='#1c0430',JUS_M=new Uint8Array(JUS_N*JUS_N);let JUS_IM=null; // masque et pixels de brouillon RÉUTILISÉS (JUS_N cellules = la plus grande goutte)
function jusToile(){ // une toile libre de la réserve (15 au plus : la file plafonne à 14 taches)
  for(const t of JUS_TOILE)if(!t.pris){t.pris=true;return t;}
  const cv=document.createElement('canvas');cv.width=cv.height=64;const t={cv:cv,x:cv.getContext('2d'),pris:true};JUS_TOILE.push(t);return t;
}
function juiceScreen(col,power,n){
  // ⚠ REDUCED_MOTION : pas de taches qui gonflent et coulent sur l'écran. La gerbe 3D, le croc et
  // l'aura restent — le fruit se lit toujours, sans giclée plein cadre.
  if(!juiceCx||REDUCED_MOTION)return;
  const W=juiceCv.width,H=juiceCv.height,cc=new THREE.Color(col),hsl=cc.getHSL({h:0,s:0,l:0}); // le CORPS : le fruit, SATURÉ
  /* ===== LA TOILE NULLE (24/10, relecture : « toile du jus de largeur nulle pendant une transition iOS ») ===== innerWidth à 0 le temps
     d'une transition : la goutte aurait un rayon 0, sa toile 0 px de large, et drawImage d'une toile nulle LÈVE dans juiceScreenTick, hors
     de tout try et avant le rendu — chaque goutte vide figeait l'écran toute sa vie et bloquait les suivantes (preuve-jus-toile-nulle) */
  if(!(W>0&&H>0))return;
  cc.setHSL(hsl.h,Math.max(hsl.s,.78),Math.min(.6,Math.max(.46,hsl.l)));const k2=cc.clone().lerp(JUS_BLANC,.38); // …et son CŒUR clair
  const cR=cc.r*255|0,cG=cc.g*255|0,cB=cc.b*255|0,kR=k2.r*255|0,kG=k2.g*255|0,kB=k2.b*255|0,corps='rgba('+cR+','+cG+','+cB+',.95)';
  const B9=Math.min(W,H); // (v3) la taille suit la plus petite dimension : même goutte debout ou couché
  for(let k=0;k<(n||1);k++){
    // (v3b) plus grosses : rayon ~46-91 px sur un téléphone (v3 : 37-73, vague 2 : 24-49), plafond 110 — la forme et ses satellites tiennent dans JUS_N
    const R=Math.min(112,(B9*.1+Math.random()*B9*.1)*(.8+power*.45)),coul=R*(.5+Math.random()*.9); // (v6) ~45-90 px, plafond 112 — (v5) ×1,7 — (v4) ÷3
    /* (v3b, Sacha : « pouvoir apparaître partout sur l'écran ») PARTOUT, uniformément : plus d'ellipse centrale interdite ni de bande du
       haut (elles repoussaient tout sur les côtés). Le HUD est dessiné PAR-DESSUS le jus, rien de ce qu'on lit n'est jamais caché. */
    let x=0,y=0,hors=false; // (v7) JAMAIS sur la route : hors de JUS_ZONE (le corps : rayon bruité jusqu'à ~1,2 R ; les satellites qui tomberaient dedans sont retirés plus bas)
    for(let t9=0;t9<24&&!hors;t9++){x=Math.random()*W;y=Math.random()*H;hors=jusHors(x,y,R*1.2,W,H);}
    if(!hors){ // filet (mesuré : ~1 tirage sur 100 debout) : la bande du HAUT si elle existe (debout), sinon les bandes des CÔTÉS (couché) — sinon au ras du haut
      const hb=H*(JUS_ZONE.cy-JUS_ZONE.b)-R*1.2,lb=W*(JUS_ZONE.cx-JUS_ZONE.a)-R*1.2;
      if(hb>0){x=Math.random()*W;y=Math.random()*hb;}else if(lb>0){x=Math.random()<.5?Math.random()*lb:W-Math.random()*lb;y=Math.random()*H;}else{x=Math.random()*W;y=-R*.4;}}
    const vie9=1.3+Math.random()*.7,gl9=12+Math.random()*22;let gm=0; // (v7) la GLISSADE s'arrête avant la route
    for(let d9=JUS_PX;d9<=gl9*vie9;d9+=JUS_PX){if(!jusHors(x,y+d9,R*1.2,W,H))break;gm=d9;}
    // (vague 2) des GOUTTES, plus des flaques (l'ancien montait à 100 px, satellites jusqu'à 2,7 R) — la taille (v3) est tirée plus haut
    if(JUS.length>=10){const v=JUS.shift();v.toile.pris=false;} // (v6) 10 — (v5) 8 // plafond (v4 : 6 — c'était 14 ; à 20 taches, mesuré, 76 % de l'écran était repeint)
    const t=jusToile(),C=JUS_PX/2; // la toile est en CELLULES de 2 px : le liseré fait une cellule, la forme se pose par blocs de deux (4 px)
    const ext=Math.min(JUS_N-4,Math.ceil(R*2.05/JUS_PX)*JUS_PX),Nw=ext,Nh=Nw+Math.ceil(coul*1.6/C)+4; // demi-étendue en px = largeur en cellules ; la coulure dessous
    if(t.cv.width!==Nw||t.cv.height!==Nh){t.cv.width=Nw;t.cv.height=Nh;}else t.x.clearRect(0,0,Nw,Nh);
    const N=9+((Math.random()*5)|0),pts=[];for(let i=0;i<N;i++)pts.push(R*(.62+Math.random()*.55)); // rayon BRUITÉ : c'est ça, une éclaboussure
    const sat=[];for(let i=0,ns=3+((Math.random()*3)|0);i<ns;i++)sat.push({a:Math.random()*6.2832,d:R*(1.25+Math.random()*.7),r:R*(.12+Math.random()*.12)});
    for(let i=sat.length-1;i>=0;i--){const s9=sat[i],sx=x+Math.cos(s9.a)*s9.d,sy=y+Math.sin(s9.a)*s9.d;if(!jusHors(sx,sy,s9.r,W,H)||!jusHors(sx,sy+gm,s9.r,W,H))sat.splice(i,1);} // (v7) pas une gouttelette sur la route, même après la glissade
    const dedans=function(px,py){ // px, py : décalage au centre, en pixels écran
      const a=(Math.atan2(py,px)+6.2832)%6.2832,f=a/6.2832*N,i0=f|0,w=f-i0;
      if(Math.hypot(px,py)<pts[i0%N]*(1-w)+pts[(i0+1)%N]*w)return true;
      for(const s of sat){const dx=px-Math.cos(s.a)*s.d,dy=py-Math.sin(s.a)*s.d;if(dx*dx+dy*dy<s.r*s.r)return true;}
      return false;};
    const M=JUS_M;M.fill(0,0,Nw*Nw);
    for(let cy=0;cy<Nw;cy+=2)for(let cx=0;cx<Nw;cx+=2) // la forme, par blocs de 4 px
      if(dedans((cx+1)*C-ext,(cy+1)*C-ext)){M[cy*Nw+cx]=M[cy*Nw+cx+1]=1;if(cy+1<Nw){M[(cy+1)*Nw+cx]=M[(cy+1)*Nw+cx+1]=1;}}
    if(!JUS_IM)JUS_IM=t.x.createImageData(JUS_N,JUS_N);const d=JUS_IM.data;d.fill(0,0,JUS_N*Nw*4); // (brouillon au pas de JUS_N)
    const hx=Math.round((ext-R*.4)/C)&~1,hy=Math.round((ext-R*.42)/C)&~1,ck=R*.5/C; // le REFLET : en haut à gauche du corps · le CŒUR : la moitié du rayon
    let bas=Nw>>1;
    for(let cy=0;cy<Nw;cy++)for(let cx=0;cx<Nw;cx++){const k9=cy*Nw+cx;if(!M[k9])continue;const o=(cy*JUS_N+cx)*4;
      if(cx===(Nw>>1))bas=Math.max(bas,cy);
      const bord=cx===0||cy===0||cx===Nw-1||cy===Nw-1||!M[k9-1]||!M[k9+1]||!M[k9-Nw]||!M[k9+Nw];
      const refl=!bord&&((cx>=hx&&cx<hx+2&&cy>=hy&&cy<hy+2)||(cx===hx+3&&cy===hy-1));
      const coeur=!bord&&Math.hypot(((cx>>1)<<1)+1-Nw/2+ck*.25,((cy>>1)<<1)+1-Nw/2+ck*.25)<ck; // (par blocs de 4 px, décalé vers la lumière)
      if(bord){d[o]=28;d[o+1]=4;d[o+2]=48;d[o+3]=255;}else if(refl){d[o]=d[o+1]=d[o+2]=255;d[o+3]=255;}
      else if(coeur){d[o]=kR;d[o+1]=kG;d[o+2]=kB;d[o+3]=230;}else{d[o]=cR;d[o+1]=cG;d[o+2]=cB;d[o+3]=240;}} // (v3) corps .94, cœur .9
    t.x.putImageData(JUS_IM,0,0,0,0,Nw,Nw);
    const coulOk=function(c){for(let d9=R*1.1;d9<=R*1.2+c*1.6;d9+=JUS_PX*2)if(!jusHors(x,y+gm+d9,R*.25,W,H))return false;return true;}; // TOUTE la coulure (elle pourrait traverser la zone, les deux bouts dehors)
    let coul9=coul;while(coul9>JUS_PX&&!coulOk(coul9))coul9*=.75;if(!coulOk(coul9))coul9=0; /* (v7, mesuré : la coulure part du BAS du corps, jusqu à ~1,2 R) */ // …et la COULURE aussi (elle pend de ~0,9 R sous le centre)
    JUS.push({x:Math.round(x/JUS_PX)*JUS_PX,y:Math.round(y/JUS_PX)*JUS_PX,r:R,ext:ext,toile:t,c:corps,bas:bas,Lc:0,
      t:0,vie:vie9,coul:coul9,gl:gl9,gy:0,gm:gm}); // (v6) 1,3-2 s, et elle GLISSE (gl px/s) — (v5) 0,9-1,4 s — (v4) 0,7-1,1 s — (v7) gm : jusqu'au bord de la route
  }
}
function juiceScreenTick(dt){
  if(!juiceCx)return;
  const W=juiceCv.width,H=juiceCv.height;
  if(!JUS.length){if(juiceScreenTick._sale){juiceCx.clearRect(0,0,W,H);juiceScreenTick._sale=false;juiceCv.style.visibility='hidden';}return;}
  juiceCx.clearRect(0,0,W,H);if(!juiceScreenTick._sale){juiceScreenTick._sale=true;juiceCv.style.visibility='visible';}
  juiceCx.imageSmoothingEnabled=false; // AU PIXEL PRÈS : la toile est recopiée ×2, sans lissage
  for(let i=JUS.length-1;i>=0;i--){
    const j=JUS[i];j.t+=dt;
    if(j.t>=j.vie){j.toile.pris=false;JUS.splice(i,1);continue;}
    const u=j.t/j.vie,tc=j.toile;
    // LA COULURE : elle descend avec le temps (gravité) — dessinée DANS la toile, par pas de 4 px, liseré d'encre sur les côtés
    const Lc=Math.min(tc.cv.height-j.bas-3,Math.floor(j.coul*u*1.6/JUS_PX)*2);
    if(Lc>j.Lc){const cw=Math.max(2,Math.round(j.r*.3/JUS_PX)*2),x0=(j.ext>>1)-(cw>>1);
      tc.x.fillStyle=JUS_ENCRE;tc.x.fillRect(x0-1,j.bas+1,cw+2,Lc+1);tc.x.clearRect(x0,j.bas,cw,Lc); // (dégagée d'abord : le corps garde SA transparence)
      tc.x.fillStyle=j.c;tc.x.fillRect(x0,j.bas,cw,Lc);j.Lc=Lc;}
    /* la goutte GRANDIT d'un coup puis s'efface. ⚠ LE GONFLEMENT EST EN SECONDES ABSOLUES, pas en fraction de vie : une projection
       arrive TOUJOURS en 90 ms. (vague 2) Il se fait par PALIERS (½, ¾, plein) : jamais de pixels de travers. */
    const g=j.t<.03?.5:j.t<.06?.75:1,e=j.ext*g;
    if(j.t>.3)j.gy=Math.min(j.gm,j.gy+j.gl*dt); // (v6) le jus GLISSE sur la vitre — par pas de 4 px (jamais de pixel de travers) — (v7) jamais jusqu'à la route
    juiceCx.globalAlpha=(u<.55?1:Math.pow((1-u)/.45,1.5))*.93; /* (v6) pleine .93 les premiers 55 % */ /* (v5) pleine .86 les premiers 40 % */ // (v4) pleine .8 le premier tiers, puis elle s'efface // (v3, Sacha : « plus opaques ») pleine .9 la 1re moitié de sa vie, puis elle s'efface — c'était ≤ .55 en fondu dès l'impact
    juiceCx.drawImage(tc.cv,j.x-e,j.y+Math.floor(j.gy/JUS_PX)*JUS_PX-e,e*2,e*2*tc.cv.height/tc.cv.width);
  }
  juiceCx.globalAlpha=1;
}
// (2026-10-14, session SON) L'ÉCHELLE DES FRUITS : le i-ème fruit de la rafale, en demi-tons — 0, 2, 4, 7 puis aller-retour 4-7 (+7 au plus :
// le splotch reste un fruit, pas une voix de souris ; la rafale, bases [0], reste sous l'octave même tonalité comprise)
const SON_FRUIT_ST=[0,2,4,7];
function sonFruitSt(i){i=Math.max(0,i|0);return i<4?SON_FRUIT_ST[i]:SON_FRUIT_ST[2+(i&1)];}
function fruitCroque(pos,col,power,nom,leger){ // nom : le fruit — chacun a SA bouche (console de son) · leger : un fruit de la FILE (toutes les 0,45 s : jus et rafale adoucis, sinon l'écran serait recouvert)
  fruitRafT=FRUIT_FENETRE;fruitRaf++;if(leger)power*=.55;
  const r=Math.min(6,fruitRaf);
  /* L'ÉCLABOUSSURE. ⚠ elle partait du CENTRE de la caisse, donc à moitié cachée par la carrosserie —
     d'où « je n'ai pas tellement vu ». Elle part maintenant du NEZ et vers le HAUT, là où la caméra
     de poursuite regarde, et le nombre de gerbes suit la rafale : une, puis deux, puis trois. */
  const p2=crV1.copy(pos);p2.y+=1.1;
  juiceSplash(p2,col,Math.min(1.2,power*.9+r*.18));      // la gerbe 3D reste, mais en appoint
  juiceScreen(col,power,leger?1:1+Math.min(4,r));                 // …et LE JUS REPEINT L'OBJECTIF : ça, on le voit (un fruit de la file : un sur quatre)
  if(SONV2){sfx(FRUIT_SON[nom]||'fruit.peche',{rate:Math.pow(2,sonFruitSt(fruitRaf-1)/12),vol:nom==='PASTÈQUE'?0:-4});if(r>=3)sfx('fruit.rafale',{st:sonFruitSt(fruitRaf-3),vol:-3});}else crunchSfx(r); /* (2026-10-15, Sacha : « équilibre mieux, que les figures fassent plus de bruit que ce qu'on ramasse ») un fruit sortait à −28, au-dessus d'une figure : −4 (−32), la rafale −3 ; la PASTÈQUE (le graal) garde son niveau */ // (2026-10-14, session SON) la série MONTE en demi-tons de pentatonique (0-2-4-7, puis 4-7…) : avant, +2,5 % par fruit (0,4 demi-ton) noyé sous le hasard de la fiche (rj ±6 %, ±1 demi-ton) ; la rafale (key:1) monte avec /* (débogage son 2026-09-29) le plein de nitro sonne à la pompe, seulement s'il y a eu plein */
  shake=Math.max(shake,Math.min(.55,.18+r*.07));
  if(fruitRaf>=3&&(!leger||fruitRaf%4===0)){          // 3 fruits d'affilée : ce n'est plus un hasard (un fruit de la FILE : une annonce sur quatre, même total d'aura)
    chaineAura('RAFALE ×'+fruitRaf,Math.round(15+r*6),'rafale',true,SONV2,true); /* (2026-10-01) 40+30r → 15+6r : depuis LA LIGNE PARFAITE un fruit arrive toutes les 2,4 s, la rafale ne retombe plus — 220 points par fruit, le plus gros robinet d'aura de la route (voir LA CHAÎNE SE FERME) */
    trickMsg('🧃 RAFALE ×'+fruitRaf,r>=5?3:2);
  }
}
function fruitRafTick(dt){
  if(fruitRafT<=0)return;
  fruitRafT-=dt;
  if(fruitRafT<=0)fruitRaf=0;
}
function auraComboTick(dt){ // la fenêtre se referme : on solde et on annonce si ça valait le coup
  if(figComboT<=0)return;
  figComboT-=dt;
  if(figComboT>0)return;
  if(figCombo>=5)trickMsg(LANG==='fr'?'✦ ENCHAÎNEMENT DE '+figCombo+' — '+figComboAura+' D\'AURA':'✦ '+figCombo+'-TRICK COMBO — '+figComboAura+' AURA',3);
  figCombo=0;figComboAura=0;
}
function styleFromBoost(dt){
  // ⚠ CALIBRAGE : la nitro est une RESSOURCE (~2 s de réserve) — viser « 100 % en une seule tenue »
  // rendait la jauge INATTEIGNABLE. À 40 %/s, une tenue pleine donne ~80 % : deux boosts enchaînés
  // suffisent, et la fuite (13 %/s) fait qu'il faut les ENCHAÎNER. C'est ça, « sans lâcher ».
  if(fever>0)return;
  styleM=Math.min(100,styleM+40*dt);
  // ⚠ LE DÉCOLLAGE EST RETIRÉ (2026-09-25, user : « le truc de décollage en double-tap, supprime complètement ») : la jauge ne s'ARME plus.
}
// ---------- LE DÉCOLLAGE : double-tap NITRO — la caisse s'ARRACHE vers le ciel, le temps se fige ----------
// (remplace l'ancien « braquage », qui ne faisait que doubler les gains : un bonus comptable, aucun geste.
//  Le ×2 est conservé, mais COLLÉ à l'action — un seul appui, un événement qu'on VOIT.)
// Le ralenti est mesuré : sur 60 frames la caisse fait 25,8 u contre 52,2 u — le monde défile 2× moins vite.
function heistFire(){
  feverArmed=false;fever=10;styleM=0;hap([16,40,16]); // deux coups secs : le braquage se SENT dans la main
  addAura(150,1);                     // LE DÉCOLLAGE : le geste le plus engageant du jeu, donc le mieux payé en aura
  slowT=Math.max(slowT,2);            // 2 s de bullet-time
  if(mode==='drive'&&!introD){
    startFall(42,1);                  // ARRACHEMENT le long de la NORMALE (startFall borne la verticale à 70)
    /* ⚠ LA CAISSE TRAVERSAIT LA ROUTE AU DÉCOLLAGE — corrigé 2026-08-18, et ce n'était pas un
       problème de collision mais de REPÈRE. La ligne d'avant faisait `fallVel.y=max(fallVel.y,36)` :
       elle garantissait la poussée en **Y MONDE**. Or `startFall` décolle le long de la NORMALE de
       la surface, et cette normale est RETOURNÉE quand on roule sur la face du dessous (`side<0`) —
       elle pointe alors vers le bas. Forcer +36 en Y monde renvoyait donc la caisse DROIT DANS LA
       DALLE, qu'elle traversait. Même chose dans un looping, où la normale devient horizontale
       puis s'inverse : on poussait dans le décor.
       L'intention d'origine (« en descente la composante avant mangeait l'impulsion, on ressortait
       en plongeant ») reste valable — on la garantit simplement DANS LE BON REPÈRE : on complète la
       vitesse le long de `F.n`, la normale de décollage, qui pointe toujours à l'opposé du bitume.
       ⚠ `F` est encore la frame posée par `startFall` juste au-dessus : ne rien intercaler ici. */
    const vN9=fallVel.dot(F.n);
    if(vN9<34)fallVel.addScaledVector(F.n,34-vN9);
    airFlash=.6;
  }else if(mode==='fall'){
    fallVel.y=Math.min(70,fallVel.y+34); // en plein vol : une RELANCE, le geste n'est jamais perdu
  }
  // LA COLONNE DE FEU : le souffle qui pousse la caisse, cracké vers le bas
  const p9=carGroup.position;
  for(let k=0;k<54;k++){
    const a=Math.random()*6.2832,r=Math.random()*1.5;
    spawnP(k%3?flames:flameCore,p9.x+Math.cos(a)*r,p9.y-.3,p9.z+Math.sin(a)*r,
      Math.cos(a)*(2+Math.random()*5),-(14+Math.random()*20),Math.sin(a)*(2+Math.random()*5),.22+Math.random()*.24);
  }
  for(let k=0;k<26;k++){const a=Math.random()*6.2832;
    spawnP(smokePool,p9.x+Math.cos(a)*2,p9.y-.5,p9.z+Math.sin(a)*2,
      Math.cos(a)*(6+Math.random()*8),1+Math.random()*3,Math.sin(a)*(6+Math.random()*8),.7+Math.random()*.7);}
  sparkBurst(sparkGold,p9,22,16);sparkBurst(sparkBlue,p9,14,13);
  boostSnd();subBoom(.34);noiseBurst(.5,.2,340);thud(12);
  shake=Math.max(shake,1.1);duckT=Math.max(duckT,.5);
  flashEl.style.background='#ffe6b8';flashEl.style.opacity=.42;
  setTimeout(function(){flashEl.style.opacity=0;flashEl.style.background='#ff2020';},150);
  showMsg('🚀 DÉCOLLAGE — TOUT ×2 ! ★','#ff3ec8');
}
function trickMsg(txt,tier){ // tier: 1 MONSTRE · 2 DOUBLE · 3 TRIPLE (ou true = mis en avant)
  if(LEFIL.on){filTrick(txt,tier);return;} /* (2026-10-25, LE FIL) plus de verdict ni de carte au centre : la pastille unique le dit */
  if(TCTL.on){verdPousse(txt,tier);return;} // (vague 3) sur téléphone #trickBox est masqué (écran nu) : le verdict monte au COULOIR des annonces (verdSolde)
  // UN temps fort à la fois : un gros verdict (tier≥2) balaie les petits pops en cours ; sinon on plafonne à 2
  if(tier===2||tier===3){while(trickBox.firstChild)trickBox.firstChild.remove();}
  else while(trickBox.childElementCount>=2)trickBox.firstChild.remove();
  const el=document.createElement('div');
  el.className='trick'+(tier===3?' m3':tier===2?' m2':tier===1?' m1':(tier?' big':''));
  {const m9=LANG!=='fr'&&/^(PARFAIT \(BOOST ×2\) !|PARFAIT !|DIVIN !!|POSÉ LOURD — AÏE…) (.+)$/.exec(txt); // (2026-10-14) le VERDICT de pose arrive composé (grade + verdict) : on traduit les deux moitiés
   el.textContent=m9?TR(m9[1])+' '+TR(m9[2]):TR(txt);} // même porte d'entrée unique que showMsg pour la traduction
  trickBox.appendChild(el);
  setTimeout(()=>{el.remove();},tier===3?1500:tier===2?1200:950);
}
// ---- CHAÎNE DE FIGURES : chaque exploit aérien se NOMME à l'instant où il naît et gonfle la
// chaîne. Rien n'est payé en vol : tout se cashe à l'atterrissage (grade × face × série) —
// et tout S'ENVOLE si on explose. La redite paye de moins en moins : varie le menu !
let chain=0,chainVal=0,chainMult=1,chainSeen={},spinHalf=0,
    curNear=false,curHOff=0,curLatOff=0,curTOff=0,lastNearY=0,lastNearH2=0,lastNearS=0, // lastNearH2 : distance HORIZONTALE² au bitume (au-dessus d'un trou elle explose → l'ombre de contact se cache) · lastNearS : où l'on en est SUR la piste pendant un vol (recentre le LOD de proximité)
    caseHot=false,heartT=0,ladderI=0;        // la MALLETTE tremble + cœur qui cogne · échelle des paliers
// ---------- FLAVOUR : les phrases qui font le sel du jeu — courtes, arrogantes, cash ----------
const pickL=a=>a[Math.floor(Math.random()*a.length)];
// LE DÉBLOCAGE : elle est à toi, définitivement — on le dit autrement qu'un « nouvelle caisse » plat
const CAR_LINES=['ELLE EST À TOI','CLÉS EN MAIN','LIVRÉE, RODÉE, VOLÉE','TU CHANGES DE MONDE',
  'SIGNÉ, EMBARQUÉ','ELLE T\'ATTENDAIT','NOUVEAU JOUET','ENCARTÉE AU GARAGE'];
const GO_LINES=[ // le départ : une gifle d'encouragement, jamais deux fois la même
 'GO ! NE MEURS PAS','PIED AU PLANCHER — QUESTIONS APRÈS','LA PRUDENCE RESTE AU GARAGE',
 'ROULE COMME SI L\'ESSENCE ÉTAIT GRATUITE','LE FREIN, C\'EST LA PÉDALE DES AUTRES','VAS-Y. LE CIEL REGARDE.'];
const ZONE_LINES=[ // le portail : chaque zone avalée se célèbre
 'NOUVELLE ZONE !','ZONE AVALÉE — SUIVANTE !','ENCORE UNE ZONE AU COMPTEUR !','LA ROUTE EST À TOI !','ZONE SUIVANTE — ON RALENTIT PAS !'];
const RAIN_LINES=[ // la pluie de billets : le compte en banque a le vertige
 '💸 IL PLEUT DES BILLETS — PARAPLUIE INUTILE','💸 LA BANQUE A APPELÉ : ELLE ABANDONNE','💸 TON COMPTE A LE VERTIGE','💸 L\'ARGENT TOMBE PLUS VITE QUE TOI'];
const END_LINES=[ // fin de run (même en crash) : la punchline sous le GAME OVER
 'LA ROUTE GAGNE. CETTE FOIS.','LE BITUME SE SOUVIENDRA DE TOI','MÊME LES LÉGENDES TOUCHENT LE SOL',
 'CRASH TEST RÉUSSI. ENFIN… TEST.','LA GRAVITÉ : 1 — TOI : 0','T\'ES MORT. LES THUNES, ELLES, RESTENT.',
 'REVIENS. LA VITESSE S\'ENNUIE DÉJÀ.'];
const END_TOP=[ // fin de run AVEC record : là on s'incline
 '🏆 RECORD — LES AUTRES JOUENT À UN AUTRE JEU','🏆 LE LEADERBOARD A DEMANDÉ TON AUTOGRAPHE',
 '🏆 RECORD ÉCRASÉ — COMME TES SUSPENSIONS','🏆 HISTORIQUE. LA ROUTE S\'EN REMET À PEINE.'];
// ---- L'ÉCHELLE : chaque palier de multiplicateur se CRIE — le plafond ×6 devient un objectif nommé ----
const LADDER=[[2,'ÇA CHAUFFE !'],[3,'EN FEU !!'],[4.5,'AURA EN FUSION'],[6,'MULTI MAX !!']]; // (2026-09-29, passe qualité) « IL PLEUT DES BILLETS » / « JACKPOT MAX » : les figures ne paient plus qu'en aura
const flyV=new THREE.Vector3();
function flyCash(worldPos,n){ // les billets VOLENT de la caisse vers le compteur — l'argent SE VOIT gagné
  flyV.copy(worldPos).project(camera);
  if(flyV.z>1)return; // derrière la caméra : rien à montrer
  if(SONV2&&!document.body.classList.contains('touch')){const m9=Math.min(4,n|0);for(let k=0;k<m9;k++){const i9=m9>1?Math.round(k*(n-1)/(m9-1)):0;sfx('billet.vole',{t:.58+i9*.045,st:sonPd(k)});}} // (console de son) sur téléphone .bill est masqué (écran nu) : pas de son sans image
  if(LEFIL.on)return; /* (2026-10-25, LE FIL) le son est joué, mais plus de billets qui traversent l'écran : le compteur d'argent se met à jour seul */
  const x0=(flyV.x*.5+.5)*innerWidth,y0=(-flyV.y*.5+.5)*innerHeight;
  const r=elMoney.getBoundingClientRect(),x1=r.left+r.width/2,y1=r.top+r.height/2;
  for(let i=0;i<n;i++){
    const b=document.createElement('div');b.className='bill';b.textContent='$';
    b.style.left=(x0+(Math.random()-.5)*70)+'px';b.style.top=(y0+(Math.random()-.5)*46)+'px';
    document.body.appendChild(b);
    setTimeout(()=>{b.style.left=x1+'px';b.style.top=y1+'px';b.style.opacity=0;b.style.fontSize='8px';},30+i*45);
    setTimeout(()=>{b.remove();},640+i*45);
  }
}
function trickPop(k){ // carillon qui MONTE d'un demi-ton par maillon — l'oreille réclame la suite
  chimeNote(noteP(Math.min(7,k-1),1),0,.09,.16); // (même tonalité que les pièces)
}
function chainHudShow(){
  chainHud.textContent=TR('CHAÎNE ×')+decFr(Math.min(6,chainMult),1)+' · +'+Math.round(chainVal);
  chainHud.style.opacity=1;
  chainHud.classList.remove('pulse');void chainHud.offsetWidth;chainHud.classList.add('pulse');
}
function addTrick(id,txt,val,tier,raw,free){ // raw : échelles qui grimpent déjà (vrilles, bumps) — pas de décote. free : figure GRATUITE, zéro dollar : feedback oui, argent non (plus personne depuis le 15/10 soir : le bump paie comme les autres)
  if(fever>0&&!free)fever=Math.min(18,fever+.8); // pendant le BRAQUAGE, chaque figure PROLONGE le plaisir (plafond 18 s) — sauf les gratuites
  const n=(chainSeen[id]=(chainSeen[id]||0)+1);
  /* L'AURA PASSE PAR LE COMBO, PAS PAR LA VALEUR DE LA FIGURE. Même les figures GRATUITES (le bump)
     comptent : elles ne valent pas un dollar mais elles PROLONGENT l'enchaînement, et c'est
     l'enchaînement qu'on récompense. */
  // (aura v2) chaque figure entre dans la CHAÎNE avec ses points (voir chaineAura) — plus de combo à rang invisible
  // (2026-09-26, audit son) `muet` : `trickPop` plus bas sonne déjà le maillon — deux carillons sur deux notes brouillaient la gamme qui monte
  if(id==='vrille')chaineAura(spinHalf*180+'°',45,'vrille',true,true);
  else if(String(id).indexOf('fig_')===0){const f9=window.FIG&&FIG.par[id.slice(4)];chaineAura(txt,FX2.aura>0?FX2.aura:f9?f9.aura:60,id,false,true);} // (2026-10-14) LES FIGURES du double-tap nitro (figures.js) — v2 : l'aura × ses tours (FX2.aura)
  else if(id==='bump')chaineAura(bounceN>1?'BUMP ×'+bounceN:'BUMP',30,'bump',true,true);
  else chaineAura(String(txt).split(' — ')[0],40,id,false,true);
  // (FLOW v2) LE RISQUE NOURRIT LE FLOW EN DIRECT : en l'air la jauge monte PENDANT qu'on vrille (et le vide ne la fait pas fuir).
  // La vrille paie par demi-tour ; les autres selon leur rang, et la redite s'use comme dans la mallette (×0,6).
  if(mode==='fall'&&!free)flowAdd(id==='vrille'?4:(tier===3?12:tier===2?9:6)*Math.pow(.6,n-1),'risque');
  if(!free){ // une figure gratuite ne touche NI la mallette (chainVal) NI le multiplicateur NI l'échelle
    chainVal+=raw?val:val*Math.pow(.6,n-1);
    chainMult+=n===1?.5:.15;
    while(ladderI<LADDER.length&&Math.min(6,chainMult)>=LADDER[ladderI][0]){ // palier franchi : on le crie
      trickMsg('×'+LADDER[ladderI][0]+' — '+TR(LADDER[ladderI][1]),LADDER[ladderI][0]>=4.5?3:2);
      if(SONV2){if(LADDER[ladderI][0]>=6)sfx('fig.jackpot');else sfx('fig.palier',{st:echSt()});}else chimeNote(noteP(ladderI+3,1),0,.12,.22); // l'échelle monte à l'oreille aussi (mi pentatonique)
      ladderI++;
    }
  }
  chain++;if(!free)secFig();m2Fig(id); /* (2026-10-16) LES MISSIONS v2 : figures d'un saut, salto devant la Terre */ // (2026-10-14) LES DÉFIS SECRETS : LAMPADAIRE (les figures de la ville, la nuit)
  if(chain>(runStats.chainMax||0))runStats.chainMax=chain;
  trickMsg(txt+(n>2&&!raw?' ×'+n:''),tier||false); // (dauphin v5) en vol, le dauphin ne s'ÉCRIT pas : on le voit nager
  addStyle(tier===3?16:tier===2?11:7);
  figSnd(id); // (2026-09-28) chaque figure a sa matière, sur l'échelle du vol (voir LA CONSOLE DE SON)
  chainHudShow();
}
function respawn(){
  dmtCoupe();
  /* ===== RIEN DE LA PARTIE D'AVANT (24/10, relecture : « une partie arrêtée en pleine figure sur la route ou en pleine descente d'une
     pose ») ===== pause → RECOMMENCER / QUITTER, ou mort au sol, pendant le bond d'une figure (FR) ou les 0,1-0,5 s où la pose finit sa
     descente (POSE_F) : la partie suivante finissait et PAYAIT l'ancienne figure au départ, et POSE_F resté posé refusait le saut nitro,
     le décollage au manche et les figures au sol du GLISSER jusqu'au vol suivant (preuve-reste-figure.cjs). */
  POSE_F=null;try{frCoupe();}catch(e){}
  try{slideRaz();}catch(e){} // (SLIDE) replacé : le frottement en cours est perdu
  try{bkSkateRaz();BKV.yaw=0;BKV.gl=0;BKV.gk=0;}catch(e){} // (ICE SKATE) la glisse aussi · (2026-10-15 soir) et la glissade sur le verglas
  SVOL.t=0;SVOL.k=0; // (2026-10-14, session SON) replacé : la tension du vol ne survit pas
  for(const t9 of SILS)t9.init=false;rainbowCoupe();nfeuCoupe(); // (2026-09-26) pas de ruban tendu jusqu'au point de replacement
  LIGNE.sPk=null;LIGNE.sPd=LIGNE.sPd0=s; // (LIGNE PARFAITE, audit GAMEPLAY) le balayage de trajet repart d'ici : sinon il ramassait, sans contact, l'objet qu'on venait de rater
  JEAU.dans=false;JEAU.wB=0; // (2026-10-13) replacé sur la route : plus sous l'eau — (2026-10-14, revue des idées de Léo) et plus redressé par elle : wB restait vers 1 en conduite, et au saut suivant la vrille et le vol équilibré étaient coupés 1-2 s
  momT=0; // (momentum v2) repartir = réserve vide
  if(introD){introD=false;if(pigGroup){scene.remove(pigGroup);pigGroup=null;}} // R pendant le largage : on annule proprement
  s=THREE.MathUtils.clamp(safeS-8,0,Math.max(0,L-80));
  lat=0;psi=0;vA=26;vL=0;side=1;FREIN_L=0;MURC.psiK=0;/* (2026-10-17) ni frein étalé ni renvoi de paroi en cours */driveDir=1;graceT=1.6;prevTvalid=false;yawAcc=0;hopY=0;hopV=0;levreY=0;bascOn=false;bascT=0;mode='drive';yawR=0;slipB=0;glisse9=0;driftYaw=0;driftEnCours=false;driftC=0;driftLv=0;driftT=0;carRoll9=0;rollV=0;pitch9=0;
  if(SENS)try{SENS_PA.rs=1;}catch(e){} // (2026-10-14, sensations · passages) un replacement vient d'avoir lieu : sensPassages le lit à l'image suivante (rien n'est joué ici — respawn sert aussi au chargement et au départ)
}
// FREESTYLE : on ne MEURT jamais dans le parc — on repart sur la piste. La chaîne en cours est perdue
// (on n'a pas su reposer), mais aucune explosion, aucun game over : c'est un bac à sable de figures.
function sandRevive(){ // BAC À SABLE : on efface les dégâts et on repart, la run continue
  clearBoom();
  chain=0;chainVal=0;chainMult=1;chainSeen={};chainHud.style.opacity=0;
  caseHud.style.opacity=0;caseHud.className='';caseHot=false;
  airPie.style.display='none';airFlash=0;
  insUsed=false;nitroR=nitroCap();nitroX=0;boost=0;slowT=0;hitT=0;
  respawn();if(SONV2)sfx('respawn'); /* (console de son) le repêchage s'entend */
  hopY=2.2;hopV=0;try{flashEcran('rgba(255,255,255,.35)');}catch(e){} // (2026-09-28) elle RETOMBE sur sa ligne (tassement compris) au lieu d'y apparaître : on voit qu'on repart
}
function parkRespawn(){
  chain=0;chainVal=0;chainMult=1;chainHud.style.opacity=0;
  caseHud.style.opacity=0;caseHud.className='';caseHot=false;
  airPie.style.display='none';airFlash=0;
  respawn();if(SONV2)sfx('respawn');hopY=2.2;hopV=0;try{flashEcran('rgba(255,255,255,.35)');}catch(e){} // (2026-09-28) la caisse retombe sur sa ligne
  showMsg('↻ ON REPART','#7dffec');
}
// ⚠ CE N'EST PLUS L'ARGENT DE LA PARTIE QUI DÉBLOQUE LES CAISSES (2026-08-03). Avant, `level` montait
// en pleine course dès que `levelCash` passait un seuil : la caisse conduite ne changeait plus (elle
// est cosmétique) mais `level` si — d'où un HUD qui affichait la dernière caisse GAGNÉE au lieu de
// celle qu'on PILOTE, et un overdrive de vitesse qui grimpait avec elle. `level` est désormais FIXE
// pour toute la partie : c'est la caisse équipée au garage, point.
// Le déblocage passe par des conditions PERSISTANTES (voir CAR_UNLOCK) ; on scanne ici pour crier
// tout de suite celles qui tombent en direct (record d'argent, palier moteur), le reste est versé à
// la fin du run par commitExploits().
function checkUpgrade(){
  const got=carScan();
  if(!got.length)return;
  boost=Math.max(boost,1.3);try{if(SONV2)sfx('caisse.debloquee');else fanfare();}catch(e){}shake=Math.max(shake,.4);
  sparkBurst(sparkGold,carGroup.position,30,17);
  for(const i of got){
    const sp9=CARS[i];
    showMsg(TR(pickL(CAR_LINES))+' — '+TR(sp9.name)+'  '+TR('(au garage)'),'#ffd75e');
    trickMsg('🔑 '+TR(sp9.name),3);
    if(!REDUCED_MOTION&&running&&!gameOver)try{feteCaisse(i);}catch(e){} /* (2026-10-23) en course aussi : la fête de sa rareté */
  }
  SAVE.flush();
}
/* LE PASSAGE DU PORTAIL (2026-09-26) — une seule fonction, deux entrées : au SOL (bout de piste ou entrée dans l'ovule) et en VOL
   (l'ovule se traverse d'où qu'on vienne, y compris en tombant du ciel). Le test ne vivait que dans la branche « au sol » de la
   boucle : en l'air, on traversait l'ovule sans rien déclencher. */
/* L'ORBITE A SES PORTES (2026-09-28, Sacha — idée reprise d'une session cloud) : on n'arrive plus dans l'espace par un simple fondu.
   ENTRÉE = un TUNNEL DE DISTORSION (1,9 s) : le monde s'incurve à fond (la distorsion du boost, poussée au maximum), le champ se
   déchire, des traits de lumière filent le long de la caisse, éclair bleu à l'entrée et à la SORTIE du tunnel.
   SORTIE = une RENTRÉE ATMOSPHÉRIQUE EN FEU (2,6 s) : la caisse retombe dans le ciel enveloppée de plasma — flammes au nez qui
   lèchent la carrosserie et traînent derrière, braises, tremblement, grondement, éclair orange.
   Déclenché par newTrack au passage d'un monde à l'autre, seulement quand on FRANCHIT un portail en course (pas au départ d'une
   partie ni au menu). Rien ne se construit : traits, particules et éclairs sont ceux du jeu. */
const ORBFX={warp:0,feu:0,prev:null,sortie:false,f:new THREE.Vector3(),r:new THREE.Vector3(),u:new THREE.Vector3(),p:new THREE.Vector3()};
function orbWarp(){
  ORBFX.warp=1;ORBFX.feu=0;ORBFX.sortie=false;
  flashEcran('rgba(140,210,255,.85)');hap([20,30,20,30,60]);shake=Math.max(shake,.45);
  try{if(SONV2)sfx('orbite.entre');else{whoosh();boostSnd(2.2);subBoom(.14);noiseBurst(1.1,.12,1800);}}catch(e){}
}
function orbFeu(){
  ORBFX.feu=1;ORBFX.warp=0;
  flashEcran('rgba(255,120,40,.85)');hap([30,40,30,40,80]);shake=Math.max(shake,.6);
  try{if(SONV2)sfx('orbite.sort');else{crackle(1);subBoom(.18);noiseBurst(1.6,.2,420);}}catch(e){}
}
function orbFxTick(dt){
  if(!(ORBFX.warp>0||ORBFX.feu>0)){if(ORBFX.halo&&ORBFX.halo.visible)ORBFX.halo.visible=ORBFX.halo2.visible=false;return;}
  if(gameOver||!running||!started){ORBFX.warp=ORBFX.feu=0;if(ORBFX.halo)ORBFX.halo.visible=ORBFX.halo2.visible=false;return;}
  const q=carGroup.quaternion,c=carGroup.position,F9=ORBFX.f.set(0,0,1).applyQuaternion(q),R9=ORBFX.r.set(1,0,0).applyQuaternion(q),U9=ORBFX.u.set(0,1,0).applyQuaternion(q);
  if(ORBFX.warp>0){
    ORBFX.warp=Math.max(0,ORBFX.warp-dt/1.9);const w=ORBFX.warp;
    fovPunch=Math.max(fovPunch,34*Math.sqrt(w)); // le champ se DÉCHIRE (la caméra relâche fovPunch toute seule)
    if(!REDUCED_MOTION)for(let k=0;k<2;k++){ // les parois du tunnel : des traits sur un anneau autour de la caisse, qui filent vers l'arrière
      const a=Math.random()*6.2832,R=7+Math.random()*12,d=25+Math.random()*70,ln=18+50*w;
      ORBFX.p.copy(c).addScaledVector(F9,d).addScaledVector(R9,Math.cos(a)*R).addScaledVector(U9,Math.sin(a)*R*.8);
      spawnStreak(ORBFX.p.x,ORBFX.p.y,ORBFX.p.z,-F9.x*ln,-F9.y*ln,-F9.z*ln);}
    if(!ORBFX.sortie&&w<.18){ORBFX.sortie=true;flashEcran('rgba(200,235,255,.65)');try{if(!SONV2)chimeNote(1320,0,.06,.4);}catch(e){}} // la SORTIE du tunnel : l'espace s'ouvre
  }
  if(ORBFX.feu>0){
    ORBFX.feu=Math.max(0,ORBFX.feu-dt/2.6);const f9=ORBFX.feu,sp=CARS[level];
    shake=Math.max(shake,.28*f9);
    if(!REDUCED_MOTION){ // le PLASMA : né au nez et sur les flancs, il hérite de la vitesse de la caisse (EXV) et LÈCHE la carrosserie vers l'arrière
      const n=Math.ceil(6*f9);for(let k=0;k<n;k++){
        // (vu en capture : nées au nez, la caisse les CACHAIT à la caméra de poursuite) — 30 % au nez, 70 % sur la SILHOUETTE vue de
        // derrière : les deux flancs et le toit, juste au bord de la carrosserie, d'où elles filent vers l'objectif
        const bout=Math.random()<.3,cote=Math.random()<.5?-1:1,toit=!bout&&Math.random()<.4;
        ORBFX.p.copy(c).addScaledVector(F9,bout?sp.l*.55+Math.random()*.5:(Math.random()-.2)*sp.l*.7)
          .addScaledVector(R9,bout?(Math.random()-.5)*sp.w:toit?(Math.random()-.5)*sp.w*.8:cote*sp.w*(.52+Math.random()*.15))
          .addScaledVector(U9,toit?sp.h+.15+Math.random()*.35:.3+Math.random()*sp.h*.8);
        const v=9+Math.random()*12;
        spawnP(flames,ORBFX.p.x,ORBFX.p.y,ORBFX.p.z,EXV.x*.92-F9.x*v+(Math.random()-.5)*3,EXV.y*.92-F9.y*v+Math.random()*2,EXV.z*.92-F9.z*v+(Math.random()-.5)*3,.2+Math.random()*.18);
        if(k<2)spawnP(flameCore,ORBFX.p.x,ORBFX.p.y,ORBFX.p.z,EXV.x*.95-F9.x*v*.6,EXV.y*.95+.5,EXV.z*.95-F9.z*v*.6,.12+Math.random()*.1);
        if(Math.random()<.35)spawnP(embers,ORBFX.p.x,ORBFX.p.y,ORBFX.p.z,EXV.x*.8-F9.x*v*.8+(Math.random()-.5)*7,EXV.y*.8+Math.random()*4,EXV.z*.8-F9.z*v*.8+(Math.random()-.5)*7,.4);}}
    { // LE BOUCLIER DE PLASMA : un halo orange vif au NEZ, une lueur rouge qui ENVELOPPE la caisse — deux sprites additifs (le programme
      // des halos de pouvoirs : aucune compilation), posés dans la scène et non dans la caisse (buildCar la vide à chaque changement)
      if(!ORBFX.halo){const m9=new THREE.SpriteMaterial({map:lampTex,color:0xff7a2a,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
        ORBFX.halo=new THREE.Sprite(m9);ORBFX.halo2=new THREE.Sprite(m9.clone());ORBFX.halo2.material.color.setHex(0xff3a12);
        for(const h9 of [ORBFX.halo,ORBFX.halo2]){h9.renderOrder=5;h9.visible=false;scene.add(h9);}}
      const tt=performance.now()/1000,fl=.78+.22*Math.sin(tt*41)*Math.sin(tt*17); // (`t` n'existe que dans la boucle)
      ORBFX.halo.visible=ORBFX.halo2.visible=f9>0;
      ORBFX.halo.position.copy(c).addScaledVector(F9,sp.l*.52).addScaledVector(U9,sp.h*.45);ORBFX.halo.scale.set(sp.w*2.6,sp.h*2.4,1);
      ORBFX.halo.material.opacity=Math.min(1,1.1*f9)*fl;
      ORBFX.halo2.position.copy(c).addScaledVector(U9,sp.h*.5);ORBFX.halo2.scale.set(sp.l*1.7,sp.l*1.2,1);
      ORBFX.halo2.material.opacity=.55*f9*fl;
    }
    ORBFX.pouls=(ORBFX.pouls||0)-dt;
    if(f9>.3&&ORBFX.pouls<=0){ORBFX.pouls=.45;flashEcran('rgba(255,110,30,'+(.35+.4*f9).toFixed(2)+')');} // les bords de l'écran BATTENT en orange tant que ça brûle
    if(!SONV2&&f9>.4&&Math.random()<dt*5)try{crackle(.3*f9);}catch(e){} /* (débogage son 2026-09-29) orbite.sort porte déjà le feu de la rentrée */
  }
}
/* LE PLAFOND DE VITESSE COMMUN (2026-09-29, nuit — trouvé par DEBUGGING, mesuré) : ×2,6 est la vitesse d'avance la plus haute qui reste pilotable
   (mesuré : au-delà de ×4,6 la caisse décolle à chaque relief et meurt « TROP LONGTEMPS EN L'AIR »). C'est le plafond de TOUT ce qui multiplie
   l'avance (VITESSE ×2 aujourd'hui). Un seul endroit : la boucle (spdMult) et la LIGNE PARFAITE (ligneTick) lisent vitMult(). */
function vitMult(){return Math.min(2.6,1+pwrSpdK);} /* (2026-10-17) pwrSpdK : le ×2 de VITESSE monte et retombe en ~0,4 s (voir pwrSpdK) */
function portailPasse(){
  if((BALADE||JADE_JEU)&&LVL.cur&&LVL.cur.id==='jade'&&JADE.root){jadeFinale();return;} // (v14) la balade de jade a une FIN : l'arrivée, puis le départ
  const sP=survPortS(); // (2026-09-30) ce que la course du Survivant avance au passage (en vol : voir survPortS)
  if(TUTO.on&&!PARK.on){SURV.pBase+=sP;newTrack();return;} // (2026-09-28) l'auto-école ne s'échappe pas par le portail (le débutant qui n'osait pas sauter finissait la leçon dans la VILLE) : la piste d'apprentissage repart
  evtPortail(); // (2026-10-14, GAMEPLAY) LES ÉVÉNEMENTS RARES : la caisse-nuage encore en course quand on passe le portail, c'est raté
  if(mode==='fall'){airPie.style.display='none';vA=Math.max(vA,Math.hypot(fallVel.x,fallVel.z)/vitMult()); // traversé en VOL : le vol s'arrête proprement, l'élan est gardé (inertie) — (2026-09-30) ÷ vitMult : le vol porte la vitesse réelle
    /* (2026-09-28, Sacha : « quand on coupe la route pour rejoindre le portail plus vite, ça doit quand même rapporter du machiavélisme »)
       LE RACCOURCI VERS LE PORTAIL : on n'atterrit pas, donc tryLand ne le voyait jamais. Même mesure qu'à la pose — la piste qu'il
       restait à rouler jusqu'à l'entrée de l'ovule (son centre est à L−25, son rayon 55 : ~L−80) moins la ligne droite volée. */
    if(!PARK.on&&!TUTO.on){const gagne=(L-80-FLOW.s0)-FLOW.p0.distanceTo(fallPos);if(gagne>=60)flowRaccourci(gagne);else if(gagne>=25)frenTrait('m',gagne/60);}
    // (2026-09-26) …et la CHAÎNE est ENCAISSÉE comme à une pose : avant, l'argent de la mallette disparaissait sans un mot et le HUD restait affiché
    if(chain>0)runStats.tricks++; // (2026-09-29) les figures ne rapportent plus d'argent : la figure du vol compte, rien n'est versé (l'aura ouverte, elle, continue sa chaîne)
    chain=0;chainVal=0;chainMult=1;chainSeen={};chainHud.style.opacity=0;caseHud.style.opacity=0;caseHud.className='';caseHot=false;}
  flashEcran('rgba(255,79,216,.6)'); // l'annonce, c'est « NIVEAU n — LIEU » (lvlAnnonce, couloir des annonces) : une seule voix au centre
  portalSnd();if(!SONV2)boostSnd();shake=.5; /* (console de son) `portail` porte tout le passage : plus le souffle d'un pad dessous */
  if(SENS)try{sensHap([22,36,12],3);}catch(e){} // (2026-10-14, sensations · passages) le portail CLAQUE dans la main : un coup lourd puis son écho — le plus gros passage du jeu avait son flash, son souffle et sa secousse, mais pas une vibration (les finales et l'auto-école sortent plus haut : rien)
  const zb=denom()*120*(fever>0?2:1)*flowMult(); /* (2026-10-14, équilibrage) 24 → 120 : un portail paie 15-20 s de pièces, un vrai jalon (+3-5 % sur une bonne partie) */money+=zb;levelCash+=zb;livre('$:portail',zb);checkUpgrade();frenCash(zb,carGroup.position); // portail : 40→24 (régulation 2026-07-30) · (2026-09-29) × le FLOW comme les pièces : franchi en FRÉNÉSIE, il paie ×3
  runStats.zones++;secPorte(); // (2026-10-14) LES DÉFIS SECRETS : LUNAIRE
  if(SONV2&&nitroR<nitroCap()-.05)sfx('nitro.plein',{t:.45}); // (console de son) le portail refait le plein : on l'entend, après l'aspiration
  nitroR=Math.max(nitroR,nitroCap()); // le portail regonfle la nitro : chaque zone repart pied au plancher — au plein du MOTEUR (en dur à 2, il vidait un réservoir de 3,6)
  trickMsg(TR(pickL(ZONE_LINES))+' +'+fmtC(zb),true);
  flyCash(carGroup.position,8);
  SURV.pBase+=sP; // la course traverse le portail : les écarts restent vrais (téléportation invisible) — (2026-09-30) même franchi en vol
  portPasseNiveau();
}
/* LE PASSAGE EN DEUX TEMPS (2026-10-05, Léo : « rends plus smooth la transition entre deux niveaux qui se suivent, avec le portail »).
   MESURÉ (banc, dbgSaut) : construire le niveau suivant = 300 à 460 ms de calcul, puis la 1re image du nouveau monde 1,3 à 2,9 s (ses
   programmes se compilent) contre 0,2 s pour une image ordinaire — sur téléphone c'est plus court, mais c'est CE gel qu'on sentait : l'image
   restait figée sur l'ancien portail, puis tout sautait (piste, caméra, ciel, musique) sous un flash qui ne colorait que les BORDS.
   Désormais : le VOILE (#portV) se pose à l'instant du passage, l'image est PEINTE, et la construction part à l'image d'après (deux rAF) ;
   le voile tient ~0,28 s (la chauffe des programmes, CHAUFFE_R à +120 ms, tombe dessous) puis s'ouvre en 0,5 s. Pendant l'attente (1 à 2
   images) la caisse reste à la bouche du portail (s ≤ L − 2 : 32 m de marge, mais à 1 900 km/h une image en avale 9). En VOL, la
   construction reste immédiate (la chute continuerait) : le voile cache la coupe. Le temps du jeu, lui, ne ralentit JAMAIS (règle du 26/09). */
const PORTV={el:null,att:0,n:0,tS:0,t0:0};
/* LE PASSAGE PAR LA FENÊTRE (2026-10-17, Léo : « revoir tout le système de transition entre chaque map »). Avec le portail de cubes, le voile
   du passage n'est plus un écran à part (les feux du départ) : c'est L'IMAGE MÊME qu'on traverse. À l'instant du passage la scène est rendue
   une fois et recopiée dans une toile plein écran (la fenêtre couvre déjà tout l'écran : on y voit la map d'en face) ; la toile AVANCE (un
   zoom joué par le compositeur : il continue pendant que newTrack bloque le script) ; le monde neuf bâti, elle se DÉFAIT EN CUBES — des
   carrés qui rétrécissent, du centre vers les bords — sur la vraie map d'arrivée, qui est la vue même de la carte postale. Aucun calcul
   pendant la construction ; ~500 petits dessins par image pendant 0,44 s ensuite. */
const PCV={el:null,cv:null,g:null,src:null,sg:null,t0:0,raf:0,tS:0,fen:false,copie:false}; // fen : un passage par la fenêtre est en cours (newTrack bascule le ciel d'un coup)
function pcVoile(rendre){
  let e=PCV.el;
  if(!e){e=document.createElement('div');e.id='portC';e.setAttribute('aria-hidden','true');const cv=document.createElement('canvas');e.appendChild(cv);document.body.appendChild(e);
    PCV.el=e;PCV.cv=cv;PCV.g=cv.getContext('2d');PCV.src=document.createElement('canvas');PCV.sg=PCV.src.getContext('2d');
    const st=document.createElement('style');st.id='portailCubes';
    st.textContent='#portC{position:fixed;inset:0;z-index:8;pointer-events:none;opacity:0;overflow:hidden;contain:strict}'+
      '#portC canvas{position:absolute;inset:0;width:100%;height:100%;transform-origin:50% 44%;will-change:transform}'+
      '#portC.go canvas{animation:pcAvance 1.5s cubic-bezier(.25,.55,.35,1) both}@keyframes pcAvance{from{transform:scale(1)}to{transform:scale(1.16)}}';
    document.head.appendChild(st);}
  cancelAnimationFrame(PCV.raf);clearTimeout(PCV.tS);
  const k=Math.min(1.5,window.devicePixelRatio||1),w=Math.max(2,Math.round(VP.w*k)),h=Math.max(2,Math.round(VP.h*k));
  if(PCV.cv.width!==w||PCV.cv.height!==h){PCV.cv.width=w;PCV.cv.height=h;PCV.src.width=w;PCV.src.height=h;}
  PCV.fen=true;
  /* (3e tour) PAS DE RENDU EN PLUS : au sol, l'image qu'on traverse est recopiée juste APRÈS le rendu normal de cette image (pcCopie, appelée
     par la boucle) — un rendu complet de moins au moment le plus chargé. En vol, newTrack part tout de suite : là, on rend une fois. */
  if(rendre){try{if(POST_ON&&composer)composer.render();else renderer.render(scene,camera);}catch(er){}pcCopie();}else PCV.copie=true;}
function pcCopie(){PCV.copie=false;const e=PCV.el,w=PCV.cv.width,h=PCV.cv.height;
  try{PCV.sg.drawImage(renderer.domElement,0,0,w,h);}catch(er){PCV.sg.fillStyle='#0b0920';PCV.sg.fillRect(0,0,w,h);} // l'image qu'on traverse, telle qu'à l'écran
  PCV.g.clearRect(0,0,w,h);PCV.g.drawImage(PCV.src,0,0);
  e.style.opacity='1';e.classList.remove('go');void e.offsetWidth;if(!REDUCED_MOTION)e.classList.add('go');PCV.t0=performance.now();}
function pcPrepare(){ // la grille des cubes de l'image et l'ordre où ils partent : du centre (un peu au-dessus du milieu : la route y file) vers les bords, avec du hasard
  const W=PCV.cv.width,H=PCV.cv.height,B=Math.max(12,Math.round(Math.min(W,H)/15)),nx=Math.ceil(W/B),ny=Math.ceil(H/B),th=new Float32Array(nx*ny);
  const cx=W*.5,cy=H*.44,dm=Math.hypot(Math.max(cx,W-cx),Math.max(cy,H-cy));
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)th[j*nx+i]=.62*Math.hypot((i+.5)*B-cx,(j+.5)*B-cy)/dm+.38*Math.random();
  PCV.W=W;PCV.H=H;PCV.B=B;PCV.nx=nx;PCV.ny=ny;PCV.th=th;}
function pcDessine(p){ // p 0 → 1 : chaque cube rétrécit sur lui-même puis s'en va
  const g=PCV.g,src=PCV.src,W=PCV.W,H=PCV.H,B=PCV.B,nx=PCV.nx,ny=PCV.ny,th=PCV.th,q=p*1.3-.14;g.clearRect(0,0,W,H);
  if(REDUCED_MOTION){g.globalAlpha=1-p;g.drawImage(src,0,0);g.globalAlpha=1;return;}
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=(th[j*nx+i]-q)/.16;if(a<=0)continue;const z=a>=1?B:B*a,o=(B-z)*.5,x=i*B,y=j*B;g.drawImage(src,x,y,B,B,x+o,y+o,z,z);}}
/* (2026-10-17, 3e tour — Léo : « la pause est beaucoup trop longue ; je préférais la première, qui donnait l'impression qu'on changeait de
   dimension, et on reprenait la main ensuite » — la traversée en paliers de pixels + tunnel est RETIRÉE, la 1re revient, plus COURTE) : le
   voile attendait 220 ms après la construction, puis 120 ms de plus pour la chauffe des programmes, qui tombait PENDANT les cubes (un à-coup
   au milieu). Désormais la chauffe du monde neuf part TOUT DE SUITE, sous l'image (CHAUFFE_R.t = maintenant), les cubes partent une image
   plus tard, sur un monde déjà prêt, et se défont en 0,30 s (0,44) ; au sol, plus de rendu en plus ni d'image d'attente de trop (pcCopie). Mesuré au banc : voir le JOURNAL. */
function pcVoileSort(){PCV.fen=false;cancelAnimationFrame(PCV.raf);clearTimeout(PCV.tS);
  try{CHAUFFE_R.t=performance.now();}catch(e){}
  let n=0;const go=function(){if(++n<2){PCV.raf=requestAnimationFrame(go);return;}
    pcPrepare();const D=(REDUCED_MOTION?260:300)*(PCV.lent||1),t0=performance.now();PCV.tD=t0;
    const f=function(){const p=Math.min(1,(performance.now()-t0)/D);pcDessine(p);
      if(p<1)PCV.raf=requestAnimationFrame(f);else{PCV.el.style.opacity='0';PCV.el.classList.remove('go');PCV.tF=performance.now();}};
    PCV.raf=requestAnimationFrame(f);};
  PCV.raf=requestAnimationFrame(go);}
window.dbgPassage=function(p,k){if(p==='lent'){PCV.lent=k||1;return PCV.lent;}if(p==null){pcVoile();PCV.fen=false;return 'voile posé';}pcPrepare();pcDessine(+p);return {B:PCV.B,cubes:PCV.nx*PCV.ny};}; // (banc) la toile du passage figée à p
function portVoile(){
  let e=PORTV.el;if(!e){e=document.createElement('div');e.id='portV';e.setAttribute('aria-hidden','true');
    e.innerHTML='<div class="pfxW"><div class="pfx"><i></i><i></i><i></i></div></div>';document.body.appendChild(e);PORTV.el=e;} // les FEUX DU DÉPART (voir le CSS de #portV)
  clearTimeout(PORTV.tS);e.style.transition='none';e.style.opacity=REDUCED_MOTION?'.45':'.94';e.classList.remove('go');void e.offsetWidth;e.classList.add('go');PORTV.t0=performance.now();}
function portVoileSort(ms){ms=Math.max(ms,560-(performance.now()-(PORTV.t0||0))); // le voile ne s'ouvre qu'une fois le VERT allumé (450 ms) et vu un instant
  clearTimeout(PORTV.tS);PORTV.tS=setTimeout(function(){const e=PORTV.el;if(!e)return;
  e.style.transition='opacity .5s cubic-bezier(.3,.6,.3,1)';e.style.opacity='0';},ms);}
function portPasseNiveau(){
  const cub=PCUBE.on; // (2026-10-17) le portail de cubes : on passe PAR LA FENÊTRE (pcVoile) au lieu des feux du départ
  if(cub)pcVoile(mode!=='drive');else portVoile();try{document.dispatchEvent(new Event('cc:portail'));}catch(e){} // (PERF) voir LES SIGNAUX DE CONSTRUCTION
  if(mode!=='drive'){PORTV.att=0;prebPorte(newTrack);if(cub)pcVoileSort(220);else portVoileSort(280);return;} // (LE PRÉ-BÂTI) prebPorte : c'est le portail qui construit
  const tok=PORTV.att=++PORTV.n;
  // (2026-10-17, 3e tour) avec la fenêtre, UNE image d'attente suffit : la copie et le voile sont posés à la fin de CETTE image (pcCopie), peints avant la suivante
  const r1=cub?function(f){f();}:requestAnimationFrame;
  requestAnimationFrame(function(){r1(function(){
    if(PORTV.att!==tok)return;PORTV.att=0;
    if(started&&!gameOver&&!PARK.on&&mode!=='boom')prebPorte(newTrack); // (LE PRÉ-BÂTI) prebPorte : c'est le portail qui construit · (2026-10-14, chasse aux bugs) mode!=='boom' : morte dans les 2 images d'attente, la caisse explose ENCORE (gameOver ne tombe qu'à endGame, 1,8 s plus tard) — newTrack lui remettait mode='drive' : plus d'endGame, elle roulait après sa mort
    if(cub)pcVoileSort(220);else portVoileSort(280);});});
}
/* L'ÉTAT DE CAMÉRA DU VOL (2026-09-28). La v2 de l'après-midi (écart tenu court, plan de trois-quarts) a été RETIRÉE le soir même :
   elle rendait la visée impossible — voir le bloc « CAMÉRA DE VOL — RETOUR À LA CAMÉRA DE POURSUITE » dans la boucle. Restent : `t`
   (dernière image de vol : détecte le décollage), `eta` (secondes avant la réception prédite, posé par le viseur, 99 = rien en vue) ·
   `zoom`/`zp` = le COUP DE ZOOM d'une pose PARFAITE (lu par la caméra au sol) · `s0` = la taille de la caisse à l'écran au décollage
   (le « bras » de la caméra de vol l'y garde) · `off` = vecteur de travail du bras. `look/hang/side/soon` ne servent plus. */
const CAMV={off:new THREE.Vector3(),look:new THREE.Vector3(),t:0,hang:0,side:1,soon:0,eta:99,zoom:0,zp:0,s0:.2,vtg:0};
function volR(){const sp=CARS[level]||CARS[0];return .5*Math.hypot(sp.l||4.2,sp.w||1.9,(sp.h||.8)+.6);} // la sphère englobante de la caisse (roues et aileron compris)
function volTaille(d,fov){return volR()/(Math.max(.5,d)*Math.tan(fov*Math.PI/360));} // sa taille à l'écran : part de la demi-hauteur
window.dbgCamVol=function(){try{const b=new THREE.Box3().setFromObject(carGroup),v=new THREE.Vector3();let x0=9,x1=-9,y0=9,y1=-9;
  for(let i=0;i<8;i++){v.set(i&1?b.max.x:b.min.x,i&2?b.max.y:b.min.y,i&4?b.max.z:b.min.z).project(camera);x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);y0=Math.min(y0,v.y);y1=Math.max(y1,v.y);}
  const c=carGroup.position.clone().project(camera),r=landMark.visible?landMark.position.clone().project(camera):null;
  return {mode,fallT:+(+fallT).toFixed(2),d:+camera.position.distanceTo(carGroup.position).toFixed(1),fov:+camera.fov.toFixed(1),vertigo:+CAMV.vtg.toFixed(2),
    taille:+volTaille(camera.position.distanceTo(carGroup.position),camera.fov).toFixed(3),ecart:r?+(Math.hypot(r.x-c.x,r.y-c.y)/Math.max(.01,volTaille(camera.position.distanceTo(carGroup.position),camera.fov))).toFixed(2):null,caisse:[+c.x.toFixed(2),+c.y.toFixed(2)],anneau:r?[+r.x.toFixed(2),+r.y.toFixed(2),r.z<1]:null};}catch(e){return e.message;}};
/* LA POSE PARFAITE SE VOIT (2026-09-28, Sacha) : en plus du gel d'image (hitT) et du « tchak », un COUP DE ZOOM — le champ se resserre
   sec à l'impact et se relâche en 0,5 s — et une COURONNE DORÉE qui éclate depuis les bords de l'écran (le centre reste net : on voit la
   caisse se poser). DIVIN (braquage) : plus fort, et la couronne bat deux fois. */
function poseParfaiteFx(divin){
  CAMV.zoom=divin?1.3:1;
  flashEcran(divin?'rgba(255,238,150,1)':'rgba(255,200,60,.95)');
  if(divin)setTimeout(function(){try{if(running&&!gameOver)flashEcran('rgba(255,215,110,.8)');}catch(e){}},200);
}
/* (2026-10-14, sensations · pose) LA CAISSE ENCAISSE LA POSE. Au contact elle se tassait bien droite (squashT), quelle que soit l'arrivée :
   une plume ou une enclume, dans l'axe ou en crabe, même geste. Désormais le NEZ plonge à proportion du choc (≈ 1° pour une plume, ≈ 5°
   pour un POSÉ LOURD) et, posée de travers, la carrosserie VERSE du côté où elle ripe (son élan la couche pendant que la gomme mord) —
   deux impulsions sur ses ressorts (sensCoup), elle se repose seule. Le débattement reste à squashT : on ne le double pas. */
function sensPose(imp,psi0,verdict){
  const k=Math.min(1,Math.max(0,imp||0)/10);
  /* (2026-10-14, gameplay · accord) LE NEZ NE PLONGE QU'UNE FOIS : le VOL ÉQUILIBRÉ de Léo le fait plonger au même contact (veqContact →
     VEQ.sp, ressort ω 13, dosé lui aussi par le choc) — les deux ressorts s'additionnaient (mesuré au banc, voir notes/accord.md). Sous le vol
     de Léo, seul son nez reste ; ce détail garde le DÉVERS du crabe (que veqContact ne fait pas). `?vol=ancien` : le nez d'ici revient. */
  sensCoup(THREE.MathUtils.clamp((psi0||0)*3,-2,2)*(.5+.5*k),VEQ.on?0:.35+1.5*k,0);
  /* LA MAIN : la vibration de pose vit dans le VERDICT (PARFAIT 15 · ordinaire 14 · LOURD 45) — qui ne juge que les vrais vols (> 0,7 s ou
     une chaîne). Une petite retombée (trou enjambé, crête, sortie courte) touchait le bitume sans que la main le sache. Celle-là, et elle
     seule, reçoit son coup au contact, dosé par le choc : plume · net · lourd. */
  if(!verdict)sensHap(imp>=10?45:imp>=4.5?16:9,imp>=10?3:imp>=4.5?2:1); // (2026-10-14, accord) lourde = 45, comme le POSÉ LOURD du verdict (34 ms passait pour un coup MOYEN sur le Taptic d'iOS)
}
/* (2026-10-14, sensations · pose) LE BUMP RACLE. Les étincelles du rebond naissaient au CENTRE de la caisse, en boule, et restaient sur
   place. Celles-ci partent du FLANC qui a touché (la tranche, une demi-largeur vers la route), giclent vers le vide et filent AVEC la
   caisse le long de la dalle (elles héritent de sa vitesse d'avance) : on lit de quel côté on a cogné. 4 à 10 selon la violence.
   (2026-10-14, accord) 8 à 14 : elle REMPLACE la boule de 12 du centre (tryLand) au lieu de s'y ajouter — une seule gerbe par bump. */
function sensBumpFlanc(b,t,n,sg,impB){
  const k=Math.min(1,Math.max(0,impB||0)/20),nb=8+Math.round(6*k),w=CARS[level].w*.5,vt=fallVel.dot(t)*SPD;
  const px=fallPos.x-b.x*sg*w,py=fallPos.y-b.y*sg*w,pz=fallPos.z-b.z*sg*w;
  for(let i=0;i<nb;i++){const a=vt*(.72+Math.random()*.26),l=sg*(2+Math.random()*(4+5*k)),u=-1+Math.random()*3.5,o=(Math.random()-.5)*1.6;
    spawnP(sparkGold,px+t.x*o,py+t.y*o,pz+t.z*o,t.x*a+b.x*l+n.x*u,t.y*a+b.y*l+n.y*u,t.z*a+b.z*l+n.z*u,.2+Math.random()*.25);}
}
function startFall(impU,impF,bord){const fr9=frDecolle();dmtCoupe();RAI.stage=0; // (2026-10-17) fr9 : une figure SUR LA ROUTE en cours, qui part avec le vol // bord : sortie par le CÔTÉ de la route (physique du bord v2) — pas de pop, bascule vers le vide
  FX2.drift=FIGV2.on&&driftEnCours&&!bord;FX2.driftS=steer>=0?1:-1; // (2026-10-14, LES FIGURES v2) un DRIFT qui décolle part en toupie — lu AVANT la remise à zéro
  if(bord)secBord();m2Saut(); /* (2026-10-16) LES MISSIONS v2 : un saut neuf, des tours neuves à frôler */ // (2026-10-14) LES DÉFIS SECRETS : FANTÔME — sorti par le bord
  const roll0=carRoll9; // (bord v2) le roulis de la carrosserie AVANT la remise à zéro : la bascule part de là
  const cap0=psi-slipB-BKV.gl; /* (2026-10-17, LE DÉCOLLAGE SANS SURSAUT) la TRAJECTOIRE au sol, lue avant la remise à zéro : au sol on avance de vA·cos(cap) et l'on dérive de vA·sin(cap) (vL) ; l'éjection prenait vA ENTIER le long de la route PLUS la dérive — à 30° de cap, la caisse décollait 11 % plus vite qu'elle ne roulait, 3° à côté de sa trajectoire */
  if(FREIN_L<0){vA*=Math.exp(FREIN_L);FREIN_L=0;}MURC.psiK=0; // (2026-10-17) un FREIN ÉTALÉ en cours se paie d'un coup au décollage ; la paroi lâche la caisse (voir murCote)
  ECH=0;SVOL.t=0;/* (2026-10-14, session SON) le chrono de la tension repart : un vol neuf monte de zéro (k, lui, retombe tout seul) */figSnd._ess=0;pitchS=0;JEAU.dans=false;JEAU.wB=0;JEAU.vRef=0;JEAU.n=0;JEAU.t=0;JEAU.rico=0;JEAU.cd=0;JEAU.syF=NaN;JEAU.y0=carGroup.position.y; // (2026-10-13) la mer : un vol neuf, un premier plongeon neuf
  // (console de son) une gamme neuve à chaque vol — (2026-10-09) pitchS : le manche repart du neutre
  traceTick(false); // (2026-09-26) le ruban de gomme se coupe au décollage
  loop._nAir=nitroOn; // (2026-09-26) l'impulsion est celle de l'ALLUMAGE en vol : tenue depuis le sol, elle ne compte pas — mais elle ne dépend plus du vol d'avant
  lastNearS=s;        // (2026-09-26) le couloir de proximité (LOD, aimant) part d'ICI, pas de la fin du vol précédent (les pièces clignotaient une image)
  LIGNE.sPk=null;     // (2026-09-30) LIGNE PARFAITE : le balayage de trajet repart de la POSE — sinon la 1re image au sol balayait tout le vol (≤ 60 m) et prenait sans contact le fruit survolé. Ici plutôt qu'à la pose : UNE entrée en vol, plusieurs sorties (tryLand, portail, replacement, parc…)
  FROLE.n=0;FROLE.t=0;
  virT=0;virC=0;virD=false;virPaye=false; /* (LA FRONDE) un virage quitté par le bord ne se paie pas à la pose */
  MIR.t=0;MIR.max=0; // (2026-09-28) MIRACULÉ : chaque vol repart « pas perdu »
  FILR.ok=false; // (2026-09-29) on a quitté la route : ce virage à filet n'est plus « à fond »
  mode='fall';fallT=0;fallTR=0;yawAcc=0;airRoll=0;trkBigA=false;trkMonstre=false; // (momentum v2) le saut ne remet plus la réserve à zéro : c'est la POSE qui juge
  driftC=0;driftLv=0;driftEnCours=false;driftArm=0;yawR=0;slipB=0;glisse9=0;driftYaw=0;BKV.gl=0;carRoll9=0;rollV=0;pitch9=0;SCOUP.p=0;SCOUP.pv=0;SEAU.k=0;SEAU.pose=false;SEAU.vy0=0;carBody.rotation.set(0,0,0);carBody.position.set(0,0,0); // une glisse ne survit pas au décollage (pas de mini-turbo en l'air)
  // TEMPO DE VOL ∝ VITESSE (2026-07-20, dosage DOUX sur base V1) : =1 jusqu'à 450 km/h affichés
  // (basse/moyenne vitesse : rigoureusement l'existant), puis +1 tous les 1800 km/h, CAP 1.35 —
  // loin du 2.3 de l'ancienne ère (qui compensait SPD=.25) : l'endgame TRAVERSE sa phase aérienne
  // au lieu de flotter, sans virer missile. Parabole DANS L'ESPACE, viseur, seuils de figures et
  // paiements (fallT temps-sim) INCHANGÉS — seul le temps réel du vol se compresse un peu.
  AIR_RATE=1; /* (2026-09-30, Sacha, le soir : « l'air time est trop rapide, il faut que ce soit VRAIMENT lié de manière réaliste à la VITESSE D'EXPULSION ») :
     le vol se joue en TEMPS RÉEL (le ×1,3 du midi est retiré) et la caisse décolle à sa VRAIE vitesse d'avance (× vitMult, voir fallVel plus bas) —
     mesuré avant : sans boost, elle bondissait de +30 % au décollage ; en NITROOO ×2,6, elle y perdait la moitié de sa vitesse. */ /* (le midi : AIR_RATE=1.3, « qu'elle aille plus vite et qu'elle tombe plus vite ») */ // (vol v6, 2026-09-25, user : « la vitesse en airtime est trop importante proportionnellement à celle sur route ») : le vol se joue en TEMPS RÉEL, comme la route — il était compressé jusqu'à ×1,35 au-delà de 450 km/h
  fallVH0=-1; // la vitesse horizontale de décollage se relève à la 1re image de vol (la catapulte retouche fallVel APRÈS cet appel)
  NIT.vol=0;NIT.nit=0;fallStartSide=side; // côté de départ figé
  bounceN=0;flightId++; // nouveau vol : compteur de bumps et budget d'airtime des nuages remis à zéro
  frameAt(s,F);
  if(side<0){F.n.multiplyScalar(-1);F.b.multiplyScalar(-1);}
  // (bord v2) au BORD la caisse part d'où elle est (hopY) : le +0,6 d'origine la faisait monter de 60 cm en une image — le « déclic »
  /* (2026-10-17, LE DÉCOLLAGE SANS SURSAUT) …et plus aucun décollage ne fait ce bond : tremplin, saut nitro, crête, trou — MESURÉ au banc
     pas à pas (feel.cjs) : la caisse montait de 0,61 m entre deux images (la vitesse de 4 images de montée d'un coup), puis repartait
     à sa vitesse. Elle part désormais d'où elle roule ; l'impulsion seule la lève. La pose ne peut pas être déclarée avant 0,35 s de vol
     (0,1 s pour un plan percé) : la caisse a le temps de quitter la dalle. */
  fallPos.copy(F.p).addScaledVector(F.b,lat).addScaledVector(F.n,(side<0?THICK:0)+hopY+(fr9?fr9.lift:0)); /* (2026-10-19) fr9.lift : une figure sur la route décolle d'où elle EST, le bond compris */
  FLOW.s0=s;FLOW.p0.copy(fallPos); // (FLOW v2) d'où part le vol — la pose dira si c'était un RACCOURCI
  {const vm9=vitMult(); /* (2026-09-30) l'ÉJECTION = la vitesse d'avance RÉELLE : au sol, NITROOO et VITESSE ×2 multiplient l'avance (vitMult), pas vA — la caisse décollait sans eux */
  fallVel.copy(F.t).multiplyScalar(vA*Math.cos(cap0)*driveDir*(impF||1)*vm9).addScaledVector(F.b,vL*driveDir*vm9) /* (2026-10-17) ×cos(cap) : la vitesse et le cap du vol sont ceux de la route (voir cap0) */.addScaledVector(F.n,impU==null?.9:impU);} // driveDir : on décolle dans le sens où l'on roulait (le parc autorise les deux) — ⚠ (bord v2) `impU==null` et non `impU||` : le bord passe 0 (aucune impulsion), qui valait .9
  // INERTIE RÉELLE (2026-07-20) : fini le plafond TOTAL de 95 qui bridait l'éjection — éjecté à
  // 300 km/h, on VOLE à 300 km/h (le compteur ne s'effondre plus au décollage), et la gravité en
  // RAJOUTE en descente, comme une vraie chute. Seule la composante VERTICALE est bornée (70) :
  // une crête ALPIN prise à 1900 km/h ne catapulte plus en orbite et la jauge des 6 s reste tenable
  // (vol balistique max ≈ 4,2 s-sim). L'ancien 3e paramètre capV de la CATAPULTE est retiré : il ne
  // servait qu'à rendre la portée ∝ vitesse malgré le plafond total — l'horizontale conservée le
  // fait désormais NATIVEMENT (portée = vx·2vy/g, vx vrai).
  VOLR.on=volrOn();if(VOLR.on){VOLR.u.copy(F.n);tryLand._bi=Math.max(0,Math.min(NP-1,Math.round(s/L*(NP-1))));}else VOLR.u.set(0,1,0); // (LE VOL QUI SUIT LA ROUTE) le haut du vol part de la face quittée ; le radar part d'ici (sinon il parle encore du vol d'avant)
  volPlafU(fallVel,70);
  hopY=0;hopV=0;POSE_F=null; // un dos d'âne en cours ne doit pas laisser de décalage fantôme
  SCOUP.vp=0;SCOUP.fp=0;SCOUP.fh=0; // (2026-10-14, accord · œil) une pose qui n'a jamais touché (repartie en vol pendant sa descente) n'emporte pas sa vibration au vol suivant
  lastNearY=fallPos.y; // référence du plongeon fatal tant que tryLand n'a pas mieux
  {tmp.copy(fallVel).normalize();FLY_U.copy(F.n).addScaledVector(tmp,-F.n.dot(tmp)); // (vol libre) le haut du vol part de celui de la route
   if(FLY_U.lengthSq()<1e-4)FLY_U.copy(F.b).cross(tmp);FLY_U.normalize();FLY_R.crossVectors(FLY_U,tmp).normalize();}
  // (bord v2) LA BASCULE : la vrille part du côté du VIDE (le toit vers l'extérieur : signe opposé à `lat`, même convention que carRoll9),
  // et elle part du roulis que la carrosserie avait déjà — reporté sur la caisse entière, sinon il s'effaçait d'un coup à la sortie
  bascOn=!!bord;bascT=0;bascDir=bord?-(Math.sign(lat)||1):1;levreY=0;
  TBORD.t=bord&&TORD.on&&!(VOLR_FIGE&&VOLR.on)?1.1:0;TBORD.on=false; // (LE BORD DE LA ROUTE TORDUE) la gravité de la route, le temps de la bascule — (LE VOL SANS HAUT NI BAS) plus de gravité qui suit la route : le haut du décollage (VOLR.u) est déjà la face quittée
  if(TBORD.t>0){tryLand._bi=Math.max(0,Math.min(NP-1,Math.round(s/L*(NP-1))));curLatOff=lat;curHOff=side<0?-THICK:0;} // le radar part du bord quitté (sinon, à la 1re image, il parle encore du vol d'avant)
  /* (2026-10-17, LE DÉCOLLAGE SANS SURSAUT) le roulis de la carrosserie (jusqu'à 24° dans un virage) passe AU VOL pour tout décollage, plus
     seulement au bord : sur un tremplin pris en courbe, un saut nitro au milieu d'un virage, la caisse se redressait d'un coup à plat en une
     image ; elle part penchée et les ressorts du VOL ÉQUILIBRÉ la rattrapent en se balançant (VEQ.br, voir veqDepart). */
  {airRoll=roll0;qTmp.setFromAxisAngle(tmp.set(0,0,1),roll0);carGroup.quaternion.multiply(qTmp);}
  veqDepart(bord,impU,roll0,carGroup.quaternion); // (2026-10-14) LE VOL ÉQUILIBRÉ : verrou du volant, ressorts de la caisse
  figDepart(bord); // (2026-10-14) LES FIGURES v2 : la caisse EMPORTE son élan de rotation (voir LES FIGURES v2)
  if(fr9)frVersVol(fr9); // (2026-10-17) …et la figure commencée SUR LA ROUTE continue en l'air (son corps devient celui du vol)
  /* (bord v2) L'IMAGE DU DÉCOLLAGE : elle ne passe ni par le placement de la conduite (le mode vient de changer) ni par celui du vol
     (il commence à l'image suivante) — la caisse et la caméra restaient FIGÉES une image puis rattrapaient deux pas d'un coup (2,7 m au
     banc). On les avance ici d'un même pas ; la caméra de vol repart de là (voir le suivi en vol), et la conduite, au retour, repartira
     de la caméra RÉELLE (`_camDriveT`/`_camLatT` périmés) au lieu d'un écart d'avant le saut. */
  {tmp.subVectors(fallPos,carGroup.position);if(tmp.lengthSq()<400){carGroup.position.copy(fallPos);camera.position.add(tmp);}
   loop._camAirT=0;loop._camDriveT=0;loop._camLatT=0;loop._fovBT=0;CAMV.p0ok=false;loop._nk=nitroOn?1:0;} /* (2026-10-17) _fovBT : un vol de moins de 0,4 s ne rend plus à la pose le champ d'AVANT le vol (+9° d'un coup) · p0ok : la caméra de vol repart de la vraie (voir CAMV.p0) · _nk : le plané du nitro part de l'état du sol (voir le réacteur) */
  // chaîne neuve : le vol commence, tout est à prouver
  chain=0;chainVal=rollover;chainMult=1;chainSeen={};spinHalf=0;
  heartBeat.vu=0; // (console de son) la mallette pourra chauffer — et le dire — une fois dans ce vol
  if(rollover>0){if(SONV2)sfx('report');trickMsg('REPORT +'+Math.round(rollover),false);rollover=0;} // le PARFAIT d'avant paye d'avance
  curNear=false;
  caseHot=false;heartT=0;ladderI=0;caseHud.style.opacity=0;caseHud.className='';
  chainHud.style.opacity=0;chainHud.classList.remove('pulse');
  // le boost se disperse en petites particules — (bord v2) sauf au BORD : une caisse qui bascule ne crache pas de flammes, son plancher RACLE la lèvre
  if(bord){sparkBurst(sparkGold,fallPos,10,6);if(!SONV2)try{noiseBurst(.12,.07,700);}catch(e){}}
  else for(let k=0;k<14;k++){
    spawnP(dust,fallPos.x,fallPos.y,fallPos.z,
      (Math.random()-.5)*7,-1-Math.random()*3,(Math.random()-.5)*7,.4+Math.random()*.3);
    if(k<8)spawnP(flameCore,fallPos.x,fallPos.y,fallPos.z,
      (Math.random()-.5)*9,-2-Math.random()*3,(Math.random()-.5)*9,.25);
  }
  /* (2026-10-14, sensations · pose) LE SOL LÂCHE DANS LA MAIN. Le décollage avait sa poussière et son souffle, mais le pouce ne sentait rien :
     on apprenait qu'on volait en le voyant. Un tic au moment où les roues quittent le bitume — léger pour une crête, un trou ou le bord,
     et le « ta-tac » des deux essieux (avant, puis arrière) sur la lèvre d'une CATAPULTE. Une seule vibration, par le limiteur commun. */
  /* (2026-10-14, gameplay · accord) …sauf le SAUT NITRO de Léo : il a son motif à lui ([12,30,18], dans veqSaut, juste après cet appel) —
     le « ta-tac » d'ici partait à la même image et se mêlait au sien. Le braquage qui arrache la caisse a déjà vibré : le limiteur le tait. */
  if(SENS&&running&&!gameOver&&!introD&&!(performance.now()-VEQ.sautT<60))try{if(!bord&&impU>=5)sensHap([10,26,14],2);else sensHap(9,1);}catch(e){}
  if(AC&&engRpm>.42){const e9=ENG_SND[Math.max(0,engLvl)];if(e9&&e9.crk)crackle(e9.crk*.8);} // (2026-09-25) le moteur se décharge en quittant le sol
  if(SONV2){ /* (console de son) tomber n'est pas décoller : chacun son son */
    /* (bord, 1/10, Sacha : « un son de merde quand on sort de la route et qu'on va dans les airs, deux petites notes ») : la sortie par le
       BORD passe désormais 0 d'impulsion (bord v2) et tombait donc sur `chute` — le sifflet + le « oh-oh » en deux notes, fait pour les
       TROUS. Elle garde le son qu'elle avait avant la v2 : le décollage, dosé comme avec l'ancienne impulsion (3,4). */
    if(!bord&&(impU||.9)<2)sfx('chute');
    else{const kv9=THREE.MathUtils.clamp((Math.max(bord?3.4:(impU||.9),fallVel.y)-3)/6,0,1),kh9=THREE.MathUtils.clamp(Math.abs(vA)*3.6*SPD/900,0,1);sfx('decollage',{vol:-8+11*Math.max(kv9,kh9*.7)});}
  }else whoosh();
}
const dTmp=new THREE.Vector3();
/* LE RADAR DE DALLE EN CASIERS (2026-09-27, passe perf iPhone) — en vol, deux recherches du point de piste le plus proche tournaient
   à CHAQUE image sur toute la piste : `tryLand` (1 point sur 2, ~4 500 distances) et le viseur d'atterrissage (1 sur 8, mais 14 pas
   d'intégration : ~15 700 distances). Sous processeur bridé c'était la moitié du temps PROPRE de la boucle.
   La piste est rangée en casiers de 64 points consécutifs, chacun dans une sphère (centre + rayon, marge d'un millimètre contre
   l'arrondi). Un casier dont la sphère est plus loin que le meilleur candidat déjà connu ne peut RIEN changer au résultat : on le
   saute. Les casiers restants sont balayés dans le MÊME ordre, avec la MÊME comparaison stricte et le même pas → même point élu au
   bit près (égalités comprises). Le casier se rebâtit seul quand la piste change (`pts` est un tableau neuf à chaque buildTrack). */
const DALLE_K=64,DALLE_IX={pts:null,n:0,nb:0,c:null,r:null};
function dalleIx(){
  const X=DALLE_IX;if(X.pts===pts&&X.n===NP)return X;
  const nb=Math.ceil(NP/DALLE_K);X.pts=pts;X.n=NP;X.nb=nb;X.c=new Float64Array(nb*3);X.r=new Float64Array(nb);
  for(let b=0;b<nb;b++){const i0=b*DALLE_K,i1=Math.min(NP,i0+DALLE_K);
    let x0=1e18,y0=1e18,z0=1e18,x1=-1e18,y1=-1e18,z1=-1e18;
    for(let i=i0;i<i1;i++){const p=pts[i];if(p.x<x0)x0=p.x;if(p.x>x1)x1=p.x;if(p.y<y0)y0=p.y;if(p.y>y1)y1=p.y;if(p.z<z0)z0=p.z;if(p.z>z1)z1=p.z;}
    const cx=(x0+x1)/2,cy=(y0+y1)/2,cz=(z0+z1)/2;let r2=0;
    for(let i=i0;i<i1;i++){const p=pts[i],dx=p.x-cx,dy=p.y-cy,dz=p.z-cz,d=dx*dx+dy*dy+dz*dz;if(d>r2)r2=d;}
    X.c[b*3]=cx;X.c[b*3+1]=cy;X.c[b*3+2]=cz;X.r[b]=Math.sqrt(r2)+1e-3;}
  return X;
}
// distance² MINIMALE possible entre (x,y,z) et un point du casier b (0 si on est dans la sphère)
function dalleLb(X,b,x,y,z){const dx=x-X.c[b*3],dy=y-X.c[b*3+1],dz=z-X.c[b*3+2],g=Math.sqrt(dx*dx+dy*dy+dz*dz)-X.r[b];return g>0?g*g:0;}
// le point le plus proche parmi les indices multiples de `pas` (2 ou 8), dd < bd0 — identique au balayage complet.
// `graine` : un indice dont la distance borne déjà le minimum (le point élu à l'image d'avant) — on écarte tout casier plus loin.
function dalleProche(x,y,z,pas,bd0,graine){
  const X=dalleIx();let lim=bd0;
  if(graine>=0&&graine<NP&&graine%pas===0){const p=pts[graine],dx=x-p.x,dy=y-p.y,dz=z-p.z,d=dx*dx+dy*dy+dz*dz;if(d<lim)lim=d;}
  let bi=-1,bd=bd0;
  for(let b=0;b<X.nb;b++){
    const lb=dalleLb(X,b,x,y,z);if(lb>lim||lb>=bd)continue; // ni ce casier ni aucun de ses points ne peut battre le candidat
    const i1=Math.min(NP,b*DALLE_K+DALLE_K);
    for(let i=b*DALLE_K;i<i1;i+=pas){
      if(TROU&&TROU[i]&&(i<1||TROU[i-1]))continue; // (LES TROUS) pas de dalle au-dessus du vide : on ne s'y pose pas
      const p=pts[i],dx=x-p.x,dy=y-p.y,dz=z-p.z,dd=dx*dx+dy*dy+dz*dz;
      if(dd<bd){bd=dd;bi=i;}
    }
  }
  dalleProche.bd=bd;return bi;
}
/* ===== LE DEMI-TOUR (2026-10-17, Léo : « le moment où tu ratterris sur la route, mais dans le mauvais sens : la voiture ne reste pas sur la
   route et ne perd pas juste de vitesse, elle continue juste de tomber — qu'elle arrive à l'envers, "mauvais sens" écrit discrètement mais de
   manière stylée, une sorte de dérapage demi-tour un peu en burn-out, mais pas trop, qu'elle revienne sur la route automatiquement, et ça reprend »).
   MESURÉ AVANT (banc, pose forcée à 149°) : la caisse gardait un cap de 30° vers le BORD (psi = atan2(vLat,|vT|)), le moteur la relançait
   vers l'avant et elle sortait par le côté en ~1 s : chute, mort. À 180° pile, elle virait face à la route en UNE image.
   Toute pose À CONTRESENS (> 90°, hors PARC où les deux sens roulent) joue désormais LE DEMI-TOUR (~1,45 s) :
   · la caisse garde le cap de son ARRIVÉE (le nez du vol, à plat dans la dalle) et GLISSE sur son élan, les quatre pneus fument ;
   · elle pivote en 1,1 s sur une courbe douce (smootherstep : ça part en douceur, ça tourne, ça se pose sans dépasser) jusqu'à faire face
     à la route ; presque pile à l'envers, le nez part vers le MILIEU de la route ;
   · BURN-OUT léger : l'arrière patine et crache sa fumée, la caisse s'accroupit et repart (la moitié de l'élan, entre 40 et 80 % de la vmax
     du moteur — le moteur reprend ensuite comme d'habitude) ;
   · pendant la manœuvre les commandes dorment et elle ne peut pas tomber (graceT) : ramenée dans la largeur s'il le faut ;
   · la CAMÉRA tourne autour d'elle avec elle (elle part d'où était la caméra de vol) au lieu de la traverser ;
   · « MAUVAIS SENS » : le texte seul, petit (8 px), rouge cerné d'encre, au-dessus de la caisse ; il s'efface quand elle repart. Il remplace
     « À CONTRESENS ! » (flowCasse ne l'écrit plus pendant un demi-tour) ;
   · les TRAÎNÉES DE LUMIÈRE des feux (et l'arc-en-ciel) se TAISENT pendant la manœuvre : accrochées aux feux, elles dessinaient une boucle
     sur la route pendant le pivot. Elles s'éteignent en 0,9 s (SIL.OFF) et repartent, coupées net, quand la caisse repart.
   2e ESSAI (même jour) — Léo, après l'avoir vu en vrai : « le pivot, le panneau, les lumières faisaient un tour bugué, c'était un peu bizarre »
   → pivot « trop sec, trop rapide » (le ressort ω 6,5 tournait 180° en 0,43 s et dépassait de 17°), panneau « plus petit et discret » (la plaque
   rouge à double liseré est partie), traînées coupées.
   La RÈGLE ne bouge pas (Sacha, v4 : pose ratée = flow à zéro, pas de PARFAIT) : on a raté, mais on repart en beauté.
   Le lacet visuel est une rotation de carGroup autour de la normale de la dalle, posée APRÈS la caisse (comme le power-slide et le SLIDE 360) :
   la physique roule dans l'axe de la route, cap 0. `?demitour=0` = l'ancienne pose. Banc : `dbgDemiTour(angle°, vitesse, lat, hauteur)` envoie
   la caisse se poser à contresens (nez dans le sens du vol) ; `dbgDemiTour()` = l'état. */
var DMT={on:!/[?&]demitour=0\b/.test(location.search),act:false,t:0,D:1.45,tS:.8,TR:1.1,y0:0,y:0,yV:0,cam:0,camP:0,dc:0,vb:0,vo:0,vl:0,sg:1,burn:false,force:false,n:0,
  g:new THREE.Vector3(),f:new THREE.Vector3(),c:new THREE.Vector3(),nn:new THREE.Vector3(),v:new THREE.Vector3(),w:new THREE.Vector3(),fw:new THREE.Vector3(),
  el:null,eW:0,eTop:'',eLeft:''};
function dmtVmax(){return CARS[0].maxKmh/3.6*lateMul()*(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).push;} // le maxSp de la boucle (local à loop)
function dmtAng(f,n,g){DMT.c.crossVectors(n,f);return Math.atan2(g.dot(DMT.c),g.dot(f));} // l'angle, autour de n, qui mène f sur g (même sens que setFromAxisAngle(n,·))
function dmtArme(bI,sd){ // (tryLand) posée à contresens sur la dalle bI, face sd — lat, psi, vA viennent d'être posés
  const D=DMT,n=D.nn.copy(Nn[bI]).multiplyScalar(sd),f=D.f.copy(T[bI]),vm=vitMult(),mx=Math.max(20,dmtVmax());
  // le cap d'ARRIVÉE : le nez de la caisse en vol, à plat dans la dalle — nez au ciel (ou au banc) : la direction du vol
  D.g.set(0,0,1).applyQuaternion(carGroup.quaternion);D.g.addScaledVector(n,-D.g.dot(n));
  if(D.force||D.g.lengthSq()<.09){D.g.copy(fallVel);D.g.addScaledVector(n,-D.g.dot(n));}
  let y0=dmtAng(f,n,D.g);
  if(Math.abs(y0)>2.6){const b=D.c.crossVectors(n,f).dot(B[bI])*sd; // presque pile à l'envers : le nez part vers le MILIEU de la route (lat vit le long de B·sd)
    y0=(Math.abs(lat)>.3?-Math.sign(lat)*Math.sign(b||1):(Math.random()<.5?1:-1))*Math.abs(y0);}
  // la caméra part d'où elle REGARDE (la caméra de vol, derrière le vol) : elle orbite ensuite avec la caisse, du même côté qu'elle
  D.g.subVectors(carGroup.position,camera.position);D.g.addScaledVector(n,-D.g.dot(n));
  let yc=D.g.lengthSq()>.25?dmtAng(f,n,D.g):y0;yc=y0+Math.atan2(Math.sin(yc-y0),Math.cos(yc-y0));
  const vT=fallVel.dot(T[bI])/vm,vB=fallVel.dot(B[bI])*sd/vm; // (vA : la vitesse d'avant le multiplicateur, comme la pose)
  D.vb=THREE.MathUtils.clamp(-vT,0,mx*.9);D.vl=THREE.MathUtils.clamp(vB*.35,-mx*.15,mx*.15);D.vo=THREE.MathUtils.clamp(Math.hypot(vT,vB)*.5,mx*.4,mx*.8);
  D.y=y0;D.y0=y0;D.yV=0;D.cam=yc;D.camP=yc;D.dc=0;D.sg=y0>=0?1:-1;D.t=0;D.burn=false;D.act=true;D.n++;
  psi=0;yawR=0;slipB=0;driftYaw=0;driftEnCours=false;driftC=0;driftLv=0;vA=-D.vb;vL=0;driftT=1;
  graceT=Math.max(graceT,D.D+.3); // ni le bord, ni le dessous de la dalle, ni « ROULE OU CRÈVE » pendant la manœuvre
  try{if(SONV2)sfx('fig.slide');}catch(e){}
  dmtSigne(true);
}
function dmtConduite(dt){const D=DMT; // (boucle de conduite, après le lacet du pouce) la manœuvre REMPLACE la conduite du joueur
  D.t+=dt;const d=Math.min(dt,1/30);
  {const r=Math.min(1,D.t/D.TR),e=r*r*r*(r*(r*6-15)+10);D.y=D.y0*(1-e);} // le PIVOT : smootherstep sur 1,1 s (pointe ~5 rad/s pour 180°), il part et se pose en douceur, sans dépasser
  D.cam+=(D.y-D.cam)*(1-Math.exp(-d/.16)); // la caméra suit le cap de la caisse avec un temps de retard (on voit son flanc pendant le pivot) : elle ORBITE
  const x=D.t/D.tS,u=x<1?0:Math.min(1,(D.t-D.tS)/(D.D-D.tS));
  if(x<1)vA=-D.vb*Math.pow(1-x,1.5); // la GLISSE en arrière, que les pneus mangent
  else{vA=D.vo*u*u; // le BURN-OUT : ça patine d'abord, puis ça mord
    if(!D.burn){D.burn=true;try{if(SONV2)sfx('turbo.mini',{vol:-5});}catch(e){}hap([10,24]);fovPunch=Math.max(fovPunch,5);if(typeof sensCoup==='function')sensCoup(0,1.6,-.8);}}
  if(vA<0&&s<6)vA=0;
  D.vl*=Math.exp(-dt*3.5);lat+=D.vl*dt*SPD; // un reste de dérive latérale, qui meurt vite
  const lim=ROAD_HALF-(CARS[level].w||2)*.5-.35;if(Math.abs(lat)>lim)lat+=(Math.sign(lat)*lim-lat)*(1-Math.exp(-dt*7)); // ramenée sur le bitume
  psi=0;yawR=0;slipB=0;driftEnCours=false;driftC=0;driftLv=0;
  glisse9=Math.max(glisse9,x<1?.95:.8*(1-.7*u)); // la gomme crie et fume (son du crissement, fumée et traces de la boucle)
  graceT=Math.max(graceT,.25);
  if(D.t>=D.D){D.act=false;driftYaw=THREE.MathUtils.clamp(D.y,-.35,.35);D.y=0;D.yV=0;dmtSigne(false);} // le reste du lacet passe au power-slide, qui le rend en douceur
}
function dmtPose(F,dt){const D=DMT; // (conduite, après la pose de la caisse sur la route) le lacet de la manœuvre, la fumée, le panneau
  if(D.y){qTmp.setFromAxisAngle(F.n,D.y);carGroup.quaternion.premultiply(qTmp);}
  if(!D.act)return;
  const sp=CARS[level]||CARS[0],bo=D.burn,VC=PT_U.uVc&&PT_U.uVc.value,rp=emiN('dmt',dt*(bo?2:.8));
  D.w.set(0,0,-1).applyQuaternion(carGroup.quaternion); // l'arrière de la caisse (le patinage crache par là)
  for(let r=0;r<rp;r++){const sd=r&1?1:-1,av=!bo&&(r&2);
    D.v.set(sd*sp.w*.45,.25,(av?.38:-.38)*sp.l).applyQuaternion(carGroup.quaternion).add(carGroup.position);
    const k=bo?6.5:1.5;
    spawnP(dust,D.v.x,D.v.y,D.v.z,(VC?VC.x*.85:0)+D.w.x*k+(Math.random()-.5)*3,(VC?VC.y*.85:0)+.8+Math.random()*1.6,(VC?VC.z*.85:0)+D.w.z*k+(Math.random()-.5)*3,(bo?.5:.35)+Math.random()*.3);}
  dmtSigneSuit();
}
function dmtCamDir(fw,n){const D=DMT; // (caméra de conduite) la direction de la caméra, tournée avec la caisse — et après la manœuvre, elle se recale en douceur
  if(!D.cam)return fw;
  return D.fw.copy(fw).applyAxisAngle(n,D.cam);}
function dmtCamTick(dt){const D=DMT;if(!D.act&&D.cam){D.cam*=Math.exp(-dt/.14);if(Math.abs(D.cam)<.003)D.cam=0;}D.dc=D.cam-D.camP;D.camP=D.cam;} // dc : de combien la caméra a tourné depuis l'image d'avant
function dmtCoupe(){if(typeof DMT==='undefined'||!DMT)return;DMT.act=false;DMT.y=0;DMT.yV=0;DMT.cam=0;DMT.camP=0;DMT.dc=0;dmtSigne(false,true);} // vol, explosion, portail, replacement, nouvelle partie
/* LE « MAUVAIS SENS » : le texte seul, petit (8 px, police pixel), rouge cerné d'encre comme les textes du HUD, au-dessus du toit ; il suit la
   caisse à l'écran, apparaît en fondu et s'efface quand elle repart. (1er essai : un panneau routier rouge à double liseré et sa flèche —
   « plus petit et discret », Léo.) */
function dmtSigne(on,net){const D=DMT;
  if(!D.el){if(!on)return;
    const st=document.createElement('style');st.id='demiTour';st.textContent=
      '#dmtSigne{position:fixed;left:50%;top:40%;z-index:40;pointer-events:none;font-family:var(--pix);font-size:8px;line-height:1;letter-spacing:1px;'+
      'white-space:nowrap;color:#ff5e7a;text-shadow:1px 0 0 #1c0430,-1px 0 0 #1c0430,0 1px 0 #1c0430,0 -1px 0 #1c0430,1px 1px 0 #1c0430,-1px 1px 0 #1c0430,0 2px 0 #1c0430;'+
      'transform:translate(-50%,-100%);opacity:0;visibility:hidden}'+
      '#dmtSigne.on{visibility:visible;animation:dmtVient .18s ease-out both}'+
      '#dmtSigne.sort{visibility:visible;animation:dmtPart .3s ease-in both}'+
      '@keyframes dmtVient{0%{opacity:0;translate:0 4px}100%{opacity:.92;translate:0 0}}'+
      '@keyframes dmtPart{0%{opacity:.92}100%{opacity:0}}'+
      'html[data-reduced-motion="1"] #dmtSigne.on,html[data-reduced-motion="1"] #dmtSigne.sort{animation:none}html[data-reduced-motion="1"] #dmtSigne.on{opacity:.92}'+
      'body.ebOn #dmtSigne,body.ftOn #dmtSigne{visibility:hidden!important}';
    document.head.appendChild(st);
    const e=D.el=document.createElement('div');e.id='dmtSigne';e.setAttribute('aria-hidden','true');document.body.appendChild(e);}
  const e=D.el;
  if(on){e.textContent=TR('MAUVAIS SENS');D.eW=e.textContent.length*9+4;D.eTop='';D.eLeft='';
    e.classList.remove('sort');e.classList.remove('on');void e.offsetWidth;e.classList.add('on');dmtSigneSuit();} // (une fois par demi-tour : la relance synchrone est sans conséquence)
  else if(net){e.classList.remove('on');e.classList.remove('sort');}
  else if(e.classList.contains('on')){e.classList.remove('on');e.classList.add('sort');}
}
function dmtSigneSuit(){const D=DMT,e=D.el;if(!e||!e.classList.contains('on'))return;
  POP_V9.copy(carGroup.position).addScaledVector(camera.up,2.2).project(camera);
  const y=THREE.MathUtils.clamp((-POP_V9.y*.5+.5)*VP.h-8,laneY()+40,VP.h*.7),hw=D.eW*.5+6,x=THREE.MathUtils.clamp((POP_V9.x*.5+.5)*VP.w,hw,VP.w-hw);
  const t9=y.toFixed(0)+'px',l9=x.toFixed(0)+'px';if(t9!==D.eTop){D.eTop=t9;e.style.top=t9;}if(l9!==D.eLeft){D.eLeft=l9;e.style.left=l9;}}
Object.assign(I18N,{'MAUVAIS SENS':'WRONG WAY'});
window.dbgDemiTour=function(ang,v,la,h){
  if(ang==null)return {actif:DMT.act,on:DMT.on,t:+DMT.t.toFixed(2),lacetDeg:Math.round(DMT.y*57.3),cameraDeg:Math.round(DMT.cam*57.3),vA:+vA.toFixed(1),lat:+lat.toFixed(2),
    glisse:+DMT.vb.toFixed(1),relance:+DMT.vo.toFixed(1),n:DMT.n,mode:mode,panneau:!!(DMT.el&&DMT.el.classList.contains('on'))};
  if(!started||gameOver)return 'pas de course en cours';if(mode!=='drive')return 'déjà en vol : '+mode;
  const a=(+ang||180)/57.3,V=v==null?70:+v;DMT.force=true;setTimeout(function(){DMT.force=false;},6000);
  return window.dbgDauphin(h==null?12:+h,V*Math.cos(a),V*Math.sin(a),la||0);};
function tryLand(dt){
  // LE VIDE : on ne se pose pas sur une dalle qui n'existe pas (trous exclus dans dalleProche) — (2026-09-27) balayage en casiers
  const bestI=dalleProche(fallPos.x,fallPos.y,fallPos.z,2,1e9,tryLand._bi),bd=dalleProche.bd;
  tryLand._bi=bestI;
  if(bestI<0)return false;
  lastNearY=pts[bestI].y; // altitude de la route la plus proche (référence du plongeon fatal)
  {const hx=fallPos.x-pts[bestI].x,hz=fallPos.z-pts[bestI].z;lastNearH2=hx*hx+hz*hz;} // à plat : sert à savoir si on survole du BITUME ou du VIDE
  lastNearS=bestI/(NP-1)*L; // position le long de la piste PENDANT le vol (le LOD de proximité s'y recentre)
  dTmp.subVectors(fallPos,pts[bestI]);
  const hOff=dTmp.dot(Nn[bestI]),latOff=dTmp.dot(B[bestI]);
  // radar de dalle AVANT le filtre des 40 m (dauphin v3) : le DAUPHIN compte le vol au-dessus de la route jusqu'à DOL_HMAX, à
  // toute largeur. curTOff = décalage LE LONG de la piste : au-dessus d'un TROU le point le plus proche est le bord, ça le trahit.
  curNear=true;curHOff=hOff;curLatOff=latOff;curTOff=dTmp.dot(T[bestI]);VEQ.si=bestI;VEQ.sh=hOff;VEQ.sl=latOff;VEQ.sd=bd; // (vol équilibré) la pose se prépare sur ce radar
  if(bd>(bkCgBord()?(ROAD_HALF+BK_CG.w+24)**2:1600))return false; // (2026-10-18, GLACIER) la piste fait 196 m : à 40 m du centre (la règle des routes de 56 m), une caisse qui retombait sur la glace la TRAVERSAIT et tombait dessous — « des problèmes de collision avec la glace elle-même » (Sacha)
  const vN=fallVel.dot(Nn[bestI]);
  // FLANC de la dalle : la caisse COGNE la tranche et REBONDIT — c'est le BUMP.
  // Demi-jauge d'airtime rendue + du STYLE + le feedback (message, son, secousse).
  // (2026-10-15 soir, Sacha : « bump doit compter comme une figure additionnable comme les autres ») il ENTRE dans la chaîne :
  // sa valeur s'ajoute à la mallette et il monte le multiplicateur, comme une figure. La redite s'use (×0,6 par rebond du même
  // vol, comme une figure refaite) : longer la tranche à l'infini ne rapporte pas plus de 12,5 par vol (l'exploit reste fermé).
  const vB=fallVel.dot(B[bestI]);
  // ANTI-TUNNEL : où était la caisse à la frame d'avant, dans le repère de la dalle ?
  // À grande vitesse le pas d'une frame dépasse les fenêtres de contact — on teste la TRAVERSÉE.
  const prevH=hOff-vN*dt*SPD,prevL=latOff-vB*dt*SPD;
  /* (2026-10-01, LA POSE — MESURÉ au banc da/pose-cote.js) LE MUR INVISIBLE DU BORD : le BUMP se déclenchait jusqu'à 2,6 m AVANT la tranche
     (la caisse y était ramenée d'un coup) et jusqu'à 80 cm AU-DESSUS du bitume — une caisse qui revenait se poser par le côté, plus haute
     que la route, rebondissait sur du vide et repartait dans le ciel (« BUMP (h 0,79) puis tombée »). Le BUMP est le choc contre la TRANCHE :
     il faut que le flanc de la caisse l'atteigne (sa demi-largeur + le pas de l'image) et que ses roues soient au niveau de la dalle ou
     dessous (12 cm de marge, dessus comme dessous). Plus haut, elle passe le bord et se pose ; les traversées en une image restent prises. */
  const mrgB9=CARS[level].w*.5+Math.max(.2,Math.abs(vB)*SPD*dt*1.5);
  const bumpIn=Math.abs(latOff)>=ROAD_HALF&&Math.abs(latOff)<ROAD_HALF+mrgB9&&vB*Math.sign(latOff)<-3;
  const bumpThru=Math.abs(prevL)>=ROAD_HALF&&Math.abs(latOff)<ROAD_HALF&&Math.sign(prevL)*vB<-3; // paroi percée en une frame
  /* (bord, 1/10) LA CAISSE PORTÉE PAR LA LÈVRE : le temps qu'elle BASCULE (BASC_T, 0,45 s) — et tant que ses roues intérieures sont
     encore sur la route (le centre à moins d'une demi-largeur au-delà du bord) — la caisse n'est pas en chute libre : elle PIVOTE sur la
     lèvre, en suit la courbe et s'affaisse vers le vide (jusqu'à 35 cm) sans passer dessous. Mesuré (banc rattrape.js, trace) : à 350, la
     caisse partie tout droit se retrouvait 1 m SOUS le plan de la route en 0,08 s (la route qui remonte dans un creux, pas la gravité) —
     et elle ne pouvait plus que cogner la tranche. Braquer pendant la bascule la fait RACCROCHER (la lèvre, juste en dessous). C'est le
     sursis que donnait l'ancien bond de sortie (≈ 0,6 s au-dessus de −1,2 m), en plus long (≈ 0,8 s) et sans à-coup. */
  /* ⚠ (1/10, soir, Sacha : « des bugs quand on essaie de se poser sur la route ») : la portée n'avait pas de borne — `fallT` rendu par un
     bump la réarmait, et toute caisse passant SOUS la route dans la largeur était remontée d'un coup à la surface. Désormais : le temps
     vécu (`bascT`), jamais plus bas que la lèvre (LEVRE_H), la bande = AU-DELÀ du bord seulement, et un bump met fin à la bascule. */
  if(bascOn&&fallStartSide>0&&hOff>-LEVRE_H&&(bascT<BASC_T||(Math.abs(latOff)>=ROAD_HALF&&Math.abs(latOff)<ROAD_HALF+CARS[level].w*.5))){
    const hS9=-.35*Math.min(1,Math.max(bascT/BASC_T,(Math.abs(latOff)-ROAD_HALF)/(CARS[level].w*.5)));
    if(hOff<hS9){fallPos.addScaledVector(Nn[bestI],hS9-hOff);if(vN<0)fallVel.addScaledVector(Nn[bestI],-vN);}}
  /* (bord v2) LA LÈVRE : juste après une BASCULE, les roues sont encore au ras du bitume. Si la caisse revient vers la route à cet
     instant (le côté intérieur encore au-dessus de la dalle, 0,8 s au plus), le pneu ACCROCHE la lèvre et remonte, comme sur un trottoir — au lieu de
     cogner la tranche et d'être renvoyé au ciel par le BUMP. Plus bas que LEVRE_H, c'est la carrosserie qui heurte la tranche : BUMP.
     Rien n'est payé ni rendu (ni nitro, ni figure) : on a juste sauvé sa peau. Dessus seulement (la face du dessous n'a pas de sol). */
  if(bascOn&&fallStartSide>0&&sideCd<=0&&bascT<1&&hOff>-LEVRE_H&&hOff<.8&&Math.abs(latOff)<ROAD_HALF+CARS[level].w*.5&&vB*Math.sign(latOff)<-.5){
    levreRattrape(bestI,latOff,hOff,dTmp.dot(T[bestI]));return true;}
  /* (2026-10-01, LA POSE) LA LÈVRE POUR TOUTE POSE : la caisse qui touche la tranche avec ses roues à moins de LEVRE_POSE (45 cm) sous le
     bitume ne REBONDIT plus (MESURÉ : « BUMP (h 0,06, à 25 cm du bord) puis tombée » — les trois quarts de la caisse au-dessus de la route,
     et elle repartait dans le vide) : le pneu monte la marche et elle se POSE au bord — une vraie pose (la chaîne s'encaisse, la vitesse
     se paie comme partout). Plus bas, c'est la carrosserie qui cogne la tranche : BUMP, comme avant. */
  const tranche9=!bkCgBord()&&sideCd<=0&&hOff>-THICK-.12&&hOff<.12&&(bumpIn||bumpThru),levre9=tranche9&&hOff>-LEVRE_POSE&&fallT>.35&&vN<4.5?(bumpThru?Math.sign(prevL):Math.sign(latOff)):0;
  if(tranche9&&!levre9){
    const sg=bumpThru?Math.sign(prevL):Math.sign(latOff),impB=Math.abs(vB);
    fallVel.addScaledVector(B[bestI],-vB*1.65); // réflexion amortie sur la paroi
    fallVel.multiplyScalar(.78);
    if(TBORD.on){const vu9=fallVel.dot(TBORD.u);fallVel.addScaledVector(TBORD.u,Math.max(vu9+2.4,BUMP_VY*Math.sqrt(gK()))-vu9);TBORD.t=1.1;} /* (LE BORD DE LA ROUTE TORDUE) vers le ciel de LA ROUTE, et sa gravité se réarme : le DOUBLE BUMP reste possible */
    else if(VOLR.on){const vu9=volVu(fallVel);volMonte(fallVel,Math.max(vu9+2.4,BUMP_VY*Math.sqrt(gK()))-vu9);} /* (LE VOL QUI SUIT LA ROUTE) vers le ciel de la dalle survolée */
    else fallVel.y=Math.max(fallVel.y+2.4,BUMP_VY*Math.sqrt(gK())); /* (2026-10-01, LA POSE) la tranche RENVOIE la caisse vers le ciel — POUR DE BON : le +2,4 d'origine (calé sur une autre échelle de vitesse) ne valait plus que 4 cm de montée et s'AJOUTAIT à la chute — un BUMP était une condamnation (relevé par GRAPHISME, MESURÉ au banc : « BUMP (h −0,95) puis tombée », à chaque fois). La vitesse verticale REPART à BUMP_VY : ~1,9 m de montée (gravité monde 15,8 m/s²), ~1 s en l'air — une caisse qui a cogné la tranche à moins de 1,3 m sous le bitume remonte AU-DESSUS de la route et peut revenir s'y poser (le volant commande le vol) ; plus bas, elle reste dessous. √gK : même hauteur en gravité lunaire. */
    // (bord v2) la caisse est remise CONTRE la tranche (sa demi-largeur), là où elle la touche : avant, elle était téléportée à 1,8 m du bord
    // ET recalée sur le point de piste le plus proche (jusqu'à 1,6 m le long du ruban) — un saut d'image, pas un choc
    fallPos.addScaledVector(B[bestI],sg*Math.max(bumpThru?0:Math.abs(latOff),ROAD_HALF+CARS[level].w*.5)-latOff);
    sideCd=.35;bascOn=false; /* (1/10, soir) la tranche touchée : la bascule est finie */
    // ---- BUMP / DOUBLE BUMP / TRIPLE BUMP : une FIGURE de la chaîne (2026-10-15 soir : elle s'additionne aux autres) ----
    bounceN++;runStats.bumps++;secBord(); /* (DÉFIS SECRETS) FANTÔME : la tranche touchée */
    hap(24);{const nv9=nitroR;nitroGain(nitroBumpDe(bounceN,nitroOn&&pwrNitroT<=0&&!PARK.on),'bump');if(SONV2&&nitroR>nv9+.01)sfx('nitro.plein',{t:.1});}flowAdd(6,'style'); // (LA LOI DU RÉSERVOIR : ,35 puis ×,6 par rebond du même vol, rien au-delà du 4e, rien nitro allumée) LE BUMP RECHARGE (2026-09-25, demande du user) : un quart de cellule… de plus à chaque rebond
    fallT=Math.max(0,fallT-airMax()*.5);fallTR=Math.max(0,fallTR-airMax()*.5);airFlash=.6; // DEMI-JAUGE d'airtime rendue (sim + réelle)
    {const bf9=FIGV2.on&&BUMP_FIG_ON,c09=CHA.pts,s09=CHA.sansPop;if(bf9)CHA.sansPop=true; // (2026-10-18, HUD des figures v5) LE BUMP EST UNE FIGURE DU COMBO : son nom s'écrit en haut (plus « BUMP +30 » sur la caisse), il compte au ×
    try{addTrick('bump',bounceN===1?'BUMP':bounceN===2?'DOUBLE BUMP':bounceN===3?'TRIPLE BUMP — LA DALLE EN PLEURE':'MEGA BUMP x'+bounceN+' 💥',
      BUMP_VAL*Math.pow(.6,bounceN-1),Math.min(3,bounceN),true);}finally{CHA.sansPop=s09;} // (2026-10-15 soir) plus `free` : il PAIE dans la chaîne (mallette + multiplicateur), la redite s'use ici (raw : le nom porte déjà le compte)
    if(bf9)try{figBumpNote(bounceN,CHA.pts-c09);}catch(e){}}
    bumpSfx(bounceN);
    thud(impB);if(!SONV2)noiseBurst(.14,.09,1100); // choc + froissement de tôle (console : pose.choc le porte)
    shake=Math.min(1.3,.3+impB*.03);
    dropChip(2+Math.floor(Math.min(4,impB*.12))); // ça casse ENCORE PLUS de bouts
    if(!SENS)sparkBurst(sparkGold,carGroup.position,12,10); // (2026-10-14, gameplay · accord) sous SENS, la gerbe naît au FLANC qui cogne (sensBumpFlanc, ligne suivante) : deux gerbes d'or à la même image — une boule au centre de la caisse ET une au flanc — n'en font plus qu'une, au bon endroit
    if(SENS)try{sensBumpFlanc(B[bestI],T[bestI],Nn[bestI],sg,impB);}catch(e){} // (2026-10-14, sensations · pose) le flanc RACLE la tranche : la gerbe part du point de contact
    squashT=Math.max(squashT,.22);
    return false; // toujours en vol — enchaîne les bumps !
  }
  let sideL=0;
  if(levre9||(fallT>.35&&hOff>-1.2&&hOff<3&&vN<4.5))sideL=1;                     // face du dessus (fenêtre élargie) — ou la LÈVRE (voir levre9)
  else if(fallT>.1&&prevH>-1.2&&hOff<=-1.2&&vN<4.5)sideL=1;      // dessus PERCÉ : TOUTE traversée du plan supérieur est rattrapée (plus de seuil d'amplitude → fini la caisse qui passe à travers la route)
  else if(fallT>.35&&hOff>-THICK-3&&hOff<-THICK+1.2&&vN>-4.5)sideL=-1; // face du dessous
  else if(fallT>.1&&prevH<-THICK+1.2&&hOff>=-THICK+1.2&&vN>-4.5)sideL=-1; // dessous percé en montant : idem, toute traversée compte
  // ⚠ LE DERNIER AXE SANS BALAYAGE (2026-08-03) — c'est LUI, « je passe à travers la route parfois ».
  // La traversée du plan de la dalle est rattrapée depuis longtemps (prevH, juste au-dessus), mais le
  // test LATÉRAL ne regardait que la position de CETTE frame. Une caisse qui perce le plan tout en
  // sortant sur le côté dans la même frame se retrouvait avec |latOff| déjà hors dalle : refusée par
  // l'atterrissage, et hors de la fenêtre du BUMP si elle s'éloignait — donc elle traversait le bitume.
  // `prevL` existait déjà (calculé pour le bump) : il suffisait de s'en servir. On accepte si la caisse
  // était SUR la dalle à un bout OU l'autre du segment, et on ramène `lat` dans la largeur.
  // (2026-09-25, user : « PAS DU TOUT d'assistance ») : on acceptait la pose si UN bout du segment touchait la dalle, puis on
  // RAMENAIT la caisse dans la largeur — un aimant de plus. Désormais : le point EXACT où la trajectoire traverse le plan de la
  // dalle (interpolé entre l'image d'avant et celle-ci) ; s'il est au-dessus du vide, on tombe. Aucun recentrage.
  if(!sideL)return false;
  const hS9=sideL>0?0:-THICK,dh9=prevH-hOff,f9=Math.abs(dh9)>1e-4?THREE.MathUtils.clamp((prevH-hS9)/dh9,0,1):1,latX9=levre9?levre9*(ROAD_HALF-.05):prevL+(latOff-prevL)*f9; /* (la LÈVRE : posée au bord, roues intérieures sur le bitume) */
  if(Math.abs(latX9)>=ROAD_HALF+(sideL>0?bkCgBord():0))return false; /* (2026-10-18, GLACIER) on se pose aussi dans la congère */
  s=THREE.MathUtils.clamp(bestI/(NP-1)*L+THREE.MathUtils.clamp(dTmp.dot(T[bestI]),-2,2),0,L-1);
  side=sideL;{const lm9=ROAD_HALF-.02+(sideL>0?bkCgBord():0);lat=THREE.MathUtils.clamp(latX9,-lm9,lm9)*sideL;}
  // RÉCEPTION EN GLISSE : la caisse se pose de travers et rattrape — petit drift au lieu d'un psi=0 sec
  {const vTan=fallVel.dot(T[bestI]),vLat=fallVel.dot(B[bestI])*sideL;
   psi=THREE.MathUtils.clamp(Math.atan2(vLat,Math.abs(vTan)+1),-1.4,1.4);yawR=steer*lacetVol(fallVel.length());slipB=0;driftYaw=0;veqPose(bestI,sideL); /* (2026-10-09) yawR = le lacet du VOL (même formule que yawIn) : volant tenu, la caisse ne « s'arrête » plus de tourner à la pose avant de repartir — elle rejoint le lacet du sol en VOL_TAU */ // (2026-09-25) le cap de la pose = la direction EXACTE du vol — plus de redressement (×0,6) : c'était une aide
   driftT=Math.max(driftT,Math.min(1,.45+Math.abs(psi)));} // …et la fumée/le crissement suivent tout seuls
  {const vm9=vitMult(),vT9=fallVel.dot(T[bestI])/vm9,vB9=fallVel.dot(B[bestI])/vm9;vA=vT9>0?Math.hypot(vT9,vB9):vT9;vL=vB9*.4*sideL;} /* (2026-10-15, Sacha : « quand on arrive sur la route en volant avec un certain angle on est ralenti d'un coup, on ne peut pas la couper ») LA COUPE GARDE SON ÉLAN : au sol vA est la vitesse le long du CAP (on avance de vA·cos psi, on dérive de vA·sin psi), et le cap posé juste au-dessus EST la direction du vol — vA = toute la vitesse à plat, plus sa seule part dans l'axe : le cosinus de l'angle était compté DEUX fois (45° → la moitié de l'avance envolée, 60° → les trois quarts). À contresens, inchangé. */ // (2026-09-30) le vol porte la vitesse RÉELLE (× vitMult) : à la pose, on la ramène au vA d'avant le multiplicateur — sans ça, le boost comptait DEUX fois
  if(PARK.on){driveDir=vA<0?-1:1;vA=Math.abs(vA);}else driveDir=1; // PARC : on repart dans le sens d'atterrissage (les deux directions roulent) ; COURSE : toujours vers l'avant
  // ATTERRISSAGE : l'impact ralentit la caisse — d'autant plus que le saut etait gros
  const nPose9=nitroR;{const nv9=nitroR;nitroGain(nitroPoseDe(nitroCap(),NIT.vol,NIT.nit)*veqNitK(),'pose');if(SONV2&&nitroR>nv9+.01)sfx('nitro.plein',{t:.2});} // (2026-09-26, user) TOUTE pose rend 20 % de nitro — parfaite, lourde, à l'arrachée · (2026-10-01, LA LOI DU RÉSERVOIR) au prorata du vol fait NITRO COUPÉE, et pleine à partir de 1,2 s de vol : ce qu'on brûle en l'air ne revient pas à la pose
  const impact=Math.abs(vN);
  /* (v4, Sacha : « en cas de mauvais atterrissage, de manière trop obtuse ou à contresens, le flow retourne à zéro ») L'ANGLE DE POSE :
     l'écart entre la trajectoire (à plat dans la dalle — c'est aussi le cap de la caisse, le volant tourne le vol lui-même) et l'axe de
     la route. 0° = axé, 90° = en crabe, 180° = à contresens. Au-delà de FLOW2.pose.angle : pose RATÉE — pas de PARFAIT possible, et le
     flow (frénésie comprise) tombe à zéro une fois la pose jugée. Une chute presque verticale (< vMin à plat) n'a pas de cap : jamais ratée. */
  const vT8=fallVel.dot(T[bestI]),vL8=fallVel.dot(B[bestI]),poseAng=Math.hypot(vT8,vL8)>FLOW2.pose.vMin?Math.atan2(Math.abs(vL8),vT8)*57.3:0;
  const poseRatee=(!PARK.on&&poseAng>FLOW2.pose.angle)||VEQ.rate; /* (2026-10-14) posée en plein SALTO / TOUPIE : ratée */ FLOW.poseA=Math.round(poseAng); // (banc) le dernier angle de pose — (2026-10-14, revue des idées de Léo) il était collé au commentaire d'avant, donc avalé : jamais écrit
  if(DMT.on&&!PARK.on&&poseAng>90)dmtArme(bestI,sideL); // (LE DEMI-TOUR) posée à contresens : la caisse glisse, pivote d'un coup de frein à main et repart — au lieu de filer vers le bord (voir DMT)
  const figN9=FX2.nitL|0;{const nf9=nitroR,g9=figNitRend(!poseRatee);if(SONV2&&g9>.01&&nf9<=nPose9+.01)sfx('nitro.plein',{t:.2});} /* (POSER UNE FIGURE RAPPORTE) le compte = les figures LANCÉES du vol ; le « plein » sonne aussi quand tout part dans la réserve bleue */ // (2026-10-17, LA FIGURE SE PAIE — loi 6) chaque figure plantée rend 30 % à la pose RÉUSSIE ; de travers, à contresens ou en plein tour : perdu — le « plein » sonne une fois, avec celui de la pose
  const bigness=Math.max(0,fallT*gK()-.8); // ×gK : en orbite un même saut dure 2× plus — il ne doit pas coûter 2× plus de vitesse à la pose
  const landLoss0=Math.min(.30,bigness*.15+impact*.008),dnS9=DN.on?dnSurf(bestI,fallVel,poseRatee):null,landLoss=dnS9?landLoss0*(1-.92*dnS9.a):landLoss0; /* (2026-10-23, DUNES, Léo : « comme le jeu du pingouin : il faut atterrir pour prendre la vitesse ») SE POSER SUR LA PENTE : une pose axée sur une descente ne coûte presque rien et DONNE de la vitesse (voir dnSurf) */ if(dnS9){vA*=1+dnS9.g;dnSurfFx(dnS9);} // un peu plus doux qu'avant — (2026-10-09, Sacha : « plus généreuse ») plafond .52 → .30 : un grand vol ne coûte plus la moitié de la vitesse à la pose
  /* (2026-10-17, LA POSE QUI MORD AU CONTACT) la perte de vitesse de la pose (même formule, même plafond de 30 %) ne tombe plus à la
     DÉCLARATION — jusqu'à 3 m au-dessus du bitume, 0,1 à 0,3 s avant les roues, en UNE image : la caisse freinait EN L'AIR. Elle part
     au contact (touche9, avec le choc, la gerbe et la gomme) et s'étale sur ~0,2 s (vFrein, LE FREIN ÉTALÉ). */
  if(landLoss>.2&&impact>=4.5)dropChip(2); // (2026-10-09) la tôle qui part = une pose DURE : un grand vol posé en douceur (PARFAIT) ne se casse plus
  if(landLoss>.28&&fallT>1.6)slowT=Math.max(slowT,.25);
  if(window.__poseJ)window.__poseJ.push({h:+hOff.toFixed(2),hAvant:+prevH.toFixed(2),lat:+latX9.toFixed(2),vN:+vN.toFixed(1),vT:+fallVel.dot(T[bestI]).toFixed(1),face:sideL,t:+fallT.toFixed(2),vA:+vA.toFixed(1),psi:+psi.toFixed(2)}); /* (banc) le journal des poses */
  prevTvalid=false;mode='drive';duckT=Math.max(duckT,.2*SVOL.k); /* (2026-10-14, session SON) LA RÉSOLUTION : la pose d'un vol tendu creuse les chaînes continues ~80 ms (dk ≥ .9, duckT retombe à 2,6/s) — le verdict (pose.parfait, choc) claque dans ce creux, puis la tension retombe en ~0,2 s (SVOL.k hors du vol) */
  /* LA POSE SANS SAUT (2026-10-01, Sacha : « il y a des bugs quand on essaye de se poser sur la route » — MESURÉ au banc des poses,
     da/pose-banc.js, 144 lâchers à 1/60 s) : la pose est DÉCLARÉE dès que la caisse passe sous 3 m de la dalle (la fenêtre élargie), et la
     conduite la posait SUR le bitume à l'image suivante — elle descendait de 2,1 à 2,6 m EN UNE IMAGE (le monde sautait à l'écran, 0,12 à
     0,20 NDC contre 0,01 à 0,06 pour un pas normal), et la gerbe, le choc et le tassement partaient en l'air, un quart de seconde trop tôt.
     Désormais la hauteur qui reste devient un SAUT de conduite (hopY / hopV, la mécanique du dos d'âne et du replacement) : la caisse FINIT
     sa descente à sa vitesse de chute, et la gerbe, le choc, la secousse, le tassement et la gomme partent AU CONTACT (POSE_F). La règle de
     pose (quand on est posé, où, à quelle vitesse, ce que ça paie) ne change pas d'une virgule. */
  const sensPsi9=psi,sensVer9=fallT>.7||chain>0||chainVal>0; // (2026-10-14, sensations · pose) le crabe de l'arrivée, et « cette pose aura-t-elle un verdict (donc sa vibration) ? » — lus ICI, rendus au contact (sensPose)
  {const hR9=sideL>0?hOff:-THICK-hOff,nI9=bestI,lL9=landLoss,vN9=vN,imp9=impact,sd9=sideL;
   const touche9=function(){
     vFrein(1-lL9); // (2026-10-17) la pose mord AU CONTACT, en ~0,2 s (voir plus haut)
     veqContact(imp9,nI9,sd9); // (2026-10-14) LE CONTACT : la suspension claque, le nez plonge, la caméra s'enfonce
     poseGerbe(carGroup.position,Nn[nI9],sd9,T[nI9],vA*SPD*driveDir,imp9); // (2026-09-26) la GERBE DE POSE : étincelles de châssis qui rasent le bitume + gomme
     thud(Math.abs(vN9)*(imp9<4.5&&lL9<.2?.75:1));shake=Math.min(1.4,.35+Math.abs(vN9)*.05+lL9*.6);squashT=Math.max(squashT,.1+Math.min(.2,imp9*.022)); // (2026-09-28) la caisse se TASSE sur ses ressorts à la pose // (2026-09-25) la pose PARFAITE ne cogne plus plus fort que la lourde
     if(SENS)try{sensPose(imp9,sensPsi9,sensVer9);}catch(e){} // (2026-10-14, sensations · pose) le nez plonge selon le choc, la caisse verse si elle arrive en crabe
     if(SENS&&SCOUP.vp)try{const p9=SCOUP.vp,n9=performance.now();SCOUP.vp=0;if(n9-SCOUP.vt<1200&&(n9-(hap._t||-1e9)>=70||(hap._k||0)<(p9>40?3:2)))hap(p9);}catch(e){} // (2026-10-14, accord) la vibration du VERDICT, gardée depuis la déclaration : elle tombe avec les roues (et se tait si une autre, aussi forte, vient de partir)
     if(SENS&&SCOUP.fp)try{const d9=SCOUP.fp===2;SCOUP.fp=0;if(performance.now()-SCOUP.vt<1200){hitT=Math.max(hitT,SCOUP.fh);poseParfaiteFx(d9);}SCOUP.fh=0;}catch(e){} /* (2026-10-14, gameplay · œil · pose — Sacha : « oui ») LE PARFAIT TOMBE AVEC LES ROUES : le gel (hitT), le flash, le coup de zoom et la couronne dorée partaient à la DÉCLARATION (3 m du bitume, 0,1-0,4 s avant le contact) ; ils attendent désormais le contact, comme la vibration du verdict (SCOUP.vp). Posée tout de suite : inchangé. `?sens=0` : comme avant. */
     engRpm*=.6;charge9=1;if(imp9>2)pneuMord(Math.min(1,imp9/10));}; // la gomme MORD : le moteur reprend en charge, et ça piaille
   if(hR9>.25){hopY=hR9;hopV=(sd9>0?vN9:-vN9)*SPD;POSE_F=touche9;}else{hopY=0;hopV=0;POSE_F=null;if(sd9>0&&hR9<0)levreY=Math.max(-.6,hR9);touche9();}} /* posée SOUS le niveau du bitume (lèvre, plan percé) : elle remonte sa marche en ~0,15 s (levreY) au lieu d'y sauter */
  /* ---- LA RÉCEPTION À L'ARRACHÉE (2026-08-18) -------------------------------------------------
     Se poser À UN CHEVEU du couperet des 6 secondes. C'est le geste le plus tendu du jeu : rester en
     l'air paye en chaîne, mais dépasser tue — donc le style consiste à frôler la limite.
     ⚠ mesuré sur `fallTR` (le temps VÉCU, celui du camembert), pas sur `fallT` (le temps-sim, qui
     court plus vite dans l'endgame) : le joueur joue contre le chrono qu'il VOIT.
     ⚠ et seulement si la jauge courait vraiment — sous pouvoir d'AIRTIME INFINI il n'y a aucun
     risque, donc aucun mérite. */
  if(pwrAirT<=0){
    const reste=airMax()-fallTR;
    if(reste>0&&reste<=.30){
      const extreme=reste<=.10;
      chaineAura(extreme?'AU CHEVEU':'ARRACHÉE',extreme?220:120,'cheveu',false,SONV2);if(SONV2)sfx('pose.cheveu');
      flowAdd(extreme?20:12,'risque'); // (FLOW v2) le geste le plus tendu du jeu : on a joué avec la mort — la triade adore
      if(TCTL.on)popTexte(extreme?'AU CHEVEU !!':'ARRACHÉE !','#ff5ec8',3); // (2026-09-25) le geste le plus tendu du jeu se LIT aussi sur téléphone
      trickMsg(TR(extreme?'⏱ AU CHEVEU —':'⏱ À L\'ARRACHÉE —')+' '+decFr(reste,2)+' s'+(extreme?(LANG==='fr'?' !!':'!!'):''),3);
      sparkBurst(sparkGold,carGroup.position,extreme?30:16,14);
    }
  }
  // ---- LE VERDICT : la CHAÎNE se cashe — grade de réception × face × série ----
  /* (2026-10-14, gameplay · accord) LA MAIN SENT LE CONTACT, PAS LA DÉCLARATION. La pose est déclarée à 3 m du bitume (voir LA POSE SANS
     SAUT) ; la caisse finit sa descente en hopY et TOUT le choc part au contact (touche9 : gerbe, thud, secousse, suspension, nez, caméra
     de Léo) — sauf la vibration du verdict, qui partait ici, un quart à un tiers de seconde AVANT les roues (mesuré au banc). Elle attend
     désormais le contact (SCOUP.vp, joué par touche9). Posée tout de suite (sans descente) : rien ne change. `?sens=0` : comme avant. */
  const hapV9=SENS&&POSE_F?function(p){SCOUP.vp=p;SCOUP.vt=performance.now();}:hap;
  if(fallT>.7||chain>0||chainVal>0){ // (2026-09-26) chainVal>0 : le REPORT annoncé au décollage se paie même sur une courte sortie
    // le grade juge tout le vol : pose soyeuse = jackpot, pose écrasée = décote
    let g=1,gTxt='';
    if(poseRatee){g=.65;gTxt='';} // (v4) de travers ou à contresens : la décote du POSÉ LOURD, et c'est la chute du flow qui parle
    else if(impact<4.5){g=1.5;gTxt='PARFAIT ! ';hitT=.08;hapV9(15);} // (2026-10-09, Sacha : « plus généreuse ») PARFAIT = douce ET dans l'axe, quelle que soit la durée du vol — `landLoss<.2` l'interdisait au-delà de ~2 s (AIR MONSTRE jamais PARFAIT) ; le remboursement de nitro reste au prorata du vol réacteur coupé
    else if(impact>=10){g=.65;gTxt='POSÉ LOURD — AÏE… ';hapV9(45);}
    else hapV9(14); // chaque pose se SENT dans la main (la parfaite a son coup sec plus haut, la lourde son choc)
    if(fever>0&&!poseRatee){ // BRAQUAGE : tous les grades montent d'un cran — même la casse pardonne (pas la pose ratée)
      if(g===1.5){g=2;gTxt='DIVIN !! ';}
      else if(g===1){g=1.5;gTxt='PARFAIT (BOOST ×2) ! ';hitT=.08;hapV9(15);}
      else{g=1;gTxt='';}
    }
    if(g>=1.5){if(SENS&&POSE_F){SCOUP.fp=g>=2?2:1;SCOUP.fh=hitT;hitT=0;}else try{poseParfaiteFx(g>=2);}catch(e){}} // (2026-09-28) coup de zoom + couronne dorée — (2026-10-14, œil · pose) sous SENS, AU CONTACT comme sa vibration : joués par touche9
    if(fallT>.7)sfaPose(!poseRatee&&g>=1); // (2026-09-28) SANS FAUTE : les poses propres d'affilée
    secPose(g,poseRatee,fallT,Math.hypot(fallVel.x,fallVel.z)*3.6*SPD);m2Pose(g,poseRatee,fallT); /* (2026-10-16) LES MISSIONS v2 : parfaites d'affilée, 5 s en l'air, chaque map */ // (2026-10-14) LES DÉFIS SECRETS : PRISME, OR ROSE, NACRE
    rollover=0; // (2026-09-29, passe qualité) plus de REPORT : il date de la mallette d'argent — les figures ne paient plus qu'en aura, et le report fabriquait une FAUSSE figure au vol suivant (verdict, voix, mission « figures » comptée sur une simple chute)
    if(g>=1.5)momT=Math.max(momT,3);else if(g<1)momT*=.5; // (momentum v2) PARFAIT relance la vitesse, POSÉ LOURD en coûte la moitié
    if(g<1){try{if(SONV2){/* (console) pose ratée : flowCasse */if(!poseRatee)sfx('pose.lourde');}else{clank9(0,190,.12);clank9(.05,135,.09);}}catch(e){}if(!poseRatee)flowFaute('n',FLOW2.faute.lourd,.5);} // (v5) POSÉ LOURD : -NARCISSE // (2026-09-25) POSÉ LOURD : la TÔLE, sans carillon
    if(Math.abs(latOff)<ROAD_HALF*.3){chainVal+=4;chainMult+=.2;trickMsg('PILE AU CENTRE 🎯',false);} // posé sur l'axe
    if(sideL<0&&chainVal>0)trickMsg('FACE CACHÉE ×2',2);
    streak++;
    // (vague 3) qG = la VALEUR DU GESTE, à l'échelle d'AVANT la vague 3 (FLOW +0,5/palier, SÉRIE jusqu'à ×2) : c'est elle qui décide
    // des pièces MOTEUR, des verdicts de l'annonceur et de la pose muette — rééquilibrer l'argent ne doit changer ni la montée du
    // moteur, ni les verdicts, ni quelle pose compte comme figure. Le GAIN, lui, suit ECO3 (et ne tombe jamais à 0 $ par arrondi).
    const qG=chainVal*Math.min(6,chainMult)*g*(sideL<0?2:1)*(1+FLOW.lv*.5)*(streak>=2?1+Math.min(1,streak*.1):1)*(fever>0?2:1);
    const gain=qG*DENOMS[Math.min(engTier,DENOMS.length-1)]<.5?0:Math.max(1,Math.round(flowMult()*denom()*chainVal*Math.min(6,chainMult)*g
      *(sideL<0?2:1)*ecoSerie()*(fever>0?2:1)));
    /* (2026-09-29, Sacha : « les figures ne doivent plus rapporter d'argent, seulement de l'aura ») — PLUS UN DOLLAR À LA POSE. `gain` ne
       sert plus qu'à dire si la pose porte une figure (sinon elle reste muette) : l'aura (chaineAura), le flow, le nitro, les verdicts de
       l'annonceur et les pièces du MOTEUR (une ressource de la partie, pas de l'argent) sont gardés ; l'argent, la caisse enregistreuse et
       les billets qui volent vers le compteur s'en vont. L'argent vient des pièces, du portail et de la campagne (les fruits ne donnent que du nitro). */
    // CONTRATS « POSE(S) PARFAITE(S) » (2026-09-30) : elle ne comptait que la parfaite qui ENCAISSE une figure — or une pose parfaite sans
    // figure a sa couronne et son zoom, et l'auto-école apprend « or = parfait ». Compte : tout VRAI vol (fallT>.7, le seuil de SANS FAUTE)
    // posé parfait, plus la courte sortie parfaite qui encaisse (elle comptait déjà) — une fois par pose, on est dans le verdict.
    if(g>=1.5&&!poseRatee&&(fallT>.7||gain>0))RUNX.perfect++;
    if(gain>0){ // l'airtime brut ne rapporte RIEN : sans chaîne à casher, la pose est muette
      flowAdd(g>=2?14:g>=1.5?10:4,g>=1.5?'risque':'style',sideL<0?'m':'n'); // (v5) posé sur la FACE CACHÉE : l'envers du décor, c'est MACHIAVEL // FLOW : une figure encaissée nourrit la montée — la pose PARFAITE est un RISQUE (on a visé), l'ordinaire du style
      if(!figN9)nitroGain(nitroFigDe(chainMult,g,NIT.vol,NIT.nit)*veqNitK(),'figure'); /* (loi 6) un vol à figures est payé par figNitRend, juste au-dessus */ // (LA LOI DU RÉSERVOIR : au prorata du vol nitro coupée) LA FIGURE RECHARGE LE NITRO — plus la chaîne est longue, plus ça remplit ; une pose parfaite ×1,5, DIVINE ×2 (l'échelle des grades monte aussi ici)
      // LA CAISSE ENREGISTREUSE : seulement sur un ENCAISSEMENT QUI COMPTE. Sur chaque pose,
      // meme minuscule, le son deviendrait un tic — et 9 samples n'y changeraient rien.
      runStats.tricks++;
      // ---- ANNOUNCER : la réplique la plus RARE l'emporte (chacune tombe 1 fois sur 3) ----
      const q=qG; // (vague 3) la valeur du GESTE, pas celle du dollar (voir qG)
      let vKey=q>=140?'m3':(q>=45?'m2':'m1');
      let vTier=q>=140?3:(q>=45?2:1);
      const vTxt=annSpeak(vKey)||'MONSTRE';
      trickMsg(gTxt+vTxt,vTier); // (2026-09-29) plus de « +$ » : la figure paie en aura (la chaîne le dit)
      // LES FIGURES RAPPORTENT DES PIÈCES : une belle chaîne fait progresser le MOTEUR, pas seulement
      // le portefeuille. 2 pièces pour une figure honnête, jusqu'à ~18 pour un enchaînement monstrueux.
      poseSndT=performance.now(); // la pose va sonner : un palier moteur franchi par ces pièces attendra son tour (voir addCoins)
      addCoins(Math.max(2,Math.min(18,Math.round(2+q/6))));
      rewardSfx(vKey,vTier); // signature sonore courte assortie à la récompense
      if(TCTL.on&&g>=1.5)popTexte(g>=2?'DIVIN !!':'PARFAIT !',g>=2?'#ff5ec8':'#ffd75e',2);
      if(g>=1.5)chaineAura(g>=2?'POSE DIVINE':'POSE PARFAITE',g>=2?120:70,'pose',false,true); // (aura v2) la pose PROLONGE la chaîne // (2026-09-25) la pose ×1,5 : LE geste à répéter — il faut qu'on le voie
      if(g>=1.5){try{if(SONV2)sfx(g>=2?'pose.divin':'pose.parfait',{t:.08});else{ /* (2026-10-14, session SON) la POSE DIVINE (×2) a SON son, pose.divin : le tchak de la PARFAITE, puis chœur, cloches et pluie d'or (avant : le tchak une quinte plus haut) */chimeNote(1980,.08,.055,.2);chimeNote(2640,.11,.04,.26);sparkle(.08,.06);if(g>=2)chimeNote(1320,.15,.06,.4);}}catch(e){}} // (2026-09-25) le « tchak » du PARFAIT : harmoniques 3 et 4 du 660, au-dessus de l'arpège
      landBoom(carGroup.position,vTier); // P'TIT BOOM D'ATTERRISSAGE : toute figure MONSTER+ éclate à la pose (calibré sur le tier)
      boost=Math.max(boost,1.2);
      addStyle(14+chain*4);
    }
    if(SONV2&&g>=1.5&&!(gain>0))sfx(g>=2?'pose.divin':'pose.parfait',{t:.08}); // (console de son) PARFAIT sans rien à encaisser : le tchak quand même, une fois
    if(SONV2&&g===1&&!poseRatee&&fallT>.35)sfx('pose.nette',{t:.06}); /* (2026-10-14, session SON — étape 3) la POSE ORDINAIRE a son petit son (pose.nette), sous la PARFAITE et la DIVINE — pas sur un saut de puce */
    if(fallT>2)slowT=.35; // slow-mo savoureux sur les gros airs
  }
  // (FLOW v2) LE RACCOURCI, DANS TOUS LES MODES : la piste parcourue entre le décollage et la pose, moins la distance VOLÉE en ligne
  // droite — un saut ordinaire donne ~0 (la route suit le vol), couper une boucle ou tomber sur la dalle d'en dessous donne des centaines
  // de mètres. C'est le geste que la triade réclame : on triche, et ça paie.
  let rc9=false;if(!PARK.on){const gagne=(s-FLOW.s0)-FLOW.p0.distanceTo(fallPos),fl9=filetDe(FLOW.s0,s);if(fl9)filetRattrape(fl9);else if(gagne>=60){flowRaccourci(gagne,true);rc9=true;}else if(gagne>=25)frenTrait('m',gagne/60);} // (2026-09-29) posé dans le FILET de son virage : RATTRAPÉ, pas RACCOURCI (voir FILET) // (v4) une PETITE coupe nourrit MACHIAVEL au prorata
  /* (2026-09-29, Sacha : « le son "low honor" de Red Dead, une petite note quand tu perds de l'honneur — pendant la frénésie, à chaque fois
     que le joueur atterrit ») LA NOTE DE LA POSE EN FRÉNÉSIE : un son ORIGINAL dans cet esprit (le fichier de Rockstar est protégé), fait par
     la console de son. Pas sur un petit saut (< 0,4 s), pas sur la pose ratée (elle a son son et éteint la frénésie), pas sur la pose qui
     DÉCLENCHE la frénésie (FLOW.lv lu avant). Après le « tchak » de la pose (t .15). */
  if(FLOW.lv===4&&!poseRatee&&!PARK.on&&fallT>.4&&SONV2)sfx('frenesie.pose',{t:.15});
  if(VEQ.rate&&FIGV2.on)figChute(); // (2026-10-14, LES FIGURES v2) la CHUTE : comme au BMX, les figures de ce vol ne sont pas gagnées
  else if(FIGV2.on)figComboEncaisse(); // (2026-10-15) …et posée propre, LE COMBO DU VOL s'encaisse
  if(poseRatee)flowCasse(poseAng>90,VEQ.rate?'FIGURE RATEE !':null); // (v4) la pose est jugée (chaîne encaissée, raccourci compté) : ENSUITE le flow tombe
  else if(FREN.arme&&FLOW.lv<4&&(chain>0||trkBigA||(rc9&&FLOW2.decl.racc)))frenDeclenche(); // (v4) jauge pleine + FIGURE POSÉE : la FRÉNÉSIE part, ici, au contact · (loi 20) en VILLE, le RACCOURCI posé aussi
  chainHud.style.opacity=0;
  caseHud.style.opacity=0;caseHud.className='';caseHot=false;
  return true;
}
/* LES TRACES DE PNEUS v2 (2026-09-26, user : « lors des virages il faut laisser des traces noires » puis « moins foncées, avec un
   MOTIF de pneu et une légère transparence pour le motif de la route ; il faut aussi qu'elles SORTENT DIRECTEMENT des roues de
   chaque voiture »).
   · UN ruban par roue ARRIÈRE, de la LARGEUR de SON pneu (lu dans les roues de la caisse montée), posé au ras du bitume dès que la
     caisse tourne fort ou glisse (même mesure que la fumée et le crissement : `glisse9`, plus la charge latérale).
   · LE BOUT VIVANT : le dernier quad de chaque ruban est RÉÉCRIT à chaque image, du dernier point posé jusqu'au contact actuel du
     pneu — la trace part donc DE la roue, sans le trou d'un demi-mètre de la v1. Un nouveau point se fige tous les 50 cm.
   · LE MOTIF : une bande de roulement en pavés décalés (texture 32 × 64 peinte une fois) sert d'alphaMap ; les UV courent le long
     de la distance parcourue (un motif tous les 90 cm) → on lit la sculpture du pneu, et le bitume se voit à travers les rainures.
     Gomme gris-noir à 55 % : une trace, pas un trait de marqueur.
   · UN seul mesh : un anneau de 900 quads (les plus anciens réécrits), seule la tranche touchée remonte vers la carte graphique.
     Le ruban se coupe quand la gomme lâche ou au décollage ; tout s'efface au portail (les traces restent sur l'ancienne route). */
const TRACE={N:900,i:0,pos:null,uv:null,geo:null,mesh:null,r:[null,null],V:[new THREE.Vector3(),new THREE.Vector3()],lo:-1,hi:-1};
function traceTex(){ // la bande de roulement : pavés décalés en chevrons, bords adoucis (blanc = gomme, noir = rainure transparente)
  const W=32,H=64,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
  x.fillStyle='#000';x.fillRect(0,0,W,H);x.fillStyle='#fff';
  for(let y=0;y<H;y+=16){x.fillRect(2,y,12,10);x.fillRect(18,y+8,12,10);x.fillRect(18,y-8,12,10);} // deux colonnes de pavés, décalées d'une demi-maille
  x.fillStyle='#bbb';x.fillRect(15,0,2,H);                                                        // la nervure centrale, plus claire
  const g=x.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgba(0,0,0,.7)');g.addColorStop(.12,'rgba(0,0,0,0)');g.addColorStop(.88,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.7)');
  x.fillStyle=g;x.fillRect(0,0,W,H);                                                              // les flancs s'estompent
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;
}
function traceInit(){
  const N=TRACE.N,pos=new Float32Array(N*12),uv=new Float32Array(N*8),idx=new Uint32Array(N*6);
  for(let q=0;q<N;q++){const b=q*4,o=q*6;idx[o]=b;idx[o+1]=b+2;idx[o+2]=b+1;idx[o+3]=b+1;idx[o+4]=b+2;idx[o+5]=b+3;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  g.setIndex(new THREE.BufferAttribute(idx,1));
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x2c2a33,alphaMap:traceTex(),transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide,
    polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));
  m.frustumCulled=false;m.renderOrder=1;scene.add(m);TRACE.pos=pos;TRACE.uv=uv;TRACE.geo=g;TRACE.mesh=m;
}
function traceVide(){if(!TRACE.pos)return;TRACE.pos.fill(0);for(const n of ['position','uv']){const a=TRACE.geo.attributes[n];a.updateRange.offset=0;a.updateRange.count=-1;a.needsUpdate=true;}TRACE.r[0]=TRACE.r[1]=null;}
function traceQuad(q,A0,A1,B0,B1,v0,v1){ // écrit le quad q : (A0,A1) = bord arrière du morceau, (B0,B1) = bord avant, v = distance/motif
  const P=TRACE.pos,U=TRACE.uv,o=q*12,u=q*8;
  P[o]=A0.x;P[o+1]=A0.y;P[o+2]=A0.z;P[o+3]=A1.x;P[o+4]=A1.y;P[o+5]=A1.z;P[o+6]=B0.x;P[o+7]=B0.y;P[o+8]=B0.z;P[o+9]=B1.x;P[o+10]=B1.y;P[o+11]=B1.z;
  U[u]=0;U[u+1]=v0;U[u+2]=1;U[u+3]=v0;U[u+4]=0;U[u+5]=v1;U[u+6]=1;U[u+7]=v1;
  if(TRACE.lo<0||q<TRACE.lo)TRACE.lo=q;if(q>TRACE.hi)TRACE.hi=q;
}
// (bord v2) LA LÈVRE RACCROCHÉE — voir tryLand. La caisse repasse en conduite là où elle touche la lèvre, cap = direction de sa
// trajectoire (aucun redressement), sa vitesse moins le choc. Le roulis pris en basculant repart dans le RESSORT de la carrosserie
// (elle se repose, elle ne se redresse pas d'un coup) et la marche sous la lèvre se remonte en ~0,15 s (`levreY`).
function levreRattrape(bI,latOff,hOff,tOff){
  secBord(); // (2026-10-14) LES DÉFIS SECRETS : FANTÔME — la lèvre rattrapée, c'est le bord
  tmp.set(0,1,0).applyQuaternion(carGroup.quaternion);
  const r9=Math.atan2(-tmp.dot(B[bI]),tmp.dot(Nn[bI])); // le roulis VISIBLE, dans la convention de carRoll9 (+ = toit vers −B)
  const vm9=vitMult(),vTan=fallVel.dot(T[bI])/vm9,vLat=fallVel.dot(B[bI])/vm9; // (30/09) le vol porte la vitesse RÉELLE (× vitMult) : ramenée au vA d'avant le multiplicateur, comme à la pose
  s=THREE.MathUtils.clamp(bI/(NP-1)*L+THREE.MathUtils.clamp(tOff,-2,2),0,L-1);
  side=1;lat=Math.sign(latOff)*(ROAD_HALF-.05);
  psi=THREE.MathUtils.clamp(Math.atan2(vLat,Math.abs(vTan)+1),-1.4,1.4);yawR=steer*lacetVol(fallVel.length());slipB=0;driftYaw=0;veqPose(bI,1); /* (2026-10-09) yawR = le lacet du VOL (même formule que yawIn) : volant tenu, la caisse ne « s'arrête » plus de tourner à la pose avant de repartir — elle rejoint le lacet du sol en VOL_TAU */
  vA=(vTan>0?Math.hypot(vTan,vLat):vTan)*.94;vL=0; // le choc de la lèvre coûte 6 % · (2026-10-15) toute la vitesse à plat, comme à la pose : le cap EST la trajectoire
  if(PARK.on){driveDir=vA<0?-1:1;vA=Math.abs(vA);}else driveDir=1;
  levreY=Math.min(0,hOff);carRoll9=THREE.MathUtils.clamp(r9,-.42,.42);rollV=0;
  mode='drive';prevTvalid=false;bascOn=false;
  {const g9=figNitRend(!VEQ.rate);if(SONV2&&g9>.01)sfx('nitro.plein',{t:.2});} /* (loi 6) rattrapée à la lèvre : les figures lancées rendent leurs 40 % (le trop-plein dans la réserve bleue) */
  if(FIGV2.on){if(VEQ.rate)figChute();else figComboEncaisse();} /* (2026-10-15, HUD des figures v3 — vu au banc) la LÈVRE rattrapée est une pose : le combo du vol s'y encaisse
     (ou s'y perd), comme sur la dalle — avant, il disparaissait sans un mot (tryLand sort ici avant l'encaissement) */
  if(chain===0&&chainVal>0)rollover=chainVal; // le REPORT d'un PARFAIT, consommé au décollage, n'est pas perdu pour autant
  chainHud.style.opacity=0;caseHud.style.opacity=0;caseHud.className='';caseHot=false;
  squashT=Math.max(squashT,.14);shake=Math.max(shake,.28);hap(18);
  sparkBurst(sparkGold,carGroup.position,8,7);
  try{thud(3.5);if(!SONV2)noiseBurst(.1,.08,900);pneuMord(.35);}catch(e){}
}
const TRACE_ATT=['position','uv']; // (2026-10-14, passe perf mobile) bâtie UNE fois (un tableau par image de trace avant)
function traceTick(actif){
  if(!actif||wheels.length<4){TRACE.r[0]=TRACE.r[1]=null;return;}
  if(!TRACE.pos)traceInit();
  TRACE.lo=-1;TRACE.hi=-1;
  for(let k=0;k<2;k++){const w=wheels[2+k];if(!w)continue; // les deux roues ARRIÈRE
    const hw=THREE.MathUtils.clamp(((w.userData.large)||.30)*.5,.12,.34);          // la LARGEUR du pneu de CETTE caisse
    const L9=TRACE.V[0].set(w.position.x-hw,.025,w.position.z),R9=TRACE.V[1].set(w.position.x+hw,.025,w.position.z);
    carGroup.localToWorld(L9);carGroup.localToWorld(R9);
    let r=TRACE.r[k];
    if(r&&r.a0.distanceToSquared(L9)>36)r=null;                                    // un saut (repli, portail) : on ne relie pas
    if(!r){r=TRACE.r[k]={a0:L9.clone(),a1:R9.clone(),d:0,q:TRACE.i};TRACE.i=(TRACE.i+1)%TRACE.N;}
    const dd=r.a0.distanceTo(L9),v0=r.d/.9,v1=(r.d+dd)/.9;
    traceQuad(r.q,r.a0,r.a1,L9,R9,v0,v1);                                            // LE BOUT VIVANT : jusqu'au pneu, à chaque image
    if(dd>=.5){r.a0.copy(L9);r.a1.copy(R9);r.d+=dd;r.q=TRACE.i;TRACE.i=(TRACE.i+1)%TRACE.N;} // on fige, et un nouveau bout part de là
  }
  if(TRACE.lo>=0)for(const n of TRACE_ATT){const a=TRACE.geo.attributes[n],st=n==='uv'?8:12;
    if(TRACE.hi-TRACE.lo<40){a.updateRange.offset=TRACE.lo*st;a.updateRange.count=(TRACE.hi-TRACE.lo+1)*st;}else{a.updateRange.offset=0;a.updateRange.count=-1;}
    a.needsUpdate=true;}
}
/* (2026-10-14, session PERF — pour les voiles d'INTERFACE) LES SIGNAUX DE CONSTRUCTION, sur `document` (même famille que `cc:chance`) :
   · `cc:portail`      — le voile du portail vient d'être posé (portPasseNiveau) : la construction part DEUX rAF plus tard (tout de suite en vol) ;
   · `cc:construction` — detail.etape = 'debut' | 'fin' (newTrack, synchrone : entre les deux, aucune image ne se peint ; detail.ms à la fin)
                         puis 'chauffe' (chauffeRendu de la piste neuve, ~120 ms après 'fin' : la dernière image lourde du changement de niveau).
   Un voile qui couvre de `cc:portail` (ou du geste JOUER) jusqu'à 'chauffe' cache TOUT le gel du changement de niveau, à tous les portails. */
function ccConstr(etape,ms){try{document.dispatchEvent(new CustomEvent('cc:construction',{detail:{etape:etape,ms:ms||0}}));}catch(e){}}
function newTrack(){
  const t0NT=performance.now();ccConstr('debut');try{newTrack0();}finally{ccConstr('fin',Math.round(performance.now()-t0NT));}}
function newTrack0(){
  const leger9=PREB.ntLeger;PREB.ntLeger=false; // (LE DÉPART D'AVANCE) la piste que resetGame rebâtit dans la même image : jamais dessinée, seul son ciel compte (voir sous9)
  SVOL.t=0;SVOL.k=0; // (2026-10-14, session SON) portail / nouvelle piste : la tension du vol repart de zéro
  PADCH.sL=0; /* (LE TRAIN DE BOOSTS) il traverse le portail — mais les pads de la nouvelle piste comptent dès son début */
  traceVide(); // (2026-09-26) les traces de pneus restent sur l'ancienne route
  for(const t9 of SILS)t9.init=false;rainbowCoupe();nfeuCoupe(); // (2026-09-26) sinon le ruban de nitro se tendait de l'ancien ovule à la nouvelle piste
  loop._rebuildT=performance.now();loop._rebuildD=3500; // la construction d'une zone fait un pic : la qualité auto ne doit pas le prendre pour de la faiblesse
  CHAUFFE_R.t=performance.now()+120; // (tour 2) la nouvelle piste, sa ville, ses nuages : dessinés une fois hors écran dans la foulée (voir chauffeRendu)
  let sd=(Math.random()*1e9)|0;{const g9=+((/[?&]pistegraine=(\d+)/.exec(location.search)||[])[1])||0;if(g9)sd=g9;} // (banc, 2026-10-18) ?pistegraine=n : la MÊME piste à chaque chargement (comparer deux versions au pixel)
  const niv=lvlChoisir(); // LE NIVEAU D'ABORD : buildClouds et buildVoxCity le lisent pendant la construction
  try{flowLieu(niv&&niv.id==='ville'?'ville':'');}catch(e){} // (2026-09-28, FLOW2 loi 15) en VILLE, la triade se gagne sur la route
  {const id9=niv&&niv.id,av9=ORBFX.prev;ORBFX.prev=id9; // (2026-09-28) L'ORBITE A SES PORTES : tunnel en y entrant, feu en en sortant (portail franchi en course)
   if(started&&!gameOver&&runStats.zones>0&&!PARK.on&&av9&&id9&&av9!==id9){if(id9==='espace')orbWarp();else if(av9==='espace')orbFeu();}}
  if(!leger9){const s9=prebGraine(niv);if(s9!=null)sd=s9;} // (2026-10-17) LE PRÉ-BÂTI : au passage du portail, la piste d'en face bâtie d'avance garde SA graine (voir PREB)
  if(niv&&niv.graine)sd=niv.graine; // (2026-09-27) CAMPAGNE : la même piste, les mêmes pièces, les mêmes nuages à chaque essai
  if(!leger9){const e9=prebPalier();try{buildTrack(sd);}finally{if(e9!=null)engTier=e9;} // (LE PRÉ-BÂTI) le décor d'une piste bâtie d'avance se bâtit à son palier (prebPalier)
  padsInstancier();} // (2026-09-27, passe perf iPhone) …et les plaques turbo : 82 appels de dessin → 1
  // LE CIEL : chaque NIVEAU tire le sien dans sa propre liste (voir NIVEAUX). Hors niveaux (parc
  // freestyle), l'ancien CYCLE DU CIEL : une heure du jour au hasard, jamais deux fois la même de
  // suite, et la VRAIE NUIT au 3e portail (runStats.zones est ++ AVANT newTrack, remis à 0 par resetGame).
  let nb9;
  if(niv)nb9=lvlBiome();
  else if(runStats.zones>=3)nb9='nuit';
  else do{nb9=BIO_DAY[(Math.random()*BIO_DAY.length)|0];}while(nb9===BIO.name);
  const nightFalls=!niv&&started&&nb9==='nuit'&&BIO.name!=='nuit'; // capturé AVANT bioGo (qui écrase BIO.name)
  bioGo(nb9,started?bioPortDur():.01); // (2026-09-26, vague 2) 1,2 s au portail (et au replay) en passant par le sombre (voir bioStep) — c'était 4 s de brume laiteuse ; instantané au boot
  if(started&&!PCV.fen)BIO.dip=1;
  lvlGo(started?bioPortDur():.01);     // …et le monde (étoiles de l'orbite, taille de la planète) bascule avec lui
  if(niv&&started&&!gameOver&&runStats.zones>0)lvlAnnonce(); // « NIVEAU 2 — MER DE NUAGES » (le niveau 1, lui, s'annonce après le logo du départ : voir fireLaunchBoost)
  else if(nightFalls)showMsg('LA NUIT TOMBE…','#9ac8ff'); // le déblocage s'annonce
  if(!leger9)computeMinimap();
  try{musicSuitLieu();}catch(e){} // LA MUSIQUE PAR MONDE : change si le lieu en réclame une autre
  if(!leger9)spawnPickups(mulberry32(sd^0x9e3779b9));
  dmtCoupe();s=0;lat=0;psi=0;side=1;driveDir=1;prevTvalid=false;safeS=0;loop._camDriveT=0; // (2026-09-28) la caméra repart de sa place sur la NOUVELLE piste (la coupe se cache sous le flash du portail)
  if(vA<20)vA=20;
  mode='drive';
  campDebut(); // (2026-09-27) la zone qui commence : l'orage repart, la caisse-nuage se range, l'événement rare se pose
}
// (2026-09-30, revue PISTE) console : dbgPas() → le PAS réel de la piste (écart réel/supposé p1/p50/p99, extrêmes, sauts ≥ ×1,5), les
// tronçons de MODULES et les bancs de route.
window.dbgPas=function(){const ds=L/(NP-1),r=[];let sauts=0;for(let i=1;i<NP;i++){r.push(pts[i].distanceTo(pts[i-1])/ds);if(i>1){const k=r[i-1]/r[i-2];if(k>=1.5||k<=1/1.5)sauts++;}}
  r.sort(function(a,b){return a-b;});const q=function(p){return +r[Math.floor(p*(r.length-1))].toFixed(3);},vC=70+(lvPiste()-1)*100;
  const Z=[];for(const c of CLOUDS)if(c.onRoad){let bi=0,bd=1e18;for(let i=0;i<NP;i+=4){const d2=pts[i].distanceToSquared(c.c);if(d2<bd){bd=d2;bi=i;}}const sB=bi*ds;Z.push([sB-c.r-10,sB+c.r+vC]);}
  return {L:Math.round(L),NP:NP,pas:{p1:q(.01),p50:q(.5),p99:q(.99),min:+r[0].toFixed(3),max:+r[r.length-1].toFixed(3),sauts:sauts},vC:Math.round(vC),
    modules:MODS.map(function(m){return [Math.round(m.s0),Math.round(m.s1)];}),flaques:OILS.length,bancs:Z.length,sas:Math.round(2.5*vC)};};
/* (2026-10-14, BANC RACCOURCIS — LECTURE SEULE) dbgTrace(o) → la piste COURANTE échantillonnée, pour les mesures en Node (cc-banc/raccourcis.cjs).
   · o.pas    : écart des échantillons en mètres (4 par défaut ; les points du jeu sont équidistants, on en saute k = pas/ds).
   · o.graine : REBÂTIT la piste de la carte courante avec CETTE graine, par la fonction du jeu elle-même (newTrack). newTrack tire sa graine
                sd=(Math.random()*1e9)|0 (campagne exceptée : niv.graine) et la passe à buildTrack(sd) : on lui sert (graine+.5)/1e9 pour CE seul
                appel — reconnu à sa pile (l'appelant direct est newTrack0), jamais un autre Math.random — puis Math.random redevient le vrai.
   · o.carte / o.meteo : impose le couple du mode classique comme `?carte=&meteo=` (même au menu : SF.pret le temps de l'appel). Sans eux, la carte en cours.
   · o.palier : pose `engTier` le temps du newTrack (la piste se bâtit à l'échelle de CE palier moteur, comme à un portail), puis le restaure.
   ⚠ Rebâtir = newTrack() ENTIER (piste, décor, pièces) : s repart de 0 — pas au milieu d'une vraie course. La piste est celle de la zone 0, au palier moteur courant (ou o.palier).
   Rend {carte,meteo,piste,L,NP,half,thick,minY,g,spd,airMax,pas,p,t,n,b,trou,graine,graineOk,lv,eng,vPal,rMin} : vPal = vPalier(), rMin = rayonPalier() AU PALIER DE LA PISTE ; p en mètres (2 décimales), t/n/b = le repère de la dalle
   (tangente, normale, binormale ; 3 décimales), trou[i]=0 (il n'y a plus de vide : le champ reste pour les bancs).
   graineOk=false : la graine n'a pas pris (niveau à graine FIXE, ou newTrack ne l'a pas tirée) — la piste n'est alors pas celle de la graine demandée. */
window.dbgTrace=function(o){o=o||{};let graineOk=null,graine=null;const eT9=engTier,pal9=o.palier!=null?(o.palier|0):eT9;
  if(o.graine!=null||o.carte||o.palier!=null){
    const raV=Math.random,sv={p:SF.pret},v=o.graine!=null?Math.abs(Math.floor(+o.graine))%1e9:-1;let pris=false;
    const randGraine=function randGraine(){ // nommée : sa pile la trahit
      if(v>=0&&!pris&&/^\s*at newTrack0\b/.test(String(new Error().stack).split('\n')[2]||'')){pris=true;Math.random=raV;return (v+.5)/1e9;}
      return raV();};
    try{
      if(o.carte){SF.force={carte:String(o.carte),meteo:o.meteo?String(o.meteo):null};SF.tirage=[];SF.der=null;SF.pret=true;}
      if(v>=0)Math.random=randGraine;
      engTier=pal9;
      newTrack();
    }finally{Math.random=raV;engTier=eT9;if(o.carte){SF.pret=sv.p;SF.force=null;}}
    if(v>=0){graine=v;graineOk=pris&&!(LVL.cur&&LVL.cur.graine);}
  }
  const ds=L/(NP-1),k=Math.max(1,Math.round((o.pas||4)/ds)),nb=Math.floor((NP-1)/k)+1,r2=function(x){return Math.round(x*100)/100;},r3=function(x){return Math.round(x*1000)/1000;};
  const p=new Array(nb*3),t=new Array(nb*3),n=new Array(nb*3),b=new Array(nb*3),trou=new Array(nb);
  for(let j=0;j<nb;j++){const i=j*k,P=pts[i],a=T[i],c=Nn[i],d=B[i],q=j*3;
    p[q]=r2(P.x);p[q+1]=r2(P.y);p[q+2]=r2(P.z);t[q]=r3(a.x);t[q+1]=r3(a.y);t[q+2]=r3(a.z);
    n[q]=r3(c.x);n[q+1]=r3(c.y);n[q+2]=r3(c.z);b[q]=r3(d.x);b[q+1]=r3(d.y);b[q+2]=r3(d.z);trou[j]=0;}
  let lv9=0,vp9=0,rm9=0;engTier=pal9;try{lv9=lvPiste();vp9=vPalier();rm9=rayonPalier();}finally{engTier=eT9;} // les trois se lisent AU PALIER de la piste
  return {carte:LVL.cur?(LVL.cur.carte||LVL.cur.id):null,meteo:LVL.cur?LVL.cur.meteo||null:null,piste:LVL.cur?LVL.cur.piste||null:null,L:r2(L),NP:NP,half:ROAD_HALF,thick:THICK,minY:r2(trackMinY),
    g:FALL_G*SPD,spd:SPD,airMax:airMax(),pas:r2(k*ds),graine:graine,graineOk:graineOk,lv:r2(lv9),eng:pal9,vPal:r2(vp9),rMin:r2(rm9),p:p,t:t,n:n,b:b,trou:trou,
    mods:MODS.map(function(m){return [r2(m.s0),r2(m.s1)];})};}; // (2026-10-18) les tronçons des MODULES (voir MODC_ON)
// console : dbgPortail(d) → la caisse à d mètres AVANT l'ovule (sur la route) ; dbgPortail('ciel') → lâchée à la verticale AU-DESSUS de lui
window.dbgPortail=function(d){if(!started||gameOver||PARK.on)return 'pas de course';
  if(d==='ciel'){s=Math.max(0,L-400);startFall(10,1);fallPos.copy(PORTAL.c);fallPos.y+=PORTAL.R*1.7;fallVel.set(0,-35,0);return {mode,c:PORTAL.c.toArray().map(Math.round),R:PORTAL.R};}
  s=Math.max(0,L-(d||300));lat=0;psi=0;prevTvalid=false;mode='drive';return {L:Math.round(L),s:Math.round(s),R:PORTAL.R};};
// console : dbgSaut() → franchit le portail tout de suite (niveau suivant), comme le vrai portail le fait
window.dbgSaut=function(){ if(!started||gameOver||PARK.on)return 'pas de course en cours';
  runStats.zones++;SURV.pBase+=survPortS();newTrack();return window.dbgNiveau(); }; // (2026-09-30) comme le vrai portail : en vol, au moins l'entrée de l'ovule
/* (2026-10-14, session SON) CE QUI SONNE ENCORE DE LA MORT QUAND ON REJOUE. L'explosion dure 3,35 s, la fanfare du record 1,87 s, le
   « compte » de l'écran de fin 1,1 s : un REJOUER pressé (le volet noir ne dure que 0,35 s) les laissait finir PAR-DESSUS le logo, le
   whoomp et le réacteur du départ de la partie suivante (ils sont dans le bus des effets, `stopJeu` ne les connaît que pour la pause).
   `resetGame` les éteint (CCSON.stop : rampe de 10 ms, jamais net) et annule ce qui était programmé en avance, UNIQUEMENT si l'on sort d'un
   écran de fin (`gameOver`) : les sons du départ qui précèdent resetGame (JOUER depuis le garage) ne sont jamais touchés. */
const FIN_SONS=['explosion','explosion.loin','impact.immeuble','mort.vide','mort.arret','mort.air','mort.police',
  'mort.enseigne','mort.compteFin','ui.debloque','ui.record','caisse.debloquee','aura.encaisse1','aura.encaisse2','aura.encaisse3'];
/* LA RÉGIE ADMOB, CÔTÉ JEU (2026-10-19, Sacha : « prépare les emplacements de pub récompensée dans le jeu (sans module AdMob), on branchera
   AdMob en v1.1 ») — ÉTEINTE tant que le chargeur du <head> (« LA RÉGIE ADMOB DE L'APP iPHONE » : CC_ADMOB) n'a pas son identifiant ET que
   le module natif n'est pas dans l'app : aujourd'hui elle ne fait RIEN (AMOB.on faux), la pub maison joue comme avant.
   Allumée, elle devient la régie de TOUTES les pubs récompensées (seconde chance, ×2 du gain) par les deux crochets que pubRecompense
   connaît déjà : CC_PUB_PREPARE (l'offre s'ouvre → prepareRewardVideoAd) et CC_PUB_RECOMPENSE (le toucher → showRewardVideoAd).
   Au lancement de l'app : initialize, le message de consentement RGPD de Google (UMP : requestConsentInfo/showConsentForm, obligatoire en
   Europe), la fenêtre de suivi d'Apple (ATT : requestTrackingAuthorization), puis une pub préchargée. La fin d'une pub se lit aux
   ÉVÉNEMENTS du module (récompense gagnée, pub fermée, pub ratée) — pas à la promesse de showRewardVideoAd, qui selon les versions rend
   la main avant que la pub soit fermée. Rien de prêt au toucher → null → la pub maison. Une pub qui ne rend jamais la main : 150 s, puis
   « pas vue ». ⚠ ÉCRIT SANS LE MODULE SOUS LA MAIN (aucun Mac ici) : les noms d'événements et d'options sont ceux de
   @capacitor-community/admob v5-v7 — à vérifier contre la version installée, au banc ?pubtest=1 sur un vrai iPhone. Banc : dbgPub().admob. */
const AMOB={on:false,pret:false,charge:false,vu:false,res:null,tm:0,etat:'',n:0,init:false};
(function(){try{
  const C=window.Capacitor;if(!C)return;
  let A=C.Plugins&&C.Plugins.AdMob;
  if(!A&&typeof C.isPluginAvailable==='function'&&C.isPluginAvailable('AdMob')&&typeof C.registerPlugin==='function')A=C.registerPlugin('AdMob');
  const test=/[?&]pubtest=1\b/.test(location.search),cfg=window.CC_ADMOB||{};
  const id=test?'ca-app-pub-3940256099942544/1712485313':String(cfg.recompense||'');
  if(!A||typeof A.prepareRewardVideoAd!=='function'||typeof A.showRewardVideoAd!=='function'||!/^ca-app-pub-\d{10,20}\/\d{6,14}$/.test(id))return;
  AMOB.on=true;
  const fin=function(v){clearTimeout(AMOB.tm);const r=AMOB.res;AMOB.res=null;if(r)r(v);};
  const charge=function(){if(!AMOB.init||AMOB.pret||AMOB.charge||AMOB.res)return;AMOB.charge=true;
    Promise.resolve().then(function(){return A.prepareRewardVideoAd({adId:id,isTesting:test});})
      .then(function(){AMOB.charge=false;AMOB.pret=true;AMOB.etat='prête';},function(){AMOB.charge=false;AMOB.etat='pas chargée';});};
  const ecoute=function(n,f){try{A.addListener(n,f);}catch(e){}};
  ecoute('onRewardedVideoAdReward',function(){AMOB.vu=true;});
  ecoute('onRewardedVideoAdDismissed',function(){AMOB.etat='fermée';fin(AMOB.vu);});
  ecoute('onRewardedVideoAdFailedToShow',function(){AMOB.etat='ratée';fin(null);});
  const lance=async function(){
    try{await A.initialize({initializeForTesting:test});}catch(e){}
    try{if(typeof A.requestConsentInfo==='function'){const ci=await A.requestConsentInfo();
      if(ci&&ci.isConsentFormAvailable&&ci.status==='REQUIRED'&&typeof A.showConsentForm==='function')await A.showConsentForm();}}catch(e){}
    try{if(typeof A.trackingAuthorizationStatus==='function'&&typeof A.requestTrackingAuthorization==='function'){
      const t=await A.trackingAuthorizationStatus();if(t&&t.status==='notDetermined')await A.requestTrackingAuthorization();}}catch(e){}
    AMOB.init=true;charge();};
  if(document.readyState==='complete')setTimeout(lance,1500);else addEventListener('load',function(){setTimeout(lance,1500);});
  window.CC_PUB_PREPARE=function(nom){charge();};
  window.CC_PUB_RECOMPENSE=function(nom){
    if(!AMOB.pret||AMOB.res){charge();return null;} // rien de prêt : la pub maison
    AMOB.pret=false;AMOB.vu=false;AMOB.n++;AMOB.etat='montrée';
    const p=new Promise(function(res){AMOB.res=res;});
    AMOB.tm=setTimeout(function(){fin(false);},150000);
    Promise.resolve().then(function(){return A.showRewardVideoAd();}).then(function(r){if(r&&r.type!=null)AMOB.vu=true;},function(){AMOB.etat='ratée';fin(null);});
    p.then(function(){setTimeout(charge,1000);}); // la suivante se prépare dès que celle-ci a rendu la main
    return p;};
}catch(e){AMOB.on=false;}})();
/* LA RÉGIE ADSENSE, CÔTÉ JEU (2026-10-15 soir, Sacha : « branche les vraies pubs sur le site web avec Google AdSense (jeux H5) ») — le
   chargeur du <head> (« LA RÉGIE ADSENSE » : CC_ADSENSE, ?pubtest=1) a posé adBreak/adConfig ; on en fait la régie de LA PUB QUI RESSUSCITE.
   Le parcours de Google pour une pub RÉCOMPENSÉE : on DEMANDE une pub quand l'offre s'ouvre (adBreak type 'reward', depuis chanceOuvre :
   CC_PUB_PREPARE) ; Google rappelle beforeReward(showAdFn) SEULEMENT s'il en a une ; la plaque CONTINUER ▶ PUB est l'invitation, son toucher
   appelle showAdFn() DANS le geste (CC_PUB_RECOMPENSE) → adViewed = reprise, adDismissed = pas de reprise. Pas de pub prête au toucher (rien
   en stock, plafond de fréquence, bloqueur, mode test « pas chargée »…) → null → la pub maison de 5 s. adConfig dit à Google si le jeu a du
   son (`sound`, relu à chaque offre) et précharge (`preloadAdBreaks`, une seule fois). Une pub qui ne rend jamais la main : 150 s, puis
   « pas vue ». Banc : dbgPub().ads (on, pret, etat = le dernier breakStatus de Google, n, prete). */
const ADS={on:!!(window.CC_ADS&&typeof window.adBreak==='function'&&typeof window.CC_PUB_RECOMPENSE!=='function'),pret:false,b:null,etat:'',n:0};
function adsSon(){return (SAVE.d.sfx||SAVE.d.mus)?'on':'off';}
if(ADS.on){
  try{adConfig({preloadAdBreaks:'on',sound:adsSon(),onReady:function(){ADS.pret=true;}});}catch(e){ADS.on=false;}
  window.CC_PUB_PREPARE=function(nom){
    if(ADS.b&&ADS.b.res)return; // une pub de Google est à l'écran : on n'en demande pas une autre
    const b={show:null,res:null,tm:0};ADS.b=b;ADS.n++;
    const fin=function(v){clearTimeout(b.tm);b.show=null;const r=b.res;b.res=null;if(r)r(v);};
    try{adConfig({sound:adsSon()});}catch(e){}
    try{adBreak({type:'reward',name:nom,
      beforeReward:function(showAdFn){if(ADS.b===b)b.show=showAdFn;},
      adDismissed:function(){fin(false);},
      adViewed:function(){fin(true);},
      adBreakDone:function(info){ADS.etat=String(info&&info.breakStatus||'');fin(ADS.etat==='viewed'?true:ADS.etat==='dismissed'?false:null);}});}
    catch(e){ADS.etat='erreur';}
  };
  window.CC_PUB_RECOMPENSE=function(nom){
    const b=ADS.b;if(!b||!b.show)return null; // rien de prêt : la pub maison
    const f=b.show;b.show=null;
    const p=new Promise(function(res){b.res=res;});
    b.tm=setTimeout(function(){const r=b.res;b.res=null;if(r)r(false);},150000);
    try{f();}catch(e){clearTimeout(b.tm);const r=b.res;b.res=null;if(r)r(null);}
    return p;
  };
}
