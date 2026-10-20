/* LES STRIES DE VENT : des points POSÉS dans le monde (vitesse nulle), devant l'objectif et décalés de l'axe du regard — la caisse les
   traverse à pleine vitesse, le shader `pt2E` les étire dans leur vitesse RELATIVE : des filets d'air qui passent à 2-8 m de la caméra,
   avec la parallaxe que les filés 2D n'ont pas. Même programme que les étincelles (aucun de plus), fondu près de l'objectif. */
const ventN=makePool(64,1,0xfff0dc,1,true,{a:[.12,.4,1,1],etire:1,str:.05,v:.35,pr:[1.4,4.5,16,520]});
ventN.mesh.material.blending=THREE.AdditiveBlending;ventN.mesh.material.map=sparkTex;
// son PROPRE tirage (mulberry32) : ces effets purement visuels ne consomment pas le Math.random du jeu — les parcours de test
// (grand tour, pilote auto) restent identiques à ce qu'ils étaient sans eux
function nfxR(){let t=(NFX.s=(NFX.s+0x6D2B79F5)|0);t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}
/* (2026-10-09) L'ÉMISSION À LA SECONDE — les flammes d'échappement, le jet du réacteur en vol, les traits d'air et la fumée de drift
   naissaient PAR IMAGE : à 30 i/s (l'iPhone bridé) on en voyait la MOITIÉ — nitro « faiblarde », vitesse moins sentie, alors que le jeu
   se juge à 60 sur PC. `emiN` rend le nombre d'« images à 60 Hz » écoulées : 1 à 60 i/s, 2 à 30, 1,5 en moyenne à 40. JAMAIS moins d'1 :
   au-dessus de 60 (écrans 120/144 Hz) on garde l'émission d'avant au pixel près — ce qu'on voyait sur un PC rapide ne change pas. */
const EMI={};
function emiN(k,dt){const a=(EMI[k]||0)+Math.min(dt,.067)*60,n=Math.max(1,Math.round(a));EMI[k]=Math.max(-.5,a-n);return n;} // le reste reporté (−0,5 au plus) : 60 par seconde pile à 30, 40 ou 50 i/s ; au-dessus de 60, une émission par image comme avant
function nfxVent(dt,dir,kmh){ // `dir` : le sens de la course (cap au sol, vitesse en vol) — sème autour de la caméra, devant elle
  const v9=Math.max(20,kmh/3.6);NFX.vAcc+=dt*(nitroBlue?52:40)*(1+NFX.ign*NFX.ignK*1.5);
  NFX.cR.setFromMatrixColumn(camera.matrixWorld,0);NFX.cU.setFromMatrixColumn(camera.matrixWorld,1);
  while(NFX.vAcc>=1){NFX.vAcc-=1;
    const d=Math.max(9,v9*.1)+nfxR()*Math.max(18,v9*.22),cx=(nfxR()<.5?-1:1)*(2.6+nfxR()*6.5),cy=-3.2+nfxR()*6.4; // sur les CÔTÉS de l'image (le centre reste à la caisse)
    spawnP(ventN,camera.position.x+dir.x*d+NFX.cR.x*cx+NFX.cU.x*cy,camera.position.y+dir.y*d+NFX.cR.y*cx+NFX.cU.y*cy,
      camera.position.z+dir.z*d+NFX.cR.z*cx+NFX.cU.z*cy,0,0,0,.3+nfxR()*.2);
  }
}
/* <<<FEU QUI RUGIT>>> (2026-10-16, session « Effets sonores nitro et flamme » — Sacha : « il faut un bruit de flamme et de nitro beaucoup
   plus travaillé pour le nitro ; il faut que ce soit jouissif de cramer du nitro »)
   AVANT : la nitro tenue, c'était un grondement BRUN étouffé (passe-bas 620 Hz — et coupé sous 85/120 Hz depuis le « bruit assourdissant »
   du 12/10) + des « plops » bruns à 600 Hz : sur un haut-parleur de téléphone, un « ffff » sourd, toujours pareil, qui ne monte jamais.
   L'allumage avait son WHOOMP ; la coupure, quelques pops de bruit filtré.
   LE NITRO EN QUATRE TEMPS — ce qui rend le geste jouissif, c'est l'ATTENTE qui monte puis la RÉCOMPENSE de fin :
   · L'ALLUMAGE (`rugAllume`) : le PSSHT du protoxyde (bruit blanc, une bande qui descend 6,5 → 2,6 kHz : LE son du nitro) ; le coup de poitrine (subBoom), la ruée d'air et le sifflet du 2e étage sont ceux d'avant.
    · LA GORGE (`RUG.roar`) : le RUGISSEMENT de la flamme, la couche qui manquait — un bruit rose agité par deux turbulences (5 et 21 Hz :
     la flamme n'est jamais stable), percé de pointes de jet (le « crackle » d'une tuyère : des pointes positives, loi de Pareto — beaucoup
     de petites, quelques grosses), deux bosses de résonance (250 Hz le corps, 1,15 kHz la déchirure), saturé (la tôle). Une boucle de
     3,7 s jouée DEUX fois à deux endroits, l'une à gauche, l'autre à droite : large, et jamais deux fois la même seconde.
   · LA MONTÉE (`RUG.h`/`RUG.k`) : tenir le nitro, ça MONTE — en 2,5 s la flamme s'ouvre (passe-bas 700 → 1 800 Hz à 250 km/h), sa hauteur
     grimpe (≈ +4 demi-tons, plus la vitesse), elle enfle (+10 dB) et le crépitement s'épaissit ; et pendant qu'elle s'installe elle PULSE (whoum-whoum-wum-brrr :
     7 → 19 Hz, une pulsation qui accélère et s'efface) — l'allumage d'une postcombustion. Lâcher une fraction de seconde ne perd pas la
     montée (elle redescend 3 fois plus vite qu'elle ne monte).
   · LA COUPURE : la flamme se REFERME (passe-bas qui retombe à 380 Hz, 0,14 s de queue : un dernier « whouff », plus une coupure) et
     l'échappement PÈTE (`rugPetarade`) — un BANG si on a tenu, puis des « pap-pap-pap… pap » qui s'égrènent, de plus en plus espacés,
     répartis dans la stéréo ; plus on a brûlé longtemps, plus il y en a. La soupape du turbo (blowOff) part en même temps.
   Tout est CALCULÉ une fois (`rugTampons`, en morceaux après initAudio : aucun fichier, rien dans la banque), puis joué en boucle :
   les 25 « plops » par seconde d'avant (4 nœuds WebAudio chacun) sont remplacés par une boucle de crépitement (`RUG.crep`).
   Les gains suivent `dk` (les grands moments creusent le mix) et passent par les PORTES (débranchés hors nitro : coût nul).
   `?nitroson=ancien` = le son d'avant, intact. */
const RUG_SON=!/[?&]nitroson=ancien/.test(location.search);
const RUG_NIV={rg:.07,cr:.04,rr:.11,crac:.11,pssht:.015,pap:.15,bang:.2}; // (2026-10-20, Sacha : « on dirait juste du vent, je veux des flammes GRAVES ») gorge plus forte (elle est bien plus basse), crépitement et PSSHT blanc baissés // les niveaux (voir le journal : mesurés contre l'ancien au banc)
/* (2026-10-17, Léo : « dès que j'appuie, ça explose et ça fait un bruit qui n'a aucun rapport avec le boost, qui pourrait détruire les
   oreilles des joueurs — écouteurs », sur iPhone ET sur Mac). MESURÉ au banc muet avec SA sauvegarde : deux sons d'EXPLOSION se mêlaient au boost.
   · LA BOULE DE FEU à chaque appui (un BWOUMF saturé, son coup grave qui plonge 170 → 48 Hz, par-dessus le subBoom) — c'est
     une explosion, pas un boost. RETIRÉE : l'allumage garde le PSSHT, le coup de poitrine et la ruée d'air.
   · LA PANNE SÈCHE SOUS LE DOIGT (`NSEC`) : le nitro tenu vide la jauge en ~4-6 s, puis se coupe et se rallume en boucle (hystérésis à ,3)
     — à chaque coupure la pétarade (BANG + pap-pap) et la soupape, à chaque rallumage un coup d'allumage complet : une explosion toutes les
     ~1,5 s tant qu'on tient. Désormais, tant que le doigt ne s'est pas levé : la toux `nitro.sec` seule à la coupure, la gorge qui reprend
     au rallumage — la pétarade et le coup d'allumage reviennent au prochain VRAI appui / à la vraie relâche. */
