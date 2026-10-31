/* ============================================================================
   LES NIVEAUX (2026-09-24) — « certains dans l'espace avec la planète, d'autres dans les nuages,
   d'autres au-dessus de la ville » (demande du user).
   ----------------------------------------------------------------------------
   Un NIVEAU = une ZONE, du départ au portail. Aucune piste ni aucune physique nouvelle : chaque
   niveau recompose le DÉCOR qui existait déjà en morceaux — la ville voxel, les nuages, la planète —
   et tire son ciel dans une liste de biomes qui lui ressemblent.
     VILLE  : la ville voxel sous la route et DÉGAGÉE (ni mer de nuages, ni plafond, ni colosse qui la
              cacheraient), des étages allumés, des ciels de soir et de nuit : l'heure des néons.
     NUAGES : la mer de nuages au complet, plus une couche ; ciels de jour ; pas de ville (elle serait
              sous la ouate — et ce sont deux draw calls de moins sur téléphone).
     ORBITE : le biome `espace`, `uSpace` qui éteint le dégradé et sème les étoiles jusque sous
              l'horizon, la planète agrandie et posée SOUS la route. Seuls restent les coussins de vol :
              ils rechargent l'airtime — c'est du GAMEPLAY, pas du décor.
   L'ordre tourne : VILLE → NUAGES → ORBITE → VILLE… Le portail est la porte entre deux mondes.
   ⚠ ça REMPLACE la « nuit au 3e portail » : la nuit vit désormais dans la ville. Le parc freestyle
   (PARK.on) garde l'ancien tirage — il a sa prairie, et ses secteurs ne comptent pas comme zones.
   ⚠ `LVL.cur` est posé AVANT `buildTrack` (voir `newTrack`) : `buildClouds` et `buildVoxCity` le
   lisent pendant la construction. Un nuage sauté ne décale que le RNG LOCAL des nuages, jamais `rnd`.
   ========================================================================== */
/* ⚠ L'ORDRE ET LES CIELS (2026-09-24, user) : « d'abord le premier niveau dans les nuages en journée
   SANS motif musical dans le ciel, deuxième au-dessus de la ville AVEC les clignotements dans le ciel,
   troisième dans l'espace au-dessus de la Terre et dans le NOIR COMPLET ». `cielMusical` pilote le fond
   de rythme du dôme (roue, ondes, piliers, onde de couleur) ET son souffle (`uPulse`) — voir musicTick.
   `pluie` : le rideau de pluie de la ville (voir PLUIE). */
/* ⚠ ORDRE : le 2026-09-24 « d'abord la VILLE », puis le 2026-09-25 au soir « remets les NUAGES en premier, avant la ville ».
   Rien ne dépend de la position dans ce tableau (tout passe par `id`) : réordonner est sans risque (musicPremier lit NIVEAUX[0]). */
