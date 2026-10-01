/* LA LUMIÈRE — la musique de niveau jouée EN ENTIER, que la course embellit ou intensifie (2026-10-01).
   Léo : « pas une musique qui évolue piste par piste (batterie, basse…) : ça fait bizarre, c'est disharmonieux. Plutôt embellir ou
   intensifier le son selon le thème — trouve une règle générale ». LA RÈGLE :
   · le MORCEAU NE CHANGE JAMAIS (notes, structure, toutes ses pistes) : il reste harmonieux ;
   · la course règle un seul curseur x ∈ [−1, 1] — EMBELLIR (lent, vol, après un crash : réverbe, air, douceur) ↔ INTENSIFIER (vitesse,
     nitro, frénésie : punch des graves, présence, grain, respiration sur le temps) — lissé sur plus d'une seconde ;
   · le THÈME du niveau colore ces effets (nuages = air et réverbe claire · ville = grain et pompe · orbite = largeur et écho) ;
   · garde-fous : le volume perçu reste à ±3 dB du morceau (le maître compense ce que les effets ajoutent), aucune piste coupée,
     aucun souffle de montée.
   Même interface que musique-chef.js (charge, joue, stop, regle, palier, pompeMoteur, etat) : le bloc <<<COUCHES>>> la pilote. */
