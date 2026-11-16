/* ===== L'ÉDIT DE LA TRIADE (2026-11-13, Sacha : « quand on passe en mode dark triad trouve un moyen de changer la musique pour la rendre plus
   stimulante comme dans les edit dark triad sur tik tok ») =====
   CE QUI EXISTAIT : rien — depuis le 11/11 (Sacha : « supprime du jeu la musique dark triad ») le morceau de la frénésie est parti, et la frénésie garde la
   musique de la course (un morceau de Pouce bleu : tempo, ton et structure changent à chaque partie). On ne peut donc ni lui poser un riff
   (il serait faux dans la moitié des cas) ni caler des coups sur une grille qu'on ne connaît pas. On transforme la MÊME musique, comme un
   monteur de « edit » : la charpente d'un edit TikTok, c'est une montée qui se tend, une COUPURE, puis le DROP — pas une mélodie.
     · À L'ENTRÉE : la musique se COUPE net (0,12 s de quasi-silence, le filtre fermé) puis REVIENT d'un coup, plus fort, filtre grand ouvert, sur
       un IMPACT (boum saturé + claquement + cymbale). C'est le drop, sur le « TRIPLE MONSTRE ».
     · TOUT AU LONG : les graves de la musique sont doublés d'une copie SATURÉE (le gros 808 distordu du phonk) : même note, même rythme
       que le morceau, juste plus lourd et plus mordant. Rien d'accordé en plus, donc rien de faux.
     · TOUTES LES 8 MESURES (au tempo du morceau, `bpm()` du lecteur) : la montée — un souffle qui s'ouvre, le filtre de la musique qui SE FERME
       (18 kHz → 650 Hz, avec de la résonance), un roulement de caisse claire qui accélère (croches, doubles, triples) — puis la coupure
       et le DROP. La phase n'est pas calée sur la grosse caisse du morceau (on ne la connaît pas) : c'est un effet de monteur, pas un
       instrument ; la coupure + l'impact sont assez francs pour qu'on n'entende pas le décalage.
     · À LA SORTIE : le filtre et le niveau sont rendus, les graves saturés se retirent, et une courte DESCENTE (grave qui tombe) ferme la frénésie.
   Les sons de synthèse (impact, souffle, roulement) n'ont AUCUNE hauteur : ils vont sur le bus des effets (`MASTER`, calés comme l'explosion), le
   curseur EFFETS les règle. Le filtre et la coupure agissent sur la chaîne de sortie de Pouce bleu (`POUCE_JEU.ch` : f = passe-bas, e = sortie) ;
   si la radio <audio> joue à la place, seuls les sons de synthèse partent (rien à filtrer proprement).
   TEMPS : tout est programmé à l'heure du contexte AudioContext (donc figé par la pause, juste au tempo) ; un minuteur de 50 ms ne fait que
   lancer la montée suivante 1 s avant et les effets visuels (ondes du ciel) à l'heure du drop. `?triade=0` : sans l'édit. Crochet : `window.dbgTriade()`. */
const TRIEDIT={on:!/[?&]triade=0/.test(location.search),g:null,iv:0,act:false,tDrop:0,tBuild:0,vis:[],n:0,dern:'',sat:null,ch:null,chaud:.08,cycle:0,bar:2};
/* LE TÉLÉPHONE (2026-11-13, ios-ultime — « optimise les nouveautés de main aussi bien que le reste ») : tout l'édit vit sur le FIL AUDIO, celui qui décroche quand l'iPhone chauffe.
   · TOUJOURS sur l'app : les saturations sans suréchantillonnage (`oversample` 'none' au lieu de '2x', qui doublait leur coût) — inaudible ici : ce qu'on sature passe sous 140 Hz
     (les graves) ou plonge de 150 à 38 Hz (l'impact), leurs harmoniques restent loin de la moitié de 48 kHz, et un passe-bas à 1 100 Hz suit ;
   · téléphone CHAUD (le gouverneur du son au cran 1, `__ccSonCharge`) : les coups de caisse claire du roulement perdent leur corps (l'oscillateur à 190 Hz), le bruit qui claque reste ;
   · cran 2 (critical) : pas de graves saturés en continu pendant la frénésie (3 nœuds qui tournent sans arrêt) ; la coupure, le drop et la montée restent.
   `?sans=trileger` = l'édit entier, comme sur l'ordinateur. */