const NIVEAUX=[ // ⚠ ORDRE (2026-09-25 au soir, user) : « remets le niveau dans les nuages en PREMIER, avant la ville » — NUAGES, puis VILLE, puis ORBITE
  // planete 0 aux NUAGES (user : « ne mets pas la Terre dans le niveau dans les nuages ») · route/sheen : clarté et brillance du bitume (routeTick)
  // (2026-09-30) `pr`, la PROMESSE (bannière de niveau, ≤ 32 signes, sans accent) : NUAGES = un nuage traversé en vol te soulève et rend de l'airtime (updateClouds, refT) · VILLE = en vol, une tour tue (villeHeurt → explode('tour'))
  {id:'nuages',nm:'MER DE NUAGES',        bio:['matin','midi','aprem'],planete:0,   espace:0,pluie:0,cielMusical:false,route:0,  sheen:.06,pr:'MER DE NUAGES'}, /* (2026-09-30) plus « TE PORTENT » : Sacha a retiré la portance des nuages (ils ne font que bloquer la vue) et les bancs se posent devant les virages */
  {id:'ville', nm:'AU-DESSUS DE LA VILLE',bio:['pluie'],               planete:0,   espace:0,pluie:1,cielMusical:true, route:.7, sheen:.12,pr:'LES TOURS NE PARDONNENT PAS'}, // route plus CLAIRE : elle se détache de la ville sombre (user) ; sheen : bitume mouillé par la pluie
  {id:'espace',nm:'EN ORBITE',            bio:['espace'],              planete:1.35,espace:1,pluie:0,cielMusical:false,route:.38,sheen:.12}, // (2026-09-27) route .9 → .38 : le SOLEIL de l'orbite éclaire désormais la route (lumière rasante de côté, voir orbiteLumiere) — la clarté ajoutée n'a plus à tout porter. Avant (vague 2) : (2026-09-26, vague 2) route .2 → .9 : la route (#050212 sur du noir) DISPARAISSAIT — MESURÉ : sous le contraste dur de l'orbite (1,28) tout ce qui sort de l'ACES sous ~.11 tombe au noir, .4 ne suffisait pas (#000008) ; à .9 le ruban se lit, encre indigo #0f0737 sur le vide
  {id:'orage', nm:'L\'ORAGE',               bio:['tempete'],             planete:0,   espace:0,pluie:1,cielMusical:false,route:.22,sheen:.16,pr:'LA ROUTE SE CACHE : L\'ECLAIR LA MONTRE'}, // (2026-09-29, Sacha) le 4e : les NUAGES sous l'ORAGE — le niveau DUR (voir « L'ORAGE » : tempete, bancs, plafond, éclairs)
  {id:'ville', nm:'MINUIT EN VILLE',      bio:['nuitNoire'],           planete:0,   espace:0,pluie:.55,cielMusical:true,route:.42,sheen:.2,nuit:1,pr:'PLEINS PHARES'}, // (2026-09-30, Sacha) le 5e : la VILLE plus tard, après l'orage — très sombre, des PHARES PUISSANTS (id 'ville' : toute la ville suit ; `nuit` ne change que la lumière — voir « MINUIT EN VILLE »)
];
/* ============================================================================
   LE MODE CLASSIQUE AU HASARD (2026-10-13, Sacha : « il faut que les biomes soient aléatoires — montagne chinoise, nuages, ville… — et
   que la suite soit aléatoire, indépendante de la météo : la map, le biome, et la météo. À chaque fois qu'on passe un portail ou qu'on
   lance un mode classique, décider aléatoirement un des biomes ET aléatoirement une des météos. Restrictions : dans l'espace, ni nuages,
   ni pluie, ni orage ; dans tous les autres niveaux, tu peux. »)
   ----------------------------------------------------------------------------
   La partie sans fin ne suit plus le cycle NIVEAUX (NUAGES → VILLE → ORBITE → ORAGE → MINUIT → SATELLITES) : au départ et à chaque
   portail, `sfTire` prend une MAP (jamais la même deux fois de suite) puis une MÉTÉO permise dans cette map. Les couples que le jeu
   connaissait déjà sont REPRIS tels quels, avec tout ce qui va avec : nuages × orage = L'ORAGE (ses bancs, ses éclairs, sa brume),
   ville × pluie = AU-DESSUS DE LA VILLE, ville × nuit = MINUIT EN VILLE (sans sa pluie : la nuit n'est pas la pluie), orbite × midi =
   EN ORBITE, et la PLUIE DE SATELLITES devient la « météo » rare de l'orbite. Les autres reçoivent leur ambiance (voir « LES MÉTÉOS DU
   MODE CLASSIQUE », près de BIOMES) et les leviers de toujours : la pluie (LVL.pluie : le rideau, la route mouillée), la nuit (LVL.nuit :
   les phares), l'orage (`orage` : les éclairs d'orageTick, partout sauf dans l'espace). Les PICS DE JADE y sont un niveau COMPLET (le
   SOLEIL DE JADE : pièces ¥, ses fruits, sa musique GLISSE V2) dont le portail mène à la suite au lieu de l'ARRIVÉE.
   PARIS n'en est plus une map (18/10 au soir : remis l'après-midi, retiré le soir). `?classique=cycle` rend le cycle fixe,
   et `?play=sansfin` (le simulateur de Léo : sa « PARTIE SANS FIN » clique JOUER et attend la MER DE NUAGES) le garde.
   Le tirage d'une partie est tenu dans `SF.tirage` (un couple par zone) : la piste bâtie sous le voile du JOUER est celle qu'on roule.
   Banc / lien de test : `?carte=jade&meteo=orage` impose le 1er couple ; `dbgClassique('ville','soir')` impose le suivant (puis dbgSaut()).
   ========================================================================== */
