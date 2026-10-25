/* ================= LES PORTES DU GRAPHE AUDIO (optimisation 2026-09-29, session SON) =================
   MESURÉ (banc isolé : le bloc AUDIO extrait seul dans une page vierge, rendu hors ligne 20 s, 3 passes alternées, médiane) : au MENU,
   le graphe prenait 3,5 % d'un cœur du PC — pour du SILENCE. Un nœud WebAudio branché calcule même à gain nul : le moteur (2 oscillateurs
   à table d'onde, sub, souffle, chuffs, bruit rose, boîte, pont, frein moteur, ronron, sifflet, saturation, 4 filtres), le vent, le
   sifflement d'air, le crissement, les 4 couches de la nitro, la sirène… tournaient tout le temps. Portes fermées : 0,47 % ; salle de
   la console débranchée en plus (sfx.js) : 0,14 %. 25 fois moins — un téléphone, c'est 3 à 5 fois ce PC : ça comptait double là-bas.
   LE PRINCIPE : WebAudio TIRE le calcul depuis la sortie — une chaîne débranchée de la sortie ne calcule plus RIEN en amont. Chaque
   chaîne a une PORTE sur son gain de sortie :
   · elle S'OUVRE À LA CONSIGNE, dans l'appel setTargetAtTime lui-même, AVANT que la rampe ne parte : zéro image de retard (se rebrancher
     à l'image suivante faisait repartir le son à 18 % de son niveau — un tic à chaque nitro) ;
   · elle se FERME quand la consigne est à zéro ET que la décroissance est finie : 7 constantes de temps après la chute (−60 dB), jamais
     avant — couper une queue de 0,2 s à mi-course, c'est un clic.
   ⚠ La porte lit la CONSIGNE (`_cib`, posée à chaque setTargetAtTime) et non la valeur courante : un nœud débranché ne fait plus avancer
   sa valeur, elle resterait figée — on ne se rebrancherait jamais. ⚠ Tout écrivain de ces gains passe par setTargetAtTime (vérifié :
   `stt` et les coupures du menu) ; un `.value=` ou une rampe n'ouvriraient PAS la porte. */
/* (2026-10-14, session SON, audit oreille-neuve §7) LA PLUIE S'ENTEND. Le rideau `PLUIE` (VILLE, MINUIT EN VILLE, L'ORAGE, la pluie du JOUER, la bruine de Paris)
   se voyait sans rien dire : une incohérence. Une seule boucle de bruit rose, SYNTHÉTISÉE (aucun fichier) : passe-haut 1,4 kHz → passe-bas 7,5 kHz (le crépitement
   d'une pluie sur la tôle, sans le grave qui est celui du moteur et du vent). `pluieG` est bâti UNE fois dans initAudio, comme `windG`/`whG`, et passe par `porte()` :
   débranché de MASTER tant que sa consigne est nulle (coût zéro hors pluie). `PLUIE_SON=false` = comme avant. PLUIE_NIV est le gain pour LVL.pluie = 1 : le bruit
   rose normalisé et filtré 1,4-7,5 kHz sort à −21 dB RMS avant gain (MESURÉ hors ligne, mêmes filtres) ; .055 → ≈ −46 dBFS RMS, à 17 dB sous le moteur seul (−29)
   et 10 sous le vent à 300 km/h (−56) : on l'entend quand rien ne couvre, jamais en premier. (Le .0075 de l'audit ne donnait que −64 dBFS : inaudible.) */
const PLUIE_SON=true,PLUIE_NIV=.035; // (2026-10-14, session SON) .055 → .035 (−4 dB, ≈ −50 dBFS) : prudence — un souffle aigu de ce genre, au-dessus de la musique, a déjà été retiré par Léo (« LE SON PARASITE DU DÉPART DES NUAGES », 08/10) ; on l'entend sans qu'il passe devant
let pluieG=null;
const PORTES=[];
function porteOuvre(P){if(P.on)return;try{P.g.connect(P.d);}catch(e){}P.on=true;}
function porteMarque(prm,P){prm._P=P;if(prm._pm)return;prm._pm=1;prm._cib=prm.value;prm._fin=0;const o=AudioParam.prototype.setTargetAtTime;
  prm.setTargetAtTime=function(v,t,tc){
    if(v>1e-4){if(this._P)porteOuvre(this._P);}
    else if(this._cib>1e-4)this._fin=t+7*tc; // la chute commence : la porte attendra qu'elle soit finie
    this._cib=v;return o.call(this,v,t,tc);};}
function porte(g,d,lfo){ // g : le gain de sortie de la chaîne · d : où il se branche · lfo : une modulation qui s'AJOUTE à ce gain (ronron, flutter)
  if(!g||!d)return null;const P={g:g,d:d,lfo:lfo||null,on:true};porteMarque(g.gain,P);if(lfo)porteMarque(lfo.gain,P);PORTES.push(P);return P;}