const NSEC={sous:false,etage:false}; // sous : la jauge a lâché sous le doigt, et ce doigt n'est pas encore levé · etage : le 2e étage (réserve bleue) a déjà sonné pendant cet appui
/* (même jour) LE 2e ÉTAGE NE SE REJOUE PAS EN BOUCLE : un fruit ramassé nitro tenu remplit un peu la jauge, on ressort de la réserve bleue, on y
   retombe une seconde plus tard — et le coup d'allumage du 2e étage repartait à CHAQUE fruit (MESURÉ : 7 à 12 coups en 30 s de nitro tenu).
   Il sonne désormais une fois par appui ; le reste (onde, champ, couleur) suit comme avant. */
const RUG_CORPS=.45; /* (2026-10-20, Sacha : « on dirait un frottement, plus rond, plus ASMR, qui ronronne ») le bruit brun recule : c'est le RONRON qui porte */ /* (2026-10-20) le grondement brun (grave) remonte */ // le grondement brun d'avant (`jrG`, le corps de la flamme) à 70 % quand la gorge chante : sinon la tenue passait 6 dB au-dessus de l'ancienne
const RUG={pret:false,ac:null,d:null,tel:false,h:0,k:0,rs:[],cs:[],paps:null,bangs:null,blanc:null,stt:null};
function rugBq(t,f,q,g,sr){ // les coefficients d'un biquad (RBJ) : 'lp' 'hp' 'bp' 'pk'
  const w=2*Math.PI*Math.min(f,sr*.45)/sr,c=Math.cos(w),s=Math.sin(w),al=s/(2*q),A=Math.pow(10,(g||0)/40);let b0,b1,b2,a0,a1,a2;
  if(t==='lp'){b0=(1-c)/2;b1=1-c;b2=b0;a0=1+al;a1=-2*c;a2=1-al;}
  else if(t==='hp'){b0=(1+c)/2;b1=-(1+c);b2=b0;a0=1+al;a1=-2*c;a2=1-al;}
  else if(t==='bp'){b0=al;b1=0;b2=-al;a0=1+al;a1=-2*c;a2=1-al;}
  else{b0=1+al*A;b1=-2*c;b2=1-al*A;a0=1+al/A;a1=-2*c;a2=1-al/A;}
  return {b0:b0/a0,b1:b1/a0,b2:b2/a0,a1:a1/a0,a2:a2/a0,x1:0,x2:0,y1:0,y2:0};}
function rugRun(o,x){const y=o.b0*x+o.b1*o.x1+o.b2*o.x2-o.a1*o.y1-o.a2*o.y2;o.x2=o.x1;o.x1=x;o.y2=o.y1;o.y1=y;return y;}
function rugRose(){let b0=0,b1=0,b2=0;return function(){const w=Math.random()*2-1;b0=.99765*b0+w*.099046;b1=.963*b1+w*.2965164;b2=.57*b2+w*1.0526913;return (b0+b1+b2+w*.1848)*.2;};} // Kellett
function rugNorme(X,pic){let m=0;for(let i=0;i<X.length;i++){const a=Math.abs(X[i]);if(a>m)m=a;}const g=pic/(m||1);for(let i=0;i<X.length;i++)X[i]*=g;return X;}
function rugRoar(sr,dur){ // LA GORGE : la boucle du rugissement (voir l'en-tête)
  const n=Math.round(sr*dur),F=Math.round(.12*sr),N=n+F,T=new Float32Array(N),E=new Float32Array(N),R=Math.random;
  {let a=0,b=0,c=0,d=0,s1=0,s2=0;const k1=1-Math.exp(-2*Math.PI*5/sr),k2=1-Math.exp(-2*Math.PI*21/sr),e2=new Float32Array(N);
   for(let i=0;i<N;i++){a+=(R()*2-1-a)*k1;b+=(a-b)*k1;c+=(R()*2-1-c)*k2;d+=(c-d)*k2;E[i]=b;e2[i]=d;s1+=b*b;s2+=d*d;}
   s1=Math.sqrt(s1/N)||1;s2=Math.sqrt(s2/N)||1;
   for(let i=0;i<N;i++)E[i]=Math.max(.12,Math.min(1.45,.62+.26*E[i]/s1+.17*e2[i]/s2));} // la TURBULENCE : la flamme n'est jamais stable
  const rose=rugRose(),hp=rugBq('hp',105,.7,0,sr),pA=rugBq('pk',250,.9,6,sr),pB=rugBq('pk',1150,.8,3.5,sr),lp=rugBq('lp',5200,.7,0,sr);
  const dec=Math.exp(-1/(sr*.00045)),pc=70/sr;let cr=0,s=0;
  for(let i=0;i<N;i++){if(R()<pc)cr+=Math.min(1.1,.06*Math.pow(R()+1e-6,-1/1.7));cr*=dec; // les POINTES DE JET (Pareto)
    const y=rugRun(lp,rugRun(pB,rugRun(pA,rugRun(hp,(rose()+cr*.55)*E[i]))));T[i]=y;s+=y*y;}
  s=Math.sqrt(s/N)||1;let s2=0;
  for(let i=0;i<N;i++){T[i]=Math.tanh(T[i]/s*.55);s2+=T[i]*T[i];} // la TÔLE : saturation douce
  const g=.25/(Math.sqrt(s2/N)||1),X=new Float32Array(n);
  for(let i=0;i<n;i++)X[i]=T[i]*g;
  for(let i=0;i<F;i++){const a=i/F;X[i]=(T[i]*Math.sin(a*Math.PI/2)+T[n+i]*Math.cos(a*Math.PI/2))*g;} // la COUTURE : la boucle n'a pas de clic
  return X;}
function rugCrep(sr,dur){ // LE CRÉPITEMENT : la boucle des pops (une queue qui dépasse la fin repart au début : couture parfaite)
  const n=Math.round(sr*dur),X=new Float32Array(n),R=Math.random;
  const pose=function(t0,L,f){for(let j=0;j<L;j++)X[(t0+j)%n]+=f(j);};
  for(let k=0,nt=Math.round(32*dur);k<nt;k++){const L=sr*(.0003+R()*.0009),a=.05+.22*Math.pow(R(),3),h=rugBq('hp',2600,.7,0,sr); // les TICS : le grésillement
    pose((R()*n)|0,Math.round(L*5),function(j){return rugRun(h,(R()*2-1)*a*Math.exp(-j/L));});}
  for(let k=0,np=Math.round(11*dur);k<np;k++){const L=sr*(.0015+R()*.005),a=Math.min(1,.16*Math.pow(R()+1e-6,-.55)),b=rugBq('bp',600+R()*1500,1.4,0,sr); // les POPS
    pose((R()*n)|0,Math.round(L*5),function(j){return rugRun(b,(R()*2-1))*a*Math.exp(-j/L)*(1-Math.exp(-j/(sr*.0002)))*2.2;});}
  for(let k=0,nq=Math.round(1.4*dur);k<nq;k++){const L=sr*.012,a=.5+.5*R(),l=rugBq('lp',1100,.7,0,sr),f0=120+R()*60;let ph=0; // les PAPS : la bouffée sourde
    pose((R()*n)|0,Math.round(L*5),function(j){ph+=2*Math.PI*f0/sr;return (rugRun(l,R()*2-1)*1.6+Math.sin(ph)*.25)*a*Math.exp(-j/L)*(1-Math.exp(-j/(sr*.0004)));});}
  let s=0;for(let i=0;i<n;i++)s+=X[i]*X[i];const g=.1/(Math.sqrt(s/n)||1);for(let i=0;i<n;i++)X[i]=Math.tanh(X[i]*g*2.2)/2.2; // −20 dB RMS, crêtes arrondies
  return X;}
