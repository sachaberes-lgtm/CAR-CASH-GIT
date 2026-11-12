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
const PLUIE_SON=false,PLUIE_NIV=.035; // (2026-10-14, session SON) .055 → .035 (−4 dB, ≈ −50 dBFS) : prudence — un souffle aigu de ce genre, au-dessus de la musique, a déjà été retiré par Léo (« LE SON PARASITE DU DÉPART DES NUAGES », 08/10) ; on l'entend sans qu'il passe devant
let pluieG=null;
/* ===== LA PLUIE v2 (2026-11-05, Sacha : « retravaille le bruit de la pluie, quelque chose de plus irrégulier et agréable à écouter ») =====
   L'ancienne boucle (3 s de bruit rose filtré) faisait un « tssss » plat, le même à chaque seconde. La pluie vraie n'est pas un bruit : c'est un lit doux
   (le fond mouillé, 0,7-3,6 kHz) sur lequel tombent des GOUTTES une par une, au hasard. Ici, un tampon STÉRÉO de 10 s synthétisé une fois (aucun fichier) :
   · des RAFALES lentes (somme de 4 sinus à nombre entier de cycles sur la boucle : couture invisible) qui font respirer le fond et la densité des gouttes
     (≈ 40 gouttes/s dans l'accalmie, ≈ 300 dans l'averse) ; · des gouttes en bruit de Poisson (intervalles exponentiels, jamais régulières) : un tic de bruit +
     un petit « plink » sinusoïdal qui monte en fréquence, beaucoup de faibles, peu de fortes, quelques GROSSES gouttes plus graves et plus longues (feuilles, gouttière) ;
     · chaque goutte à une position au hasard dans le champ stéréo, le fond décorrélé G/D : la pluie est AUTOUR de soi, pas dans le centre de la tête.
   Normalisé à −21 dB RMS comme l'ancien bruit : PLUIE_NIV et les calages du mixage (−46 dBFS, 17 dB sous le moteur) ne bougent pas. */