const SF={on:!/[?&](classique=cycle|play=sansfin)\b/.test(location.search),pret:false,neuf:false,tirage:[],der:null,force:null,prochain:null,prochainDer:null};
/* (2026-10-30, Léo : « enlève la map pic de glace du jouer, elle n'est pas au niveau ») LE GLACIER (id 'banquise') quitte le JOUER : seul `?carte=banquise` le remet. */
const SF_HORS={vitree:VILLE_VERRE_V&&!/[?&]vitree=1\b/.test(location.search),banquise:!/[?&](carte|niveau)=banquise\b/.test(location.search)}; /* ⚠ TEL_NATIF, PAS l'ancien drapeau mobile (2026-10-25, Sacha : « sur PC la qualité a chuté ») : `l'ancien drapeau mobile` est vrai AUSSI sur l'ordi qui joue l'édition 'mobile' (FORCE_TEL, voir EDITION) — les retraits « téléphone » du 24/10 tombaient donc sur le PC. */ /* (2026-10-24, Sacha : « enlève les maps dunes et forêt de la version mobile ») LA FORÊT n'est plus tirée sur téléphone (l'ordi la garde) · (2026-10-25, Léo : « remets la map dune dans le main, intelligible pour un iPhone 13 ») LES DUNES sont REVENUES au tirage du téléphone, allégées (DN_MOB, dunes-1.js ; `?dunesplein=1` rend l'image d'avant) ; `?carte=foret` / `?carte=dunes` les remettent */ /* (2026-10-25, Léo : « remets forêt sur iPhone ») LA FORÊT est REVENUE au tirage du téléphone (elle y garde son allègement : arbres ×0,8, MOB) ; l'ordi la gardait déjà */
/* (2026-10-18, Sacha : « fusionne les maps ville et ville vitrée ») les maps HORS DU TIRAGE — jouables par ?carte= et dbgClassique (voir VILLE_VERRE_V) */
{const q9=/[?&]carte=(\w+)/.exec(location.search),m9=/[?&]meteo=(\w+)/.exec(location.search),t9=/[?&]teinte=(\w+)/.exec(location.search);if(q9||m9)SF.force={carte:q9?q9[1]:null,meteo:m9?m9[1]:null,teinte:t9?t9[1]:null};} // (2026-10-16) + `?teinte=` (la ville : violet, vert, jaune, bleu)
const SF_NIV={nuages:NIVEAUX.find(function(n){return n.id==='nuages';}),orage:NIVEAUX.find(function(n){return n.id==='orage';}),
  ville:NIVEAUX.find(function(n){return n.id==='ville'&&!n.nuit;}),minuit:NIVEAUX.find(function(n){return n.id==='ville'&&n.nuit;}),
  espace:NIVEAUX.find(function(n){return n.id==='espace';}),jade:NIV_JADE,foret:NIV_FORET,canyon:NIV_CANYON,dunes:NIV_DUNES,grotte:NIV_GROTTE,banquise:NIV_BANQ,vitree:NIV_VITRE};
const SF_METEOS={matin:'MATIN',midi:'MIDI',soir:'SOIR',nuit:'NUIT',pluie:'PLUIE',orage:'ORAGE',neige:'NEIGE',blizzard:'BLIZZARD',brouillard:'BROUILLARD'}; // (2026-10-16) BROUILLARD : le temps de la ville // (2026-10-14) NEIGE et BLIZZARD : les temps de LA BANQUISE
Object.assign(I18N,{'BROUILLARD':'FOG'}); // (2026-10-16) la météo de la ville, dite au portail
// une MAP = son niveau de base + ses météos permises (`bio` : l'ambiance, `niv` : un niveau du jeu repris tel quel, `p` : le poids au tirage, 1 par défaut)
/* (2026-10-14, LA BIBLE CAR CASH, passe graphismes · banquise2) LA BANQUISE avait déjà son ciel saturé à horizon chaud : il leur
   manquait les invariants communs — le contre-jour ROSE sur les caisses (ici) et la signature de route rose + or (routeSig). */