function rugPap(sr,gros){ // un PET d'échappement : le CLAC, le PAP (bande), la bouffée, le coup sourd
  const n=Math.round(sr*(gros?.32:.12)),X=new Float32Array(n),R=Math.random;
  const bp=rugBq('bp',gros?420+R()*200:560+R()*420,1.2,0,sr),lp=rugBq('lp',gros?1500:2400,.7,0,sr),hc=rugBq('hp',2000,.7,0,sr);
  const fq=gros?150:110+R()*40,f1=gros?50:80;let ph=0;
  for(let i=0;i<n;i++){const t=i/sr,a=1-Math.exp(-t/.0003);
    let x=rugRun(hc,R()*2-1)*Math.exp(-t/.0009)*.9;
    x+=rugRun(bp,R()*2-1)*Math.exp(-t/(gros?.03:.011))*a*2.4;
    x+=rugRun(lp,R()*2-1)*Math.exp(-t/(gros?.06:.02))*a*(gros?1.2:.5);
    const f=f1+(fq-f1)*Math.exp(-t/(gros?.07:.03));ph+=2*Math.PI*f/sr;x+=Math.sin(ph)*Math.exp(-t/(gros?.09:.03))*(gros?1:.55)*a;
    X[i]=Math.tanh(x*(gros?2:1.7));}
  const F=Math.round(.01*sr);for(let i=0;i<F;i++)X[n-1-i]*=i/F;
  return rugNorme(X,.95);}
function rugTampons(ac,d,o){ // calcule les tampons et branche le graphe, EN MORCEAUX (un par tâche : jamais un long gel au premier toucher)
  if(RUG.ac)return;RUG.ac=ac;RUG.d=d;RUG.tel=!!o.tel;RUG.stt=o.stt||function(p,v,t,tc){p.setTargetAtTime(v,t,tc);};
  const sr=24000,mk=function(X){const b=ac.createBuffer(1,X.length,sr);b.getChannelData(0).set(X);return b;};
  const pan=function(v){if(!ac.createStereoPanner)return ac.createGain();const p=ac.createStereoPanner();p.pan.value=v;return p;};
  const kr=function(p){try{p.automationRate='k-rate';}catch(e){}}; // piloté à chaque image : k-rate (voir initAudio)
  const etapes=[
    function(){ // la GORGE + la PULSATION
      const b=mk(rugRoar(sr,3.7));
      RUG.rgF=ac.createBiquadFilter();RUG.rgF.type='lowpass';RUG.rgF.frequency.value=650;RUG.rgF.Q.value=.55;kr(RUG.rgF.frequency);
      RUG.rgF2=ac.createBiquadFilter();RUG.rgF2.type='lowpass';RUG.rgF2.frequency.value=850;RUG.rgF2.Q.value=.6;kr(RUG.rgF2.frequency); // deux passe-bas : la pente raide (−24 dB/oct.) — le mordant vient du crépitement, jamais d'un souffle aigu continu (la fatigue vit à 2-4 kHz)
      const h=ac.createBiquadFilter();h.type='highpass';h.frequency.value=RUG.tel?150:40;h.Q.value=.7; // un téléphone ne rend rien sous 150 Hz : ce grave ne ferait que pomper le compresseur
      RUG.rgG=ac.createGain();RUG.rgG.gain.value=0;
      for(let c=0;c<2;c++){const s=ac.createBufferSource();s.buffer=b;s.loop=true;const p=pan(c?.55:-.55);s.connect(p);p.connect(RUG.rgF);s.start(0,c?b.duration*.47:0);RUG.rs.push(s);}
      RUG.rgF.connect(RUG.rgF2);RUG.rgF2.connect(h);h.connect(RUG.rgG);RUG.rgG.connect(d);
      RUG.thO=ac.createOscillator();RUG.thO.type='sine';RUG.thO.frequency.value=7;kr(RUG.thO.frequency);
      RUG.thG=ac.createGain();RUG.thG.gain.value=0;RUG.thO.connect(RUG.thG);RUG.thG.connect(RUG.rgG.gain);RUG.thO.start();
      if(o.porte)o.porte(RUG.rgG,d,RUG.thG);},
    function(){ // le CRÉPITEMENT
      const b=mk(rugCrep(sr,3.3));
      RUG.crF=ac.createBiquadFilter();RUG.crF.type='highpass';RUG.crF.frequency.value=RUG.tel?300:120;RUG.crF.Q.value=.7;
      RUG.crG=ac.createGain();RUG.crG.gain.value=0;
      for(let c=0;c<2;c++){const s=ac.createBufferSource();s.buffer=b;s.loop=true;const p=pan(c?.35:-.35);s.connect(p);p.connect(RUG.crF);s.start(0,c?b.duration*.53:0);RUG.cs.push(s);}
      RUG.crF.connect(RUG.crG);RUG.crG.connect(d);
      if(o.porte)o.porte(RUG.crG,d);
      RUG.pret=true;},
    function(){ // l'allumage
      const w=new Float32Array(Math.round(sr*.3));for(let i=0;i<w.length;i++)w[i]=Math.random()*2-1;RUG.blanc=mk(w);
      },
    function(){ // (2026-10-20) LE RONRON + LES CRÉPITEMENTS DE BOIS (voir rrPas)
      rrConstruit(ac,d,sr,mk,pan,kr,o);},
    function(){ // la pétarade
      RUG.paps=[mk(rugPap(sr,0)),mk(rugPap(sr,0)),mk(rugPap(sr,0)),mk(rugPap(sr,0)),mk(rugPap(sr,0))];RUG.bangs=[mk(rugPap(sr,1)),mk(rugPap(sr,1))];}];
  let i=0;const suite=function(){try{etapes[i++]();}catch(e){console.warn('feu qui rugit',e);return;}if(i<etapes.length)setTimeout(suite,o.vite?0:30);};
  if(o.vite)for(;i<etapes.length;)etapes[i++]();else setTimeout(suite,60);}
function rugPas(dt,o){ // à chaque image : o = {on, air, bleu, v (km/h), dk}
  if(!RUG.pret)return;const t=RUG.ac.currentTime,S=RUG.stt,on=!!o.on,b=o.bleu?1:0,air=o.air?1:0,v=Math.max(0,o.v||0);
  RUG.h=on?Math.min(4,RUG.h+dt):Math.max(0,RUG.h-dt*3);const k=RUG.k=1-Math.exp(-RUG.h/.9); // LA MONTÉE : 63 % en 0,9 s, 93 % en 2,4 s — elle continue APRÈS la queue de l'allumage
  const gR=on?RUG_NIV.rg*(.3+.7*k)*(air?.85:1)*(1+.15*b)*o.dk:0;
  S(RUG.rgG.gain,gR,t,on?.06:.14); // coupée : 0,14 s de queue
  const fc=on?Math.min(650,240+180*k+v*.12+b*80):150; /* (2026-10-20) GRAVE : la flamme ne s'ouvre plus jusqu'à 3 kHz (c'était le « vent ») */S(RUG.rgF.frequency,fc,t,on?.09:.12);S(RUG.rgF2.frequency,fc*1.3,t,on?.09:.12); // elle S'OUVRE en montant (700 → 1 800 Hz à 250 km/h) ; coupée, elle se referme — le dernier « whouff »
  const r=on?.62+.12*k+Math.min(.1,v/4000)+b*.05:.55; /* (2026-10-20) la boucle jouée plus lentement : tout le rugissement descend */S(RUG.rs[0].playbackRate,r,t,.12);S(RUG.rs[1].playbackRate,r*1.013,t,.12); // la hauteur MONTE (≈ +4 demi-tons) et suit la vitesse
  S(RUG.thO.frequency,7+12*k,t,.05);S(RUG.thG.gain,on?gR*.45*(1-k):0,t,.06); // la PULSATION accélère et s'efface
  S(RUG.crG.gain,on?RUG_NIV.cr*(.3+.7*k)*(air?.75:1)*o.dk:0,t,on?.06:.1);
  rrPas(dt,o,on,b,air,v);
  const rc=on?.6+.2*k+b*.08:.6; /* (2026-10-20) crépitement plus grave */S(RUG.cs[0].playbackRate,rc,t,.1);S(RUG.cs[1].playbackRate,rc*.97,t,.1);} // plus chaude, elle crépite plus vite et plus clair
