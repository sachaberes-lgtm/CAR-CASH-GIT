/* ===== LES BRIQUES PROPRES (2026-11-07, LA GÉNÉRATION DES ROUTES, PROPRE — Sacha : « plein de petits virages et de petites douilles ; rends ça super propre,
   super clean, un joli modèle ; réfléchis à des genres de maps ») =====
   Les gestes communs à tous les générateurs, pour que PERSONNE ne dessine un petit virage (passation/GENERATION-ROUTES.md) :
   · briqueRecadre(dDeg, dette) — le recadrage du cap NE DESSINE RIEN sous 8° (le cap n'a pas à être tenu au degré), garde une DETTE de 8 à 26° reportée sur le
     prochain vrai virage (briqueDette : il tourne un peu plus ou un peu moins), et au-delà rend un vrai virage à dessiner. Remplace les petits arcs de recentre,
     jCap, gAxe, cap, recadre… (trois cordes de quelques mètres : LA douille) ;
   · briqueSouffle(rnd, vP, genre) — le souffle entre deux temps forts : une DROITE FRANCHE de 1,8 à 4 s de croisière (sept fois sur dix) ou un BALAYAGE de 30-60°
     à 5 rP ou plus (la courbe au pouce). Plus jamais des S de 8-20° ;
   · phraser(rnd, L, vP, genre) — LA PHRASE DE RYTHME : la map est planifiée en SECONDES avant d'être dessinée — OUVERTURE, puis des cycles MONTÉE (2-3 virages
     lisibles) → TEMPS FORT (un module) → SOUFFLE, un CLIMAX (le module unique de la map, après un souffle plus long) entre 50 et 75 % de la route, la FIN. À haut
     palier les cycles gardent leurs secondes (moins de temps forts par km, chacun plus long) ;
   · phraseGenre(rnd) — les trois GENRES tirés à chaque map (« les genres de maps ») : VITESSE (deux grands virages par montée, souffles longs, balayages),
     TECHNIQUE (trois virages serrés enchaînés, souffles courts), SPECTACLE (le climax plus tôt, les souffles avant chaque figure).
   Tout est en mètres de dessin : le générateur passe SON vP (m/s, à son échelle) et SON rP. `?gen=ancien` : rien de tout ça. */
const BRIQUE={angMin:26,recadreMin:8,balayageRP:6.5,souffle:[1.8,4],balayage:[30,60]}; /* balayageRP 6,5 : nettement au-dessus des 5 rP où la fiche cesse de voir une douille */
const PHRASE_GENRES={ /* montee : [nb mini, nb maxi] de virages par montée · a : [°, °] · Rk : rayons (× rP) · ench : part des montées enchaînées (pas de droite entre deux virages) · souffle : [s, s] · bal : part des souffles en balayage · climax : [part, part] de la route */
  VITESSE:  {montee:[2,2],a:[45,105],Rk:[2.4,3.4],ench:.3,souffle:[2.2,3.4],bal:.5,climax:[.6,.75]},
  TECHNIQUE:{montee:[3,3],a:[50,120],Rk:[1.7,2.7],ench:.7,souffle:[1.6,2.4],bal:.15,climax:[.55,.7]},
  SPECTACLE:{montee:[2,3],a:[45,110],Rk:[2,3],  ench:.5,souffle:[1.8,3],bal:.3,climax:[.5,.62]},
  ORBITE:   {montee:[1,2],a:[40,85], Rk:[2.6,3.8],ench:.2,souffle:[2.6,4.4],bal:.55,climax:[.55,.7]}}; /* (2026-11-12, L'ORBITE VERS L'AVANT) le genre de l'orbite : un ou deux GRANDS virages par montée, des souffles longs (la ligne qu'on contemple), un balayage une fois sur deux — jamais tiré par phraseGenre, imposé par genCtrl (ESP_V3) */
function briqueRecadre(dDeg,dette){const d=dDeg+(dette||0),a=Math.abs(d);if(a<BRIQUE.recadreMin)return {dessine:0,dette:0};if(a<BRIQUE.angMin)return {dessine:0,dette:d};return {dessine:d,dette:0};}
function briqueDette(aDeg,dette){if(!dette)return aDeg;const s=aDeg<0?-1:1;let a=Math.abs(aDeg)+dette*s;if(a<BRIQUE.angMin)a=BRIQUE.angMin;return a*s;}
function briqueSouffle(rnd,vP,g){const G=g||PHRASE_GENRES.SPECTACLE,s=G.souffle[0]+rnd()*(G.souffle[1]-G.souffle[0]);
  if(rnd()<G.bal)return {bal:1,a:BRIQUE.balayage[0]+rnd()*(BRIQUE.balayage[1]-BRIQUE.balayage[0]),s:s,L:s*vP};return {bal:0,s:s,L:s*vP};}
