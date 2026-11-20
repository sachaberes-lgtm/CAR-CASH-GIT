/* ===== CRYPTO CITY DE JOUR : LA MÊME VILLE, UN AUTRE SOLEIL (2026-11-19, Sacha : « non on la met aussi dans la version mobile il faut qu'elle soit au meme
   niveau que la map jour », puis « en fait il faut que ça soit la même map mais juste le soleil qui change ») =====
   Avant, le jour et la nuit de Crypto City étaient DEUX cartes réunies au tirage (SF_FUSION) : la nuit `ville` (le béton, les néons, les modules route-ville,
   les cadres de néon) et le jour `crypto` (un autre générateur de tracés — MODC 'crypto' —, d'autres tours — cryptoTour, cryptoMatTours —, ses pièces ₿, ses
   dirigeables, ses fusées, sa couronne d'horizon). Ce n'était pas la même ville, et le jour coûtait plus cher (+10 programmes, ~+16 % de triangles).
   Désormais le JOUR, ce sont trois MÉTÉOS de la carte de la nuit : `ville` × matin / midi / soir. Le niveau est celui de la nuit (SF_NIV.ville : même id,
   ni `crypto` ni `vitre`), donc MÊME route (même générateur, même graine), mêmes tours, mêmes géantes de verre, mêmes décors, mêmes scènes, mêmes modules.
   Ce qui change, et seulement ça : l'AMBIANCE (cjMatin / cjMidi / cjSoir : ciel, soleil, brume, hémisphère, étalonnage), pas de pluie ni d'orage (le temps
   de la nuit), la teinte néon de la nuit (violet / vert / jaune) laissée à la nuit, les façades en jour (CITY.uJ, déjà là : facades-jour du 14/10), le verre
   des géantes qui renvoie le vrai ciel (la branche de jour de villeVerreTick), la route sèche et polie qui renvoie le ciel, pas de lueur violette au pied
   des tours. Aucun programme, aucune texture, aucune géométrie de plus : des valeurs et des uniformes déjà compilés.
   L'ancienne carte `crypto` reste dans le code (`?carte=crypto`), hors du tirage (SF_HORS, niveaux.js), ses ambiances intactes.
   `?sans=cryptojour` = le jeu d'avant au bit près (rien de ce morceau ne s'exécute). */
const CJ={part:.5,fj:0}; /* la part du JOUR dans Crypto City (0 : jamais, .5 : autant que la nuit, comme l'ordinateur depuis le 25/10) */
const CJ_BIO={matin:'cjMatin',midi:'cjMidi',soir:'cjSoir'};
const CJ_ROUTE={cjMatin:{g:2.4,s:.5,j:.3,c:1.8,t:[.84,.86,1.04]},cjMidi:{g:2.4,s:.5,j:.3,c:1.8,t:[.86,.92,1.10]},cjSoir:{g:2.4,s:.5,j:.3,c:1.8,t:[.72,.76,1.08]}}; /* la dalle polie : uGlace (le ciel renvoyé en rasant), uSheen (la brillance
   d'horizon), t (la teinte du béton, ×) · j : le JOUR DES FAÇADES (CITY.uJ) — 1 = le verre de jour pur ; plus bas, les carreaux de la nuit (verre sombre, pièces
   allumées) reviennent en partie · c : le COURANT de la ville le jour (CITY.uC × c, voir plus bas) · t ramène le béton au soleil vers le gris bleuté (plus d'aplat
   sable à midi ni orange au matin) (passe 2, contrôle de la reprise) */
function cjPoids(){const V=SF_CARTES.ville.m,n=V.orage.p==null?1:V.orage.p,p=Math.max(0,Math.min(.98,CJ.part)),k=p/(1-p)*n/3.5; /* à .5 : 1 / 1,3 / 1,2, les poids du jour d'avant */
  V.matin.p=1*k;V.midi.p=1.3*k;V.soir.p=1.2*k;}