/* ===== LE RONRON DU NITRO (2026-10-20, Sacha : « on dirait plus un frottement, essaie plus rond, plus ASMR, qui ronronne, avec des
   variations : si on appuie longtemps ça change ; il faut qu'il y ait des crépitements et tout ») =====
   Le cœur du son n'est plus du BRUIT (le frottement) mais un TON grave et rond : deux triangles (fondamentale + octave) et une quinte sinus,
   saturés doucement, sous un passe-bas — et HACHÉS par une pulsation (le RONRON : 13 → 26 Hz, le grain d'un chat ou d'un V8 au ralenti).
   Par-dessus, des CRÉPITEMENTS de feu de bois (tics secs + pops boisés, chacun à sa place dans la stéréo) posés un par un.
   TROIS TEMPS si on tient (RR.tH, le temps tenu, remis à zéro 0,35 s après le lâcher) :
   · 0-1 s    : le ronron s'installe, lent et doux (44 Hz, pulsation 13 Hz), quelques crépitements ;
   · 1-2,5 s  : il MONTE — la hauteur grimpe (≈ +5 demi-tons), la pulsation accélère, le filtre s'ouvre, le feu prend (crépitements ×2) ;
   · après 2,5 s : PLEIN RÉGIME — de grandes houles lentes (0,3 Hz) qui gonflent et dégonflent, un vibrato, des RAFALES de crépitements.
   La réserve bleue joue une quinte plus haut. Le téléphone (pas de grave sous 150 Hz) joue tout une octave plus haut. */
/* (2026-10-20 soir, Léo : « un audio parfois sur mon tel et mon ordi, qu'il n'y a pas sur le tel ni l'ordi de Sacha, sur le main — lié au boost,
   un son qui n'a rien à voir ») LE RONRON NE VIT PLUS DANS LE SUB. MESURÉ au banc muet avec SA sauvegarde (vu-mètre dbgVu, tenue de 5 s) :
   la chaîne du ronron sortait à −23/−26 dB RMS — ~10 dB AU-DESSUS de la gorge du nitro (−35) et 12-15 dB au-dessus du grondement
   (−40/−44), aussi fort que tout le moteur — et tout ce niveau tenait entre 22 Hz (la sous-octave `sine ×.5`) et 86 Hz. Un haut-parleur
   d'ordi ou d'iPhone ne rend rien là-dessous : Sacha, sur ses enceintes, n'entendait rien de plus ; Léo, au casque, recevait un bourdon
   grave qui vrombit (haché à 13 → 28 Hz, vibrato, houles) sans rapport avec la flamme. Désormais : (1) un passe-haut à 70 Hz sur la chaîne
   (la sous-octave et le 44 Hz s'effacent, les harmoniques 88-176 Hz qui font le « ronron » restent, le téléphone — déjà une octave plus
   haut — ne change pas) ; (2) le niveau `rr` ,11 → ,045 : le ronron se range au rang de la gorge (mesuré après : −33/−36 dB), il porte
   encore, il ne couvre plus. Les trois temps, les houles, le vibrato, les crépitements : intacts. `?ronron=ancien` = v740 tel quel ;
   `?ronron=0` = muet (A/B). dbgRonron() rend aussi `hp`. */
const RR_MODE=(/[?&]ronron=(ancien|0)\b/.exec(location.search)||[])[1]||'';
const RR_ON=RR_MODE!=='0';
if(RR_MODE!=='ancien')RUG_NIV.rr=.045;
const RR={pret:false,tH:0,off:0,crT:0,raf:0,ph:0};
function rrCrac(sr,pop){const R=Math.random,n=Math.round(sr*(pop?.06:.016)),X=new Float32Array(n);
  if(!pop){const bp=rugBq('bp',1300+R()*2200,.9,0,sr),tau=sr*(.0006+R()*.0016);for(let i=0;i<n;i++)X[i]=rugRun(bp,R()*2-1)*Math.exp(-i/tau);}
  else{const lp=rugBq('lp',500+R()*400,.8,0,sr),f0=120+R()*70;let ph=0;for(let i=0;i<n;i++){const t=i/sr,a=1-Math.exp(-t/.0005);ph+=2*Math.PI*(f0*(.6+.4*Math.exp(-t/.02)))/sr;
    X[i]=(rugRun(lp,R()*2-1)*1.4*Math.exp(-t/.008)+Math.sin(ph)*.8*Math.exp(-t/.018))*a;}}
  const F=Math.round(.002*sr);for(let i=0;i<F;i++)X[n-1-i]*=i/F;return rugNorme(X,.9);}
function rrConstruit(ac,d,sr,mk,pan,kr,o){
  RR.o=[];const mix=ac.createGain();mix.gain.value=1;
  for(const [ty,m,g] of [['triangle',1,1],['triangle',2,.42],['sine',1.5,.22],['sine',.5,.5]]){const os=ac.createOscillator();os.type=ty;os.frequency.value=44*m;kr(os.frequency);
    const og=ac.createGain();og.gain.value=g;os.connect(og);og.connect(mix);os.start();RR.o.push([os,m]);}
  const sh=ac.createWaveShaper(),cv=new Float32Array(512);for(let i=0;i<512;i++){const x=i/511*2-1;cv[i]=Math.tanh(1.8*x)/Math.tanh(1.8);}sh.curve=cv;sh.oversample='2x';
  RR.lp=ac.createBiquadFilter();RR.lp.type='lowpass';RR.lp.frequency.value=320;RR.lp.Q.value=.9;kr(RR.lp.frequency);
  RR.am=ac.createGain();RR.am.gain.value=.6; /* le ronron : la pulsation hache le ton */
  RR.pO=ac.createOscillator();RR.pO.type='sine';RR.pO.frequency.value=13;kr(RR.pO.frequency);RR.pG=ac.createGain();RR.pG.gain.value=.4;RR.pO.connect(RR.pG);RR.pG.connect(RR.am.gain);RR.pO.start();
  RR.hl=ac.createGain();RR.hl.gain.value=1; /* les houles du plein régime */
  RR.hO=ac.createOscillator();RR.hO.type='sine';RR.hO.frequency.value=.3;RR.hG=ac.createGain();RR.hG.gain.value=0;RR.hO.connect(RR.hG);RR.hG.connect(RR.hl.gain);RR.hO.start();
  RR.vO=ac.createOscillator();RR.vO.frequency.value=4.7;RR.vG=ac.createGain();RR.vG.gain.value=0;RR.vO.connect(RR.vG);for(const [os] of RR.o)RR.vG.connect(os.detune);RR.vO.start();
  RR.g=ac.createGain();RR.g.gain.value=0;
  RR.hp=null;if(RR_MODE!=='ancien'){RR.hp=ac.createBiquadFilter();RR.hp.type='highpass';RR.hp.frequency.value=70;RR.hp.Q.value=.7;} /* (2026-10-20 soir) le sub part : voir RR_MODE */
  mix.connect(sh);sh.connect(RR.lp);RR.lp.connect(RR.am);RR.am.connect(RR.hl);if(RR.hp){RR.hl.connect(RR.hp);RR.hp.connect(RR.g);}else RR.hl.connect(RR.g);RR.g.connect(d);
  if(o.porte)o.porte(RR.g,d);
  RR.tics=[];RR.pops=[];for(let i=0;i<8;i++)RR.tics.push(mk(rrCrac(sr,0)));for(let i=0;i<5;i++)RR.pops.push(mk(rrCrac(sr,1)));
  RR.pan=pan;RR.pret=true;}
