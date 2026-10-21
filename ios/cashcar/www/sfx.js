/* ================================================================================================
   CASH CAR — LE LECTEUR DE SONS (sfx.js, 2026-09-28)
   Sacha : « il faut que tout ce qui se passe à l'écran ait un son propre et unique, parfaitement
   maîtrisé et mixé, réellement addictif — niveau top 1 App Store ».

   ⚠ TROIS FICHIERS, TROIS RÔLES :
     · `atelier-son/recettes.js` — l'ATELIER : chaque son est une recette de synthèse (jamais chargée par le jeu) ;
     · `sons-banque.js` — la BANQUE : les sons rendus, mesurés, encodés (générée par `node atelier-son/cuire.js`) ;
     · `sfx.js` (ici) — le LECTEUR : décode la banque en tâche de fond, puis joue. Jouer un son = UNE source + UN gain.
   Le banc d'écoute `sons.html` charge exactement ces deux fichiers : on y entend les vrais sons du jeu, un par un.

   ⚠ LES QUATRE BUS (+ la salle) : chaque famille a son bus, donc son niveau et sa part de réverbe.
     ui  — l'interface : sec, court, présent
     rec — les RÉCOMPENSES (argent, figures, style) : brillant, dans la salle, dans la TONALITÉ
     fx  — les chocs et le danger : sec, grave, au premier plan
     amb — les ambiances ponctuelles : loin, large
   La SALLE est une réverbe à convolution (réponse impulsionnelle calculée ici : plaque brillante de 1,1 s).
   C'est elle qui fait « cher » : un son sec sonne jouet, un son qui vit dans une pièce sonne produit.
   Tous les bus sortent dans la destination donnée à `init` (le MASTER du jeu : le curseur EFFETS, le
   compresseur et la pause s'y appliquent sans rien changer).

   ⚠ TRIM : l'étalonnage sur l'ANCIEN mixage. Mesuré le 2026-09-28 : les sons d'avant sortaient de −42 LUFS
   (le clic d'interface, presque inaudible) à −15 (l'explosion), la pièce à −34, les carillons à −32 ; le bus
   du jeu (MASTER → compresseur à gain de rattrapage automatique → tanh) ajoute ~+10 dB aux petits signaux.
   Les fichiers sortent à −20 LUFS (fenêtre 200 ms) : TRIM les ramène à −30, et chaque fiche se règle autour
   (`db` : la pièce −4, l'explosion +13…).
   ================================================================================================ */