if(CRYPTO_JOUR){
  /* LES TROIS AMBIANCES : copies des ambiances FINIES du jour d'avant (toutes les passes d'étalonnage faites), puis la lumière du jour de la ville. Les
     originales (bullrun, cryptoMatin, cryptoSoir) ne bougent pas : `?carte=crypto` garde son image. */
  const cl=function(n,o){const b=JSON.parse(JSON.stringify(BIOMES[n]));return Object.assign(b,o);};
  /* MIDI · LE SOLEIL DUR : azur profond, verre bleu au sommet et or au pied, ombres bleues */
  BIOMES.cjMidi=cl('bullrun',{nm:'CRYPTO CITY · MIDI',
    jZen:[.02,.15,.68],jMid:[.20,.50,.93],jHor:[1,.84,.56],jSol:[1,.66,.26],
    fog:[.30,.37,.47],fogN:900,fogCj:[1,.84,.58],fogIn:[.80,.88,1],
    sunC:[1,.93,.76],sunI:1.6,hemiS:[.56,.72,1],hemiG:[.70,.50,.24],hemiI:.42,fillC:[.44,.70,.98],
    kickC:[1,.78,.36],kickI:.18,expo:.8,con:1.34,sat:1.34,sh:[-.004,.012,.05],hi:[.02,.01,-.02],bloomS:.3,vigK:.3,vigC:[.04,.06,.16],
    rtK:.84,rtT:[.86,.94,1.14],
    env:[[0,'#1a5ad0'],[.3,'#4a94ea'],[.48,'#f2d8a0'],[.58,'#ffc860'],[.66,'#a8884e'],[1,'#5e4c30']]});
  /* MATIN · LE SOLEIL BAS DORÉ : ciel bleu clair, horizon pêche et or, brume dorée (plus de lavande : refusée au 3e tour), ombres bleues */
  BIOMES.cjMatin=cl('cryptoMatin',{nm:'CRYPTO CITY · MATIN',
    jZen:[.12,.32,.72],jMid:[.50,.64,.92],jHor:[1,.70,.46],jSol:[1,.60,.30],
    fog:[.546,.448,.378],fogN:1300,fogCj:[1,.72,.46],fogIn:[.92,.84,.80],
    sunC:[1,.78,.50],sunI:1.7,hemiS:[.56,.66,1],hemiG:[.70,.46,.28],hemiI:.4,fillC:[.52,.64,1],
    kickC:[1,.64,.36],kickI:.22,expo:.8,con:1.38,sat:1.3,sh:[0,.006,.05],hi:[.02,.008,-.012],bloomS:.32,vigK:.3,vigC:[.06,.04,.16],
    rtK:.76,rtT:[.94,.90,1.10],
    env:[[0,'#2c50a8'],[.3,'#8aa0d8'],[.48,'#ffd0a0'],[.58,'#ffb070'],[.66,'#a07a5c'],[1,'#544038']]});
  /* SOIR · LE COUCHANT : zénith bleu nuit, bande orange et or, contre-jour orangé, ombres violettes */
  BIOMES.cjSoir=cl('cryptoSoir',{nm:'CRYPTO CITY · SOIR',
    jZen:[.08,.10,.34],jMid:[.48,.26,.46],jHor:[1,.52,.18],jSol:[1,.40,.10],
    fog:[.35,.21,.252],fogN:1100,fogCj:[1,.50,.24],fogIn:[.80,.52,.46],
    sunC:[1,.60,.30],sunI:1.7,hemiS:[.40,.36,.74],hemiG:[.74,.40,.18],hemiI:.4,fillC:[.50,.40,.80],
    kickC:[1,.48,.24],kickI:.24,expo:.84,con:1.28,sat:1.1,bloomS:.34,vigK:.3,vigC:[.10,.03,.14],
    env:[[0,'#221a62'],[.3,'#94448a'],[.48,'#ff944a'],[.58,'#ffbe60'],[.66,'#a0604a'],[1,'#4a3044']]});
  /* LA BRUME DE L'HEURE PLUS SOMBRE QUE LE CIEL (passe 2, contrôle de la reprise : « toutes les tours lointaines sont des blocs unis sans fenêtres ») : la couleur
     de la brume est aussi celle où se noie le pied des tours (villePied : sur 280 m, quelle que soit la distance) — claire comme le ciel, elle effaçait les
     tours basses de l'horizon en aplats pâles. Midi ×0,5 (bleu profond), matin et soir ×0,7 : les tours lointaines se détachent en silhouettes avec leurs
     fenêtres, le ciel garde sa lumière (planches reprise2-*). Les essais sur la DISTANCE de la brume (×2, ×3, sans brume) ne changeaient rien. */
  /* LE TIRAGE : trois météos de plus pour la carte de la nuit — sans pluie ni orage, la route et sa brillance du jour d'avant */
  for(const m in CJ_BIO)SF_CARTES.ville.m[m]={bio:CJ_BIO[m],pluie:0,orage:0,route:.30,sheen:.16,cj:1,p:1};
  cjPoids();
  /* LE LIEN `?carte=ville` sans météo garde la NUIT (comme avant) : le jour se demande par `&meteo=matin|midi|soir` */
  const sfi0=sfImpose;sfImpose=function(prev){const f=SF.force;if(f&&f.carte==='ville'&&!f.meteo)f.meteo='orage';return sfi0(prev);};
  /* LE NIVEAU : celui de la nuit ; ni la teinte néon de la nuit (elle repeindrait le ciel du jour), ni sa pluie. bioBase : villeRose() lit le jour */
  const sfn0=sfNiveau;sfNiveau=function(c,m,te){const M=SF_CARTES[c]&&SF_CARTES[c].m[m];if(!M||!M.cj)return sfn0(c,m,te);
    const o=sfn0(c,m,null);o.bio=[M.bio];o.bioBase=M.bio;delete o.teinte;return o;};
  /* LE VERRE DES GÉANTES renvoie le vrai ciel : la branche de jour de villeVerreTick (écrite pour l'ancien jour, LVL.cur.crypto), le temps d'un appel */
  const vvt0=villeVerreTick;villeVerreTick=function(dt){const c=LVL.cur;if(!(c&&c.cj&&!c.crypto))return vvt0(dt);c.crypto=1;try{return vvt0(dt);}finally{delete c.crypto;}};
  /* LA ROUTE SÈCHE ET POLIE : le béton renvoie le ciel de l'heure en rasant (uGlace, uSheen : deux uniformes du béton, branche déjà compilée), la teinte
     du béton de jour (ROUTE_JOUR, comme les autres maps de jour) ; pas de lueur violette au pied des tours (CITY.uPied : la nuit seulement) */
  const rt0=routeTick;routeTick=function(){rt0();const c=LVL.cur,r=c&&c.cj?CJ_ROUTE[c.bio[0]]:null;
    if(!r){if(CJ.fj){CITY.uJf=null;CJ.fj=0;}return;} /* hors du jour : les façades reprennent leur calcul (villeApres) */
    CITY.uPied.value=0;CITY.uJf=r.j*skyU.uJour.value;CJ.fj=1;const k=(1-Math.min(1,LVL.nuit||0))*(1-Math.min(1,LVL.pluie||0));if(k<=0)return;
    ROAD_U.uGlace.value=Math.max(ROAD_U.uGlace.value,r.g*k*GLACE.k);ROAD_U.uSheen.value=Math.max(ROAD_U.uSheen.value,r.s*k);
    const j=k*skyU.uJour.value,t=r.t;ROAD_U.uTeinte.value.setRGB((1+(ROUTE_JOUR[0]-1)*j)*t[0],(1+(ROUTE_JOUR[1]-1)*j)*t[1],(1+(ROUTE_JOUR[2]-1)*j)*t[2]);};
  /* LA VILLE ALLUMÉE EN PLEIN JOUR (passe 2, contrôle de la reprise : « les tours lointaines sont des blocs unis sans fenêtres ») : le COURANT de la ville
     (CITY.uC, 1 = allumée, posé par villeApres à chaque image) passe au-dessus de 1 le jour — fenêtres, liserés des toits, bandes LED et enseignes néon
     plus forts, pour se lire sur un fond clair comme la nuit sur un fond noir. Un uniforme déjà compilé : aucun programme de plus. */
  const va0=villeApres;villeApres=function(){va0();const c=LVL.cur,r=c&&c.cj?CJ_ROUTE[c.bio[0]]:null;if(r&&r.c!=null)CITY.uC.value*=1+(r.c-1)*skyU.uJour.value;};
}
window.dbgCryptoJour=function(o){ /* (banc) {part} : la part du jour · {bio:{…}} : retouche à chaud de l'ambiance courante · {route:{g,s}} */
  if(o&&CRYPTO_JOUR){if(o.part!=null){CJ.part=+o.part;cjPoids();}if(o.route&&CJ_ROUTE[BIO.name])Object.assign(CJ_ROUTE[BIO.name],JSON.parse(JSON.stringify(o.route)));
    if(o.bio&&BIOMES[BIO.name]){Object.assign(BIOMES[BIO.name],JSON.parse(JSON.stringify(o.bio)));bioLerp(BIOMES[BIO.name],BIOMES[BIO.name],1,BIO.cur);bioApply(BIO.cur);}
    try{routeTick();}catch(e){}}
  const V=SF_CARTES.ville.m,c=LVL.cur;
  return {on:CRYPTO_JOUR,part:CJ.part,poids:Object.keys(V).map(function(k){return k+' '+(V[k].p==null?1:+(+V[k].p).toFixed(3));}).join(', '),hors:SF_HORS.crypto,
    jour:!!(c&&c.cj),bio:BIO.name,uJ:+CITY.uJ.value.toFixed(3),pied:CITY.uPied.value,glace:+ROAD_U.uGlace.value.toFixed(3),sheen:+ROAD_U.uSheen.value.toFixed(3)};};