function rrCraque(t,pop,vol){const ac=RUG.ac,s=ac.createBufferSource(),L=pop?RR.pops:RR.tics;s.buffer=L[(Math.random()*L.length)|0];s.playbackRate.value=.85+.3*Math.random();
  const g=ac.createGain();g.gain.value=vol;const p=RR.pan((Math.random()-.5)*1.4);s.connect(g);g.connect(p);p.connect(RUG.d);s.start(t);}
function rrPas(dt,o,on,b,air,v){
  if(!RR.pret||!RR_ON)return;const t=RUG.ac.currentTime,S=RUG.stt;
  if(on){RR.tH+=dt;RR.off=0;}else{RR.off+=dt;if(RR.off>.35)RR.tH=0;}
  const T=RR.tH,m1=Math.min(1,T/1),m2=Math.max(0,Math.min(1,(T-1)/1.5)),m3=Math.max(0,Math.min(1,(T-2.5)/1.5)); /* les trois temps */
  const oct=RUG.tel?2:1,f=(44*Math.pow(2,(5*m2+1.5*m3)/12)+Math.min(10,v*.012))*(b?1.5:1)*oct;
  for(const [os,mm] of RR.o)S(os.frequency,f*mm,t,.18);
  S(RR.lp.frequency,(260+220*m2+160*m3+(b?120:0))*oct,t,.2);
  S(RR.pO.frequency,13+8*m2+5*m3+3*Math.sin(t*.9)*m3,t,.15);S(RR.pG.gain,.42-.08*m3,t,.2);
  S(RR.hG.gain,.32*m3,t,.3);S(RR.vG.gain,9*m3,t,.3);
  S(RR.g.gain,on?RUG_NIV.rr*(.45+.35*m1+.2*m2)*(air?.85:1)*o.dk:0,t,on?(T<.3?.12:.08):.16); /* lâché : le ronron s'éteint en ~0,4 s */
  if(on){ /* LES CRÉPITEMENTS : de plus en plus serrés, puis des rafales */
    const tx=(3+7*m1+8*m2+6*m3)*(air?.7:1);RR.crT+=dt*tx;
    while(RR.crT>=1){RR.crT-=1+(Math.random()-.5)*.6;const pop=Math.random()<.22;rrCraque(t+Math.random()*.04,pop,RUG_NIV.crac*(pop?.9:.5+.5*Math.random())*o.dk);}
    if(m3>0&&Math.random()<dt*.6*m3){for(let i=0,n=3+(Math.random()*4|0);i<n;i++)rrCraque(t+.02+i*(.025+Math.random()*.03),Math.random()<.3,RUG_NIV.crac*.7*o.dk);}
  }}
window.dbgRonron=function(){return {pret:RR.pret,mode:RR_MODE||'regle',hp:RR.hp?RR.hp.frequency.value:0,tenu:+RR.tH.toFixed(2),gain:RR.g?+RR.g.gain.value.toFixed(4):null,hz:RR.o?+RR.o[0][0].frequency.value.toFixed(1):null,pulse:RR.pO?+RR.pO.frequency.value.toFixed(1):null};};
function rugAllume(k,bleu,air){ // LE PSSHT (le reste du coup d'allumage est dans nitroWhoomp)
  if(!RUG.blanc)return false;const ac=RUG.ac,t0=ac.currentTime;
  {const s=ac.createBufferSource();s.buffer=RUG.blanc;const f=ac.createBiquadFilter();f.type='bandpass';f.Q.value=1.3;
   f.frequency.setValueAtTime(bleu?7600:6500,t0);f.frequency.exponentialRampToValueAtTime(2600,t0+.18);
   const g=ac.createGain();g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(Math.max(.0002,RUG_NIV.pssht*k),t0+.004);g.gain.exponentialRampToValueAtTime(.001,t0+.22);
   s.connect(f);f.connect(g);g.connect(RUG.d);s.start(t0);s.stop(t0+.25);}
  return true;}
function rugPetarade(q){ // LA PÉTARADE de la coupure : q 0..1, ce qu'on a brûlé
  if(!RUG.paps)return false;const ac=RUG.ac,t0=ac.currentTime+.02,R=Math.random;let t=0;
  const joue=function(b,dt,v,p){const s=ac.createBufferSource();s.buffer=b;s.playbackRate.value=.9+.2*R();const g=ac.createGain();g.gain.value=v;s.connect(g);
    let x=g;if(ac.createStereoPanner){x=ac.createStereoPanner();x.pan.value=p;g.connect(x);}x.connect(RUG.d);s.start(t0+dt);};
  if(q>.3){joue(RUG.bangs[(R()*RUG.bangs.length)|0],0,RUG_NIV.bang*(.7+.3*q),(R()-.5)*.3);t=.075+R()*.03;}
  for(let i=0,n=2+Math.round(q*5+R()*1.5);i<n;i++){joue(RUG.paps[(R()*RUG.paps.length)|0],t,RUG_NIV.pap*Math.pow(.84,i)*(.7+.3*R()),(R()-.5)*.8);t+=.04+.025*R()+i*i*.006;}
  return true;}