for(const [f9,ks9] of [['banquise',['banqMatin','banqMidi','banqSoir','banqNuit','banqNeige','banqBlizzard']]])
  for(const k of ks9)if(BIOMES[k])Object.assign(BIOMES[k],{kickC:[1,.38,.66],kickI:Math.max(BIOMES[k].kickI||0,.16)});
{if(BIOMES.banqMatin)BIOMES.banqMatin.sat=1.08;if(BIOMES.banqMidi)BIOMES.banqMidi.sat=1.08;if(BIOMES.banqSoir)BIOMES.banqSoir.sat=1.12;} // (bible · banquise2) saturation effective : jour 1,25 → 1,31, soir 1,28 → 1,35 (neige et blizzard gardent leur retenue)
const SF_CARTES={
  nuages:{nm:'MER DE NUAGES',base:'nuages',m:{matin:{bio:'matin'},midi:{bio:'midi'},soir:{bio:'nuagesSoir'},nuit:{bio:'nuagesNuit',nuit:1},
    pluie:{bio:'nuagesPluie',pluie:.75,route:.18,sheen:.16},orage:{niv:'orage',orage:1}}},
  /* (2026-10-31, Sacha : « fusionne la map. Crypto City n'existe plus — tu la fusionnes avec la ville normale, la ville la nuit. La nuit, mode néon ;
     le jour, quelques éléments de Crypto City, discrets : quelques bougies, quelques trucs Bitcoin, et on enlève le taureau ») LA VILLE EST FUSIONNÉE :
     un seul temps de JOUR (le ciel du bull run — `bullrun`, déjà réglé — qui ne porte plus que quelques bougies et panneaux épars, voir cryptocity.js,
     le taureau est retiré du code) à égalité avec un seul temps de NUIT (l'orage néon, INTOUCHABLE). CRYPTO CITY (sa skyline de verre/or, ses pièces
     géantes, ses dirigeables, ses fusées, ses feux d'artifice et son taureau) n'est plus une map à part. */
  ville:{nm:'LA VILLE',base:'ville',teintes:['violet','vert','jaune'],m:{
    jour:{bio:'bullrun',crypto:1,route:.30,sheen:.16},
    orage:{bio:'villeOrage',pluie:1,orage:1,route:.5,sheen:.2}}},
  jade:{nm:'PICS DE JADE',base:'jade',m:{matin:{bio:'jadeMatin'},midi:{bio:'jadeMidi'},soir:{bio:'jade'},nuit:{bio:'jadeNuit',nuit:1},
    pluie:{bio:'jadePluie',pluie:.75,sheen:.2},orage:{bio:'jadeOrage',pluie:1,orage:1,sheen:.2}}},
  /* (2026-10-14, Sacha) LA FORÊT NOIRE : ses six temps — le matin doré, le midi vert, le soir d'or, la NUIT HANTÉE (les phares, le loup-garou),
     la pluie, l'orage (les éclairs blanchissent la forêt). Voir « LA FORÊT NOIRE — LA MAP DES CONTES » (genForet, buildForet, FOR_MET). */
  foret:{nm:'LA FORÊT NOIRE',base:'foret',m:{matin:{bio:'foretMatin'},midi:{bio:'foretMidi'},soir:{bio:'foretSoir'},
    pluie:{bio:'foretPluie',pluie:.8,sheen:.18},orage:{bio:'foretOrage',pluie:1,orage:1,sheen:.2,pr:'LES LOUPS HURLENT'}}},
  /* (2026-10-14, Sacha) LE GLACIER (ex-LA BANQUISE, renommé à 20 h 40 : « ça devrait plutôt s'appeler GLACIER et être une MONTAGNE, comme dans STEEP ») :
     le matin rose, le midi bleu profond, le soir où les pics s'embrasent, la NUIT des aurores boréales, la NEIGE, le BLIZZARD (plus rare). Ni pluie ni
     éclairs. La promesse est la même à toute heure : le RACCOURCI (genBanq : les lacets superposés). Voir « LE GLACIER » au JOURNAL. L'id reste 'banquise'. */
  banquise:{nm:'LE GLACIER',base:'banquise',m:{midi:{bio:'banqMidi'},soir:{bio:'banqSoir'},nuit:{bio:'banqNuit',nuit:1},
    neige:{bio:'banqNeige'}}},
  /* (2026-10-31) CRYPTO CITY (ci-dessus, 15/10) n'est plus une map séparée : fusionnée dans « ville » (voir plus haut, « LA VILLE EST FUSIONNÉE »). */
  /* (2026-10-17, Léo) LA VILLE VITRÉE : quatre heures — le MATIN aux reflets dorés, le MIDI bleu (les nuages dans les vitres), le COUCHER où les tours
     s'embrasent, la NUIT des bureaux allumés derrière le verre. Jamais de pluie ni d'orage. Voir « LA VILLE VITRÉE ». */
  ...({vitree:{nm:'VILLE VITRÉE',base:'vitree',m:{matin:{bio:'vitreMatin',pr:'REFLETS DORES'},midi:{bio:'vitreMidi',p:1.2},soir:{bio:'vitreSoir',p:1.2,pr:'LES TOURS S EMBRASENT'},nuit:{bio:'vitreNuit',nuit:1,pr:'LES BUREAUX BRILLENT'},
    pluie:{bio:'vitrePluie',pluie:.8,sheen:.2,pr:'IL PLEUT ENTRE LES VILLES'}}}}), // (v2) la PLUIE : elle tombe de la ville d'en haut
  espace:{nm:'EN ORBITE',base:'espace',m:{matin:{bio:'espaceMatin'}}}, // ni nuages, ni pluie, ni orage (Sacha) — (2026-10-14, Sacha : « plus de PLUIE DE SATELLITES, elle doit être enlevée ») plus de météo SATELLITES
  /* (2026-10-18, Sacha) LES PROFONDEURS : sous la terre, pas de ciel — ses quatre « temps » sont des lumières : TORCHES (la grotte explorée), CRISTAUX
     (minerais et améthyste à pleine lumière), MAGMA (la lave déborde), NOIR COMPLET (tes phares). La salle du moment choisit l'ambiance (grtBiomes). */
  grotte:{nm:'LES PROFONDEURS',base:'grotte',m:{matin:{bio:'grt-matin-mine',mt:'TORCHES',pr:'SUIS LES TORCHES'},midi:{bio:'grt-midi-mine',mt:'CRISTAUX',pr:'LES CRISTAUX T ECLAIRENT'},
    soir:{bio:'grt-soir-mine',mt:'MAGMA',pr:'LA LAVE MONTE'},nuit:{bio:'grt-nuit-mine',mt:'NOIR COMPLET',nuit:1,p:.8,pr:'TES PHARES, TA SEULE LUMIERE'},
    glace:{bio:'grt-glace-mine',mt:'GLACE',pr:'LA GROTTE A GELE'}}}, /* (2026-10-26, Sacha : « une nouvelle météo pour la grotte : la grotte glacée, inspirée de la grotte intérieure de Fight Club ») */
  ...(CANYON_OK?{canyon:{nm:'CANYON DES GÉANTS',base:'canyon',m:{matin:{bio:'canyonMatin'},soir:{bio:'canyonSoir'},nuit:{bio:'canyonNuit',nuit:1}, // (2026-10-14, Sacha) LE CANYON DES GÉANTS : les six météos du désert
    pluie:{bio:'canyonPluie',pluie:.6,sheen:.18},orage:{bio:'canyonOrage',pluie:.9,orage:1,sheen:.2}}}}:{}),
  /* (2026-10-18, Sacha : « fais les dunes d'or de manière parfaite ») LES DUNES D'OR : le matin rose, le midi turquoise et or (les mirages), le SOIR (la carte postale :
     un peu plus souvent), la nuit d'argent, le VENT DE SABLE (pas une goutte : `pluie` reste 0), la TEMPÊTE DE SABLE (un orage sec). Voir genDunes, buildDunes. */
  ...(DUNES_OK?{dunes:{nm:"LES DUNES D'OR",base:'dunes',m:{matin:{bio:'dunesMatin'},soir:{bio:'dunesSoir',p:1.3},nuit:{bio:'dunesNuit',nuit:1,pr:'LA LUNE ARGENTE LE SABLE'},
    pluie:{bio:'dunesVent',mt:'VENT DE SABLE',sheen:.14,pr:'LE VENT SE LEVE'}}}}:{})
};
/* (2026-10-16, Sacha : « la map ville, elle sera toujours la nuit […] on abandonne toutes les maps ville-jour ») — ancienne règle, levée le 2026-10-31 : la
   nuit de la ville (voir VTEINTES) reste l'ORAGE, intouchable, mais un seul temps de JOUR revient avec la fusion de Crypto City (voir « LA VILLE EST
   FUSIONNÉE » plus haut). Les TEINTES (`teintes` : sfTire en tire une à chaque fois) restent celles de la nuit. */