function portesTick(){ // à chaque image, hors de la simulation (la porte doit aussi se fermer au menu) — ne fait que FERMER
  if(!AC||AC.state!=='running')return;const n=AC.currentTime;
  for(const P of PORTES){if(!P.on)continue;const a=P.g.gain,b=P.lfo&&P.lfo.gain;
    if(a._cib>1e-4||n<a._fin||(b&&(b._cib>1e-4||n<b._fin)))continue;
    try{P.g.disconnect(P.d);}catch(e){}P.on=false;}
}
// (2026-10-12, banc du son) `dbgVu()` : le niveau (dB RMS) de chaque chaîne continue à sa sortie (ordre des portes) et du MASTER — pour trouver
// QUI fait « le bruit » au lieu de deviner. Les analyseurs se posent au 1er appel (ils n'écoutent qu'en dérivation, rien n'est rebranché).
window.dbgVu=function(){if(!AC||!MASTER)return null;const N=['moteur','vent','sifflet','crisse','nitroGronde','nitroJet','nitroBas','nitroOsc','pluie','gomSouffle','gomGrain'];
  if(!dbgVu.A)dbgVu.A=[];while(dbgVu.A.length<PORTES.length){const a=AC.createAnalyser();a.fftSize=1024;try{PORTES[dbgVu.A.length].g.connect(a);}catch(e){}dbgVu.A.push(a);}
  if(!dbgVu.M){dbgVu.M=AC.createAnalyser();dbgVu.M.fftSize=1024;MASTER.connect(dbgVu.M);dbgVu.b=new Float32Array(1024);}
  const db=function(a){a.getFloatTimeDomainData(dbgVu.b);let q=0;for(const v of dbgVu.b)q+=v*v;return Math.round(10*Math.log10(q/1024+1e-12));};
  const o={total:db(dbgVu.M)};dbgVu.A.forEach(function(a,i){o[N[i]||('p'+i)]=db(a);});return o;};
/* <<<GOMME DOUCE>>> LE CRISSEMENT QUI CHUCHOTE (2026-10-16, session « Son des pneus trop agressif » — Sacha : « le son du crissement des
   pneus est désagréable et empêche de profiter de la musique ; change pour un truc moins agressif et plus ASMR »).
   L'ANCIEN (CRISSEMENT v2, `skidG`) : du bruit blanc dans deux bandes ÉTROITES (Q 8 et 10) qui montaient jusqu'à 1,5 et 2,3 kHz, brouté 9 à
   16 fois par seconde — un sifflement aigu posé pile où l'oreille est la plus sensible, là où chante la mélodie de la musique. Il reste
   INTACT pour le burn-out du garage (à Léo : `burnSon` l'écrit lui-même) et pour l'écoute : `?crisse=ancien` le rend en course.
   LE NOUVEAU, deux couches SANS AUCUNE résonance, calculées une fois au premier son (aucun fichier) :
   · LE SOUFFLE : bruit rose STÉRÉO (deux canaux indépendants : large, enveloppant, comme au casque d'une vidéo ASMR) → deux passe-hauts
     à 260 Hz (le grave est au moteur et à la musique) → deux passe-bas doux (−24 dB/oct.) qui s'ouvrent de ~1,3 à ~2 kHz avec la glisse et
     la vitesse, et une respiration lente (0,6 Hz) — le « chhhh » de la gomme qui glisse ;
   · LE GRAIN : un tapis de minuscules grains (le sable, le gravier fin sous la gomme), ~240 par seconde, chacun une rafale de 0,3 à 1 ms
     posée au hasard dans la stéréo → passe-bande large (1,8 kHz, Q .7) puis passe-bas 4 kHz : un grésillement doux, jamais un sifflement ;
     il ne vient que dans les vraies glisses (niveau × glisse²), plus dense et un peu plus clair avec la vitesse (`playbackRate`).
   L'ENVELOPPE : il monte en ~0,12 s et s'éteint en ~0,28 s — un soupir, pas un coup de frein. Même ZONE MORTE et même mesure que la
   fumée (`glisse9`). Deux PORTES (`porte`) : débranché hors glisse, coût nul. `GOM_NIV` = ses deux niveaux ; `dbgGomme()` = son état.
   MESURÉ (banc hors ligne, même scénario de glisse) : 5 à 6 dB sous l'ancien (sonie K), centre du spectre à ~1 kHz au lieu de 2,3 ; posé sur
   GLASSY PLUCKS, l'ancien montait la musique de +3 dB à 4 kHz et +7 dB à 8 kHz (le sifflement AU-DESSUS d'elle), lui de 0,3 dB au plus. */