window.dbgRug=function(){const r=function(p,n){return p?+p.value.toFixed(n):null;};return {son:RUG_SON,pret:RUG.pret,tampons:!!(RUG.blanc&&RUG.paps),h:+RUG.h.toFixed(2),k:+RUG.k.toFixed(2),gorge:r(RUG.rgG&&RUG.rgG.gain,4),crepite:r(RUG.crG&&RUG.crG.gain,4),pulse:r(RUG.thO&&RUG.thO.frequency,1),fc:r(RUG.rgF&&RUG.rgF.frequency,0)};}; // l'état du rugissement (banc, console)
/* <<<FIN FEU QUI RUGIT>>> */
function nitroWhoomp(k,bleu,air){ // LE « WHOOMP » d'allumage — 8 à 10 nœuds, tous arrêtés en moins d'une seconde (rien ne s'empile)
  if(!sfxOk())return;
  const n9=performance.now();if(n9-NFX.sT<150)return;NFX.sT=n9; // une rafale de taps ne fait pas une rafale de souffles
  try{
    const t0=AC.currentTime;
    // 1) LE SOUFFLE QUI S'OUVRE : bruit BRUN (rond, jamais un chuintement), passe-bas qui s'ouvre d'un coup puis se referme
    // (2026-10-16) LE FEU QUI RUGIT le remplace : le PSSHT du protoxyde puis la BOULE DE FEU (rugAllume) — celui-ci reste pour ?nitroson=ancien
    if(!(RUG_SON&&rugAllume(k,bleu,air))){
    const s=AC.createBufferSource();s.buffer=brownBuf(1);
    const f=AC.createBiquadFilter();f.type='lowpass';f.Q.value=1.4;
    f.frequency.setValueAtTime(TEL_NATIF?420:170,t0);f.frequency.exponentialRampToValueAtTime(bleu?3600:2600,t0+.09);
    f.frequency.exponentialRampToValueAtTime(TEL_NATIF?700:420,t0+.75);
    const g=AC.createGain();g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.42*k,t0+.025);g.gain.exponentialRampToValueAtTime(.001,t0+.85);
    s.connect(f);f.connect(g);g.connect(MASTER);s.start(t0);s.stop(t0+.9);}
    // 2) LE COUP DE POITRINE (le « MP ») — subBoom : dédoublonné et calé pour le haut-parleur du téléphone
    subBoom((air?.2:.26)*k);
    // 3) LA RUÉE D'AIR : bande de bruit blanc qui MONTE — la vitesse qui arrive (c'est elle qu'un haut-parleur de téléphone rend)
    const s2=AC.createBufferSource();s2.buffer=noiseBuf(.6);
    const b=AC.createBiquadFilter();b.type='bandpass';b.Q.value=.9;b.frequency.setValueAtTime(900,t0);b.frequency.exponentialRampToValueAtTime(bleu?6200:4800,t0+.45);
    const g2=AC.createGain();g2.gain.setValueAtTime(.0001,t0);g2.gain.exponentialRampToValueAtTime(.075*k,t0+.12);g2.gain.exponentialRampToValueAtTime(.001,t0+.55);
    s2.connect(b);b.connect(g2);g2.connect(MASTER);s2.start(t0);s2.stop(t0+.6);
    if(bleu){ // le 2e étage SONNE : un sifflet bref qui monte — la turbine passe la surmultipliée
      const o=AC.createOscillator(),go=AC.createGain();o.type='triangle';
      o.frequency.setValueAtTime(700,t0);o.frequency.exponentialRampToValueAtTime(1900,t0+.22);
      go.gain.setValueAtTime(.0001,t0);go.gain.exponentialRampToValueAtTime(.04*k,t0+.03);go.gain.exponentialRampToValueAtTime(.001,t0+.3);
      o.connect(go);go.connect(MASTER);o.start(t0);o.stop(t0+.32);}
    duckT=Math.max(duckT,.35*k); // la poussée passe DEVANT le mix une fraction de seconde
  }catch(e){}
}
function nitroAllume(bleu,etage){ // LE COUP — au front montant de `nitroOn` (sol ET vol) ; `etage` : le passage en réserve bleue, en plus petit
  const n9=performance.now(),rep=n9-NFX.t0<650;NFX.t0=n9; // réservoir vide qu'on tient appuyé (hystérésis) : des rallumages rapprochés, un coup plus petit
  const k=(etage?.6:1)*(rep?.45:1);
  NFX.ign=1;NFX.ignK=k;NFX.off=0;NFX.ringT=0;NFX.ringK=k;NFX.air=mode==='fall';NFX_FIL.arme=true; // (la gerbe de filés : voir nfxFiles)
  NFX.col.setHex(bleu?NFX_C.b:NFX_C.n); // la teinte de l'onde et des bords est juste dès la première image
  try{nfeuCoup(k);}catch(e){} // (2026-10-15) le feu de pixels : une boule de feu par pot
  fovPunch=Math.max(fovPunch,(NFX.air?8:7)*k);     // le champ S'OUVRE d'un coup (lu au sol comme en vol) — un COUP au-dessus de l'ouverture de la nitro (+15°), pas un second zoom : à 14 la caisse fondait de moitié
  hap(bleu?[8,16,8]:[14,26,10]);
  if(!NSEC.sous&&!(etage&&NSEC.etage))nitroWhoomp(k,bleu,NFX.air); // (2026-10-17) rallumé sous le même doigt (panne sèche), ou 2e étage déjà sonné pendant cet appui : la gorge reprend, pas de second coup d'allumage (voir NSEC)
  if(etage)NSEC.etage=true;
  if(!POST_ON)flashEcran(bleu?'rgba(91,125,255,.45)':'rgba(255,122,36,.45)'); // sans l'ACES (post coupé), le coup de couleur passe par le calque DOM
}
function nitroEteint(sous){ // LA DERNIÈRE BOUFFÉE : une langue de feu aux pots + la pétarade — puis le champ retombe en douceur (`NFX.off`) — `sous` : la jauge a lâché SOUS le doigt (panne sèche) : la langue de feu oui, la pétarade non (voir NSEC)
  NFX.off=1;
  if(nitroHeldT<.25||mode==='boom')return; // un simple tap ne mérite pas la cérémonie
  const VC=PT_U.uVc.value;
  for(let i=0;i<8;i++){potMonde(CAR_POTS[i%CAR_POTS.length]||CAR_POT_C,NFX.v);
    spawnP(flames,NFX.v.x,NFX.v.y,NFX.v.z,VC.x-hsF.x*(9+nfxR()*9)+(nfxR()-.5)*2.4,VC.y-hsF.y*9+nfxR()*1.4,VC.z-hsF.z*(9+nfxR()*9)+(nfxR()-.5)*2.4,.1+nfxR()*.08);
    if(i<4)spawnP(embers,NFX.v.x,NFX.v.y,NFX.v.z,VC.x-hsF.x*(4+nfxR()*5)+(nfxR()-.5)*3,VC.y+1+nfxR()*2.5,VC.z-hsF.z*(4+nfxR()*5)+(nfxR()-.5)*3,.2+nfxR()*.15);}
  if(!sous)try{if(!(RUG_SON&&sfxOk()&&rugPetarade(Math.min(1,(nitroHeldT-.25)/1.75))))crackle(.7);}catch(e){} // (2026-10-16) LE FEU QUI RUGIT : la PÉTARADE (un bang, puis des pap-pap-pap qui s'égrènent, à la mesure de ce qu'on a brûlé)
  try{nfeuFin();}catch(e){} // (2026-10-15) le feu de pixels : la dernière bouffée, lente et sale
}
/* (2026-10-14, sensations · nitro) LA POUSSÉE SE SENT DANS LES RESSORTS. L'allumage avait tout (cabrage, onde, champ, vibration, whoomp) ;
   la COUPURE, elle, n'avait que du son et une langue de feu : la caisse accroupie (pitch9 −1,7°) se relevait en fondu, sans poids.
   `sensNitro` ne fait que REGARDER (nitroOn, nitroHeldT, engGear, VPAL.n) et répond par les outils communs : elle ne calcule rien du jeu.
   Appelée une fois par image, juste avant la remise à zéro de `nitroHeldT`. `on` : l'état de l'image d'avant. */