function pluieBuf(len){
  const sr=AC.sampleRate,n=Math.floor(sr*len),b=AC.createBuffer(2,n,sr),C=[b.getChannelData(0),b.getChannelData(1)],TP=Math.PI*2,rnd=Math.random;
  /* les rafales, calculées tous les 32 échantillons */
  const gu=[[1,2,.5],[3,3,.3],[6,4,.2],[11,5,.12]].map(function(q){return {c:q[0]+((rnd()*q[1])|0),p:rnd()*TP,a:q[2]};});
  const Gf=new Float32Array(Math.ceil(n/32)+1);
  for(let k=0;k<Gf.length;k++){let s=0;for(const q of gu)s+=q.a*Math.sin(TP*q.c*(k*32/n)+q.p);const g=Math.min(1,Math.max(0,.5+.55*s/1.12));Gf[k]=g*g*(3-2*g);}
  /* le fond : bruit blanc → passe-bande 0,7-3,6 kHz (deux passe-bas soustraits), décorrélé entre les deux oreilles, porté par la rafale */
  const ka=1-Math.exp(-TP*3600/sr),kb=1-Math.exp(-TP*700/sr);let e2=0;
  for(let ch=0;ch<2;ch++){const x=C[ch];let l1=0,l2=0;
    for(let i=-3000;i<n;i++){const w=rnd()*2-1;l1+=ka*(w-l1);l2+=kb*(w-l2);if(i>=0){const v=(l1-l2)*(.35+.65*Gf[i>>5]);x[i]=v;e2+=v*v;}}}
  const kf=.05/(Math.sqrt(e2/(2*n))||1);
  for(let ch=0;ch<2;ch++){const x=C[ch];for(let i=0;i<n;i++)x[i]*=kf;}
  /* les gouttes : processus de Poisson, taux suivant la rafale ; l'écriture revient au début de la boucle (queue qui déborde = couture invisible) */
  for(let t=0;t<len;){
    const i0=Math.min(n-1,Math.floor(t*sr)),g=Gf[i0>>5];
    t+=-Math.log(1-rnd())/(40+260*g*g);
    const gr=rnd()<.035,u=rnd(),a=gr?.28+.3*rnd():.025+.4*u*u*u,f=gr?560+rnd()*760:1500+rnd()*4300,tau=gr?.005+.006*rnd():.0011+.0022*rnd();
    const pa=rnd()*Math.PI/2,gL=Math.cos(pa),gR=Math.sin(pa),m=Math.min(n,Math.floor(tau*6*sr)),dk=Math.exp(-1/(tau*sr)),dt2=Math.exp(-1/(tau*.35*sr));
    let env=1,en2=1,ph=rnd()*TP;
    for(let j=0;j<m;j++){
      ph+=TP*f*(1-.4*env)/sr; /* le « plink » monte vers sa note */
      const v=a*(.55*env*Math.sin(ph)+.45*en2*(rnd()*2-1)),i=(i0+j)%n;
      C[0][i]+=v*gL;C[1][i]+=v*gR;env*=dk;en2*=dt2;}
  }
  /* −21 dB RMS comme l'ancien bruit ; un limiteur doux pour les rares gouttes qui crèteraient */
  let e3=0;for(let ch=0;ch<2;ch++){const x=C[ch];for(let i=0;i<n;i++)e3+=x[i]*x[i];}
  const kn=.089/(Math.sqrt(e3/(2*n))||1);
  for(let ch=0;ch<2;ch++){const x=C[ch];for(let i=0;i<n;i++)x[i]=Math.tanh(x[i]*kn*1.25)/1.25;}
  return b;
}
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
  try{sonGouverne();}catch(e){}
  if(!AC||AC.state!=='running')return;const n=AC.currentTime;
  for(const P of PORTES){if(!P.on)continue;const a=P.g.gain,b=P.lfo&&P.lfo.gain;
    if(a._cib>1e-4||n<a._fin||(b&&(b._cib>1e-4||n<b._fin)))continue;
    try{P.g.disconnect(P.d);}catch(e){}P.on=false;}
}
// (2026-10-12, banc du son) `dbgVu()` : le niveau (dB RMS) de chaque chaîne continue à sa sortie (ordre des portes) et du MASTER — pour trouver
// QUI fait « le bruit » au lieu de deviner. Les analyseurs se posent au 1er appel (ils n'écoutent qu'en dérivation, rien n'est rebranché).
window.dbgVu=function(){if(!AC||!MASTER)return null;const N=['moteur','vent','sifflet','crisse','nitroGronde','nitroJet','nitroBas','nitroOsc','pluie','gomSouffle','gomGrain','roulement','appui','rape'];
  if(!dbgVu.A)dbgVu.A=[];while(dbgVu.A.length<PORTES.length){const a=AC.createAnalyser();a.fftSize=1024;try{PORTES[dbgVu.A.length].g.connect(a);}catch(e){}dbgVu.A.push(a);}
  if(!dbgVu.M){dbgVu.M=AC.createAnalyser();dbgVu.M.fftSize=1024;MASTER.connect(dbgVu.M);dbgVu.b=new Float32Array(1024);}
  const db=function(a){a.getFloatTimeDomainData(dbgVu.b);let q=0;for(const v of dbgVu.b)q+=v*v;return Math.round(10*Math.log10(q/1024+1e-12));};
  /* (2026-11-10, refonte du son) + `effets` (après le bus : compresseur, épaule, curseur), `sortie` (après le limiteur : effets + musique, ce qu'on entend) et sa `crete` (dBFS) */
  if(!dbgVu.E&&MASTER._vol&&MASTER._lim){dbgVu.E=AC.createAnalyser();dbgVu.E.fftSize=1024;MASTER._vol.connect(dbgVu.E);dbgVu.S=AC.createAnalyser();dbgVu.S.fftSize=1024;MASTER._lim.connect(dbgVu.S);}
  const o={total:db(dbgVu.M)};if(dbgVu.E){o.effets=db(dbgVu.E);o.sortie=db(dbgVu.S);let m9=0;for(const v of dbgVu.b){const a9=v<0?-v:v;if(a9>m9)m9=a9;}o.crete=Math.round(200*Math.log10(m9+1e-9))/10;}
  dbgVu.A.forEach(function(a,i){o[N[i]||('p'+i)]=db(a);});return o;};
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
/* ===== LA GOMME QUI CHANTE (2026-11-11, Sacha : « le son des virages est vraiment pas agréable aux oreilles, on dirait du vent ») =====
   LE SOUFFLE ci-dessus était du bruit rose filtré : sans hauteur, sans rythme, avec une respiration lente — la définition même du vent.
   Un pneu qui glisse n'est pas un bruit : c'est la gomme qui ACCROCHE et LÂCHE des centaines de fois par seconde, donc une NOTE, grave,
   qui tremble. La couche « souffle » garde sa place, sa porte et son enveloppe, mais sa boucle n'est plus du bruit (`gomChant`) :
   · deux voix par oreille (420 Hz et sa quinte à peine fausse, l'oreille droite 1,3 % plus haut : large sans chorus), chacune une onde
     ronde (7 harmoniques qui s'éteignent vite : pas de scie, pas de sifflet) ;
   · la hauteur de chaque voix DÉRIVE toute seule (±3,5 %, un nouveau cap toutes les 60 à 180 ms) : la gomme ne tient jamais sa note ;
   · un BROUTAGE de 24 à 38 fois par seconde (le volume qui bat, 38 %) : le « rrr » du caoutchouc, ce qui la sépare d'un sifflet.
   En course la note MONTE avec la glisse et la vitesse (`playbackRate` .85 → 1,35 : 360 → 570 Hz, loin des 950-2 300 Hz de l'ancien
   crissement) et les mêmes passe-bas doux la gardent ronde. Plus de respiration lente. Le GRAIN (le gravier) reste, un peu plus bas.
   `?crisse=souffle` rend le souffle du 16/10 pour comparer · `?crisse=ancien` le tout premier crissement · `dbgGomme().mode`. */
