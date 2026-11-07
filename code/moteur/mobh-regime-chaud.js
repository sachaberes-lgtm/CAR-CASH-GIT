/* ===== LE RÉGIME CHAUD — MOBH_ (2026-10-25, passe perf mobile A6 : « alléger les effets décoratifs quand le téléphone est chaud ») =====
   MESURÉ (iPhone 13 Pro, dans l'app, niveau 9) : après 3 à 5 minutes de jeu le téléphone s'effondre de 55 à 8-13 i/s, calage sur 30 compris. Le gouverneur (mobChaud) sait QUAND
   le téléphone est chaud ; ce morceau lui donne de quoi ALLÉGER le travail par image. Seuls des effets d'AFFICHAGE changent (traits de vent, feu de pixels de la nitro, redessin de
   l'éclair du bouton NITRO, cadence de la carte du moteur) : ni physique, ni collision, ni vitesse, ni gain d'argent, ni aura, ni chaîne, ni compteur.
   L'INTERRUPTEUR : `?mobh_chaud=1` l'active, `?mobh_chaud=0` le coupe (ACTIF PAR DÉFAUT depuis le 07/11 à dose >= 100, voir plus bas ; il change l'image). Inactif ou téléphone froid :
   mobhChaud() est faux et chaque site retombe sur l'ancien chemin, ligne pour ligne. Seulement sur un vrai téléphone (TEL_NATIF, jamais le drapeau d'interface).
   Les réglages sont tous ici : vent (nombre de traits ×, une image dessinée sur N), feu nitro (×), éclair NITRO (ms mini entre deux redessins), carte moteur (ms mini). */
/* (2026-11-07, vitesse-fluide : « active par défaut le régime chaud à dose > 100 ») ACTIF PAR DÉFAUT à partir du palier 2 du gouverneur (dose >= MOBH_R.dose, ou état iOS >= 2) ; `?mobh_chaud=1` = chaud dès que le gouverneur dit chaud
   (donc dès le départ, le 30 étant calé d'office), `?mobh_chaud=0` = jamais, `?gouv=max` = jamais (comme avant). */
const MOBH_M=location.search.match(/[?&]mobh_chaud=([01])\b/),MOBH_ACTIF=MOBH_M?MOBH_M[1]==='1':true,MOBH_FORCE=!!MOBH_M&&MOBH_M[1]==='1';
const MOBH_R={dose:100,vent:.7,ventPas:2,ventCap:.14,feu:.6,nx3Ms:66,engMs:100};
function mobhChaud(){if(!TEL_NATIF||!MOBH_ACTIF)return false;if(MOBH_FORCE)return mobChaud();return MOB_PALS&&(MOB_S.thermo>=2||MOB_S.D>=MOBH_R.dose);} /* vrai : le téléphone est chaud ET l'essai est demandé */
let MOBH_ventN=0,MOBH_ventDt=0,MOBH_nx3T=0,MOBH_nx3D=-9;
function mobhVentSaute(dt){ /* vrai : cette image-ci, le vent ne se redessine pas (le calque garde l'image d'avant, aucun effacement) ; dt s'accumule pour la suivante */
  if(!mobhChaud()){MOBH_ventN=0;MOBH_ventDt=0;return false;}
  MOBH_ventDt+=dt;if((++MOBH_ventN)%MOBH_R.ventPas!==0)return true;
  return false;}
function mobhVentDt(){const d=MOBH_ventDt;MOBH_ventDt=0;return d;} /* le temps écoulé depuis le dernier dessin (le vent lisse la vitesse de la caméra avec lui) */
window.dbgMobh=function(){return {actif:MOBH_ACTIF,force:MOBH_FORCE,tel:!!TEL_NATIF,chaud:mobChaud(),regime:mobhChaud(),reglages:MOBH_R};};