const CRISSE_DOUX=!/[?&]crisse=ancien/.test(location.search);
const GOM_NIV={souffle:.11,grain:.4};
const GOM={ok:false,k:0,tc:.12,sG:null,gG:null,respG:null,lp1:null,lp2:null,gSrc:null,stt:null};
function gomBatit(ac,dest,o){
  const sr=ac.sampleRate,nS=Math.floor(sr*2.9),bS=ac.createBuffer(2,nS,sr);
  for(let c=0;c<2;c++){const ch=bS.getChannelData(c);let b0=0,b1=0,b2=0,m=0; // le rose de Paul Kellett (comme pinkBuf), un tirage par canal
    for(let i=0;i<nS;i++){const w=Math.random()*2-1;b0=.99765*b0+w*.0990460;b1=.96300*b1+w*.2965164;b2=.57000*b2+w*1.0526913;
      const v=b0+b1+b2+w*.1848;ch[i]=v;const a=Math.abs(v);if(a>m)m=a;}
    const d0=ch[0]/(m||1),d1=ch[nS-1]/(m||1);for(let i=0;i<nS;i++)ch[i]=ch[i]/(m||1)-(d0+(d1-d0)*i/nS);} // normalisé + boucle sans couture
  const nG=Math.floor(sr*3.3),bG=ac.createBuffer(2,nG,sr),L=bG.getChannelData(0),R=bG.getChannelData(1);
  let t=0,m=0;
  for(;;){t+=-Math.log(1-Math.random()*.999)/240;const i0=Math.floor(t*sr);if(i0>=nG)break; // des grains au hasard (Poisson), surtout doux, quelques-uns plus francs
    const n=Math.max(4,Math.floor(sr*(.0003+Math.random()*.0007))),a=.2+.8*Math.pow(Math.random(),2.5),p=Math.random()*Math.PI/2,aL=a*Math.cos(p),aR=a*Math.sin(p);
    for(let j=0;j<n;j++){const e=Math.exp(-4*j/n)*(Math.random()*2-1),i=(i0+j)%nG;L[i]+=aL*e;R[i]+=aR*e;}} // le modulo : la boucle tombe juste
  for(let i=0;i<nG;i++){const a=Math.max(Math.abs(L[i]),Math.abs(R[i]));if(a>m)m=a;}
  for(let i=0;i<nG;i++){L[i]/=m||1;R[i]/=m||1;}
  const sS=ac.createBufferSource();sS.buffer=bS;sS.loop=true;
  const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=260;hp.Q.value=.6;
  const hp2=ac.createBiquadFilter();hp2.type='highpass';hp2.frequency.value=260;hp2.Q.value=.6;
  const lp1=ac.createBiquadFilter();lp1.type='lowpass';lp1.frequency.value=1200;lp1.Q.value=.5;
  const lp2=ac.createBiquadFilter();lp2.type='lowpass';lp2.frequency.value=1500;lp2.Q.value=.5;
  const sG=ac.createGain();sG.gain.value=0;
  sS.connect(hp);hp.connect(hp2);hp2.connect(lp1);lp1.connect(lp2);lp2.connect(sG);sG.connect(dest);
  const resp=ac.createOscillator();resp.type='sine';resp.frequency.value=.6;
  const respG=ac.createGain();respG.gain.value=0;resp.connect(respG);respG.connect(sG.gain);
  const gS=ac.createBufferSource();gS.buffer=bG;gS.loop=true;
  const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1800;bp.Q.value=.7;
  const glp=ac.createBiquadFilter();glp.type='lowpass';glp.frequency.value=4000;glp.Q.value=.5;
  const gG=ac.createGain();gG.gain.value=0;
  gS.connect(bp);bp.connect(glp);glp.connect(gG);gG.connect(dest);
  sS.start();gS.start();resp.start();
  for(const q of [lp1.frequency,lp2.frequency])try{q.automationRate='k-rate';}catch(e){} // pilotés à chaque image, glissés lents : k-rate (voir initAudio)
  GOM.sG=sG;GOM.gG=gG;GOM.respG=respG;GOM.lp1=lp1;GOM.lp2=lp2;GOM.gSrc=gS;GOM.stt=o.stt;GOM.ok=true;
  if(o.porte){o.porte(sG,dest,respG);o.porte(gG,dest);}
}
function gomPas(drift,spd3,dk,T){ // à chaque image de course, à la place de l'ancien crissement — drift = glisse9 (0 hors glisse), spd3 = la vitesse ressentie
  if(!GOM.ok)return;const s=GOM.stt,v=Math.min(1,spd3/420);
  const k=drift>0?Math.min(1,drift)*(.55+.45*v)*dk:0,tc=GOM.tc=k>GOM.k?.12:k<GOM.k?.28:GOM.tc;GOM.k=k; // monte en soupir, s'éteint plus lentement (la constante tient jusqu'au silence : sinon la queue repartait à .12 une image après)
  s(GOM.sG.gain,k*GOM_NIV.souffle,T,tc);s(GOM.respG.gain,k*GOM_NIV.souffle*.22,T,tc);
  s(GOM.gG.gain,k*k*GOM_NIV.grain,T,tc);
  if(k>0){const f=950+drift*700+Math.min(900,spd3)*.6;s(GOM.lp1.frequency,f,T,.15);s(GOM.lp2.frequency,f*1.35,T,.15);
    s(GOM.gSrc.playbackRate,.8+.35*v+.15*drift,T,.25);}
}
window.dbgGomme=function(){const r=function(p,n){return p?+p.value.toFixed(n):null;};return {doux:CRISSE_DOUX,pret:GOM.ok,k:+GOM.k.toFixed(3),souffle:r(GOM.sG&&GOM.sG.gain,4),grain:r(GOM.gG&&GOM.gG.gain,4),passeBas:r(GOM.lp1&&GOM.lp1.frequency,0),grains:r(GOM.gSrc&&GOM.gSrc.playbackRate,2)};};
/* <<<FIN GOMME DOUCE>>> */
function initAudio(){
  AC=(function(){const C=window.AudioContext||window.webkitAudioContext;try{return new C({sampleRate:48000});}catch(e){return new C();}})(); /* (2026-10-25, Sacha/Léo : « sons très aigus chez lui, grésillements chez moi, même lien ») 48 kHz IMPOSÉS : le contexte prenait la cadence de la carte son de chaque ordinateur (44,1 · 48 · 96 kHz, Bluetooth 16-24 kHz) et tout le DSP tournait à une cadence différente d'une machine à l'autre ; le navigateur rééchantillonne vers la sortie. */
  if(!SND.sfx&&!(MUS_WA&&MUS_WA.on)&&!musGraphe())try{AC.suspend();}catch(e){} // le mute SON survit au redémarrage — (2026-10-14, session SON) sauf si la musique passe par WebAudio (MUS_WA) : suspendu, le contexte la rendait MUETTE au lancement (SON coupé, MUSIQUE allumée) ; musWaSon coupe alors les effets par l'entrée du limiteur
  // BUS MASTER : tout le WebAudio passe par compresseur + limiteur doux tanh — niveau perçu
  // stable, jamais de clip numérique, pas de fatigue d'oreille sur une longue session
  /* ⚠ DEUX NŒUDS LÀ OÙ IL N'Y EN AVAIT QU'UN, ET C'EST CE QUI REND LE CURSEUR « EFFETS » POSSIBLE.
     `MASTER` reste le point de branchement de TOUT le WebAudio (une quarantaine de `connect(MASTER)`
     n'ont pas bougé d'une ligne) mais il ne va plus au compresseur : il devient LE VOLUME DES
     EFFETS. `BUSOUT` prend sa place de sortie, et la musique s'y branche DIRECTEMENT — sans quoi
     baisser les effets baisserait aussi la bande-son, et les trois curseurs n'en feraient qu'un.
     ⚠ personne n'écrit `MASTER.gain` ailleurs (le ducking `dk` s'applique gain par gain, pas ici) :
     c'est ce qui permet de se l'approprier sans rien casser. Vérifié avant de le faire. */
  MASTER=AC.createGain();MASTER.gain.value=1; // le point de branchement de tout le WebAudio (le VOLUME DES EFFETS est en sortie : MASTER._vol)
  MASTER._vol=AC.createGain();MASTER._vol.gain.value=sfxVol(); /* (2026-09-28, console de son) ← LE VOLUME DES EFFETS, APRÈS le compresseur : devant lui, −6 dB au curseur ne baissaient les pics que de ~1,5 dB */
  BUSOUT=AC.createGain();                           // ← le vrai point de sortie commun
  const cmp=AC.createDynamicsCompressor();
  cmp.threshold.value=-16;cmp.knee.value=12;cmp.ratio.value=4;cmp.attack.value=.004;cmp.release.value=.16;
  const lim=AC.createWaveShaper();lim.curve=engCurve(1.3);lim.oversample='2x';
  MASTER.connect(BUSOUT);
  BUSOUT.connect(cmp);cmp.connect(lim);lim.connect(MASTER._vol);
  /* (débogage 2026-09-29) LE PLAFOND DE SORTIE : les voix décodées (directes) + un son de mort + l'explosion pouvaient dépasser 0 dBFS — écrêtage
     dur. Limiteur à −1 dBFS, transparent en dessous ; son rattrapage automatique (+0,57 dB, spec WebAudio) est compensé en entrée. */
  MASTER._lim=AC.createDynamicsCompressor();MASTER._lim.threshold.value=-1;MASTER._lim.knee.value=0;MASTER._lim.ratio.value=20;MASTER._lim.attack.value=.001;MASTER._lim.release.value=.1;
  {const e9=AC.createGain();e9.gain.value=.937;MASTER._vol.connect(e9);e9.connect(MASTER._lim);MASTER._limIn=e9;}MASTER._lim.connect(AC.destination);
  // (la bande-son ne passe plus par ce graphe : voir « LA MUSIQUE v4 »)
  if(MUS_WA.on)try{musWaBranche();}catch(e){} // (2026-10-14, session SON) …sauf là où MUS_WA l'y rebranche : ici, dans le geste qui crée le contexte, avant que le morceau ne s'entende
  if(!musWaTient()&&musGraphe())try{musWaSon();}catch(e){} // (15/10) Pouce bleu sans MUS_WA : SON coupé ferme l'entrée des effets, le contexte reste éveillé pour le morceau
  // MOTEUR v2 : 2 oscillateurs à onde harmonique (le timbre de la caisse) désaccordés de 7 cents
  // + sub sinus à f/2 (la poitrine) + souffle d'admission → SATURATION (grain) → filtre (brillance)
  osc=AC.createOscillator();osc2=AC.createOscillator();
  engMix=AC.createGain();engMix.gain.value=.5;
  const o2g=AC.createGain();o2g.gain.value=.6;
  osc.connect(engMix);osc2.connect(o2g);o2g.connect(engMix);
  engSub=AC.createOscillator();engSub.type='sine';engSub.frequency.value=25;
  engSubG=AC.createGain();engSub.connect(engSubG);engSubG.connect(engMix);
  const enz=AC.createBufferSource();enz.buffer=noiseBuf(2);enz.loop=true;
  engNzF=AC.createBiquadFilter();engNzF.type='bandpass';engNzF.frequency.value=800;engNzF.Q.value=.8;
  engNzG=AC.createGain();engNzG.gain.value=0;
  enz.connect(engNzF);engNzF.connect(engNzG);engNzG.connect(engMix);
  engShaper=AC.createWaveShaper();engShaper.oversample='none'; // (optimisation 2026-09-29) 2x → none : le moteur est filtré sous 2,8 kHz juste derrière — les replis d'aliasing tombent au-dessus, coupés ; ~1 % d'un cœur rendu
  /* ---- L'ÉTAGE DE CHARGE : c'est ICI que se joue « rauque à fond / rond en stabilisé » ----
     ⚠ ON NE CHANGE PAS LA COURBE DE SATURATION. La dureté d'un waveshaper dépend du NIVEAU
     qu'on lui envoie, pas de sa forme : pousser fort dedans écrête et fabrique des harmoniques
     impairs (= rauque), l'effleurer laisse le signal propre (= rond). Recalculer `curve` à
     chaque frame coûterait un Float32Array par frame ET produirait des sauts audibles ; un
     simple gain d'entrée donne la même chose, en continu et pour rien.
     ⚠ ET UN GAIN DE RATTRAPAGE DERRIÈRE. Sans lui, « plus de charge » voudrait surtout dire
     « plus fort », et on aurait juste un jeu qui hurle — le compresseur du MASTER écraserait
     tout et l'oreille fatiguerait en dix minutes. Le rattrapage compense l'essentiel du niveau
     pour que ce soit le TIMBRE qui change, pas le volume. */
  engPre=AC.createGain();engPre.gain.value=.6;
  engPost=AC.createGain();engPost.gain.value=1;
  /* ---- L'ÉGALISEUR ANTI-FATIGUE ----
     La fatigue auditive vit entre 2 et 4 kHz : c'est là que l'oreille est le plus sensible et
     c'est exactement la bande qu'un moteur saturé remplit. On y creuse un trou qui se REFERME
     quand on pousse (la hargne a le droit de piquer) et se CREUSE en stabilisé, là où le son
     doit se faire oublier. C'est le poste qui décide si on tient une heure de jeu. */
  engEq=AC.createBiquadFilter();engEq.type='peaking';engEq.frequency.value=2900;
  engEq.Q.value=1.1;engEq.gain.value=-5;
  /* ---- LE FORMANT DU CONDUIT : la GORGE de l'échappement ----
     ⚠ TROUVÉ EN ANALYSANT UN VRAI ENREGISTREMENT (échappement de WRX fourni par Sacha, FFT sur
     trois régimes). Tous les filtres du moteur suivaient la fréquence d'explosion — donc tout
     glissait ensemble avec le régime, et c'est précisément ce qui fait « synthé » plutôt que
     « tuyau ». Sur le vrai enregistrement, un pic de +4,1 dB à ~95 Hz reste PLANTÉ AU MÊME
     ENDROIT au ralenti, en charge et à mi-régime : c'est le conduit qui résonne, pas le moteur.
     Un corps résonant ne se déplace pas quand ce qui l'excite change de hauteur.
     Ce poste est FIXE par palier (posé dans engSetTier, jamais dans la boucle) et il donne à
     chaque moteur sa cavité : un pot de bicylindre résonne haut et court, un collecteur de V8
     bas et large, une tuyère de réacteur très bas et très flou. */
  engFmt=AC.createBiquadFilter();engFmt.type='peaking';engFmt.frequency.value=95;
  engFmt.Q.value=1.2;engFmt.gain.value=0;
  filt=AC.createBiquadFilter();filt.type='lowpass';filt.frequency.value=500;
  gainN=AC.createGain();gainN.gain.value=0;
  engMix.connect(engPre);engPre.connect(engShaper);engShaper.connect(engPost);
  engPost.connect(engEq);engEq.connect(engFmt);engFmt.connect(filt);filt.connect(gainN);gainN.connect(MASTER);
  /* ---- LES CHUFFS DE COMBUSTION : une bouffée PAR EXPLOSION ----
     ⚠ ce qui manque à un moteur de synthé, c'est le GRAIN : un vrai moteur n'émet pas un son
     continu, il émet une rafale d'explosions. On module donc un souffle par un train
     d'impulsions calé sur la fréquence d'explosion (`fF`) — même horloge que la fondamentale,
     donc jamais de battement parasite. C'est ce qui fait entendre les cylindres UN PAR UN en bas
     du compte-tours, et une texture dense en haut. */
  {const N=12,re=new Float32Array(N+1),im=new Float32Array(N+1);
   for(let k=1;k<=N;k++)im[k]=1/Math.pow(k,.35);           // train d'impulsions doux (pas un Dirac : ça claquerait)
   engTickO=AC.createOscillator();engTickO.setPeriodicWave(AC.createPeriodicWave(re,im));
   const tsrc=AC.createBufferSource();tsrc.buffer=pinkBuf(2);tsrc.loop=true;
   const tf=AC.createBiquadFilter();tf.type='bandpass';tf.frequency.value=1700;tf.Q.value=.7;
   engTickG=AC.createGain();engTickG.gain.value=0;
   tsrc.connect(tf);tf.connect(engTickG);engTickG.connect(engMix);
   engTickO.connect(engTickG.gain);                        // l'oscillateur MODULE le gain du souffle
   tsrc.start();engTickO.start();}
  /* ---- LE LIT DE BRUIT ROSE : la complexité de fond ----
     Toujours présent, très bas. Il ne s'entend pas tout seul ; il empêche le moteur de sonner
     comme un synthétiseur propre, ce qu'aucun objet mécanique n'est. */
  {const psrc=AC.createBufferSource();psrc.buffer=pinkBuf(3);psrc.loop=true;
   const pf=AC.createBiquadFilter();pf.type='lowpass';pf.frequency.value=2400;
   pinkG=AC.createGain();pinkG.gain.value=0;
   psrc.connect(pf);pf.connect(pinkG);pinkG.connect(engMix);psrc.start();}
  /* ---- LA TRANSMISSION ET LE PONT ----
     ⚠ LEUR HAUTEUR SUIT LA VITESSE DE LA VOITURE, PAS LE RÉGIME MOTEUR. C'est toute la
     différence : au passage de rapport le moteur RETOMBE alors que la boîte, elle, continue.
     Un sifflement qui redescendrait avec le moteur se confondrait avec lui et ne dirait rien.
     Deux voix : la boîte (aiguë, denture droite) et le pont (plus grave, plus sourd). */
  transO=AC.createOscillator();transO.type='triangle';transO.frequency.value=800;
  {const tf2=AC.createBiquadFilter();tf2.type='bandpass';tf2.frequency.value=2600;tf2.Q.value=2.2;
   transG=AC.createGain();transG.gain.value=0;
   transO.connect(tf2);tf2.connect(transG);transG.connect(gainN);transO.start();}
  diffO=AC.createOscillator();diffO.type='triangle';diffO.frequency.value=380;
  {const df=AC.createBiquadFilter();df.type='bandpass';df.frequency.value=900;df.Q.value=1.6;
   diffG=AC.createGain();diffG.gain.value=0;
   diffO.connect(df);df.connect(diffG);diffG.connect(gainN);diffO.start();}
  /* ---- LE FREIN MOTEUR : ce qu'on entend quand on LÂCHE ----
     Gaz coupés à haut régime, la combustion s'arrête mais la mécanique tourne encore : il reste
     une dépression d'admission et un échappement qui se vide. C'est creux, filtré, et ça
     DESCEND avec le régime. Sans cette couche, lâcher les gaz ne faisait que baisser le volume. */
  {const osrc=AC.createBufferSource();osrc.buffer=pinkBuf(2);osrc.loop=true;
   ovrF=AC.createBiquadFilter();ovrF.type='bandpass';ovrF.frequency.value=420;ovrF.Q.value=1.9;
   ovrG=AC.createGain();ovrG.gain.value=0;
   osrc.connect(ovrF);ovrF.connect(ovrG);ovrG.connect(gainN);osrc.start();}
  // RONRONNEMENT : LFO d'amplitude 8-15 Hz (la rugosité psychoacoustique que l'oreille adore),
  // profond au ralenti, qui s'efface dès qu'on monte dans les tours — le chat devient fauve
  engLfo=AC.createOscillator();engLfo.type='sine';engLfo.frequency.value=11;
  engLfoG=AC.createGain();engLfoG.gain.value=0;
  engLfo.connect(engLfoG);engLfoG.connect(gainN.gain);
  // sifflement d'onduleur/turbine (proto, fusées) : dent de scie très haute filtrée
  engWhine=AC.createOscillator();engWhine.type='sawtooth';engWhine.frequency.value=2000;
  const ewf=AC.createBiquadFilter();ewf.type='lowpass';ewf.frequency.value=9000;
  engWhineG=AC.createGain();engWhineG.gain.value=0;
  engWhine.connect(ewf);ewf.connect(engWhineG);engWhineG.connect(gainN);
  osc.start();osc2.start();engSub.start();enz.start();engLfo.start();engWhine.start();
  engSetTier(0); // on démarre toujours au timbre du moteur d'origine
  try{MV.build();}catch(e){} // (2026-10-22) LE MOTEUR VIVANT (?moteurvivant=1) : rien sans le drapeau
  // vent
  const wsrc=AC.createBufferSource();wsrc.buffer=noiseBuf(2);wsrc.loop=true;
  windF=AC.createBiquadFilter();windF.type='lowpass';windF.frequency.value=500;windF.Q.value=.2;
  windG=AC.createGain();windG.gain.value=0;
  wsrc.connect(windF);windF.connect(windG);windG.connect(MASTER);wsrc.start();
  // CRISSEMENT v2 : deux bandes résonantes non harmoniques (950/1480 Hz) + LFO de STICK-SLIP
  // qui fait brouter les fréquences — la gomme accroche-lâche, le crissement VIT au lieu de siffler
  const ssrc=AC.createBufferSource();ssrc.buffer=noiseBuf(1.3);ssrc.loop=true;
  skF1=AC.createBiquadFilter();skF1.type='bandpass';skF1.frequency.value=950;skF1.Q.value=8;
  skF2=AC.createBiquadFilter();skF2.type='bandpass';skF2.frequency.value=1480;skF2.Q.value=10;
  skidG=AC.createGain();skidG.gain.value=0;
  ssrc.connect(skF1);ssrc.connect(skF2);skF1.connect(skidG);skF2.connect(skidG);skidG.connect(MASTER);ssrc.start();
  skLfo=AC.createOscillator();skLfo.type='triangle';skLfo.frequency.value=12;
  skD1=AC.createGain();skD1.gain.value=0;skD2=AC.createGain();skD2.gain.value=0;
  skLfo.connect(skD1);skD1.connect(skF1.frequency);skLfo.connect(skD2);skD2.connect(skF2.frequency);skLfo.start();
  // SIFFLEMENT D'AIR : n'existe qu'aux vitesses folles (l'oreille sait qu'on va TRÈS vite)
  const wsrc2=AC.createBufferSource();wsrc2.buffer=noiseBuf(1.4);wsrc2.loop=true;
  whF=AC.createBiquadFilter();whF.type='bandpass';whF.frequency.value=2600;whF.Q.value=14;
  whG=AC.createGain();whG.gain.value=0;
  wsrc2.connect(whF);whF.connect(whG);whG.connect(MASTER);wsrc2.start();
  // LA PLUIE (voir PLUIE_SON) : bruit rose bouclé → passe-haut 1,4 kHz → passe-bas 7,5 kHz (Q .4) → gain mené par la boucle (LVL.pluie)
  {const rsrc=AC.createBufferSource();rsrc.buffer=pinkBuf(3);rsrc.loop=true;
   const rhp=AC.createBiquadFilter();rhp.type='highpass';rhp.frequency.value=1400;rhp.Q.value=.7;
   const rlp=AC.createBiquadFilter();rlp.type='lowpass';rlp.frequency.value=7500;rlp.Q.value=.4;
   pluieG=AC.createGain();pluieG.gain.value=0;
   rsrc.connect(rhp);rhp.connect(rlp);rlp.connect(pluieG);pluieG.connect(MASTER);rsrc.start();}
  // réacteur nitro : souffle + grondement grave + sifflement de turbine (3 couches)
  // + FILTRE EN PEIGNE sur le souffle : rebouclé fort AU SOL = la flamme qui rugit ;
  // en l'air le peigne s'ouvre et un LFO lent module le délai = le whoosh flangé du jet
  const jsrc=AC.createBufferSource();jsrc.buffer=noiseBuf(1.7);jsrc.loop=true;
  jetF=AC.createBiquadFilter();jetF.type='bandpass';jetF.frequency.value=900;jetF.Q.value=.8;
  jetG=AC.createGain();jetG.gain.value=0;
  const jPre=AC.createGain();jPre.gain.value=2.6; // on pousse le souffle fort dans la saturation…
  jetDist=AC.createWaveShaper();jetDist.curve=engCurve(3);jetDist.oversample='none'; /* (optimisation) du BRUIT saturé : l'aliasing y est du bruit, inaudible */ // …et le souffle devient FLAMME (grain de fusée)
  jsrc.connect(jetF);jetF.connect(jPre);
  const jcomb=AC.createDelay(.05);jcomb.delayTime.value=.0071;
  jcFb=AC.createGain();jcFb.gain.value=.12;
  jetF.connect(jcomb);jcomb.connect(jcFb);jcFb.connect(jcomb);jcomb.connect(jPre);
  jPre.connect(jetDist);jetDist.connect(jetG);
  const jcLfo=AC.createOscillator();jcLfo.type='sine';jcLfo.frequency.value=.4;
  jcDep=AC.createGain();jcDep.gain.value=.0002;
  jcLfo.connect(jcDep);jcDep.connect(jcomb.delayTime);jcLfo.start();
  jetG.connect(MASTER);jsrc.start();
  const j2=AC.createBufferSource();j2.buffer=noiseBuf(2.3);j2.loop=true;
  const jlf=AC.createBiquadFilter();jlf.type='lowpass';jlf.frequency.value=150;
  jetLowG=AC.createGain();jetLowG.gain.value=0;
  j2.connect(jlf);jlf.connect(jetLowG);jetLowG.connect(MASTER);j2.start();
  jetOsc=AC.createOscillator();jetOsc.type='sawtooth';jetOsc.frequency.value=1200;
  const jof=AC.createBiquadFilter();jof.type='bandpass';jof.frequency.value=2400;jof.Q.value=6;
  jetOscG=AC.createGain();jetOscG.gain.value=0;
  jetOsc.connect(jof);jof.connect(jetOscG);jetOscG.connect(MASTER);jetOsc.start();
  // LE CORPS DE LA FLAMME : bruit brown sous DOUBLE lowpass (pente raide, tout l'aigu meurt)
  // + flutter lent 5 Hz — le « fwooosh » rond, chaud, moelleux. C'est LUI la nitro, surtout en vol.
  const jr=AC.createBufferSource();jr.buffer=brownBuf(2.7);jr.loop=true;
  jrF=AC.createBiquadFilter();jrF.type='lowpass';jrF.frequency.value=300;jrF.Q.value=.4;
  const jrF2=AC.createBiquadFilter();jrF2.type='lowpass';jrF2.frequency.value=TEL_NATIF?1000:620;
  jrG=AC.createGain();jrG.gain.value=0;
  jr.connect(jrF);jrF.connect(jrF2);
  if(TEL_NATIF){const jrHp=AC.createBiquadFilter();jrHp.type='highpass';jrHp.frequency.value=120;jrF2.connect(jrHp);jrHp.connect(jrG);} // (2026-09-25) le haut-parleur d'un téléphone ne rend rien sous ~150 Hz : ce grave ne faisait que POMPER le compresseur — et appuyer sur NITRO rendait la caisse plus SOURDE
  else{const jrHp=AC.createBiquadFilter();jrHp.type='highpass';jrHp.frequency.value=85;jrF2.connect(jrHp);jrHp.connect(jrG);} // (2026-10-12, Léo : « au début de la partie, un bruit assourdissant ») MESURÉ : boost tenu dès le départ, ce grondement était la chaîne dominante et presque tout son poids sous 200 Hz — le sub (< 85 Hz) ne faisait qu'assourdir au casque et pomper le compresseur
  jrG.connect(MASTER);jr.start();
  const jrLfo=AC.createOscillator();jrLfo.type='sine';jrLfo.frequency.value=5.3;
  jrDep=AC.createGain();jrDep.gain.value=0;
  jrLfo.connect(jrDep);jrDep.connect(jrG.gain);jrLfo.start();
  try{if(RUG_SON)rugTampons(AC,MASTER,{tel:TEL_NATIF,stt:stt,porte:porte});}catch(e){console.warn('feu qui rugit',e);} // (2026-10-16) LE FEU QUI RUGIT : la gorge, le crépitement, la boule de feu, la pétarade — calculés en morceaux juste après (rugTampons)
  sonConsole(); // (2026-09-28) LA CONSOLE DE SON se branche sur ce contexte et ce MASTER
  try{porte(gainN,MASTER,engLfoG);porte(windG,MASTER);porte(whG,MASTER);porte(skidG,MASTER);porte(jrG,MASTER,jrDep);porte(jetG,MASTER);porte(jetLowG,MASTER);porte(jetOscG,MASTER);}catch(e){} // (optimisation) les PORTES du graphe
  try{porte(pluieG,MASTER);}catch(e){} // (2026-10-14) la pluie : débranchée de MASTER tant qu'il ne pleut pas (9e porte de dbgVu)
  try{gomBatit(AC,MASTER,{stt:stt,porte:porte});}catch(e){console.warn('gomme douce',e);} // (2026-10-16) LA GOMME DOUCE, le crissement qui chuchote (voir <<<GOMME DOUCE>>>) : ses deux portes sont la 10e et la 11e de dbgVu (bâtie même en `?crisse=ancien`, muette : l'ordre des portes ne bouge pas)
  /* (optimisation 2026-09-29) LES PARAMÈTRES PILOTÉS À CHAQUE IMAGE PASSENT EN k-rate. La boucle pose une consigne par image sur les
     fréquences du moteur, du vent, de la nitro : en a-rate (le défaut) un filtre biquad AUTOMATISÉ recalcule ses coefficients à CHAQUE
     ÉCHANTILLON (sinus, cosinus, racine — 48 000 fois par seconde et par filtre), un oscillateur recalcule son pas de phase pareil.
     En k-rate : une fois par bloc de 128 échantillons (2,7 ms). Sur des glissés à constante de temps ≥ 50 ms, l'écart est sous le
     seuil d'audition ; la phase des oscillateurs reste continue (zéro clic). MESURÉ en course, automation réelle rejouée (une consigne
     par image et par paramètre, régime qui balaie) : 6,0 → 4,8 % d'un cœur. Vérifié À L'OREILLE DU CALCUL (même graine, spectre en
     tiers d'octave) : filtres en k-rate = écart NUL ; oscillateurs secondaires = écart sous celui d'un désaccord de 1 cent.
     ⚠ PAS `osc`/`osc2` (le TIMBRE de la caisse, à table d'onde) : en k-rate leur spectre moyen bougeait de 0,3 dB de plus qu'un
     désaccord inaudible — pour 0,2 % d'un cœur, le moteur reste au bit près. ⚠ PAS le crissement (skF1/skF2) : un LFO de broutage les
     module à la fréquence audio, en k-rate il serait échantillonné. ⚠ PAS les gains : en k-rate un gain saute par paliers (effet
     « fermeture éclair ») — et le banc n'y gagnait rien. */
  for(const q of [filt.frequency,engNzF.frequency,ovrF.frequency,engEq.gain,windF.frequency,whF.frequency,jrF.frequency,jetF.frequency,
    engSub.frequency,engLfo.frequency,transO.frequency,diffO.frequency,engTickO.frequency,engWhine.frequency,jetOsc.frequency,skLfo.frequency])
    try{if(q&&'automationRate' in q)q.automationRate='k-rate';}catch(e){}
}
function noiseBurst(dur,vol,freq){
  if(!sfxOk())return;
  try{
    const src=AC.createBufferSource();src.buffer=noiseBuf(dur);
    const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=freq;
    const g=AC.createGain();g.gain.setValueAtTime(vol,AC.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+dur);
    src.connect(f);f.connect(g);g.connect(MASTER);src.start();
  }catch(e){}
}
/* ---- LE CHANGEMENT DE MOTEUR : on ENTEND qu'on bricole (2026-08-03) ------------------------
   Un simple carillon disait « tu as gagné quelque chose » mais pas QUOI. Ici on raconte une scène :
   la CLÉ À CHOCS qui dévisse, deux CLANKS de tôle quand la pièce tombe en place, puis le moteur
   neuf qui DÉMARRE — un coup de lanceur suivi d'une montée en régime. C'est cette petite histoire
   en 1,2 s qui informe mieux qu'un son unique, aussi joli soit-il.
   ⚠ tout est branché sur MASTER (jamais sur AC.destination) et tout est procédural. */