const SENS_NI={on:false,ts:0,h:0,g:1,tg:0,c:99};
function sensNitro(dt,veut){
  const n9=performance.now();
  if(!nitroOn&&SENS_NI.on&&mode!=='boom'&&!gameOver){
    /* LA PANNE SÈCHE HOQUETTE : le doigt tient encore, la jauge lâche — le son tousse (`nitro.sec`) mais rien ne le disait à la main ni à la
       tôle. DEUX RATÉS : le nez pique sec, 130 ms plus tard il repique plus petit ; la main reçoit les deux mêmes coups ([12,118,12], moyen),
       l'écran un frémissement (moitié en vol, où la panne coûte le plané). Au plus une fois par 1,2 s : doigt tenu, le réservoir se rallume
       à ,3 et retombe à sec en boucle — le hoquet ne doit pas devenir un bourdon. Elle REMPLACE alors le transfert de charge ci-dessous. */
    if(veut&&n9-(SENS_NI.ts||0)>1200){SENS_NI.ts=n9;SENS_NI.h=.13;
      if(!REDUCED_MOTION)sensCoup(0,1.1,-.3);
      sensHap([12,118,12],2);sensSecoue(.1);}
    else
    if(nitroHeldT>.35){ /* LE TRANSFERT DE CHARGE : la poussée lâche, le poids repasse sur l'avant — le nez PLONGE d'un coup (≈ 1,6° après un coup
        bref → 3,6° après 1,5 s tenue), la caisse se tasse (1 → 2 cm), puis se repose seule ; un tic léger dans le pouce qui vient de lâcher */
      const k=Math.min(1,(nitroHeldT-.35)/1.15);
      if(!REDUCED_MOTION)sensCoup(0,.6+.8*k,-(.25+.25*k));
      sensHap(9,1);}
  }
  if(SENS_NI.h>0){SENS_NI.h-=dt; // le 2e raté de la panne sèche (compté en secondes : même écart à 30, 60 et 120 i/s) — annulé si la flamme est revenue ou si la caisse a sauté
    if(SENS_NI.h<=0&&!nitroOn&&mode!=='boom'&&!gameOver){if(!REDUCED_MOTION)sensCoup(0,.7,-.2);sensSecoue(.07);}}
  /* LE RAPPORT PASSE DANS LA CAISSE : chaque passage claquait déjà à l'oreille, au pouce (hap 5) et au champ (+1,8°) — la carrosserie, elle,
     ne bronchait pas. Le couple se coupe un instant : le nez SALUE (≈ 1,2°), puis la poussée le reprend. Vu à l'image suivante (la boîte
     tourne plus bas dans la boucle). Un seul cran monté (un recalage de palier en saute plusieurs, ou retombe en 1re : muet), au plus un
     tous les 350 ms comme la cérémonie sonore, et pas pendant le cabrage de l'allumage (il le contredirait). Aucune vibration : elle existe. */
  if(engGear===SENS_NI.g+1&&mode==='drive'&&n9-SENS_NI.tg>350&&NFX.ign<.3){SENS_NI.tg=n9;if(!REDUCED_MOTION)sensCoup(0,.45,0);}
  SENS_NI.g=engGear;
  /* LE MUR D'AIR APPUIE : chaque centaine criée (« 400 KM/H ! ») avait son texte, son champ, sa vibration, son son — la caisse traversait
     le mur sans le sentir. Elle s'ÉCRASE d'un coup sur ses roues (≈ 2 cm à 300 → 3,5 cm passé 700 : l'appui grandit, puis plafonne), le nez
     un rien levé, et se repose. Lu sur `VPAL.n` (la centaine déjà criée par vpalTick) ; sa remise à zéro de début de partie est muette. */
  if(VPAL.n>SENS_NI.c&&!REDUCED_MOTION)sensCoup(0,-.3,-(.5+.1*Math.min(4,VPAL.n-3)));
  SENS_NI.c=VPAL.n;
  SENS_NI.on=nitroOn;
}
/* LE BOOST JOUE UN ARPÈGE (2026-10-03, Léo : « que le boost joue directement un instrument qu'on peut SPAMMER, APPUYER LONGTEMPS,
   ACCORDÉ à la musique » · puis « mille fois plus discret » · puis « pas cool comme instrument : bien filtré, vise plutôt un ARPÈGE et
   une HARMONIE »). Un piano électrique doux (sinus + modulation FM qui s'éteint, filtré sous 1,8 kHz, comme les Rhodes du CIEL) égrène
   les notes d'un ACCORD de la tonalité du morceau (`sonTonSuit._t` = la gamme majeure relative, comme tous les sons du jeu) :
   · APPUI = l'arpège part sur l'accord suivant de la grille I · vi · IV · V (accords de neuvième : l'harmonie de VAPEUR) — SPAMMER = la
     grille défile, toujours juste ; un appui bref joue au moins 3 notes ;
   · TENIR = l'arpège monte et redescend en doubles croches et passe à l'accord suivant toutes les 2 boucles ;
   · LÂCHER = plus de nouvelles notes, celles qui sonnent s'éteignent seules. La grille repart du I après 2,5 s sans appui.
   Discret (≈ −30 dB sous une voix pleine), un écho en croche pointée. Par MASTER (curseur EFFETS) : marche aussi sur iPhone.
   `dbgInstru()` : état · `dbgInstru(0|1)` coupe / rallume · `dbgInstru('essai')` (banc muet : les fréquences jouées). */
/* (2026-10-12, Léo : « enlève le boost instrument, il fait un bruit horrible qui casse tout ») : la phrase est COUPÉE (`on:false`) — elle
   lisait la musique du CIEL (instruMusiqueOk regardait la SOURCE du lecteur, pas s'il jouait) et partait donc aussi sous une autre musique
   (simulateur, GLISSE V2…), à contretemps et hors tonalité. Tout le code reste : `dbgInstru(1)` la rallume pour l'écouter. */
const INSTRU={fins:[],der:0,on:false,tient:false,k:0,n:0,tNote:0,tDer:0,bus:null,iv:0,vu:[],pas:.15,off:null,queue:0,mel:14,vel:1,acc:0};
/* LA PHRASE DU BOOST v3 (2026-10-03, Léo : « toujours un blanc entre les arpèges ; complexifie la structure pour qu'on puisse appuyer
   longtemps et que ça donne une MÉLODIE accordée à la musique du jeu ; si le joueur lâche, ça ne doit pas tout casser »).
   LE BLANC : le réservoir de nitro qui se vide pendant l'appui éteignait la nitro puis la rallumait (hystérésis) → l'arpège s'arrêtait
   et repartait de zéro. La phrase suit désormais LE DOIGT (`wantN`, front montant/descendant dans la boucle), pas la flamme.
   UNE PHRASE QUI CONTINUE : un compteur de doubles croches `k` qui ne repart de zéro qu'après 2,5 s de silence. Lâcher n'arrête pas
   net : la phrase va au bout du temps en cours + un temps, en s'éteignant (`queue`) ; réappuyer REPREND là où elle était, sur la grille.
   TROIS COUCHES, sur le tempo et la grille du morceau (`instruTempo`/`instruGrille`), dans sa tonalité (`sonTonSuit._t`) :
   · l'ARPÈGE (doubles croches, doux) : un des 5 dessins par demi-mesure, l'accord avance à chaque MESURE (I · vi · IV · V) ;
   · la MÉLODIE (au-dessus, plus présente) : un rythme par mesure (6 cellules), sur les temps forts une note de l'ACCORD, entre les deux
     des pas dans la pentatonique, vers un contour de 4 mesures (monte · monte · sommet · redescend) ; registre sol3-do5 ;
   · la BASSE douce sur les temps, à partir de la 3e mesure tenue.
   Chaque nouvel appui (spam) frappe un ACCENT : la note de mélodie suivante part tout de suite, plus fort. */
const INSTRU_MOTIFS=[[0,1,2,3,4,3,2,1],[0,2,1,3,2,4,3,1],[4,3,2,1,0,1,2,3],[0,1,2,4,3,2,4,1],[0,2,4,2,1,3,4,3]];
const INSTRU_RYTHMES=[[1,0,1,0,1,0,1,1],[1,0,0,1,0,0,1,0],[1,1,0,1,1,0,1,0],[1,0,1,1,0,1,0,0],[1,0,0,0,1,0,1,1],[1,1,1,0,1,0,0,0]]; // croches de la mesure : 1 = une note
/* LA PHRASE LIT LE MORCEAU (2026-10-03, Léo : « encore plus harmonieux et accordé à CHAQUE musique de la liste (important), parce que ça
   va au début mais c'est pire à la fin »). Deux causes : la phrase inventait SA grille d'accords (I · vi · ii · V) sans savoir où en était
   celle du morceau (ASCENSEUR finit sur un La7♭9 : do#, si♭ — tout frottait), et le tempo n'était calé qu'à l'appui (l'écart grandissait
   au fil d'un long appui). Désormais `CC_HARMONIE` (atelier-son/harmonie.py : tempo, position des temps et, TEMPS PAR TEMPS, les notes qui
   sonnent dans le morceau — vérifié sur les grilles connues de VAPEUR, ASCENSEUR, CIEL) : la phrase ne joue QUE les notes que le morceau
   joue à cet instant, et se recale sur sa position de lecture à CHAQUE note (zéro dérive, même après 2 minutes d'appui).
   Morceau inconnu (frénésie, un nouveau fichier) : la pentatonique de `SON_TON`, comme avant — et une ligne de plus dans harmonie.py. */
