/* ===== LE RÉGIME CHAUD — MOBH_ (2026-10-25, passe perf mobile A6 : « alléger les effets décoratifs quand le téléphone est chaud ») =====
   MESURÉ (iPhone 13 Pro, dans l'app, niveau 9) : après 3 à 5 minutes de jeu le téléphone s'effondre de 55 à 8-13 i/s, calage sur 30 compris. Le gouverneur (mobChaud) sait QUAND
   le téléphone est chaud ; ce morceau lui donne de quoi ALLÉGER le travail par image. Seuls des effets d'AFFICHAGE changent (traits de vent, feu de pixels de la nitro, redessin de
   l'éclair du bouton NITRO, cadence de la carte du moteur) : ni physique, ni collision, ni vitesse, ni gain d'argent, ni aura, ni chaîne, ni compteur.
   L'INTERRUPTEUR : `?mobh_chaud=1` l'active, `?mobh_chaud=0` le coupe (INACTIF PAR DÉFAUT : il change l'image, Sacha tranche après essai). Inactif ou téléphone froid :
   mobhChaud() est faux et chaque site retombe sur l'ancien chemin, ligne pour ligne. Seulement sur un vrai téléphone (TEL_NATIF, jamais IS_MOBILE).
   Les réglages sont tous ici : vent (nombre de traits ×, une image dessinée sur N), feu nitro (×), éclair NITRO (ms mini entre deux redessins), carte moteur (ms mini). */
const MOBH_ACTIF=(function(){const m=location.search.match(/[?&]mobh_chaud=([01])\b/);return m?m[1]==='1':false;})();
const MOBH_R={vent:.7,ventPas:2,ventCap:.14,feu:.6,nx3Ms:66,engMs:100};
function mobhChaud(){return TEL_NATIF&&MOBH_ACTIF&&mobChaud();} /* vrai : le téléphone est chaud ET l'essai est demandé */
let MOBH_ventN=0,MOBH_ventDt=0,MOBH_nx3T=0,MOBH_nx3D=-9;
function mobhVentSaute(dt){ /* vrai : cette image-ci, le vent ne se redessine pas (le calque garde l'image d'avant, aucun effacement) ; dt s'accumule pour la suivante */
  if(!mobhChaud()){MOBH_ventN=0;MOBH_ventDt=0;return false;}
  MOBH_ventDt+=dt;if((++MOBH_ventN)%MOBH_R.ventPas!==0)return true;
  return false;}
function mobhVentDt(){const d=MOBH_ventDt;MOBH_ventDt=0;return d;} /* le temps écoulé depuis le dernier dessin (le vent lisse la vitesse de la caméra avec lui) */
window.dbgMobh=function(){return {actif:MOBH_ACTIF,tel:!!TEL_NATIF,chaud:mobChaud(),regime:mobhChaud(),reglages:MOBH_R};};