function clank9(t,f,vol){ // tôle frappée : un partiel métallique inharmonique + son transitoire
  if(!sfxOk())return;
  try{
    const t0=AC.currentTime+t;
    for(let k=0;k<3;k++){
      const o=AC.createOscillator(),g=AC.createGain();
      o.type='square';o.frequency.setValueAtTime(f*(1+k*1.47),t0); // rapports NON entiers = métal, pas cloche
      g.gain.setValueAtTime(0,t0);
      g.gain.linearRampToValueAtTime(vol*(k?.22:.5),t0+.004);
      g.gain.exponentialRampToValueAtTime(.0008,t0+.16+k*.05);
      const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f*(1+k*1.47);bp.Q.value=6;
      o.connect(bp);bp.connect(g);g.connect(MASTER);o.start(t0);o.stop(t0+.3);
    }
  }catch(e){}
}
function visseuse9(t,dur){ // clé à chocs : une rafale de percussions serrées qui ralentit
  if(!sfxOk())return;
  try{
    let tt=t,pas=.028;
    while(tt<t+dur){clank9(tt,1400+Math.random()*500,.055);tt+=pas;pas*=1.06;} // elle décélère : c'est ça qui fait « outil »
  }catch(e){}
}
function engSwapSnd(){ // la scène complète du remplacement
  if(SONV2){sfx('moteur.palier',{vol:-10});return;} // (2026-10-12, Léo : « en début de partie, un vrai bruit, comme une trompette, un klaxon ») MESURÉ : le son le plus fort de la banque (+4 dB, 8 dB au-dessus d'une pièce), à CHAQUE nouveau moteur — plusieurs fois dans les 30 premières secondes. −10 dB
 // (console de son) la scène entière d'un seul tenant, calée sur la carte : visseuse, plongée, clanks, impact, démarreur, fanfare
  if(!sfxOk())return;
  try{
    visseuse9(0,.34);                       // on dévisse
    clank9(.40,520,.30);clank9(.50,340,.26); // la pièce tombe en place
    noiseBurst(.12,.10,900);
    // le démarreur, puis le moteur neuf qui monte en régime
    const t0=AC.currentTime+.62;
    const o=AC.createOscillator(),g=AC.createGain(),lp=AC.createBiquadFilter();
    o.type='sawtooth';lp.type='lowpass';
    o.frequency.setValueAtTime(52,t0);
    o.frequency.exponentialRampToValueAtTime(78,t0+.16);   // le lanceur peine
    o.frequency.exponentialRampToValueAtTime(240,t0+.55);  // ça part
    lp.frequency.setValueAtTime(420,t0);lp.frequency.exponentialRampToValueAtTime(2600,t0+.55);
    g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.16,t0+.05);
    g.gain.setValueAtTime(.16,t0+.42);g.gain.exponentialRampToValueAtTime(.001,t0+.72);
    o.connect(lp);lp.connect(g);g.connect(MASTER);o.start(t0);o.stop(t0+.75);
    engFan9(t0+.06);                        // et la fanfare, calée sur la RÉVÉLATION
  }catch(e){}
}