const TRI_LEGER=typeof TEL_NATIF!=='undefined'&&TEL_NATIF&&!/[?&]sans=[^&]*trileger/.test(location.search);
function triCharge(){return TRI_LEGER?(window.__ccSonCharge|0):0;}
function triOver(){return TRI_LEGER?'none':'2x';}
function triPb(){ // la chaîne de sortie de Pouce bleu, SI c'est lui qui joue la course
  const p=window.POUCE_JEU;
  return (p&&p.joue&&p.joue()&&p.ch&&p.ch.f&&p.ch.e&&p.ac===AC)?p:null;
}
function triSortie(){ // le départ des sons de synthèse : un gain vers le bus des effets (recréé si le contexte a changé)
  if(!AC||!MASTER)return null;
  if(!TRIEDIT.g||TRIEDIT.g.context!==AC){const g=AC.createGain();g.gain.value=.9;g.connect(MASTER);TRIEDIT.g=g;TRIEDIT.sat=null;}
  return TRIEDIT.g;
}
function triSat(){ // la courbe du grave saturé : tanh poussé
  if(TRIEDIT.sat)return TRIEDIT.sat;
  const n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(x*3.2)/Math.tanh(3.2);}
  return (TRIEDIT.sat=c);
}
function triEnv(w,pk,att,dec){ // un gain à enveloppe : montée de att s, retombée exponentielle de dec s
  const g=AC.createGain();g.gain.setValueAtTime(.0001,w);g.gain.linearRampToValueAtTime(pk,w+att);g.gain.exponentialRampToValueAtTime(.0001,w+att+dec);return g;
}
function triBruit(w,len){ // une source de bruit blanc (tampon en cache : noiseBuf)
  const s=AC.createBufferSource();s.buffer=noiseBuf(Math.max(.06,len));s.start(w);s.stop(w+len+.05);return s;
}
function triBoum(w,v,out){ // le grave de l'impact : un sinus qui PLONGE (150 → 38 Hz) puis tient, saturé (les harmoniques s'entendent sur un haut-parleur de téléphone)
  const o=AC.createOscillator();o.type='sine';o.frequency.setValueAtTime(150,w);o.frequency.exponentialRampToValueAtTime(38,w+.3);
  const s=AC.createWaveShaper();s.curve=triSat();s.oversample=triOver();
  const g=triEnv(w,.55*v,.004,1.1);o.connect(s);s.connect(g);g.connect(out);o.start(w);o.stop(w+1.2);
}
function triCymbale(w,v,out,d){ // la crash : bruit passé au filtre aigu, longue queue
  const n=triBruit(w,d),f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=3600;
  const g=triEnv(w,.2*v,.002,d*.9);n.connect(f);f.connect(g);g.connect(out);
}
function triClac(w,v,out){ // le claquement sec de l'attaque (bruit médium, 90 ms) : c'est lui qu'on SENT sur le drop
  const n=triBruit(w,.12),f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=1900;f.Q.value=.7;
  const g=triEnv(w,.32*v,.001,.09);n.connect(f);f.connect(g);g.connect(out);
}
function triImpact(w,v){ // LE DROP : boum + claquement + cymbale (v : 0..1, la force)
  const out=triSortie();if(!out)return;
  triBoum(w,v,out);triClac(w,v,out);triCymbale(w,v,out,v>.9?2:1.4);
  TRIEDIT.n++;TRIEDIT.dern='impact';
}
function triMonte(w,d,v){ // la MONTÉE : un souffle qui s'ouvre (300 → 9 000 Hz) + un sifflement qui grimpe, coupés net à la fin
  const out=triSortie();if(!out)return;
  const f=d-.02,n=triBruit(w,d),b=AC.createBiquadFilter();b.type='bandpass';b.Q.value=3.2;
  b.frequency.setValueAtTime(300,w);b.frequency.exponentialRampToValueAtTime(9000,w+f);
  const g=AC.createGain();g.gain.setValueAtTime(.0001,w);g.gain.exponentialRampToValueAtTime(.17*v,w+f*.96);g.gain.linearRampToValueAtTime(0,w+f+.01);
  n.connect(b);b.connect(g);g.connect(out);
  const o=AC.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(170,w);o.frequency.exponentialRampToValueAtTime(1500,w+f);
  const l=AC.createBiquadFilter();l.type='lowpass';l.frequency.value=2600;
  const g2=AC.createGain();g2.gain.setValueAtTime(.0001,w);g2.gain.exponentialRampToValueAtTime(.04*v,w+f*.96);g2.gain.linearRampToValueAtTime(0,w+f+.01);
  o.connect(l);l.connect(g2);g2.connect(out);o.start(w);o.stop(w+d);
  TRIEDIT.dern='montee';
}
function triClaire(w,v,out){ // un coup de caisse claire : bruit médium + un corps à 190 Hz
  const n=triBruit(w,.2),f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=2600;f.Q.value=.9;
  const g=triEnv(w,.36*v,.001,.11);n.connect(f);f.connect(g);g.connect(out);
  if(triCharge()>=1)return; /* téléphone chaud : le coup sans son corps (voir LE TÉLÉPHONE) */
  const o=AC.createOscillator();o.type='triangle';o.frequency.setValueAtTime(220,w);o.frequency.exponentialRampToValueAtTime(140,w+.07);
  const g2=triEnv(w,.2*v,.001,.07);o.connect(g2);g2.connect(out);o.start(w);o.stop(w+.12);
}
function triRoule(w,pas,nb,v0,v1){ // un ROULEMENT de caisse claire : nb coups espacés de `pas` secondes, de plus en plus forts (v0 → v1)
  const out=triSortie();if(!out)return;
  for(let i=0;i<nb;i++)triClaire(w+i*pas,v0+(v1-v0)*(nb>1?i/(nb-1):1),out);
  TRIEDIT.dern='roulement';
}
function triDescente(w){ // la sortie de frénésie : un grave qui TOMBE (120 → 32 Hz) + un souffle qui se ferme, doux
  const out=triSortie();if(!out)return;
  const o=AC.createOscillator();o.type='sine';o.frequency.setValueAtTime(120,w);o.frequency.exponentialRampToValueAtTime(32,w+.5);
  const g=triEnv(w,.3,.01,.55);o.connect(g);g.connect(out);o.start(w);o.stop(w+.7);
  const n=triBruit(w,.6),f=AC.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(5000,w);f.frequency.exponentialRampToValueAtTime(200,w+.5);
  const g2=triEnv(w,.12,.01,.5);n.connect(f);f.connect(g2);g2.connect(out);
  TRIEDIT.dern='descente';
}
/* ---- LA MUSIQUE QUI SE TRANSFORME (Pouce bleu : f = passe-bas, e = gain de sortie) ---- */
function triCoupe(p,w,d){ // la COUPURE : d secondes de quasi-silence, filtre fermé, puis le retour d'un coup — plus fort (×1,25), qui retombe en 0,3 s
  const ch=p.ch,e=ch.e.gain,f=ch.f.frequency,w1=w+d;
  try{
    e.cancelScheduledValues(w);e.setValueAtTime(.937,w);e.linearRampToValueAtTime(.02,w+.015);e.setValueAtTime(.02,w1);
    e.setValueAtTime(1.17,w1+.001);e.setTargetAtTime(.937,w1+.05,.2);
    if(p.tIntro<=AC.currentTime){ // pas pendant l'intro de la course (le filtre y est à elle)
      f.cancelScheduledValues(w);f.setValueAtTime(18000,w);f.exponentialRampToValueAtTime(500,w+.015);f.setValueAtTime(500,w1);
      f.exponentialRampToValueAtTime(18000,w1+.45);}
  }catch(x){}
}
function triRend(){ // on rend la musique à son état : filtre ouvert, niveau d'origine
  const p=triPb();if(!p)return;const t=AC.currentTime;
  try{p.ch.e.gain.cancelScheduledValues(t);p.ch.e.gain.setTargetAtTime(.937,t,.03);
    p.ch.f.frequency.cancelScheduledValues(t);p.ch.f.frequency.setTargetAtTime(18000,t,.04);p.ch.f.Q.cancelScheduledValues(t);p.ch.f.Q.setTargetAtTime(.6,t,.04);}catch(x){}
}
function triChaud(on){ // LES GRAVES SATURÉS : une copie des graves de la musique (< 140 Hz) poussée dans la saturation, remélangée à la sortie
  const p=triPb(),t=AC?AC.currentTime:0;
  if(on){
    if(!p||TRIEDIT.ch||triCharge()>=2)return; /* téléphone critique : pas de graves saturés (voir LE TÉLÉPHONE) */
    try{const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=140;lp.Q.value=.7;
      const sh=AC.createWaveShaper();sh.curve=triSat();sh.oversample=triOver();
      const lp2=AC.createBiquadFilter();lp2.type='lowpass';lp2.frequency.value=1100;lp2.Q.value=.5; /* les harmoniques de la saturation, sans le grésillement */
      const gh=AC.createGain();gh.gain.value=0;
      p.ch.g.connect(lp);lp.connect(sh);sh.connect(lp2);lp2.connect(gh);gh.connect(p.ch.e); /* dans `e` : la coupure du drop les emporte avec la musique */
      gh.gain.setTargetAtTime(TRIEDIT.chaud,t,.4);
      TRIEDIT.ch={src:p.ch.g,lp:lp,sh:sh,lp2:lp2,gh:gh};}catch(x){TRIEDIT.ch=null;}
    return;}
  const c=TRIEDIT.ch;if(!c)return;TRIEDIT.ch=null;
  try{c.gh.gain.setTargetAtTime(0,t,.12);}catch(x){}
  setTimeout(function(){try{c.src.disconnect(c.lp);}catch(x){}try{c.gh.disconnect();}catch(x){}},900);
}
function triSilence(){ // la frénésie finit en pleine montée : le souffle, le roulement et l'impact PROGRAMMÉS ne doivent pas sonner après elle — on ferme leur départ et on en pose un neuf
  const g=TRIEDIT.g;if(!g)return;TRIEDIT.g=null;
  try{const t=AC.currentTime;g.gain.cancelScheduledValues(t);g.gain.setTargetAtTime(0,t,.015);}catch(x){}
  setTimeout(function(){try{g.disconnect();}catch(x){}},3000);
}
function triBpm(){ // le tempo du morceau en cours (le lecteur le connaît), borné
  const p=triPb();let b=120;try{if(p&&p.J&&p.J.bpm)b=+p.J.bpm()||120;}catch(x){}
  return Math.max(80,Math.min(170,b));
}
function triBuild(tD){ // programme UNE montée qui finit par le drop à l'heure tD : 2 mesures de tension, la coupure, l'impact
  const bar=240/triBpm(),d0=.14,tB=Math.max(AC.currentTime+.02,tD-2*bar),p=triPb();
  TRIEDIT.bar=bar;
  triMonte(tB,tD-d0-tB,1);
  /* le roulement : croches sur les 2 premiers temps de la dernière mesure, doubles sur le 3e, triples sur le 4e (arrêtés avant la coupure) */
  const r0=tD-bar;
  if(r0>=tB){triRoule(r0,bar/8,4,.25,.55);triRoule(r0+bar/2,bar/16,4,.55,.8);
    const p4=bar/32,nb=Math.max(2,Math.floor((bar/4-d0-.03)/p4));triRoule(r0+bar*.75,p4,nb,.8,1);}
  if(p){const ch=p.ch,f=ch.f.frequency,q=ch.f.Q;
    try{if(p.tIntro<=AC.currentTime){f.cancelScheduledValues(tB);f.setValueAtTime(18000,tB);f.exponentialRampToValueAtTime(650,tD-d0);
        q.cancelScheduledValues(tB);q.setValueAtTime(.6,tB);q.linearRampToValueAtTime(5,tD-d0);q.setValueAtTime(.6,tD);}}catch(x){}
    triCoupe(p,tD-d0,d0);}
  triImpact(tD,1);
  TRIEDIT.vis.push(tD);
}
function triEditTick(){ // toutes les 50 ms : la prochaine montée part 1 s avant son début ; les ondes du ciel claquent à l'heure du drop
  if(!TRIEDIT.act||!AC||AC.state!=='running')return;
  const now=AC.currentTime;
  if(!TRIEDIT.ch&&triPb())triChaud(true); /* Pouce bleu arrive après l'entrée (chargement tardif) : les graves saturés suivent */
  while(TRIEDIT.tDrop-2*TRIEDIT.bar<now+.1)TRIEDIT.tDrop+=TRIEDIT.cycle; /* en retard (onglet figé) : on saute les cycles passés, pas de drop à contretemps */
  if(now>TRIEDIT.tDrop-2*TRIEDIT.bar-1&&TRIEDIT.tBuild<TRIEDIT.tDrop){TRIEDIT.tBuild=TRIEDIT.tDrop;triBuild(TRIEDIT.tDrop);TRIEDIT.tDrop+=TRIEDIT.cycle;}
  while(TRIEDIT.vis.length&&now>=TRIEDIT.vis[0]){TRIEDIT.vis.shift();
    try{lvlBlast();}catch(x){}try{hap([22]);}catch(x){}}
}
function triEditDebut(){ // la frénésie commence : coupure, drop, graves saturés, et la montée suivante au tempo du morceau
  if(!TRIEDIT.on||!SND.music||!AC||AC.state!=='running'||paused||TRIEDIT.act)return;
  const w=AC.currentTime+.03,p=triPb(),d=.12;
  TRIEDIT.act=true;TRIEDIT.vis.length=0;TRIEDIT.bar=240/triBpm();TRIEDIT.cycle=8*TRIEDIT.bar;
  if(p)triCoupe(p,w,d);
  triImpact(w+d,1);TRIEDIT.vis.push(w+d);
  triChaud(true);
  TRIEDIT.tDrop=w+d+6*TRIEDIT.bar;TRIEDIT.tBuild=0; /* le 1er drop à 6 mesures (≈ 12 s : une frénésie courte l'entend), puis toutes les 8 */
  clearInterval(TRIEDIT.iv);TRIEDIT.iv=setInterval(function(){try{triEditTick();}catch(e){}},50);
}
function triEditFin(){ // la frénésie finit : la musique est rendue à son état, les graves saturés se retirent, une descente ferme
  if(!TRIEDIT.act)return;
  TRIEDIT.act=false;clearInterval(TRIEDIT.iv);TRIEDIT.iv=0;TRIEDIT.vis.length=0;
  try{triRend();triChaud(false);triSilence();if(!gameOver&&AC&&AC.state==='running'&&SND.music)triDescente(AC.currentTime+.02);}catch(e){}
}
window.dbgTriade=function(quoi){ /* sans argument : l'état ; 'impact' · 'monte' · 'roule' · 'descente' joue le son pour l'entendre ; 'entre' / 'sort' lance / arrête l'édit */
  if(quoi&&AC&&AC.state==='running'){const w=AC.currentTime+.05;
    if(quoi==='impact')triImpact(w,1);else if(quoi==='monte')triMonte(w,3.5,1);else if(quoi==='roule')triRoule(w,.06,8,.4,1);else if(quoi==='descente')triDescente(w);
    else if(quoi==='entre')triEditDebut();else if(quoi==='sort')triEditFin();else if(quoi==='cycle')triBuild(w+2*(240/triBpm())+.2);}
  if(quoi==='niveaux'&&TRIEDIT.ch&&triPb()){ /* le banc : RMS de la musique (avant la copie saturée) et de la copie, sur 1,5 s */
    const A=AC.createAnalyser(),B=AC.createAnalyser();A.fftSize=B.fftSize=2048;TRIEDIT.ch.src.connect(A);TRIEDIT.ch.gh.connect(B);
    const a=new Float32Array(2048),b=new Float32Array(2048);let ma=0,mb=0,n=0;
    return new Promise(function(ok){const iv=setInterval(function(){A.getFloatTimeDomainData(a);B.getFloatTimeDomainData(b);let sa=0,sb=0;for(let i=0;i<2048;i++){sa+=a[i]*a[i];sb+=b[i]*b[i];}ma=Math.max(ma,Math.sqrt(sa/2048));mb=Math.max(mb,Math.sqrt(sb/2048));
      if(++n>=15){clearInterval(iv);try{TRIEDIT.ch.src.disconnect(A);TRIEDIT.ch.gh.disconnect(B);}catch(x){}ok({musiqueRms:+ma.toFixed(4),chaudRms:+mb.toFixed(4),rapportDb:ma>0?+(20*Math.log10(mb/ma)).toFixed(1):null,gainMusique:+(triPb().ch.g.gain.value).toFixed(3)});}},100);});}
  const p=triPb();
  return {on:TRIEDIT.on,leger:TRI_LEGER,charge:triCharge(),actif:TRIEDIT.act,pouce:!!p,bpm:triBpm(),cycle:+TRIEDIT.cycle.toFixed(2),prochainDrop:+(TRIEDIT.tDrop-(AC?AC.currentTime:0)).toFixed(2),impacts:TRIEDIT.n,dernier:TRIEDIT.dern,
    chaud:!!TRIEDIT.ch,filtre:p?Math.round(p.ch.f.frequency.value):null,sortie:p?+p.ch.e.gain.value.toFixed(3):null,ac:AC?AC.state:null};
};