(function(G){
'use strict';
const S={ac:null,dest:null,bus:{},buf:{},off:{},voix:{},der:{},dern:{},ton:0,ok:false,grp:{},m:null,nDec:0,nTot:0,dec:false};
const TRIM=-10,FEN=.11,RECUL=-9;
const BUS={ // niveau du bus (dB) · part envoyée dans la SALLE
  ui: {db:-5, rev:.05}, // (−3 → −5 : le clic neuf sortait 9 dB au-dessus de l’ancien, quasi inaudible ; on garde la présence sans crier)
  rec:{db: 0, rev:.20},
  fx: {db:+1, rev:.07},
  amb:{db:-4, rev:.30}
};
function dbL(x){return Math.pow(10,x/20);}
function hasard(a){a>>>=0;return function(){a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
/* LA SALLE : réponse impulsionnelle d'une plaque brillante (stéréo décorrélée, premières réflexions à 7-29 ms,
   queue de 1,1 s dont l'aigu meurt plus vite que le grave, comme dans l'air) */
function salleIR(ac){
  const sr=ac.sampleRate,T=1.25,n=Math.round(sr*T),b=ac.createBuffer(2,n,sr),R=hasard(1618),LN=6.907755;
  for(let c=0;c<2;c++){const d=b.getChannelData(c);let lp=0;
    for(let i=0;i<n;i++){const t=i/sr,dec=Math.exp(-LN*t/1.1),k=Math.min(.95,.25+t*1.4);
      lp+=(R()*2-1-lp)*(1-k);d[i]=lp*dec*(t<.004?t/.004:1);}
    for(const [ms,g] of [[7,.5],[13,.36],[19,.28],[29,.2]]){const i=Math.round(ms/1000*sr)+(c?37:0);if(i<n)d[i]+=g*(c?.9:1);}
  }
  return b;
}
/* ---- LE DÉCODAGE DE LA BANQUE, EN TÂCHE DE FOND ----
   Il commence DÈS LE CHARGEMENT de la page (`charge()`), avant le premier toucher : un OfflineAudioContext
   décode sans geste de l'utilisateur. Quatre fichiers à la fois au plus, les fiches `pre:1` (interface,
   pièce, pose) en tête — elles doivent être prêtes au premier appui. Les tampons restent à 32 kHz (un tiers
   de mémoire en moins) : le navigateur les rééchantillonne à la lecture. */
function b64ab(s){const bin=atob(s),n=bin.length,u=new Uint8Array(n);for(let i=0;i<n;i++)u[i]=bin.charCodeAt(i);return u.buffer;}
function charge(){
  if(S.dec)return;const B=G.CCSON_BANQUE;if(!B)return;S.dec=true;S.m=B.m;
  /* (débogage 2026-09-29) WebKit avant iOS 14.1 n'accepte que 44,1 à 96 kHz dans un OfflineAudioContext : à 32 kHz le constructeur levait,
     `ctx` restait nul, et l'ÉTALON (décodé seulement par ce chemin) ne l'était jamais — toutes les attaques retombaient sur la détection
     son par son. On essaie 32 kHz puis 44,1 kHz, et l'étalon passe désormais par la même file que le reste, quel que soit le contexte. */
  const OC=G.OfflineAudioContext||G.webkitOfflineAudioContext;let ctx=null;
  for(const r of [B.sr||32000,44100]){try{ctx=OC?new OC(1,1,r):null;}catch(e){ctx=null;}if(ctx)break;}
  const cles=Object.keys(B.d).filter(function(k){return k!=='__etalon';}).sort(function(a,b){const ia=a.split('#')[0],ib=b.split('#')[0];return ((B.m[ib]&&B.m[ib].pre)|0)-((B.m[ia]&&B.m[ia].pre)|0);});
  S.nTot=cles.length;let i=0,enCours=0,etalon=B.d.__etalon?0:2; // 0 à faire · 1 en cours · 2 fait
  const tete=B.tete||.03;
  const attaque=function(buf){ // l'instant d'attaque : la crête de l'étalon − 1,5 ms ; sans étalon, le premier échantillon audible
    if(S.t0!=null)return S.t0;
    const d=buf.getChannelData(0),sr=buf.sampleRate,lim=Math.min(d.length,Math.round((tete+.08)*sr));let k=0;
    while(k<lim&&Math.abs(d[k])<2e-4)k++;
    return k>=lim?tete:Math.max(0,(k-Math.round(.0015*sr))/sr);
  };
  const decode=function(c,b64,ok){let fait=false;const une=function(x){if(!fait){fait=true;ok(x);}}; // une seule réponse, quoi que fasse le navigateur
    try{const p=c.decodeAudioData(b64ab(b64),une,function(){une(null);});if(p&&p.catch)p.catch(function(){une(null);});}catch(e){une(null);}};
  const suivant=function(){
    const c=ctx||S.ac;if(!c)return; // pas encore de contexte (pas d'OfflineAudioContext) : init() relancera
    if(etalon<2){if(etalon===1)return;etalon=1; // l'étalon d'abord, SEUL : tout le reste en dépend
      decode(c,B.d.__etalon,function(buf){
        if(buf){const d=buf.getChannelData(0);let k=0,m=0;for(let j=0;j<Math.min(d.length,Math.round(.12*buf.sampleRate));j++){const a=Math.abs(d[j]);if(a>m){m=a;k=j;}}
          if(m>.05)S.t0=Math.max(0,(k-Math.round(.0015*buf.sampleRate))/buf.sampleRate);}
        B.d.__etalon=null;etalon=2;suivant();});
      return;}
    while(enCours<4&&i<cles.length){
      const cle=cles[i++],b64=B.d[cle];if(!b64)continue;
      enCours++;
      decode(c,b64,function(buf){enCours--;
        if(buf){S.buf[cle]=buf;S.off[cle]=attaque(buf);S.nDec++;}
        B.d[cle]=null; // le texte base64 n'est plus utile : la mémoire est rendue
        suivant();});
    }
  };
  S.relance=suivant;suivant();
}
function init(ac,dest){
  if(S.ok)return;
  try{
    S.ac=ac;S.dest=dest||ac.destination;
    // la SALLE : pré-délai 14 ms → passe-haut 280 Hz (pas de boue dans le grave) → convolution → retour
    const pre=ac.createDelay(.1);pre.delayTime.value=.014;
    const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=280;
    const cv=ac.createConvolver();cv.normalize=true;cv.buffer=salleIR(ac);
    const ret=ac.createGain();ret.gain.value=.55;
    pre.connect(hp);hp.connect(cv);cv.connect(ret);S.salRet=ret;S.salOn=false; // (optimisation 2026-09-29) la salle n'est branchée que quand un son passe
    /* LA SALLE AU REPOS : une convolution de 1,25 s calcule même sur un silence (2,7 % d'un cœur MESURÉS, en permanence). Elle se branche
       au premier son et se débranche 1,4 s après la fin du dernier (sa queue est éteinte) — débranchée, elle ne calcule plus rien. */
    setInterval(function(){if(!S.salOn||!S.ac)return;const n=S.ac.currentTime;let fin=S.coupe||0; /* une voix COUPÉE sort du compte, sa queue de salle non */for(const k in S.voix)for(const x of S.voix[k])if(x.fin>fin)fin=x.fin;
      if(n>fin+1.4){try{S.salRet.disconnect(S.dest);}catch(e){}S.salOn=false;}},500);
    for(const k in BUS){const g=ac.createGain();g.gain.value=dbL(BUS[k].db);g.connect(S.dest);
      const s=ac.createGain();s.gain.value=BUS[k].rev;g.connect(s);s.connect(pre);S.bus[k]=g;}
    S.ok=true;
  }catch(e){S.ok=false;}
  charge();if(S.relance)S.relance();
}
/* LES BASES D'OCTAVE (`bases:[0,12]`) : un son accordé transposé de deux octaves par `playbackRate` serait joué
   4× plus vite — attaque écrasée, aigu replié. Il est donc cuit sur plusieurs bases et le lecteur prend la plus
   proche EN DESSOUS de la note voulue : jamais plus d'une octave de transposition. */
function baseDe(f,st){const B=f.bases;if(!B)return 0;let b=B[0];for(const x of B)if(x<=st+.5)b=x;return b;}
/* LE CHEF D'ORCHESTRE. Une pose peut lancer quinze sons dans la même image (audit du 2026-09-28 : 15 à 20 notes en
   200 ms quand la frénésie part à la pose). Les fiches d'un même GROUPE (`grp`) et leur PRIORITÉ (`prio`) règlent la
   préséance dans une fenêtre de 110 ms : le plus important passe DEVANT, les autres reculent de 9 dB (on les entend
   encore — c'est une texture — mais ils ne se battent plus). Un son `cede:1` s'efface tout à fait devant plus grand. */
function chef(f,t0){
  const g=f.grp;if(!g)return 0;
  let G1=S.grp[g];if(!G1||t0-G1.t>FEN){G1=S.grp[g]={t:t0,prio:-1,voix:[]};}
  const p=f.prio||0;
  if(p<G1.prio){if(f.cede)return null;return RECUL;} // un moindre ne prolonge PAS la fenêtre du plus grand (débogage 2026-09-29)
  if(p>G1.prio){const n=Math.max(t0,S.ac.currentTime);
    for(const y of G1.voix){if(!(y.fin>n))continue; // une voix finie ou évincée ne remonte pas à −9 dB (elle « ressuscitait » jusqu'à son stop)
      try{if(y.cede)y.stop(.01);else y.g.gain.setTargetAtTime(y.g0*dbL(RECUL),n,.012);}catch(e){}}
    G1.prio=p;G1.voix=[];}
  G1.t=Math.max(G1.t,t0);return 0;
}
/* JOUER. o = {st: demi-tons · t: délai (s) · vol: dB · pan: −1…1 · rate: multiplicateur · loop: boucle ·
   force: ignore le délai minimal · var: variante imposée · bus: autre bus}. Rend une poignée (stop/gain/rate) ou null. */
function play(id,o){
  if(!S.ok||!S.m)return null;const f=S.m[id];if(!f)return null;o=o||{};
  const ac=S.ac,now=ac.currentTime,t0=now+(o.t||0);
  if(f.cd>0&&!o.force&&S.der[id]!=null&&Math.abs(t0-S.der[id])<f.cd)return null;
  const st=(o.st||0)+(f.key?S.ton:0),base=baseDe(f,st);
  // la variante : au hasard, jamais deux fois la même d'affilée (un doublon s'entend comme un bug)
  let v=0;if(o.var!=null)v=Math.max(0,Math.min(f.v-1,o.var|0));else if(f.v>1){v=Math.floor(Math.random()*f.v);if(v===S.dern[id])v=(v+1)%f.v;}
  let cle=id+'#'+v+'#'+base,ab=S.buf[cle];
  if(!ab){for(let k=0;k<f.v&&!ab;k++){cle=id+'#'+k+'#'+base;ab=S.buf[cle];}if(!ab)return null;} // pas encore décodé : on se tait plutôt que d'attendre
  S.dern[id]=v;
  const dbC=chef(f,t0);if(dbC===null)return null;
  // la polyphonie de CE son : au-delà de `max`, la plus ancienne voix s'efface (en 15 ms, jamais coupée net)
  const L=S.voix[id]||(S.voix[id]=[]);for(let i=L.length-1;i>=0;i--)if(L[i].fin<now)L.splice(i,1);
  while(L.length>=f.max){const x=L.shift(),tt=Math.max(now,t0);x.fin=0;S.coupe=Math.max(S.coupe||0,tt+.05);try{x.g.gain.cancelScheduledValues(tt);x.g.gain.setTargetAtTime(0,tt,.005);x.s.stop(tt+.05);}catch(e){}} // à l'instant du NOUVEAU son (débogage 2026-09-29)
  try{
    const s=ac.createBufferSource();s.buffer=ab;
    const rate=Math.pow(2,(st-base)/12)*(o.rate||1)*(1+(Math.random()*2-1)*f.rj);
    s.playbackRate.value=rate;
    const off=S.off[cle]||0;
    let dep=off;
    if(o.loop){ /* la boucle EXACTE : de l'attaque (étalon + 1,5 ms) sur `lg` secondes — ni le rembourrage de fin du MP3 ni la marge de tête
                   n'y entrent (débogage 2026-09-29 : un trou et un clic à chaque tour) */
      s.loop=true;const B0=G.CCSON_BANQUE;dep=(S.t0!=null?S.t0+.0015:(B0&&B0.tete)||.03);
      s.loopStart=dep;s.loopEnd=f.lg?Math.min(ab.duration,dep+f.lg):ab.duration;}
    const g0=dbL(TRIM+f.db+(o.vol||0)+dbC+(Math.random()*2-1)*f.vj);
    const g=ac.createGain();g.gain.value=g0;
    let tete=g;
    if(o.pan&&ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,o.pan));g.connect(p);tete=p;}
    s.connect(g);tete.connect(S.bus[o.bus||f.bus]||S.bus.rec);
    s.start(t0,dep);S.der[id]=t0;
    if(!S.salOn&&S.salRet){try{S.salRet.connect(S.dest);}catch(e){}S.salOn=true;}
    const x={s:s,g:g,g0:g0,t0:t0,bus:o.bus||f.bus,cede:!!f.cede,fin:o.loop?1e9:t0+(ab.duration-dep)/rate,
      stop:function(tc){try{const n=ac.currentTime;g.gain.cancelScheduledValues(n);g.gain.setTargetAtTime(0,n,tc||.03);s.stop(n+(tc||.03)*6);S.coupe=Math.max(S.coupe||0,n+(tc||.03)*6);}catch(e){}x.fin=0;},
      gain:function(db,tc){try{g.gain.setTargetAtTime(dbL(TRIM+f.db+db),ac.currentTime,tc||.05);}catch(e){}},
      rate:function(r,tc){try{s.playbackRate.setTargetAtTime(r,ac.currentTime,tc||.05);}catch(e){}}};
    L.push(x);if(f.grp&&S.grp[f.grp]){const V=S.grp[f.grp].voix;V.push(x);if(V.length>32)V.shift();}
    return x;
  }catch(e){return null;}
}
function ton(n){S.ton=+n||0;}
/* les sons programmés à plus de `apres` secondes (billets volants, plein de nitro différé…) : annulés. Appelé à la PAUSE — sans ça ils
   survivaient à la mise en veille du contexte et partaient à la reprise, sur un tout autre moment de jeu. */
/* à la PAUSE : les sons de JEU en cours (queue d'explosion, fanfare, scène moteur…) s'éteignent — sinon, la sortie remise à plein à la
   reprise, leur fin rejouait pendant le 3-2-1. L'INTERFACE (le clic ⏸, la feuille qui s'ouvre) et les BOUCLES (qui ont leur propre logique) restent. */
function stopJeu(){if(!S.ac)return;const n=S.ac.currentTime;for(const k in S.voix)for(const x of S.voix[k]){if(x.bus==='ui'||x.fin===1e9||!(x.fin>n))continue;x.stop(.02);}}
function annuleFutur(apres){if(!S.ac)return;const n=S.ac.currentTime+(apres||0);for(const k in S.voix)for(const x of S.voix[k])if(x.t0>n&&x.fin>0){try{x.s.stop();}catch(e){}x.fin=0;}}
function stop(id){const now=S.ac?S.ac.currentTime:0;S.coupe=Math.max(S.coupe||0,now+.08);for(const k in S.voix){if(id&&k!==id)continue;for(const x of S.voix[k]){try{x.g.gain.setTargetAtTime(0,now,.01);x.s.stop(now+.08);}catch(e){}}S.voix[k]=[];}}
function liste(){const o={},M=S.m||(G.CCSON_BANQUE&&G.CCSON_BANQUE.m)||{};for(const id in M){const f=M[id];(o[f.fam]||(o[f.fam]=[])).push({id:id,dit:f.dit});}return o;}
G.CCSON={charge:charge,init:init,play:play,ton:ton,stop:stop,liste:liste,annuleFutur:annuleFutur,stopJeu:stopJeu,
  bus:function(k){return S.bus[k]||null;},
  existe:function(id){return !!(S.m&&S.m[id]);},
  etat:function(){return{ok:S.ok,ton:S.ton,decodes:S.nDec,total:S.nTot,salle:!!S.salOn};},
  // le banc : où commence chaque son (ms) — tous doivent tomber près des 30 ms de tête (± le retard de l'encodeur)
  attaques:function(){const v=Object.keys(S.off).map(function(k){return Math.round(S.off[k]*1000);}).sort(function(a,b){return a-b;});
    return {etalon:S.t0==null?null:Math.round(S.t0*10000)/10,n:v.length,min:v[0],med:v[v.length>>1],max:v[v.length-1],hors:Object.keys(S.off).filter(function(k){return S.off[k]<.02||S.off[k]>.07;})};}};
// le décodage part tout de suite, sans attendre le premier toucher (voir charge)
try{if(typeof requestIdleCallback==='function')requestIdleCallback(charge,{timeout:1500});else setTimeout(charge,300);}catch(e){}
})(typeof window!=='undefined'?window:globalThis);