(function(G){
'use strict';
const THEMES={
  nuages:{rev:1.25,air:1.2,grave:.7,grain:.25,pompe:.12,echo:.15},
  ville:{rev:.7,air:.6,grave:1.1,grain:.65,pompe:.32,echo:.1},
  orbite:{rev:1,air:.9,grave:1.2,grain:.3,pompe:.18,echo:.45},
  frenesie:{rev:.6,air:.7,grave:1.2,grain:.8,pompe:.35,echo:.1}};
const LU_REGLES={monte:1.0,descend:1.6,crashDelta:.32,crashSous:.55,crashTient:2.6,fondu:2.2,boucleMin:55};
const TAMPONS={};

function MusiqueLumiere(ac,sortie){
  const R=LU_REGLES,n={};
  // ---- la chaîne : graves → présence → air → (sec | grain) → pompe → maître ; réverbe et écho en envois
  n.grave=ac.createBiquadFilter();n.grave.type='lowshelf';n.grave.frequency.value=110;
  n.pres=ac.createBiquadFilter();n.pres.type='peaking';n.pres.frequency.value=3000;n.pres.Q.value=.8;
  n.air=ac.createBiquadFilter();n.air.type='highshelf';n.air.frequency.value=8500;
  n.sec=ac.createGain();n.mouille=ac.createGain();n.mouille.gain.value=0;n.sat=ac.createWaveShaper();
  {const k=new Float32Array(1024);for(let i=0;i<1024;i++){const v=i/511.5-1;k[i]=Math.tanh(v*2.2)/Math.tanh(2.2);}n.sat.curve=k;n.sat.oversample='2x';}
  n.pompe=ac.createGain();n.maitre=ac.createGain();
  n.revE=ac.createGain();n.revE.gain.value=0;n.rev=ac.createConvolver();
  {const L=Math.floor(3.2*ac.sampleRate),b=ac.createBuffer(2,L,ac.sampleRate);
    for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<L;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/L,2.6)*.6;}n.rev.buffer=b;}
  n.echE=ac.createGain();n.echE.gain.value=0;n.ech=ac.createDelay(2);n.echR=ac.createGain();n.echR.gain.value=.38;
  n.echF=ac.createBiquadFilter();n.echF.type='lowpass';n.echF.frequency.value=3500;
  n.entree=ac.createGain();
  n.entree.connect(n.grave);n.grave.connect(n.pres);n.pres.connect(n.air);
  n.air.connect(n.sec);n.air.connect(n.sat);n.sat.connect(n.mouille);n.sec.connect(n.pompe);n.mouille.connect(n.pompe);
  n.pompe.connect(n.maitre);n.maitre.connect(sortie);
  n.air.connect(n.revE);n.revE.connect(n.rev);n.rev.connect(n.maitre);
  n.air.connect(n.echE);n.echE.connect(n.ech);n.ech.connect(n.echF);n.echF.connect(n.echR);n.echR.connect(n.ech);n.echF.connect(n.maitre);

  let D=null,bufs=[],joueOk=false,piste=-1,voix=null,iv=0,theme='nuages';
  let x=0,xC=0,xPose=-9,vF=0,vPic=0,tPrec=0,crashT=-99,palT=-99,fren=false,frenVoix=null,dernier={};

  async function tampon(f){if(!TAMPONS[f])TAMPONS[f]=fetch(f).then(r=>{if(!r.ok)throw new Error(f);return r.arrayBuffer();})
    .then(ab=>new Promise((ok,ko)=>ac.decodeAudioData(ab,ok,ko)));return TAMPONS[f];}
  async function charge(d){D=d;theme=d.theme||'nuages';bufs=await Promise.all(d.pistes.map(p=>tampon(p.f)));
    if(d.frenesie)tampon(d.frenesie.f).catch(()=>{});}
  function bornes(p,buf){const ex=p.dur?buf.duration-p.dur:0,a=ex>.03?Math.min(ex,2112/buf.sampleRate):0;return[a,p.dur?a+p.dur:buf.duration];}
  // ---- une piste bouclée, qui entre en fondu ; la playlist du niveau passe à la suivante au bout de ~1 min, SUR LA FIN DE SA BOUCLE
  function lance(p,buf,t,fondu){const[a,b]=bornes(p,buf),s=ac.createBufferSource(),g=ac.createGain();s.buffer=buf;s.loop=true;s.loopStart=a;s.loopEnd=b;
    g.gain.setValueAtTime(0,t);g.gain.setTargetAtTime(1,t,fondu/3);s.connect(g);g.connect(n.entree);s.start(t,a);return{s:s,g:g,t0:t,lg:b-a,bpm:p.bpm||110,p:p};}
  function eteint(v,t,fondu){if(!v)return;try{v.g.gain.cancelScheduledValues(t);v.g.gain.setTargetAtTime(0,t,fondu/3);v.s.stop(t+fondu*2);}catch(e){}}
  function suivante(){if(!D||!bufs.length)return;const old=voix;piste=(piste+1)%bufs.length;
    const t=old?old.t0+Math.ceil((ac.currentTime+.1-old.t0)/old.lg)*old.lg-R.fondu/2:ac.currentTime+.05;
    voix=lance(D.pistes[piste],bufs[piste],Math.max(ac.currentTime+.05,t),old?R.fondu:.4);eteint(old,Math.max(ac.currentTime,t),R.fondu);voix.fin=voix.t0+Math.max(1,Math.ceil(R.boucleMin/voix.lg))*voix.lg;}
  function joue(reprise){stop();if(!D)return;joueOk=true;piste=(!reprise||piste<0)?-1:piste-1;voix=null;suivante();regleSon(true);iv=setInterval(battre,25);}
  function stop(){joueOk=false;clearInterval(iv);eteint(voix,ac.currentTime,.1);voix=null;eteint(frenVoix,ac.currentTime,.1);frenVoix=null;}
  // ---- la POMPE (sur les temps du morceau qui joue) et la playlist
  let tbDer=0;
  function battre(){if(!joueOk||!voix)return;const now=ac.currentTime,v=frenVoix||voix;
    if(!frenVoix&&bufs.length>1&&voix.fin&&now>voix.fin-R.fondu-.3)suivante();
    const T=THEMES[fren?'frenesie':theme],p=Math.max(0,x)*T.pompe,g=n.pompe.gain;
    if(p<.01){if(tbDer!==-1){g.setTargetAtTime(1,now,.05);tbDer=-1;}return;}
    const tps=60/v.bpm,tb=v.t0+Math.ceil((now-v.t0)/tps)*tps;if(tb===tbDer||tb-now>.1)return;tbDer=tb;
    g.setTargetAtTime(1-p,tb,.008);g.setTargetAtTime(1,tb+.03,tps*.28);}
  // ---- appliquer x au son (seulement quand il a bougé)
  function regleSon(force){if(!force&&Math.abs(x-xPose)<.01)return;xPose=x;
    const T=THEMES[fren?'frenesie':theme],em=Math.max(0,-x),it=Math.max(0,x),t=ac.currentTime,tc=.3;
    n.revE.gain.setTargetAtTime((.06+.32*em)*T.rev,t,tc);
    n.air.gain.setTargetAtTime(4.5*em*T.air+1.2*it,t,tc);n.pres.gain.setTargetAtTime(2*it,t,tc);
    n.grave.gain.setTargetAtTime(-2.5*em+2.5*it*T.grave,t,tc);
    n.mouille.gain.setTargetAtTime(.9*it*T.grain,t,tc);n.sec.gain.setTargetAtTime(1-.35*it*T.grain,t,tc);
    n.echE.gain.setTargetAtTime(T.echo*(.3+.3*Math.abs(x)),t,tc);
    const ajout=it*(2*T.grave+1.2+5*T.grain)+em*(3*T.rev)+2*T.echo;     // ce que les effets ajoutent (dB) : le maître le reprend
    n.maitre.gain.setTargetAtTime(Math.pow(10,(it*2-em*1-ajout)/20),t,tc);
    const v=frenVoix||voix;if(v)n.ech.delayTime.setTargetAtTime(Math.min(1.9,60/v.bpm*.75),t,.05);}
  // ---- LA COURSE → x
  function regle(o){if(!D)return;dernier=o;const now=ac.currentTime,dt=tPrec?Math.min(.25,Math.max(0,now-tPrec)):0;tPrec=now;
    const v=o.frenesie?1.3:(o.vitesse||0);vF+=(v-vF)*Math.min(1,dt*6);vPic=Math.max(vF,vPic-dt*.3);
    if(now-crashT>3&&vPic-vF>R.crashDelta&&vF<R.crashSous)crashT=now;          // un choc, un arrêt : tout s'adoucit
    const s=Math.max(0,Math.min(1,(vF-.2)/.9));let c=-.6+1.1*s*s*(3-2*s);         // lent = embellir · croisière = un peu d'intensité
    if(o.nitro)c+=.55;if(o.enVol)c=c*.5-.25;if(now-palT<3)c+=.25;if(o.frenesie)c=1;
    if(now-crashT<R.crashTient)c=-1;
    xC=Math.max(-1,Math.min(1,c));x+=(xC-x)*Math.min(1,dt/(xC>x?R.monte:R.descend));
    // la FRÉNÉSIE a son morceau, s'il y en a un : il entre en fondu par-dessus et repart à la sortie
    if(o.frenesie!==fren){fren=!!o.frenesie;regleSon(true);
      if(fren&&D.frenesie&&joueOk)tampon(D.frenesie.f).then(buf=>{if(!fren||!joueOk||frenVoix)return;frenVoix=lance(D.frenesie,buf,ac.currentTime+.05,1);if(voix)voix.g.gain.setTargetAtTime(0,ac.currentTime,.4);}).catch(()=>{});
      if(!fren&&frenVoix){eteint(frenVoix,ac.currentTime,1.2);frenVoix=null;if(voix)voix.g.gain.setTargetAtTime(1,ac.currentTime,.5);}}
    regleSon(false);}
  function palier(){palT=ac.currentTime;}
  return{charge:charge,joue:joue,stop:stop,regle:regle,palier:palier,pompeMoteur:()=>1,reset:()=>{piste=-1;x=0;},sortie:n.entree,
    etat:()=>({theme:fren?'frenesie':theme,x:+x.toFixed(2),piste:voix&&voix.p.titre,frenesie:!!frenVoix,crash:ac.currentTime-crashT<R.crashTient})};
}
G.MusiqueLumiere=MusiqueLumiere;G.LU_REGLES=LU_REGLES;G.LU_THEMES=THEMES;
})(window);