function instruH(){ // la fiche du morceau qui joue (ou null)
  const H=window.CC_HARMONIE;if(!H||!musicEl||!musicEl.src)return null;
  const nom=decodeURIComponent(musicEl.src.split('/').pop().split('?')[0]).replace(/\.[a-z0-9]+$/i,'');return H[nom]||null;
}
function instruTempo(){ // la double croche du morceau qui joue, et son horloge vue de l'audio
  const H=instruH();INSTRU.H=H;let bpm=H?H.bpm:0;
  if(!bpm&&typeof BCLK!=='undefined'&&BCLK.conf>.5&&BCLK.per>.3&&BCLK.per<1)bpm=60/BCLK.per;
  if(!bpm)bpm=100;let pas=60/bpm/4;while(pas<.1)pas*=2;while(pas>.2)pas/=2;           // une note entre ~.1 et ~.2 s
  INSTRU.pas=pas;instruHorloge();
}
function instruHorloge(){ // recalée à CHAQUE passage du planificateur : la phrase ne dérive jamais du morceau
  INSTRU.off=(musicEl&&!musicEl.paused&&musicEl.currentTime>0&&(musicEl.playbackRate||1)===1)?AC.currentTime-musicEl.currentTime+(INSTRU.H?INSTRU.H.ph:0):null;
}
function instruGrille(t){ // la prochaine note de la grille du morceau à partir de t
  if(INSTRU.off==null)return t;const p=INSTRU.pas,x=(t-INSTRU.off)/p;return INSTRU.off+Math.ceil(x-.02)*p;
}
function instruTons(t){ // les notes (classes 0 = do) qui sonnent dans le morceau à l'instant t — et la tonique de repli
  const H=INSTRU.H;
  if(H&&INSTRU.off!=null){const tb=60/H.bpm;let b=Math.floor((t-INSTRU.off)/tb);b=Math.max(0,Math.min(H.m.length-1,b));const m=H.m[b],o=[];
    for(let i=0;i<12;i++)if(m>>i&1)o.push(i);if(o.length>=2)return o;
    if(H.gamme&&H.gamme.length)return H.gamme.filter(function(x,i){return i%2===0;});} // temps creux : la gamme, une note sur deux
  const r=(4+(sonTonSuit._t|0)+120)%12;return [0,2,4,7,9].map(function(x){return(r+x)%12;}); // repli : la pentatonique du morceau
}
function instruHz(m){return 440*Math.pow(2,(m-69)/12);}
function instruDans(tons,lo,hi){const o=[];for(let m=lo;m<=hi;m++)if(tons.indexOf(m%12)>=0)o.push(m);return o;}
/* LE RENDU PREMIUM (2026-10-03, Léo : « on n'entend pas assez, et c'est pas parfait parfait : perfectionne, rendu premium ») :
   · la TOUCHE : deux porteuses à ±4 cents (le chorus d'un vrai Rhodes, ouvertes en stéréo), un modulateur dont l'indice suit la
     FORCE de frappe (doux = rond, fort = qui « tinte »), un corps d'octave qui s'éteint vite, un peu d'humain (±4 ms, ±8 % de force) ;
   · le BUS : une compression douce qui soude les trois couches → le filtre sous 2 kHz (« parfaitement filtré ») → une SALLE (réverbe
     à convolution calculée, 1,8 s, sombre) + un ÉCHO en croche pointée CALÉ SUR LE TEMPO du morceau, filtré et en ping-pong ;
   · le niveau : +5 dB (il passe devant les effets, toujours sous la musique). */
function instruBus(){
  if(INSTRU.bus||!AC||!MASTER)return INSTRU.bus;
  const g=AC.createGain();g.gain.value=1;
  const so9=AC.createGain();so9.gain.value=1;so9.connect(MASTER);INSTRU.sortie=so9; /* (2026-10-07) LA PORTE de l'instrument : tout ce qu'il joue sort par là (voir instruCoupe) */
  const cp=AC.createDynamicsCompressor();cp.threshold.value=-20;cp.ratio.value=3;cp.attack.value=.008;cp.release.value=.18;cp.knee.value=12;
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1600;lp.Q.value=.5;
  const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=160;
  const sec=AC.createGain();sec.gain.value=1.05;                                         // (Léo : « plus fondu et effacé ») −3,5 dB sec, la salle porte le reste
  g.connect(cp);cp.connect(hp);hp.connect(lp);lp.connect(sec);sec.connect(so9);
  try{ // LA SALLE : du bruit qui s'éteint, assombri avec le temps (calculé une fois, 1,8 s)
    const n=Math.floor(AC.sampleRate*1.8),ir=AC.createBuffer(2,n,AC.sampleRate);
    for(let c=0;c<2;c++){const d=ir.getChannelData(c);let lo=0;for(let i=0;i<n;i++){const x=i/n,a=Math.pow(1-x,3.2),k=.25+.7*x;lo+=(Math.random()*2-1-lo)*(1-k);d[i]=lo*a*(i<AC.sampleRate*.012?i/(AC.sampleRate*.012):1);}}
    const cv=AC.createConvolver();cv.buffer=ir;const rv=AC.createGain();rv.gain.value=.55;const pd=AC.createDelay(.2);pd.delayTime.value=.035;INSTRU.salle=pd;const rh=AC.createBiquadFilter();rh.type='highpass';rh.frequency.value=320;lp.connect(rh);rh.connect(pd); /* la salle ne prend plus le grave (la « résonance ») */pd.connect(cv);cv.connect(rv);rv.connect(so9); // pré-délai 35 ms : l'attaque de chaque note passe AVANT la salle
  }catch(e){}
  try{ // L'ÉCHO PING-PONG en croche pointée, recalé sur le tempo à chaque appui (instruTempo)
    const dL=AC.createDelay(2),dR=AC.createDelay(2),fb=AC.createGain(),df=AC.createBiquadFilter(),mg=AC.createChannelMerger(2),eg=AC.createGain();
    df.type='lowpass';df.frequency.value=1300;const dh=AC.createBiquadFilter();dh.type='highpass';dh.frequency.value=300;fb.gain.value=.3;eg.gain.value=.26;
    lp.connect(dh);dh.connect(df);df.connect(dL);dL.connect(dR);dR.connect(fb);fb.connect(dL);dL.connect(mg,0,0);dR.connect(mg,0,1);mg.connect(eg);eg.connect(so9);
    INSTRU.dL=dL;INSTRU.dR=dR;
  }catch(e){}
  try{ // (2026-10-03, Léo : « à chaque note un peu plus d'individualité, fais-les ressortir un peu du fondu ») LE CONTOUR : l'attaque de chaque
    // touche (un « tine » d'harmoniques, 40 ms) passe à côté du filtre sombre, de la salle et de l'écho — la note se dessine, le halo reste.
    const ct=AC.createGain();ct.gain.value=1;const ch=AC.createBiquadFilter();ch.type='bandpass';ch.frequency.value=2600;ch.Q.value=.7;
    ct.connect(ch);ch.connect(so9);INSTRU.contour=ct;
  }catch(e){}
  try{ // LE BUS ÉTINCELLE (la 4e mesure et après) : clair, aéré — pas le filtre sombre ; un peu de salle
    const eb=AC.createGain();eb.gain.value=1;const eh=AC.createBiquadFilter();eh.type='highpass';eh.frequency.value=350;
    const el=AC.createBiquadFilter();el.type='lowpass';el.frequency.value=7000;const es=AC.createGain();es.gain.value=.5;
    eb.connect(eh);eh.connect(el);el.connect(so9);el.connect(es);if(INSTRU.salle)es.connect(INSTRU.salle);INSTRU.etin=eb;
  }catch(e){}
  INSTRU.bus=g;return g;
}
function instruEcho(){try{const t=Math.min(.9,INSTRU.pas*6);if(INSTRU.dL){INSTRU.dL.delayTime.setTargetAtTime(t/2,AC.currentTime,.05);INSTRU.dR.delayTime.setTargetAtTime(t/2,AC.currentTime,.05);}}catch(e){}}
