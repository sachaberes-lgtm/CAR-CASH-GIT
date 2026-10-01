/* LE CHEF D'ORCHESTRE (2026-10-01, Léo : « creuse comment créer une musique adaptée au jeu sans trop que la personne s'en rende
   compte ; qu'elle prenne en compte quand on tourne ; qu'il y ait de l'évolution ; chaque niveau a sa musique ; compose en synthèse
   mais dépasse tes limites ; ce qui manque, c'est l'ÉNERGIE »).
   ----------------------------------------------------------------------------------------------------------------------
   Module AUTONOME (aucune globale du jeu). Il joue une PARTITION (atelier-son/compo.py → assets/audio/music/compo/) note à note,
   au seizième près, avec une BANQUE DE SONS rendue hors ligne (une planche : chaque son à son adresse).

   LA FORME SUIT LA COURSE — sans que ça se voie : on ne coupe jamais au milieu d'une phrase, tout se décide sur la grille.
   · INTRO (le départ) → GROOVE → DROP quand on file ; une MONTÉE tant que la nitro est tenue, le DROP tombe au LÂCHER (impact) ;
     avant un DROP la dernière mesure devient un ROULEMENT (caisse claire qui accélère + montée) ;
   · après 4 phrases de DROP, un BREAK (le hook rejoué en pincé, sans batterie) puis le DROP revient À L'ACTE SUIVANT : nouveau hook,
     basse qui saute l'octave, ride ; au 3e acte le morceau MONTE D'UN TON (la vieille ficelle des finales) — l'ÉVOLUTION ;
   · EN VOL : grosse caisse, clap et basse se taisent à la croche, le grave s'allège ; À LA POSE : IMPACT sur le temps et tout revient ;
   · ACCALMIE (choc, arrêt) : BREAK sur le temps suivant, le son se ferme ; RELANCE : une montée d'une mesure, le groove revient sur la barre ;
   · palier moteur : montée d'une mesure + crash sur la barre, et les actes avancent plus vite.
   CE QUI SUIT EN CONTINU (subtil) :
   · le VOLANT : l'arpège et le lead glissent dans l'espace du côté du virage, l'arpège s'éclaircit ; le DRIFT ajoute des roulements de charley ;
   · la VITESSE : le son s'ouvre (filtre), la musique s'éloigne quand on ralentit (réverbe) ;
   · l'INTENSITÉ (vitesse + élan + moteur, lissée : vite à monter, lente à retomber) règle la densité en GROOVE/INTRO ;
   · le MOTEUR respire sur le temps (`pompeMoteur()`), la basse et les accords POMPENT sous chaque grosse caisse.

   const chef = MusiqueChef(ac, sortie);  await chef.charge(compo);  chef.joue(reprise);  chef.stop();
   chef.regle({ vitesse, enVol, nitro, moteur, temps, frenesie, virage, drift });  chef.palier(moteur);  chef.etat();
*/
(function(G){
'use strict';
const CH_REGLES={avance:.16,iMonte:1.0,iDescend:3.5,dropSur:.62,dropTient:.45,introSous:.2,elanMontee:.7,
  ruptDelta:.32,ruptSous:.55,picDescend:.3,relanceSur:.45,fcBas:1800,lpRupt:900,pompeMot:.28,profMax:.35,
  panArp:.38,panLead:.22,toursParActe:4,monteeMes:4,nitroTrou:.35,gMontee:.6,tonFinal:2};
function MusiqueChef(ac,sortie){
  const R=CH_REGLES;
  // ---- LA CONSOLE : bus → (pompe) → pré → passe-haut (vol) → passe-bas (vitesse) → colle → écrêteur doux → sortie ; réverbe et écho en envoi
  const pre=ac.createGain(),hp=ac.createBiquadFilter(),lp=ac.createBiquadFilter(),colle=ac.createDynamicsCompressor(),clip=ac.createWaveShaper(),out=ac.createGain(),aigus=ac.createBiquadFilter();
  hp.type='highpass';hp.frequency.value=25;lp.type='lowpass';lp.frequency.value=20000;lp.Q.value=.5;aigus.type='highshelf';aigus.frequency.value=4000;aigus.gain.value=0;
  colle.threshold.value=-16;colle.ratio.value=3;colle.knee.value=6;colle.attack.value=.008;colle.release.value=.16;
  {const n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(x*1.3)/Math.tanh(1.3);}clip.curve=c;}
  out.gain.value=.82;pre.connect(hp);hp.connect(lp);lp.connect(aigus);aigus.connect(colle);colle.connect(clip);clip.connect(out);out.connect(sortie||ac.destination);
  const rev=ac.createConvolver(),revG=ac.createGain(),eco=ac.createDelay(1.5),ecoFb=ac.createGain(),ecoF=ac.createBiquadFilter(),ecoG=ac.createGain();
  {const n=Math.floor(ac.sampleRate*2.6),ir=ac.createBuffer(2,n,ac.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);let h=0x2468ACE+c*977;
    for(let i=0;i<n;i++){h^=h<<13;h^=h>>>17;h^=h<<5;const t=i/ac.sampleRate;d[i]=((h>>>0)/4294967296*2-1)*Math.exp(-t*2.7)*(t<.015?t/.015:1);}}rev.buffer=ir;}
  revG.gain.value=.12;rev.connect(revG);revG.connect(pre);
  ecoFb.gain.value=.33;ecoF.type='lowpass';ecoF.frequency.value=3200;ecoG.gain.value=.18;eco.connect(ecoF);ecoF.connect(ecoFb);ecoFb.connect(eco);ecoF.connect(ecoG);ecoG.connect(pre);
  function bus(envRev,envEco,pan,filtre){ // un bus : [filtre] → [pan] → pompe → pré (+ envois)
    const entree=ac.createGain();let x=entree;
    let f=null;if(filtre){f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=filtre;x.connect(f);x=f;}
    let p=null;if(pan&&ac.createStereoPanner){p=ac.createStereoPanner();x.connect(p);x=p;}
    const duck=ac.createGain();x.connect(duck);duck.connect(pre);
    if(envRev){const s=ac.createGain();s.gain.value=envRev;duck.connect(s);s.connect(rev);}
    if(envEco){const s=ac.createGain();s.gain.value=envEco;duck.connect(s);s.connect(eco);}
    return{in:entree,duck:duck,pan:p,f:f};
  }
  const BUS={bat:bus(.06,0),basse:bus(0,0),harm:bus(.35,0),arp:bus(.32,.35,true,6500),lead:bus(.25,.28,true),fx:bus(.2,0)};
  let D=null,buf=null,deb=0,iv=0,joueOk=false;
  let bpm=120,tps=.5,dc=.125,mes=2,t0=0,nb=0,tNb=0;                // la grille
  let sec='INTRO',act=0,dropTours=0,phr=0,cleK=1,cleProchaine=1,roulement=false,prochaine=null,relance=0,breakTours=0;
  let ancre=0,attente=[],vise=null,monteeT0=-1,monteeFaite=false,nitroLache=-9,I=0,vF=0,vPic=0,vPicL=0,elan=0,nitroT=0,nitroAv=false,volAv=false,volT=0,vir=0,drift=false,rupt=false,tRupt=-99,tPrec=0,dernier={};
  const pistes={};                                                  // la sortie de chaque piste (son gain = le calibrage × la règle « sol »)
  async function charge(c){
    D=c;bpm=c.bpm;tps=60/bpm;dc=tps/4;mes=tps*4;
    const r=await fetch(c.sons);if(!r.ok)throw new Error('banque introuvable : '+c.sons);const ab=await r.arrayBuffer();
    buf=await new Promise((ok,ko)=>ac.decodeAudioData(ab,ok,ko));
    let fin=0;for(const k in c.index)fin=Math.max(fin,c.index[k][0]+c.index[k][1]+.06);
    const ex=buf.duration-fin;deb=ex>.03?Math.min(ex,2112/buf.sampleRate):0; // l'amorce AAC
    for(const p in c.meta){if(pistes[p])try{pistes[p].disconnect();}catch(e){}const g=ac.createGain();g.gain.value=(c.gains[p]||1);g.connect(BUS[c.meta[p].bus].in);pistes[p]=g;}
    reset();
  }
  function reset(){sec='INTRO';act=0;dropTours=0;phr=0;cleK=1;cleProchaine=1;roulement=false;prochaine=null;relance=0;breakTours=0;I=0;vF=vPic=vPicL=elan=nitroT=0;rupt=false;ancre=0;vise=null;monteeT0=-1;monteeFaite=false;attente=[];if(riser){coupe(riser,ac.currentTime);riser=null;}}
  // ---- jouer un son de la planche
  function son(nom,t,g,dur,gl,piste,off){
    const a=D.index[nom];if(!a||!buf)return;
    const hauteur=!/^(kick|clap|caisse|hat|ohat|ride|shaker|crash|montee|descente|impact|crashinv|subdrop)/.test(nom);
    const r=hauteur?cleK:1,s=ac.createBufferSource(),gn=ac.createGain();s.buffer=buf;s.playbackRate.setValueAtTime(r,t);
    if(gl){s.playbackRate.setValueAtTime(r,t+.05);s.playbackRate.linearRampToValueAtTime(r*Math.pow(2,gl/12),t+.3);}
    gn.gain.setValueAtTime(g,t);let lg=a[1]/r;
    if(dur>0&&dur<lg){gn.gain.setValueAtTime(g,t+dur);gn.gain.linearRampToValueAtTime(0,t+dur+.07);lg=dur+.08;}
    off=Math.max(0,Math.min(a[1]-.05,off||0));
    s.connect(gn);gn.connect(piste?pistes[piste]:BUS.fx.in);s.start(t,deb+a[0]+off,Math.min(a[1]-off,lg*r+.01));
    if(/^montee/.test(nom)){if(riser)coupe(riser,t);riser={s:s,g:gn};}  // UNE seule montée à la fois
    if(nom==='kick')pompe(t);
  }
  let riser=null;
  function coupe(r,t){try{r.g.gain.cancelScheduledValues(t);r.g.gain.setTargetAtTime(0,t,.025);r.s.stop(t+.25);}catch(e){}}
  function pompe(t){['basse','harm','arp','lead'].forEach(function(b){const d=BUS[b].duck.gain;d.setTargetAtTime(.38,t,.004);d.setTargetAtTime(1,t+.035,.06);});}
  // ---- LA FORME : la section de la phrase qui vient
  function choisir(){
    if(rupt)return 'BREAK';
    if(phr<1)return 'INTRO';                                          // le départ : une phrase d'INTRO, puis la course décide
    if(phr<2)return 'GROOVE';
    if(sec==='BREAK'&&breakTours>0)return I>R.dropSur?'DROP':'GROOVE';
    if(sec==='DROP'&&dropTours>0&&dropTours%R.toursParActe===0&&!dernier.frenesie)return 'BREAK'; // la respiration de la chanson
    if(sec==='DROP'&&I>R.dropTient)return 'DROP';
    if(I>R.dropSur)return 'DROP';
    if(I<R.introSous)return 'INTRO';
    return 'GROOVE';
  }
  function entreDrop(){ // l'ACTE se décide à chaque entrée dans le DROP (chemin normal, relance, lâcher de nitro)
    act=Math.min(2,Math.floor(dropTours/R.toursParActe));if(dernier.frenesie)act=2;
    cleK=act>=2?Math.pow(2,R.tonFinal/12):1;                          // l'acte final : le morceau monte d'un ton
  }
  function barreDe(t){return Math.round((t-t0)/mes);}
  function mesure(T,b){ // le début d'une mesure : la forme se décide ici
    let pb=((b-ancre)%4+4)%4;
    if(relance&&T>=relance-.01){relance=0;ancre=b;pb=0;sec=I>R.dropSur?'DROP':'GROOVE';son('impact',T,.75);if(sec==='DROP'){dropTours=Math.max(dropTours,1);entreDrop();}}
    else if(sec==='MONTEE'){ // la MONTÉE dure ce que dure son souffle (4 mesures) : nitro encore tenue ou pas, elle tombe sur le DROP
      if(monteeT0>0&&T>=monteeT0+R.monteeMes*mes-.01&&vise!=='DROP'){sec='DROP';monteeT0=-1;ancre=b;pb=0;dropTours=Math.max(dropTours,1);entreDrop();son('impact',T,.7);phr++;}
    }
    else if(pb===0){
      if(sec==='DROP')dropTours++;
      if(sec==='BREAK')breakTours++;else breakTours=0;
      const n=choisir();
      if(n==='DROP'&&sec!=='DROP')entreDrop();
      if(n!==sec&&n==='GROOVE'&&sec==='DROP')son('descente',T,.5);
      sec=n;phr++;
    }
    roulement=false;
    if(pb===3&&sec!=='DROP'&&sec!=='MONTEE'&&!rupt){                  // la dernière mesure avant un DROP devient un ROULEMENT
      const n=choisir();if(n==='DROP')roulement=true;
    }
  }
  function temps(b,T){ // un temps de la grille : on programme ses seizièmes
    const bar=Math.floor(b/4),bt=b%4;
    if(bt===0)mesure(T,bar);
    const pb=((bar-ancre)%4+4)%4,T0=T-bt*tps,s0=bt*4,s1=s0+4;
    const S=D.sections[roulement?'ROULEMENT':sec];if(!S)return;
    for(const p in S){
      const P=S[p],M=D.meta[p];
      if(M.roll&&!drift)continue;
      if(sec==='MONTEE'&&p==='fx'&&!roulement)continue;              // la montée est lancée par le chef, au début de la MONTÉE
      if(P.minI>I+.001&&(sec==='GROOVE'||sec==='INTRO'))continue;
      const vs=P.variantes,v=vs[Math.min(act,vs.length-1)];if(!v)continue;
      for(let i=0;i<v.length;i++){const e=v[i];if(e[0]!==pb||e[1]<s0||e[1]>=s1)continue;
        son(e[2],T0+e[1]*dc,e[3],e[4],e[5],p);}
    }
  }
  function planifie(){
    if(!joueOk)return;const now=ac.currentTime;
    if(tNb<now-.2){const k=Math.ceil((now-tNb)/tps);nb+=k;tNb+=k*tps;}   // l'onglet a dormi : on ne rattrape pas une rafale de notes
    while(tNb<now+R.avance){temps(nb,tNb);nb++;tNb+=tps;}
  }
  function prochainTemps(){return tNb;} // le prochain temps pas encore programmé
  function prochaineCroche(){const now=ac.currentTime+.02;const k=Math.ceil((now-t0)/(tps/2));return t0+k*tps/2;}
  function joue(reprise){
    stop();if(!reprise)reset();
    t0=ac.currentTime+.08;nb=0;tNb=t0;joueOk=true;planifie();iv=setInterval(planifie,25);
  }
  function stop(){joueOk=false;clearInterval(iv);}
  function solGain(g,t){for(const p in D.meta)if(D.meta[p].sol)pistes[p].gain.setTargetAtTime((D.gains[p]||1)*g,t,.01);}
  function regle(o){
    if(!D)return;dernier=o;const now=ac.currentTime,dt=tPrec?Math.min(.25,Math.max(0,now-tPrec)):0;tPrec=now;
    const v=o.frenesie?1.3:(o.vitesse||0),mot=Math.max(0,Math.min(1,o.moteur||0));
    const vAv=vF;vF+=(v-vF)*Math.min(1,dt*10);const acc=dt>0?(vF-vAv)/dt:0;
    vPic=Math.max(vF,vPic-dt*R.picDescend);vPicL=Math.max(vF,vPicL-dt*.2);
    // l'ÉLAN : nitro tenue (et enchaînée), accélération
    if(o.nitro)nitroT+=dt;else nitroT=Math.max(0,nitroT-dt*1.5);
    const eC=o.nitro?Math.min(1,.35+nitroT*.18):Math.min(.45,Math.max(0,acc*1.2));
    elan+=(eC-elan)*Math.min(1,dt/(eC>elan?.35:1.8));
    // l'INTENSITÉ : ce que la course demande à la musique (vite à monter, lente à retomber)
    const iC=Math.min(1,.08+.72*Math.min(1.15,vF)+.25*elan+.1*mot+(o.frenesie?.3:0));
    I+=(iC-I)*Math.min(1,dt/(iC>I?R.iMonte:R.iDescend));
    // la MONTÉE de la nitro : elle commence à la barre suivante ; le LÂCHER fait tomber le DROP sur la barre suivante
    const nit=!!o.nitro||now-nitroLache<R.nitroTrou;if(o.nitro)nitroLache=now;
    if(!nit)monteeFaite=false;                                        // relâchée pour de bon : la prochaine nitro pourra remonter
    if(nit&&!monteeFaite&&elan>R.elanMontee&&sec!=='MONTEE'&&!vise&&!rupt&&joueOk){monteeFaite=true;planEtat(prochaineBarre(),'MONTEE');}
    if(nitroAv&&!nit&&(sec==='MONTEE'||vise==='MONTEE')){const tb=prochaineBarre();planEtat(tb,'DROP',true);if(riser)coupe(riser,tb);}
    nitroAv=nit;
    // le VOL : la batterie et la basse se taisent à la croche ; la POSE : impact sur le temps
    if(o.enVol&&!volAv){volT=now;solGain(0,prochaineCroche());hp.frequency.setTargetAtTime(220,now,.2);}
    if(!o.enVol&&volAv){const t=prochaineTempsReel();solGain(1,t);hp.frequency.setTargetAtTime(25,t,.05);if(now-volT>.6)son('impact',t,.55);}
    volAv=!!o.enVol;
    // l'ACCALMIE et la RELANCE
    if(!rupt&&now-tRupt>3&&((vPic-vF>R.ruptDelta&&vF<R.ruptSous)||(vF<.08&&vPicL>.3))){rupt=true;tRupt=now;const t=prochaineTempsReel();planEtat(t,'BREAK');if(riser)coupe(riser,t);son('descente',t,.45);}
    else if(rupt&&vF>R.relanceSur&&now-tRupt>.6){ // la RELANCE : le groove retombe sur la prochaine barre qui laisse au moins une demi-mesure de montée
      rupt=false;let tb=prochaineBarre();if(tb-now<mes*.5)tb+=mes;const d0=tb-mes,n0=now+.03;
      son('montee1',Math.max(n0,d0),.5,0,0,null,Math.max(0,n0-d0));relance=tb;}
    // le VOLANT, le DRIFT
    vir+=((o.virage||0)-vir)*Math.min(1,dt*6);drift=!!o.drift;
    if(BUS.arp.pan)BUS.arp.pan.pan.setTargetAtTime(Math.max(-1,Math.min(1,R.panArp*vir)),now,.05);
    if(BUS.lead.pan)BUS.lead.pan.pan.setTargetAtTime(Math.max(-1,Math.min(1,R.panLead*vir)),now,.05);
    BUS.arp.f.frequency.setTargetAtTime(4200+6000*Math.abs(vir),now,.08);
    // la VITESSE ouvre le son, la lenteur l'éloigne ; l'élan fait briller
    const k=Math.max(0,Math.min(1,(vF-.05)/.5));
    lp.frequency.setTargetAtTime(rupt?R.lpRupt:R.fcBas*Math.pow(20000/R.fcBas,k),now,rupt?.4:.12);
    revG.gain.setTargetAtTime(.1+R.profMax*(rupt?1:(1-Math.min(1,vF/.7))),now,.4);
    aigus.gain.setTargetAtTime(5*elan,now,.1);
  }
  function prochaineBarre(){const now=ac.currentTime+.05;const k=Math.ceil((now-t0)/mes);return t0+k*mes;}
  function prochaineTempsReel(){const now=ac.currentTime+.03;const k=Math.ceil((now-t0)/tps);return t0+k*tps;}
  function planEtat(t,s,impact){ // une section qui doit commencer à l'instant t (sur la grille)
    attente=attente.filter(function(a){return a.s!==s&&!(s==='DROP'&&a.s==='MONTEE');});attente.push({t:t,s:s,impact:!!impact});vise=s;
    const f=function(){const now=ac.currentTime;attente=attente.filter(function(a){
      if(a.t-now>R.avance+.05)return true;
      sec=a.s;if(a.s==='MONTEE'||a.s==='DROP')ancre=barreDe(a.t);if(a.s==='DROP'){monteeT0=-1;dropTours=Math.max(dropTours,1);entreDrop();if(a.impact)son('impact',a.t,.7);}
      if(a.s==='MONTEE'){monteeT0=a.t;son('montee4',a.t,R.gMontee);}
      return false;});vise=attente.length?attente[attente.length-1].s:null;if(attente.length)setTimeout(f,30);};
    setTimeout(f,0);
  }
  function palier(m){if(!joueOk)return;const tb=prochaineBarre();if(sec!=='MONTEE'&&!vise)son('montee1',tb,.5);son('crash',tb+mes,.7);dropTours+=2;}
  function pompeMoteur(){if(!joueOk)return 1;const ph=((ac.currentTime-t0)%tps+tps)%tps;return 1-R.pompeMot*Math.exp(-ph/.08);}
  function position(){return joueOk?((ac.currentTime-t0)%(mes*4)+mes*4)%(mes*4):0;}
  return{charge:charge,joue:joue,stop:stop,regle:regle,palier:palier,pompeMoteur:pompeMoteur,position:position,reset:reset,sortie:pre,
    etat:function(){return{section:roulement?'ROULEMENT':sec,acte:act+1,ton:cleK>1?'+'+R.tonFinal:'0',intensite:+I.toFixed(2),elan:+elan.toFixed(2),
      phrases:phr,drop:dropTours,vol:volAv,accalmie:rupt,virage:+vir.toFixed(2),drift:drift,filtre:Math.round(lp.frequency.value)};}};
}
G.MusiqueChef=MusiqueChef;G.CH_REGLES=CH_REGLES;
})(window);