function phraseGenre(rnd){const u=rnd();return u<.34?'VITESSE':u<.67?'TECHNIQUE':'SPECTACLE';}
/* la phrase : un PHRASEUR qui décide du prochain temps d'après la position RÉELLE du dessin (les modules font rarement les 5 s prévues) — `suivant(pos)` rend
   {t:'ouverture'|'montee'|'fort'|'souffle'|'climax'|'fin', L (m), n (virages), ench, bal, a, s} ou null quand la route est pleine · o : {ouverture:[s,s], fortS (s par module), fin (m), climax:false} */
function phraser(rnd,L,vP,genre,o){o=o||{};const G=o.G||PHRASE_GENRES[genre]||PHRASE_GENRES.SPECTACLE, /* o.G : (2026-11-12) un genre retouché par la map (les nuages : des montées plus courtes, plus amples) */fortS=o.fortS||5,finL=o.fin!=null?o.fin:2.2*vP;
  const cx=o.climax===false?-1:(G.climax[0]+rnd()*(G.climax[1]-G.climax[0]))*L,ouv=o.ouverture||[2,3];
  const PH={genre:genre,G:G,L:L,cx:cx,slots:[],etat:'ouverture',climaxFait:false,n:0};
  PH.suivant=function(pos){let sl=null;const place=L-finL-pos;
    if(PH.etat==='fini')return null;
    if(PH.etat==='ouverture'){const l=(ouv[0]+rnd()*(ouv[1]-ouv[0]))*vP;sl={t:'ouverture',L:l,s:l/vP};PH.etat='montee';}
    else if(PH.etat==='fin'){sl={t:'fin',L:finL};PH.etat='fini';}
    else if(PH.etat==='climax'){sl={t:'climax',L:fortS*1.4*vP};PH.climaxFait=true;PH.etat='souffle';}
    else if(!PH.climaxFait&&cx>=0&&PH.etat!=='ouverture'&&(pos>=cx||place<(o.climaxS?o.climaxS+(PH.etat==='fort'?(o.margeFort||12):9):fortS*2.8)*vP)){ /* (2026-11-11, LA TORSION EN MODULES) o.climaxS : la VRAIE durée du climax (s) — le surf et le couloir durent 10-12 s, pas les 7 prévues : ils débordaient sur la fin tenue à l'endroit de pisteTord et restaient à plat. Le climax part dès qu'il ne resterait plus sa durée + un temps (9 s : une montée ; o.margeFort, 12 s : un temps fort) */ /* le climax, à TOUT état (un module plus long que ses 5 s prévues faisait basculer la phrase en fin sans lui) : après un souffle (état montee) tout de suite, sinon le souffle (long) qui l'annonce */
      if(PH.etat==='montee'){sl={t:'climax',L:fortS*1.4*vP};PH.climaxFait=true;PH.etat='souffle';}
      else{const s9=briqueSouffle(rnd,vP,G);if(place>fortS*4*vP){s9.L*=1.3;s9.s*=1.3;}s9.t='souffle';s9.avantClimax=1;sl=s9;PH.etat='climax';}}
    else if(place<fortS*vP*.8){PH.etat='fin';return PH.suivant(pos);}
    else if(PH.etat==='montee'){const nv=G.montee[0]+Math.floor(rnd()*(G.montee[1]-G.montee[0]+1));sl={t:'montee',n:nv,ench:rnd()<G.ench,L:nv*2.6*vP};PH.etat='fort';}
    else if(PH.etat==='fort'){if(place<fortS*vP*1.6){PH.etat='fin';return PH.suivant(pos);}sl={t:'fort',L:fortS*vP};PH.etat='souffle';}
    else if(PH.etat==='souffle'){sl=briqueSouffle(rnd,vP,G);sl.t='souffle';PH.etat='montee';}
    if(++PH.n>80){PH.etat='fini';}
    if(sl){sl.pos=Math.round(pos);PH.slots.push(sl);}return sl;};
  return PH;}