const CRISSE_DOUX=!/[?&]crisse=ancien/.test(location.search);
const GOM_SOUFFLE=/[?&]crisse=souffle/.test(location.search);
/* ===== LA GOMME GRAVE (2026-11-11 soir, Sacha : « le son des virages est horrible, il fait mal aux oreilles ») =====
   MESURÉ (outils/banc-son/mixage.mjs, la gomme seule) : la gomme qui chante tenait une note presque pure entre 490 et 560 Hz et sa quinte vers 720-830 Hz — 99 % de son énergie
   dans le médium, le registre d'une sirène —, elle ondulait sans arrêt, et elle sonnait dès qu'un virage chargeait un peu (même en ligne droite quand la caisse corrige).
   Désormais : (1) UN VIRAGE ORDINAIRE NE CHANTE PLUS — la gomme ne vient que dans les vraies glisses (drift, flaque, travers) ; le virage se sent par le ROULEMENT qui gonfle (la régie) ;
   (2) la note descend d'UNE OCTAVE (210 Hz et sa quinte : 180 à 285 Hz en course), ses harmoniques s'éteignent plus vite, son broutage passe de 38 à 15 % ; (3) le passe-bas ne
   s'ouvre plus au-delà de 900 Hz et le grain de gravier baisse de 8 dB. `?crisse=chant` : la gomme qui chante du matin (v1457), pour comparer. */