/* ==========================================================================
   (2026-10-14, passe graphismes · agent planetes) LES PLANÈTES DE L'ORBITE — Sacha : « on peut mettre différentes planètes du système
   solaire à la place de la Terre ». DÉMONSTRATION : MARS sur la variante MIDI d'EN ORBITE ; matin, soir et satellites gardent la Terre.
   Le MÊME globe, le MÊME shader (globeJourNuit2) : seuls changent le CONTENU de la toile 1024×512 (repeinte UNE fois, au portail —
   newTrack → lvlChoisir → lvlAstre —, jamais en course), la teinte multiplicative du globe et la couleur du limbe. Rien en plus au dessin.
   Interrupteur : `PLANETES_ON=false` → le jeu redevient exactement celui d'avant (Terre partout, aucune repeinte).
   ========================================================================== */
const PLANETES_ON=true;
const PLANETES={ // teinte = multiplicateur du globe (le grade final rallume : on rentre sombre) · atmo = coquille du limbe · limbe = halo (au repos) · peint = la peinture de la toile
  terre:{teinte:0x55708c,atmo:0x8fd4ff,limbe:0x6fc0ff,rim:1}}; // (teinte : sombre exprès, le grade final rallume — mesuré à l'image : 0x8c7a6e lavait Mars en saumon, 0x6e5f56 le tenait rouille)
