
/* ===== LES INTERRUPTEURS DE LA PASSE PERF MOBILE A4 (2026-10-25, passe perf mobile : « chaque levier a son ?mobi_<nom>=0 ») =====
   MOBI_ACTIF('nom',défaut) : `?mobi_nom=0` éteint, `?mobi_nom=1` allume, sinon la valeur par défaut du levier (allumé quand il ne change rien à l'image).
   Les leviers CSS (h3, h3b, h2) sont lus de la même façon dans la tête de la page et posés en classes sur <html>. */
function MOBI_ACTIF(nom,defaut){const m=location.search.match(new RegExp('[?&]mobi_'+nom+'=([01])\\b'));return m?m[1]==='1':defaut;}
const MOBI_NR=MOBI_ACTIF('nr',true),   /* H4 : plus d'écriture --nr/--nx sur #tNitro quand l'éclair pixel dessine sa jauge */
      MOBI_DOM=MOBI_ACTIF('dom',true), /* H10 : rien vers les panneaux masqués sur tactile */
      MOBI_CASH=MOBI_ACTIF('cash',true), /* H11 : le compteur d'argent ne se formate que quand le dollar change */
      MOBI_CRAN=MOBI_ACTIF('cran',false), /* H5 : --p des plaques de pouvoir au centième (change l'image de moins d'un pixel) */
      MOBI_SON=MOBI_ACTIF('son',true), /* A4 : consignes audio par image espacées (bourdon de dérive à 0 une fois, tonalité de la musique mémorisée par source) : même son */
      MOBI_NINF=MOBI_ACTIF('ninf',false); /* H1 : les bords de la nitro infinie se repeignent moins souvent */