const GOM_AIGU=/[?&]crisse=chant/.test(location.search);
const GOM_NIV=GOM_SOUFFLE?{souffle:.11,grain:.4}:{souffle:.032,grain:.3};
const GOM={ok:false,k:0,tc:.12,sG:null,gG:null,respG:null,lp1:null,lp2:null,gSrc:null,sSrc:null,stt:null};
function gomChant(ch,n,sr,dec){ /* un canal de la boucle : la note de la gomme (dec = le désaccord de cette oreille) */
  const NT=2048,tb=new Float32Array(NT+1);
  for(let i=0;i<=NT;i++){let v=0;const ex=GOM_AIGU?1.6:2.3;for(let h=1;h<=7;h++)v+=Math.sin(6.2831853*h*i/NT)/Math.pow(h,ex)*(h%2?1:.6);tb[i]=v;}
  const nx=Math.floor(sr*.08),N=n+nx,tmp=new Float32Array(N),V=GOM_AIGU?[{f:420*dec,a:1},{f:629*dec,a:.5}]:[{f:210*dec,a:1},{f:314.5*dec,a:.42}],amD=GOM_AIGU?.38:.15;
  for(const o of V){let p=Math.random()*NT,w=0,wc=0,wn=0,j=0,cp=Math.random(),cf=30,cc=30;
    for(let i=0;i<N;i++){
      if(--wn<=0){wc=(Math.random()*2-1)*.035;cc=24+Math.random()*14;wn=Math.floor(sr*(.06+Math.random()*.12));} /* un nouveau cap de hauteur et de broutage */
      w+=(wc-w)*(18/sr);cf+=(cc-cf)*(10/sr);j+=((Math.random()*2-1)*.02-j)*.03;
      p+=o.f*(1+w+j)*NT/sr;if(p>=NT)p-=NT;
      cp+=cf/sr;if(cp>=1)cp-=1;
      const i0=p|0;
      tmp[i]+=o.a*(tb[i0]+(tb[i0+1]-tb[i0])*(p-i0))*(1-amD+amD*Math.cos(6.2831853*cp));}}
  let m=0;
  for(let i=0;i<n;i++){let v=tmp[i];if(i<nx){const q=1.5707963*i/nx;v=v*Math.sin(q)+tmp[n+i]*Math.cos(q);} /* la fin fondue dans le début : boucle sans couture */
    ch[i]=v;const a=v<0?-v:v;if(a>m)m=a;}
  for(let i=0;i<n;i++)ch[i]/=m||1;
}
function gomBatit(ac,dest,o){
  const sr=ac.sampleRate,nS=Math.floor(sr*2.9),bS=ac.createBuffer(2,nS,sr);
  for(let c=0;c<2;c++){const ch=bS.getChannelData(c);if(!GOM_SOUFFLE){gomChant(ch,nS,sr,c?1.013:1);continue;}let b0=0,b1=0,b2=0,m=0; // le rose de Paul Kellett (comme pinkBuf), un tirage par canal
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
  const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=GOM_SOUFFLE?260:190;hp.Q.value=.6;
  const hp2=ac.createBiquadFilter();hp2.type='highpass';hp2.frequency.value=GOM_SOUFFLE?260:190;hp2.Q.value=.6;
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
  GOM.sG=sG;GOM.gG=gG;GOM.respG=respG;GOM.lp1=lp1;GOM.lp2=lp2;GOM.gSrc=gS;GOM.sSrc=sS;GOM.stt=o.stt;GOM.ok=true;
  if(o.porte){o.porte(sG,dest,respG);o.porte(gG,dest);}
}
function gomPas(drift,spd3,dk,T){ // à chaque image de course, à la place de l'ancien crissement — drift = glisse9 (0 hors glisse), spd3 = la vitesse ressentie
  if(!GOM.ok)return;const s=GOM.stt,v=Math.min(1,spd3/420);
  const k=drift>0?Math.min(1,drift)*(.55+.45*v)*dk:0,tc=GOM.tc=k>GOM.k?.12:k<GOM.k?.28:GOM.tc;GOM.k=k; // monte en soupir, s'éteint plus lentement (la constante tient jusqu'au silence : sinon la queue repartait à .12 une image après)
  s(GOM.sG.gain,k*GOM_NIV.souffle,T,tc);if(GOM_SOUFFLE)s(GOM.respG.gain,k*GOM_NIV.souffle*.22,T,tc);
  s(GOM.gG.gain,k*k*GOM_NIV.grain*(GOM_AIGU||GOM_SOUFFLE?1:.4),T,tc);
  if(k>0){const f=GOM_AIGU||GOM_SOUFFLE?950+drift*700+Math.min(900,spd3)*.6:Math.min(900,520+drift*230+Math.min(900,spd3)*.2);s(GOM.lp1.frequency,f,T,.15);s(GOM.lp2.frequency,f*1.35,T,.15);
    s(GOM.gSrc.playbackRate,.8+.35*v+.15*drift,T,.25);
    if(!GOM_SOUFFLE)s(GOM.sSrc.playbackRate,.85+.32*Math.min(1,drift)+.18*v,T,.18);} /* la note monte avec la glisse et la vitesse */
}
window.dbgGomme=function(){const r=function(p,n){return p?+p.value.toFixed(n):null;};return {doux:CRISSE_DOUX,mode:!CRISSE_DOUX?'ancien':GOM_SOUFFLE?'souffle':'chant',pret:GOM.ok,note:r(GOM.sSrc&&GOM.sSrc.playbackRate,2),k:+GOM.k.toFixed(3),souffle:r(GOM.sG&&GOM.sG.gain,4),grain:r(GOM.gG&&GOM.gG.gain,4),passeBas:r(GOM.lp1&&GOM.lp1.frequency,0),grains:r(GOM.gSrc&&GOM.gSrc.playbackRate,2)};};
/* <<<FIN GOMME DOUCE>>> */
/* ===== LE SON QUI NE REDÉMARRE PAS (2026-10-28, boîte noire de l'appli de Léo : trois « Failed to start the audio device ») =====
   Sur iPhone, `resume()` d'un contexte audio REFUSE (promesse rejetée) quand iOS ne rend pas encore la sortie : retour d'arrière-plan sans geste
   (visibilitychange), appel ou Siri pas finis, appli pas tout à fait au premier plan. Une dizaine d'appels le lançaient sans écouter le refus : la
   promesse partait rejetée (notée dans la boîte noire) et rien ne disait qu'il fallait réessayer. `acReveil(A)` : le même réveil, partout ; il
   rend une promesse qui ne rejette JAMAIS (vrai = le son tourne) ; un refus est compté et le PROCHAIN TOUCHER réessaie (un geste : iOS rend la
   sortie), une fois, sans rallumer un contexte que le jeu a endormi exprès entre-temps (pause, SON coupé, onglet caché). `dbgAudio` : `.reveil`. */
/* ================= LE NOYAU DU SON (2026-11-10, refonte — Sacha : « on a plein de problèmes différents en fonction des ordis. Des fois, ça fait des
   sons stridents. Des fois, le son lag […] une refonte totale du système de son ») =================
   Ce qui faisait qu'un même lien ne sonnait pas pareil d'une machine à l'autre, et ce qui change :
   1. LA LATENCE. Le contexte était demandé en latence MINIMALE (`interactive` : un tampon de 3 à 10 ms selon la carte son). Sur une machine lente ou chargée,
      le fil audio ne finit pas son bloc à temps : le navigateur saute le bloc — un craquement, puis le son « traîne ». Une machine saine garde la latence minimale ; une machine que le gouverneur (3) a vue
      DÉCROCHER part, à la session suivante et pendant 7 jours, avec le GRAND tampon du navigateur (`playback` ; MESURÉ sur Chrome Mac : 21 ms au lieu de 5, inaudible
      sous un doigt). Le téléphone garde `interactive` (iOS choisit seul). `?latence=min` = toujours le petit · `?latence=sure` = toujours le grand.
   2. LE BUS DOUX. Tous les effets passaient par compresseur (−16 dB, 4:1) → tanh(1,3·x) : la tanh n'a pas de zone droite, elle fabrique des harmoniques impaires
      et de l'intermodulation sur TOUT, même un son faible — moteur + vent + pièces + nitro ensemble devenaient aigres (et le repliement du 2x s'entendait en
      grésillement). Désormais : compresseur plus souple (−18 dB, 3:1, 6 ms / 200 ms) → une ÉPAULE (`sonEpaule`) : une droite jusqu'à 70 % de la pleine échelle
      (aucune harmonique en dessous), puis un arrondi vers 1. MESURÉ (rendu hors ligne, sinus 440 Hz) : même gain qu'avant sur les petits signaux (+8,2 dB), ±0,4 dB
      jusqu'à −12 dBFS d'entrée ; les crêtes sortent 1 dB plus haut (elles ne sont plus écrasées) et le limiteur de sortie les tient. `?mix=ancien` = l'ancien bus.
   3. LE GOUVERNEUR (`sonGouverne`, appelé à chaque image). L'horloge audio n'avance QUE des blocs réellement rendus : quand le fil audio décroche, elle prend du
      retard sur l'horloge de la page, et ce retard ne se rattrape jamais. On le relève toutes les 2 s : +25 ms = un DÉCROCHAGE. Au 2e décrochage en 30 s, la
      charge descend d'un cran (`window.__ccSonCharge`) : cran 1 = le lecteur de sons plafonne ses voix plus bas et la salle (la réverbe) se débranche ; cran 2 =
      la musique de course passe en fichiers pré-rendus au prochain départ (comme sur téléphone) et la machine est notée lente pour la prochaine session.
      Tout est dit dans la boîte noire (`__ccNote('son', …)`) et dans `dbgAudio().gouv` / `dbgSonGouv()`. `?songouv=0` = jamais.
   4. LES SIFFLETS. Le sifflement d'air (Q 14 entre 2,7 et 4,2 kHz), le gémissement de turbine (dent de scie jusqu'à 9 kHz), la denture de boîte (2,6 kHz) et le
      spool du nitro (dent de scie dans un passe-bande Q 7 jusqu'à 6,8 kHz) vivaient pile dans la bande où l'oreille est la plus sensible. Adoucis (`SON_DOUX`) :
      `?sondoux=0` rend les anciens. */
const SON_MIX_ANCIEN=/[?&]mix=ancien\b/.test(location.search),SON_DOUX=!/[?&]sondoux=0\b/.test(location.search),SON_GOUV_ON=!/[?&]songouv=0\b/.test(location.search);
function sonLatence(){
  const lent=sonLent();
  const q=location.search;
  if(/[?&]latence=min\b/.test(q))return 'interactive';
  if(/[?&]latence=sure\b/.test(q))return 'playback';
  if(typeof TEL_NATIF!=='undefined'&&TEL_NATIF)return 'interactive';
  return lent?'playback':'interactive';}
function sonLent(){try{const v=+localStorage.getItem('cc_son_lent')||0;return v>0&&Date.now()-v<7*864e5;}catch(e){return false;}} /* une machine vue lente le reste 7 jours, puis on réessaie */
function sonEpaule(g,kn){ /* une droite de pente g jusqu'à la sortie kn, puis un arrondi (tanh) vers 1 : aucune harmonique tant que le signal reste sous kn */
  const n=4097,c=new Float32Array(n);
  for(let i=0;i<n;i++){const x=i/(n-1)*2-1,a=Math.abs(x)*g;c[i]=(x<0?-1:1)*(a<=kn?a:kn+(1-kn)*Math.tanh((a-kn)/(1-kn)));}
  return c;}
const SON_CHAUD=typeof TEL_NATIF!=='undefined'&&TEL_NATIF&&!/[?&]sonchaud=0\b/.test(location.search);
const SON_GOUV={chaud:0,t0:0,a0:0,base:0,decro:0,dern:[],cran:0,retard:0,lent:false,vu:0,tr:0};
window.__ccSonCharge=0;
function sonGouverne(){
  if(!SON_GOUV_ON||!AC)return;
  const G9=SON_GOUV,now=performance.now();
  if(AC.state!=='running'||document.hidden||(typeof paused!=='undefined'&&paused)){G9.t0=0;return;}
  /* (2026-11-12, ios-ultime, Sacha : « son haché en course ») LE TÉLÉPHONE CHAUD : build 67, canyon — état thermique 2 toute la session, processeur bridé (12-20 i/s, image déjà au plancher),
     et le fil audio (tampon de 3 ms imposé par iOS) a sauté près d'une demi-seconde deux fois de suite. Le gouverneur n'allégeait qu'APRÈS deux décrochages entendus : sur l'app, la chaleur
     annonce le décrochage — état 2 (serious) = cran 1 d'office (la salle débranchée, 11 voix), état 3 (critical) = cran 2 (8 voix). Rendu dès que le téléphone refroidit. `?sonchaud=0` = comme avant. */
  if(SON_CHAUD){let th9=0;try{if(MOB_S.capteur)th9=MOB_S.thermo>=3?2:MOB_S.thermo>=2?1:0;}catch(e){}
    if(th9!==G9.chaud){G9.chaud=th9;window.__ccSonCharge=Math.max(G9.cran,th9);try{window.__ccNote('son','téléphone '+(th9?'chaud':'refroidi')+' : charge du son au cran '+window.__ccSonCharge);}catch(e){}}}
  if(!G9.t0||now-G9.vu>700||now-G9.t0>60000){G9.t0=now;G9.a0=AC.currentTime;G9.base=1e9;G9.vu=now;G9.tr=now;return;} /* nouveau repère : au réveil, après un gel de la page (> 0,7 s sans image), et chaque minute (les deux horloges dérivent de quelques ms par minute) */
  G9.vu=now;
  const ret=(now-G9.t0)-(AC.currentTime-G9.a0)*1000; /* ms de son NON rendues depuis le repère : l'horloge audio saute d'un tampon à la fois (elle tremble d'un tampon), mais un bloc sauté ne se rattrape jamais */
  if(ret<G9.base)G9.base=ret;
  if(now-G9.t0<3000)return; /* le plancher se pose pendant les 3 premières secondes d'un repère : une sortie qui démarre (Bluetooth, premier geste) peut mettre plus d'une demi-seconde à rendre ses premiers blocs — ce n'est pas un décrochage */
  if(now-G9.tr<500)return;G9.tr=now; /* puis on compare deux fois par seconde */
  const seuil=25+1500*(AC.baseLatency||.01),d=ret-G9.base;
  if(d>seuil&&d<3000){G9.base=ret;G9.decro++;G9.retard+=d;G9.dern.push(now);while(G9.dern.length&&now-G9.dern[0]>30000)G9.dern.shift();
    if(G9.dern.length>=2&&G9.cran<2){G9.cran++;G9.dern.length=0;window.__ccSonCharge=Math.max(G9.cran,G9.chaud|0);
      try{window.__ccNote('son','décrochage audio : charge au cran '+G9.cran+' · '+Math.round(d)+' ms · latence '+Math.round((AC.baseLatency||0)*1000)+' ms · '+AC.sampleRate+' Hz');}catch(e){}
      if(G9.cran>=2){G9.lent=true;try{localStorage.setItem('cc_son_lent',String(Date.now()));}catch(e){}}}}
}
window.dbgSonGouv=function(){const G9=SON_GOUV;return {actif:SON_GOUV_ON,decrochages:G9.decro,retardMs:Math.round(G9.retard),cran:G9.cran,lente:G9.lent||sonLent(),
  latenceMs:AC?Math.round(((AC.baseLatency||0)+(AC.outputLatency||0))*1000):null,cadence:AC?AC.sampleRate:null,mix:SON_MIX_ANCIEN?'ancien':'doux',doux:SON_DOUX};};
window.dbgSonLent=function(v){try{if(v)localStorage.setItem('cc_son_lent',String(Date.now()));else localStorage.removeItem('cc_son_lent');}catch(e){}return v?'la prochaine session part en latence sûre':'oubliée';};
const AC_REV={rates:0,essais:0,dern:'',arme:false};
function acVeut(A){ /* ce contexte doit-il tourner maintenant ? (le jeu peut l'avoir endormi exprès depuis le refus) */
  if(!A||A.state==='running'||A.state==='closed'||document.hidden)return false;
  if(A===AC)return !paused&&(SND.sfx||musGraphe());
  return true;}
function acReveil(A){
  A=A||AC;if(!A||A.state==='running'||A.state==='closed')return Promise.resolve(!!A&&A.state==='running');
  if(A===AC&&!SND.sfx&&!SND.music&&!(typeof MUSAP!=='undefined'&&MUSAP.t>performance.now()))return Promise.resolve(false); /* (2026-11-07, chasse SON-N04) tout coupé : rien à réveiller (sauf l'extrait du curseur MUSIQUE) */
  let p=null;try{p=A.resume();}catch(e){p=Promise.reject(e);}
  if(!p||!p.then)return Promise.resolve(A.state==='running');
  return p.then(function(){return A.state==='running';},function(e){AC_REV.rates++;AC_REV.dern=String(e&&e.message||e).slice(0,80);acReessaie(A);return false;});}
window.__ccSonVeut=function(){return acVeut(AC);};window.__ccSonReveil=function(){return acReveil(AC);}; /* (2026-11-13, ios-ultime) pour LE VEILLEUR DU SON de natif.js : le jeu veut-il du son alors que son contexte dort ? */
function acReessaie(A){ /* au prochain toucher (touchend : le geste qu'iOS accepte pour le son ; pointerup pour l'ordinateur) */
  if(AC_REV.arme)return;AC_REV.arme=true;
  const f=function(){removeEventListener('touchend',f,true);removeEventListener('pointerup',f,true);AC_REV.arme=false;
    if(acVeut(A)){AC_REV.essais++;acReveil(A);}};
  addEventListener('touchend',f,true);addEventListener('pointerup',f,true);}
function initAudio(){
  AC=(function(){const C=window.AudioContext||window.webkitAudioContext;try{return new C({sampleRate:48000,latencyHint:sonLatence()});}catch(e){try{return new C({sampleRate:48000,latencyHint:'interactive'});}catch(e2){return new C();}}})(); /* (2026-11-10, refonte du son) la latence : voir LE NOYAU (sonLatence) */ /* (2026-10-25, Sacha/Léo : « sons très aigus chez lui, grésillements chez moi, même lien ») 48 kHz IMPOSÉS : le contexte prenait la cadence de la carte son de chaque ordinateur (44,1 · 48 · 96 kHz, Bluetooth 16-24 kHz) et tout le DSP tournait à une cadence différente d'une machine à l'autre ; le navigateur rééchantillonne vers la sortie. */
  if((!SND.sfx&&!SND.music)||(!SND.sfx&&!(MUS_WA&&MUS_WA.on)&&!musGraphe()))try{AC.suspend();}catch(e){} /* (2026-11-07, chasse SON-N04) SON et MUSIQUE coupés : il dort dès sa naissance, même avec Pouce bleu (musGraphe) */ // le mute SON survit au redémarrage — (2026-10-14, session SON) sauf si la musique passe par WebAudio (MUS_WA) : suspendu, le contexte la rendait MUETTE au lancement (SON coupé, MUSIQUE allumée) ; musWaSon coupe alors les effets par l'entrée du limiteur
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
  const lim=AC.createWaveShaper();lim.oversample='2x';
  if(SON_MIX_ANCIEN){cmp.threshold.value=-16;cmp.knee.value=12;cmp.ratio.value=4;cmp.attack.value=.004;cmp.release.value=.16;lim.curve=engCurve(1.3);}
  else{cmp.threshold.value=-18;cmp.knee.value=14;cmp.ratio.value=3;cmp.attack.value=.006;cmp.release.value=.2;lim.curve=sonEpaule(1.57,.7);} /* (2026-11-10, refonte du son) LE BUS DOUX : voir LE NOYAU */
  MASTER.connect(BUSOUT);
  /* (2026-11-11, LA RÉGIE — Sacha : « qu'il n'y ait aucun son qui fasse mal aux oreilles ») LE CREUX DE L'OREILLE : tous les effets passent par une cloche de −2,5 dB à 3,1 kHz (Q ,8),
     là où l'oreille est la plus sensible (le conduit auditif résonne entre 2,5 et 4 kHz) — une rafale de pièces, une pétarade, un impact y perdent leur pointe, pas leur clarté. `?regie=0` : sans. */
  if(REG_ON){const or9=AC.createBiquadFilter();or9.type='peaking';or9.frequency.value=3100;or9.Q.value=.8;or9.gain.value=-2.5;BUSOUT.connect(or9);or9.connect(cmp);}else BUSOUT.connect(cmp);
  cmp.connect(lim);lim.connect(MASTER._vol);
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
  engPost.connect(engEq);engEq.connect(engFmt);engFmt.connect(filt);filt.connect(gainN);
  /* (2026-11-10, Léo : « moteur moins fort ») LA SORTIE DU MOTEUR : un seul nœud, `engDose`, par lequel tout le moteur rejoint MASTER — son gain est le dosage de base (MIX_MOTEUR, musique.js).
     La porte du moteur (plus bas) branche gainN dessus ; le moteur moderne y glisse sa chaîne (moteur-buche.js). */
  engDose=AC.createGain();engDose.gain.value=MIX_MOTEUR;engDose.connect(MASTER);gainN.connect(engDose);
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
  {const tf2=AC.createBiquadFilter();tf2.type='bandpass';tf2.frequency.value=SON_DOUX?1700:2600;tf2.Q.value=SON_DOUX?1.4:2.2; /* (2026-11-10) la denture chante plus bas, hors de la bande sensible */
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
  const ewf=AC.createBiquadFilter();ewf.type='lowpass';ewf.frequency.value=SON_DOUX?3800:9000; /* (2026-11-10) les harmoniques de la dent de scie au-dessus de 4 kHz ne passent plus */
  engWhineG=AC.createGain();engWhineG.gain.value=0;
  engWhine.connect(ewf);ewf.connect(engWhineG);engWhineG.connect(gainN);
  osc.start();osc2.start();engSub.start();enz.start();engLfo.start();engWhine.start();
  engSetTier(0); // on démarre toujours au timbre du moteur d'origine
  try{MV.build();}catch(e){} // (2026-10-22) LE MOTEUR VIVANT (?moteurvivant=1) : rien sans le drapeau
  try{MB.build();}catch(e){}
  try{NPHY.build();}catch(e){} /* (2026-11-10) LE NITRO PHYSIQUE (?nitro=physique) : rien sans le drapeau */ /* (2026-11-10) LE MOTEUR MODERNE (?moteur=buche, l'appli de Léo) : rien sans le drapeau */
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
  whF=AC.createBiquadFilter();whF.type='bandpass';whF.frequency.value=2600;whF.Q.value=SON_DOUX?2.4:14; /* (2026-11-10, refonte du son) Q 14 → 2,4 : un souffle d'air, plus une note de sifflet (voir LE NOYAU) */
  whG=AC.createGain();whG.gain.value=0;
  wsrc2.connect(whF);whF.connect(whG);whG.connect(MASTER);wsrc2.start();
  // LA PLUIE (voir PLUIE_SON, pluieBuf) : fond + gouttes au hasard, stéréo, bouclé → passe-haut 450 Hz → passe-bas 8 kHz (Q .4) → gain mené par la boucle (LVL.pluie)
  {const rsrc=AC.createBufferSource();rsrc.buffer=PLUIE_SON?pluieBuf(10):AC.createBuffer(2,480,AC.sampleRate); /* (2026-11-10, refonte du son) la pluie est coupée (PLUIE_SON) : on ne calcule plus ses 10 s de tampon (960 000 échantillons, ~3 000 gouttes) au premier geste */rsrc.loop=true;
   const rhp=AC.createBiquadFilter();rhp.type='highpass';rhp.frequency.value=450;rhp.Q.value=.7;
   const rlp=AC.createBiquadFilter();rlp.type='lowpass';rlp.frequency.value=8000;rlp.Q.value=.4;
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
  try{porte(gainN,(MB.ok&&MB.puis)||engDose,engLfoG);porte(windG,MASTER);porte(whG,MASTER);porte(skidG,MASTER);porte(jrG,MASTER,jrDep);porte(jetG,MASTER);porte(jetLowG,MASTER);porte(jetOscG,MASTER);}catch(e){} // (optimisation) les PORTES du graphe
  try{porte(pluieG,MASTER);}catch(e){} // (2026-10-14) la pluie : débranchée de MASTER tant qu'il ne pleut pas (9e porte de dbgVu)
  try{gomBatit(AC,MASTER,{stt:stt,porte:porte});}catch(e){console.warn('gomme douce',e);} // (2026-10-16) LA GOMME DOUCE, le crissement qui chuchote (voir <<<GOMME DOUCE>>>) : ses deux portes sont la 10e et la 11e de dbgVu (bâtie même en `?crisse=ancien`, muette : l'ordre des portes ne bouge pas)
  try{regBatit();}catch(e){console.warn('régie',e);} /* (2026-11-11) LA RÉGIE : le roulement, l'appui, la râpe du drift, les oreilles du mixage (son/regie.js) — portes 12 à 14 de dbgVu */
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
  try{if(!SND.sfx&&!SND.music)AC.suspend();}catch(e){} /* (2026-11-07, chasse SON-N04) tout coupé dès la sauvegarde : le graphe dort tout de suite (sndRefresh ne tourne pas au premier geste) */
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