/* (2026-10-24, Sacha : « au lieu de Mars et Jupiter, remets juste la Terre ») plus de variante Mars (midi) ni Jupiter (soir) : l'orbite a toujours la Terre. */
{SF_CARTES.nuages.m.matin.bio='nuagesMatinCC';SF_CARTES.nuages.m.midi.bio='nuagesMidiCC';}
/* (2026-10-15 soir, Sacha : « le ciel est toujours assez mal géré, les couleurs en plein jour sont mal gérées ») LE CIEL DES NUAGES SANS BANDE ORANGE.
   Depuis LA MAP SANS HAUT NI BAS, le dôme est replié (uSym) et la caméra roule avec la route : l'horizon PÊCHE de la bible (jHor .95,.80,.64 à midi,
   1,.74,.52 le matin), saturé par l'étalonnage jusqu'à #f8b571 (MESURÉ), devenait une bande orange qui barrait le ciel — en travers, en diagonale,
   à la verticale quand la dalle se couche. À midi le lointain est une BRUME DE CIEL (bleu très pâle) ; le matin, une crème à peine dorée. Les
   copies de course seulement (le menu garde matin/midi). */
{Object.assign(BIOMES.nuagesMidiCC,{jHor:[.80,.88,.98],jSol:[.80,.88,.98],fogCj:[.90,.92,.96]});Object.assign(BIOMES.nuagesMatinCC,{jHor:[.97,.91,.84],jSol:[.97,.91,.84],fogCj:[.98,.90,.82]});} // (bible · nuagesjour) la course prend les copies, le menu garde matin/midi
