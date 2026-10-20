/* ================================================================================================
   CASH CAR — L'ATELIER DU SON : la synthèse et les RECETTES de toute la palette (2026-09-28)
   Sacha : « il faut que tout ce qui se passe à l'écran ait un son propre et unique, parfaitement
   maîtrisé et mixé, réellement addictif — niveau top 1 App Store ».

   ⚠ CE FICHIER N'EST PAS CHARGÉ PAR LE JEU. C'est l'ATELIER : chaque son y est une RECETTE (du code qui
   calcule le son échantillon par échantillon), et `cuire.js` (Node) les rend toutes, les MESURE
   (sonie, crête, spectre), les encode et écrit `../sons-banque.js` — la banque que le jeu décode.
   Modifier un son = modifier sa recette ici, puis relancer `node atelier-son/cuire.js`.

   ⚠ POURQUOI PRÉ-RENDRE. Mesuré le 2026-09-28 : cuire les gros sons (fanfare de fin de monde,
   entrée en frénésie) coûte 300 à 400 ms de calcul chacun — sur un téléphone, un à-coup visible.
   Rendus ici une fois pour toutes, ils ne coûtent plus rien au jeu, et ce qui joue est EXACTEMENT ce
   qui a été mesuré. La synthèse peut donc se payer ce qu'aucun graphe temps réel ne tiendrait :
   cloches modales à plusieurs partiels, cordes pincées (Karplus-Strong), FM, chœurs à formants,
   sonie normalisée son par son (−20 LUFS sur 200 ms dans le fichier ; le lecteur retire TRIM).

   ⚠ LA TONALITÉ SUIT LA MUSIQUE. Les quatre morceaux ne sont pas dans la même tonalité (mesuré :
   NÉON en fa, VITESSE en si mineur, NOCTURNAL en sol# mineur, NOITE en ré# mineur) alors que toutes
   les récompenses étaient en mi : une seconde mineure contre la basse une fois sur deux. Tout son
   `key:1` est cuit en MI et transposé à la lecture (`CCSON.ton(n)`) dans la pentatonique du morceau.
   ================================================================================================ */
(function(G){
'use strict';
const TAU=Math.PI*2,LN1000=6.907755278982137;

/* ---------------- LE HASARD REPRODUCTIBLE — une recette + une graine = toujours le même son -------- */
function hasard(a){a>>>=0;return function(){a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hache(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}

/* ---------------- LA TOILE : le tampon qu'une recette peint ------------------------------------ */
function Toile(sr,dur,st){const n=Math.max(1,Math.ceil(sr*dur));return{sr:sr,n:n,L:new Float32Array(n),R:st?new Float32Array(n):null,dur:dur};}
/* gains de panoramique à puissance constante (−1 gauche … +1 droite) */
function panG(p){const a=((p||0)+1)*Math.PI/4;return [Math.cos(a),Math.sin(a)];}

/* L'ENVELOPPE. Attaque en demi-cosinus (jamais de clic), palier, puis décroissance exponentielle
   exprimée en T60 (le temps pour perdre 60 dB) : c'est l'unité des acousticiens, et la seule qui se
   lit à l'oreille — « d:.4 » veut dire « le son s'éteint en 0,4 s ». */
function env(t,a,h,d){
  if(t<0)return 0;
  if(t<a)return .5-.5*Math.cos(Math.PI*t/a);
  t-=a;if(t<h)return 1;t-=h;
  return Math.exp(-LN1000*t/d);
}
/* le glissando : exponentiel (on entend les hauteurs en rapports), avec une courbe `gc` */
function gl(f0,f1,g,t,gc){if(f1==null||!(g>0))return f0;const u=Math.min(1,t/g);return f0*Math.pow(f1/f0,gc?Math.pow(u,gc):u);}
/* polyBLEP : l'anti-repliement des ondes à angle vif (dent de scie, carré) — sans lui, une note
   aiguë en dent de scie « siffle » de fréquences fantômes qui ne sont pas dans la gamme */
function blep(t,dt){if(t<dt){t/=dt;return t+t-t*t-1;}if(t>1-dt){t=(t-1)/dt;return t*t+t+t+1;}return 0;}

/* ---------------- LES FILTRES (biquads de R. Bristow-Johnson) -------------------------------- */
function bqC(ty,f,q,sr,gdb){
  f=Math.max(10,Math.min(f,sr*.45));q=q||.7071;
  const w=TAU*f/sr,c=Math.cos(w),s=Math.sin(w),al=s/(2*q),A=Math.pow(10,(gdb||0)/40);
  let b0,b1,b2,a0,a1,a2;
  if(ty==='lp'){b0=(1-c)/2;b1=1-c;b2=b0;a0=1+al;a1=-2*c;a2=1-al;}
  else if(ty==='hp'){b0=(1+c)/2;b1=-(1+c);b2=b0;a0=1+al;a1=-2*c;a2=1-al;}
  else if(ty==='bp'){b0=al;b1=0;b2=-al;a0=1+al;a1=-2*c;a2=1-al;}           // crête à 0 dB
  else if(ty==='pk'){b0=1+al*A;b1=-2*c;b2=1-al*A;a0=1+al/A;a1=-2*c;a2=1-al/A;}
  else if(ty==='hs'){const r=2*Math.sqrt(A)*al;b0=A*((A+1)+(A-1)*c+r);b1=-2*A*((A-1)+(A+1)*c);b2=A*((A+1)+(A-1)*c-r);a0=(A+1)-(A-1)*c+r;a1=2*((A-1)-(A+1)*c);a2=(A+1)-(A-1)*c-r;}
  else if(ty==='ls'){const r=2*Math.sqrt(A)*al;b0=A*((A+1)-(A-1)*c+r);b1=2*A*((A-1)-(A+1)*c);b2=A*((A+1)-(A-1)*c-r);a0=(A+1)+(A-1)*c+r;a1=-2*((A-1)+(A+1)*c);a2=(A+1)+(A-1)*c-r;}
  else {b0=1;b1=0;b2=0;a0=1;a1=0;a2=0;}
  return [b0/a0,b1/a0,b2/a0,a1/a0,a2/a0];
}
function Bq(){return {c:null,x1:0,x2:0,y1:0,y2:0};}
function bqRun(s,x){const c=s.c,y=c[0]*x+c[1]*s.x1+c[2]*s.x2-c[3]*s.y1-c[4]*s.y2;s.x2=s.x1;s.x1=x;s.y2=s.y1;s.y1=y;return y;}
/* filtre FIXE sur toute la toile (en place) */
function filtre(b,ty,f,q,gdb){
  for(const ch of [b.L,b.R]){if(!ch)continue;const s=Bq();s.c=bqC(ty,f,q,b.sr,gdb);for(let i=0;i<b.n;i++)ch[i]=bqRun(s,ch[i]);}
  return b;
}

/* ---------------- LES SOURCES --------------------------------------------------------------- */
/* L'OSCILLATEUR. o = {f, f1, g, gc, w:'sin'|'tri'|'saw'|'sq', pw, t0, a, h, d, v, pan, vib:[Hz,prof],
   ph, fm:{r,i,d} (modulation de fréquence : rapport, indice, T60 de l'indice)} */
function osc(b,o){
  const sr=b.sr,i0=Math.round((o.t0||0)*sr),a=o.a==null?.002:o.a,h=o.h||0,d=o.d==null?.3:o.d;
  const n=Math.min(b.n-i0,Math.ceil((a+h+d)*sr));if(n<=0)return;
  const w=o.w||'sin',v=o.v==null?.5:o.v,pw=o.pw||.5,f0=o.f,vib=o.vib,fm=o.fm;
  const P=panG(o.pan);let ph=o.ph==null?0:o.ph,mph=0;
  const fl=o.flt?Bq():null;
  for(let i=0;i<n;i++){
    const t=i/sr;let f=gl(f0,o.f1,o.g,t,o.gc);
    if(vib)f*=1+vib[1]*Math.sin(TAU*vib[0]*t);
    if(fm){const mf=f*fm.r;mph+=mf/sr;if(mph>=1)mph-=1;f+=mf*fm.i*env(t,.001,0,fm.d||.3)*Math.sin(TAU*mph);}
    const dt=Math.abs(f)/sr;ph+=f/sr;ph-=Math.floor(ph);
    let s;
    if(w==='sin')s=Math.sin(TAU*ph);
    else if(w==='tri')s=4*Math.abs(ph-.5)-1;
    else if(w==='saw')s=2*ph-1-blep(ph,dt);
    else{s=(ph<pw?1:-1)+blep(ph,dt)-blep((ph-pw+1)%1,dt);}
    if(fl){if((i&15)===0)fl.c=bqC(o.flt[0],gl(o.flt[1],o.flt[2],o.flt[3]||o.g||(a+h+d),t,o.flt[5]),o.flt[4]||.9,sr);s=bqRun(fl,s);}
    const e=env(t,a,h,d)*v,x=s*e,k=i0+i;
    if(b.R){b.L[k]+=x*P[0];b.R[k]+=x*P[1];}else b.L[k]+=x;
  }
}
/* LE BRUIT. o = {c:'b'(blanc)|'r'(rose)|'n'(brun), t0, a, h, d, v, ft:'lp'|'hp'|'bp'|'pk', f, f1, g, gc, q,
   pan, pan1 (le son TRAVERSE la stéréo de pan à pan1), am:[Hz,prof] (hachage)} */
function bruit(b,o,R){
  const sr=b.sr,i0=Math.round((o.t0||0)*sr),a=o.a==null?.002:o.a,h=o.h||0,d=o.d==null?.3:o.d;
  const n=Math.min(b.n-i0,Math.ceil((a+h+d)*sr));if(n<=0)return;
  const v=o.v==null?.5:o.v,c=o.c||'b',rnd=R||Math.random;
  const fs=o.ft?Bq():null,fs2=o.ft2?Bq():null;let p0=0,p1=0,p2=0,br=0;
  let P=panG(o.pan);
  for(let i=0;i<n;i++){
    const t=i/sr,w=rnd()*2-1;let s;
    if(c==='r'){p0=.99765*p0+w*.099046;p1=.963*p1+w*.2965164;p2=.57*p2+w*1.0526913;s=(p0+p1+p2+w*.1848)*.2;}
    else if(c==='n'){br=(br+w*.04)*.996;s=br*2.2;}
    else s=w;
    if(fs){if((i&15)===0)fs.c=bqC(o.ft,gl(o.f,o.f1,o.g||(a+h+d),t,o.gc),o.q||.8,sr,o.gdb);s=bqRun(fs,s);}
    if(fs2){if(i===0)fs2.c=bqC(o.ft2,o.f2,o.q2||.7,sr);s=bqRun(fs2,s);}
    let e=env(t,a,h,d)*v;
    if(o.am)e*=1-o.am[1]*(.5+.5*Math.cos(TAU*o.am[0]*t));
    const x=s*e,k=i0+i;
    if(b.R){if(o.pan1!=null&&(i&31)===0)P=panG(o.pan+(o.pan1-o.pan)*Math.min(1,t/(a+h+d*.5)));b.L[k]+=x*P[0];b.R[k]+=x*P[1];}
    else b.L[k]+=x;
  }
}
/* LA CLOCHE MODALE — un objet frappé = une somme de modes qui s'éteignent chacun à sa vitesse.
   o = {f, r:[rapports], m:[amplitudes], d:[T60], t0, a, v, pan, jit}. Les rapports NON entiers font
   « métal » (2,76 = la cloche, 1,5/2,0 = le verre, 2,32/4,25 = la pièce de monnaie). */
function cloche(b,o,R){
  const r=o.r,m=o.m,d=o.d,rnd=R||Math.random;
  for(let k=0;k<r.length;k++){
    const j=o.jit?1+(rnd()-.5)*o.jit:1;
    osc(b,{f:o.f*r[k]*j,f1:o.f1?o.f1*r[k]*j:null,g:o.g,w:'sin',t0:o.t0,a:o.a==null?.0015:o.a,d:d[k]||d[d.length-1],v:(o.v==null?.5:o.v)*(m[k]==null?.3:m[k]),pan:o.pan,ph:rnd()});
  }
}
/* LA CORDE PINCÉE (Karplus-Strong) — la matière des « plucks » : une salve de bruit dans une ligne
   à retard rebouclée et filtrée. Aucune synthèse additive ne fait aussi « vrai » pour aussi peu. */
function corde(b,o,R){
  const sr=b.sr,i0=Math.round((o.t0||0)*sr),f=o.f,d=o.d||.8,v=o.v==null?.5:o.v,rnd=R||Math.random;
  const L=Math.max(2,Math.round(sr/f)),buf=new Float32Array(L),br=o.br==null?.5:o.br;
  let lp=0;for(let i=0;i<L;i++){const w=rnd()*2-1;lp+=(w-lp)*(.25+.75*br);buf[i]=lp;}
  const g=Math.pow(10,-3/(f*d)),n=Math.min(b.n-i0,Math.ceil(d*sr));const P=panG(o.pan);
  let idx=0,prev=0;
  for(let i=0;i<n;i++){
    const cur=buf[idx],nx=(cur+prev)*.5*g;prev=cur;buf[idx]=nx*(o.ks||1)+cur*(1-(o.ks||1));
    idx=(idx+1)%L;
    const x=cur*v*(i<32?i/32:1),k=i0+i;
    if(b.R){b.L[k]+=x*P[0];b.R[k]+=x*P[1];}else b.L[k]+=x;
  }
}
/* le CLIC — une impulsion de 1 à 4 ms, la « prise » d'un son : c'est elle qui dit au cerveau
   « maintenant ». Sans transitoire, un son arrive mou, quel que soit son volume. */
function clic(b,o,R){bruit(b,{c:'b',t0:o.t0,a:.0002,d:o.d||.012,v:o.v==null?.4:o.v,ft:o.ft||'hp',f:o.f||2500,q:.7,pan:o.pan},R);}

/* ---------------- LES TRAITEMENTS ------------------------------------------------------------ */
function sature(b,k){const t=Math.tanh(k);for(const ch of [b.L,b.R]){if(!ch)continue;for(let i=0;i<b.n;i++)ch[i]=Math.tanh(ch[i]*k)/t;}return b;}
function decime(b,bits,div){ // le grain 8 bits (ARCADE) : quantification + tenue d'échantillon
  const q=Math.pow(2,bits-1);for(const ch of [b.L,b.R]){if(!ch)continue;let h=0;for(let i=0;i<b.n;i++){if(i%div===0)h=Math.round(ch[i]*q)/q;ch[i]=h;}}return b;
}
function echo(b,dt,fb,mix,pp){ // écho (ping-pong si stéréo et `pp`) — cuit dans le son
  const D=Math.round(dt*b.sr);if(D<1)return b;
  if(b.R&&pp){for(let i=D;i<b.n;i++){const l=b.L[i-D],r=b.R[i-D];b.L[i]+=r*fb*mix;b.R[i]+=l*fb*mix;}}
  else for(const ch of [b.L,b.R]){if(!ch)continue;for(let i=D;i<b.n;i++)ch[i]+=ch[i-D]*fb;}
  return b;
}
function fondu(b,fin){const n=Math.min(b.n,Math.round(fin*b.sr));for(const ch of [b.L,b.R]){if(!ch)continue;for(let i=0;i<n;i++){const k=b.n-1-i;ch[k]*=i/n;}}return b;}
function versStereo(b,larg,R){ // élargit un son mono : un décalage de 7-13 ms, décorrélé (effet Haas doux)
  if(b.R)return b;const src=b.L.slice(),D=Math.round((.007+.006*(R?R():.5))*b.sr);b.R=new Float32Array(b.n);
  for(let i=0;i<b.n;i++){const d=i>=D?src[i-D]:0;b.R[i]=src[i]*(1-larg)+d*larg;}
  return b;
}

/* ---------------- LA SONIE (BS.1770 simplifiée, fenêtre 200 ms) ------------------------------
   ⚠ POURQUOI 200 ms ET PAS 400. La sonie « momentanée » officielle intègre 400 ms : parfait pour un
   programme, faux pour un clic de 30 ms, qu'elle trouverait 11 dB trop faible — on le pousserait
   alors jusqu'à la crête et l'interface agresserait. 200 ms est proche de l'intégration de l'oreille
   pour les sons brefs. On mesure le PIRE moment (fenêtre la plus forte), pondéré K. */
function sonie(b){
  const sr=b.sr,W=Math.max(1,Math.round(.2*sr)),H=Math.max(1,Math.round(.02*sr));
  const acc=new Float64Array(b.n);
  for(const ch of [b.L,b.R]){if(!ch)continue;const s1=Bq(),s2=Bq();s1.c=bqC('hs',1681,.7071,sr,4);s2.c=bqC('hp',38,.5,sr);
    for(let i=0;i<b.n;i++){const y=bqRun(s2,bqRun(s1,ch[i]));acc[i]+=y*y;}}
  let best=1e-12,sum=0;const pre=new Float64Array(b.n+1);for(let i=0;i<b.n;i++)pre[i+1]=pre[i]+acc[i];
  if(b.n<=W)best=pre[b.n]/W;else for(let i=0;i+W<=b.n;i+=H){const m=(pre[i+W]-pre[i])/W;if(m>best)best=m;}
  sum=best;return -0.691+10*Math.log10(Math.max(sum,1e-12));
}
function crete(b){let m=0;for(const ch of [b.L,b.R]){if(!ch)continue;for(let i=0;i<b.n;i++){const a=Math.abs(ch[i]);if(a>m)m=a;}}return m;}
function gainT(b,g){for(const ch of [b.L,b.R]){if(!ch)continue;for(let i=0;i<b.n;i++)ch[i]*=g;}}
/* LE LIMITEUR DOUX de la cuisson : au-dessus de −1 dBFS, une courbe tanh arrondit la crête au lieu
   de la trancher. Il ne travaille que sur les sons à fort facteur de crête (un clic très bref qu'on
   a dû monter pour qu'il s'entende) — les autres n'y touchent jamais. */
function plafond(b,c){const m=crete(b);if(m<=c)return;for(const ch of [b.L,b.R]){if(!ch)continue;for(let i=0;i<b.n;i++){const x=ch[i]/c;ch[i]=c*(Math.abs(x)<.7?x:Math.sign(x)*(.7+.3*Math.tanh((Math.abs(x)-.7)/.3)));}}}

/* ============================== LE CATALOGUE ================================================== */
const DEFS={};
/* D(id, fiche) — bus, db (niveau de mixage en dB autour de la référence −20 LUFS), max (voix
   simultanées de CE son), cd (délai minimal entre deux départs, s), v (variantes cuites), key (suit
   la tonalité de la musique), rj/vj (hasard de hauteur/de volume à chaque départ : un son répété à
   l'identique devient une alarme en trois minutes), dur (durée cuite), st (stéréo), r (la recette),
   fam (la famille, pour le banc d'écoute), dit (ce qu'on entend, en une phrase). */
function D(id,f){f.id=id;f.bus=f.bus||'rec';f.db=f.db||0;f.max=f.max||3;f.cd=f.cd==null?.03:f.cd;f.v=f.v||1;f.rj=f.rj==null?.012:f.rj;f.vj=f.vj==null?1:f.vj;DEFS[id]=f;}
G.CCSON_D=D;G.CCSON_DEFS=DEFS;
/* LA BOUCLE SANS COUTURE (débogage du 2026-09-29 : la 1re version recopiait la fin sur le début — la couture sautait, et le fondu
   de sortie de 6 ms creusait un trou à chaque tour). Méthode juste : on garde x[n..N) et on fond sa QUEUE vers x[0..n) à puissance
   constante — le dernier échantillon retombe pile sur celui qui suit le début. La toile raccourcit de `fen` secondes. */
function boucle(b,fen){
  const n=Math.max(1,Math.round(fen*b.sr)),N=b.n,M=N-n;
  for(const k of ['L','R']){const x=b[k];if(!x)continue;const y=new Float32Array(M);
    for(let i=0;i<M;i++)y[i]=x[i+n];
    for(let j=0;j<n;j++){const a=j/n*Math.PI/2;y[M-n+j]=x[N-n+j]*Math.cos(a)+x[j]*Math.sin(a);}
    b[k]=y;}
  b.n=M;b.dur=M/b.sr;b.boucle=true;return b;
}
/* le passe-haut CIRCULAIRE (anti-décalage continu d'une boucle) : le filtre tourne une fois « à blanc » sur la boucle pour se mettre
   en régime, puis une seconde fois pour de bon — pas de transitoire au début, donc pas de clic à la couture */
function hpCirc(b,f){for(const ch of [b.L,b.R]){if(!ch)continue;const s=Bq();s.c=bqC('hp',f,.7071,b.sr);for(let i=0;i<b.n;i++)bqRun(s,ch[i]);for(let i=0;i<b.n;i++)ch[i]=bqRun(s,ch[i]);}}
G.CCSON_OUTILS={boucle:boucle,Toile:Toile,osc:osc,bruit:bruit,cloche:cloche,corde:corde,clic:clic,filtre:filtre,sature:sature,decime:decime,echo:echo,fondu:fondu,versStereo:versStereo,env:env,Bq:Bq,bqC:bqC,bqRun:bqRun,gainT:gainT};

/* ================================ LA CUISSON ================================================== */
const REF=-20; // la sonie de référence de toute la palette (LUFS, fenêtre 200 ms) — dans le tampon ; le lecteur retire ensuite TRIM
/* ⚠ TRIM : l'étalonnage sur l'ANCIEN mixage. Mesuré le 2026-09-28 (banc ancien.js) : les sons d'avant sortaient de −42 LUFS
   (le clic d'interface, presque inaudible) à −15 (l'explosion), la pièce à −34, les carillons à −32. Le bus du jeu (MASTER →
   compresseur à gain de rattrapage automatique → tanh) ajoute ~+10 dB aux petits signaux : c'est DANS ce contexte que la palette
   a été accordée. Ici la référence tombe donc à −30 LUFS, et chaque fiche se règle autour : pièce −3 → −33, l'explosion +13 → −17. */
const TRIM=-10;
/* ⚠ LA CUISSON À 32 kHz. Un AudioBuffer peut avoir SA fréquence : le navigateur le rééchantillonne à la lecture. 32 kHz garde
   tout jusqu'à 16 kHz (au-delà, un haut-parleur de téléphone ne rend rien) et coûte un tiers de mémoire et de calcul en moins.
   `hq:1` sur une fiche la cuit à la fréquence du contexte (pour les très aigus qu'on transpose vers le haut). */
const SR_CUISSON=32000;
function cuireBrut(id,variante,sr,tel,base){
  const f=DEFS[id];if(!f)return null;
  const R=hasard(hache(id)*31+(variante|0)*7919+(base|0)*104729+1);
  const b=Toile(sr,f.dur||.5,!!f.st);
  f.r(b,R,{tel:!!tel,v:variante|0,base:base|0});
  /* (débogage 2026-09-29) LE DÉCALAGE CONTINU : les carrés asymétriques et le bruit brun laissaient une composante continue (mesurée
     jusqu'à 0,016 sur ui.erreur / ui.refus) — un « pop » à l'attaque et à la fin, et du grave inutile qui pompe le compresseur.
     Passe-haut 18 Hz sur tout (circulaire pour une boucle). */
  if(b.boucle)hpCirc(b,18);else filtre(b,'hp',18,.7071);
  // normalisation : sonie de référence + le niveau de la fiche
  const L=sonie(b);if(isFinite(L)&&L>-90)gainT(b,Math.pow(10,(REF-L)/20));
  /* crête plafonnée à −2 dBFS (et non −1) : décodé, le MP3 DÉPASSE la crête d'origine sur les attaques sèches (nitro.vide et ui.appui
     écrêtaient : mesuré au contrôle de la banque) */
  plafond(b,.8);
  // fondu de sortie de 6 ms : jamais de clic en fin de tampon (sauf une boucle : sa fin EST son début)
  if(!b.boucle)fondu(b,.006);
  return b;
}
G.CCSON_cuireBrut=cuireBrut;G.CCSON_sonie=sonie;G.CCSON_crete=crete;

G.CCSON_REF=REF;G.CCSON_SR=SR_CUISSON;
})(typeof window!=='undefined'?window:globalThis);

/* ================================================================================================
   LES RECETTES — la palette du jeu, famille par famille.
   ⚠ LA GRAMMAIRE (à respecter pour tout son ajouté) — ce qui fait qu'on RECONNAÎT un son sans regarder :
     · la MATIÈRE dit la famille : l'ARGENT est en métal (cloches modales, pièces, tiroir-caisse),
       le STYLE en synthé néon (cordes pincées, cuivres de synthé, nappes), le DANGER en choc et en
       bruit (plastique, tôle, grave sale), l'INTERFACE en laque (petits « tock » vitrés, secs, brefs).
     · la HAUTEUR dit le sens : ce qui monte récompense, ce qui descend retire ; tout ce qui a une note
       est dans la pentatonique de mi (degrés 0 2 4 7 9) — `key:1` le transpose dans le morceau qui joue.
     · la TAILLE dit la rareté : un événement fréquent est BREF et doux (< 300 ms), un rarissime a
       droit à l'ampleur (sub, salle, queue). Le jackpot ne sonne pas comme une pièce plus forte.
   ================================================================================================ */
(function(G){
'use strict';
const D=G.CCSON_D,O=G.CCSON_OUTILS,osc=O.osc,bruit=O.bruit,cloche=O.cloche,corde=O.corde,clic=O.clic;
const E4=329.6276,nE=function(st){return E4*Math.pow(2,st/12);}; // nE(12)=mi5, nE(19)=si5, nE(24)=mi6
const P=[0,2,4,7,9]; // la pentatonique (degrés en demi-tons)
function pd(i){return P[((i%5)+5)%5]+12*Math.floor(i/5);} // i-ème degré de la pentatonique, en demi-tons depuis mi
G.CCSON_pd=pd;

/* ---------- INTERFACE — la LAQUE : petits objets vitrés, secs, brefs, jamais criards ---------------
   Un appui = une prise (clic 2-6 ms) + un corps accordé (sinus qui chute de 6 % en 12 ms : le « tock »
   d'une touche qui s'enfonce) + un poids (grave bref sous le doigt). */
function tock(b,R,f,t0,v,poids){
  clic(b,{t0:t0,f:3500,d:.006,v:.3*v},R);
  osc(b,{f:f*1.06,f1:f,g:.012,w:'sin',t0:t0,a:.001,d:.075,v:.5*v});
  osc(b,{f:f*2.76,w:'sin',t0:t0,a:.0008,d:.025,v:.11*v});
  if(poids)osc(b,{f:330,f1:210,g:.03,w:'sin',t0:t0,a:.002,d:.055,v:.32*v*poids});
}
D('ui.tap',{fam:'interface',bus:'ui',dur:.16,key:1,db:0,max:3,cd:.035,dit:"appui d'un bouton principal (or) : tock vitré + poids du doigt",
  r:function(b,R){tock(b,R,nE(24),0,1,1);}});
D('ui.nav',{fam:'interface',bus:'ui',dur:.12,key:1,db:-3,max:3,cd:.035,dit:'appui secondaire (cyan, icônes) : tick plus clair, sans poids',
  r:function(b,R){clic(b,{t0:0,f:5000,d:.004,v:.28},R);osc(b,{f:nE(31)*1.04,f1:nE(31),g:.01,t0:0,a:.001,d:.05,v:.42});osc(b,{f:nE(19),t0:0,a:.001,d:.03,v:.14});}});
D('ui.retour',{fam:'interface',bus:'ui',dur:.2,key:1,db:-3,max:2,cd:.05,dit:'retour / fermer : deux ticks qui DESCENDENT (on recule)',
  r:function(b,R){tock(b,R,nE(24),0,.8,.5);tock(b,R,nE(19),.045,.55,0);}});
D('ui.on',{fam:'interface',bus:'ui',dur:.2,key:1,db:-1,max:2,cd:.05,dit:'interrupteur ALLUMÉ : quinte qui monte',
  r:function(b,R){tock(b,R,nE(19),0,.7,.6);tock(b,R,nE(24),.055,.9,0);}});
D('ui.off',{fam:'interface',bus:'ui',dur:.2,key:1,db:-4,max:2,cd:.05,dit:'interrupteur ÉTEINT : quinte qui descend, plus sourde',
  r:function(b,R){tock(b,R,nE(24),0,.7,.6);tock(b,R,nE(19),.055,.6,0);O.filtre(b,'lp',5000,.7);}});
D('ui.onglet',{fam:'interface',bus:'ui',dur:.12,key:1,db:-5,max:2,cd:.04,dit:"changement d'onglet : tick + froissé bref",
  r:function(b,R){clic(b,{t0:0,f:4000,d:.004,v:.25},R);bruit(b,{c:'r',t0:0,a:.004,d:.05,v:.3,ft:'bp',f:2600,q:1.4},R);osc(b,{f:nE(28),t0:.002,a:.001,d:.035,v:.22});}});
D('ui.curseur',{fam:'interface',bus:'ui',dur:.05,db:-10,max:2,cd:.028,rj:0,dit:'cran de curseur (volume) : la hauteur suit la valeur',
  r:function(b,R){clic(b,{t0:0,f:6000,d:.003,v:.3},R);osc(b,{f:2200,t0:0,a:.0006,d:.02,v:.5});}});
D('ui.volet',{fam:'interface',bus:'ui',dur:.5,st:1,db:-8,max:2,cd:.12,rj:.03,dit:"volet de transition d'écran : souffle qui traverse la stéréo",
  r:function(b,R){bruit(b,{c:'r',t0:0,a:.07,h:.05,d:.28,v:.6,ft:'bp',f:380,f1:3000,g:.3,gc:1.3,q:1.1,pan:-.7,pan1:.7},R);
    bruit(b,{c:'b',t0:.13,a:.02,d:.16,v:.12,ft:'hp',f:6500,q:.7,pan:.3},R);}});
D('ui.feuille',{fam:'interface',bus:'ui',dur:.5,db:-8,max:2,cd:.1,rj:.02,dit:"une feuille / un panneau s'ouvre : souffle qui monte + le panneau se pose",
  r:function(b,R){bruit(b,{c:'r',t0:0,a:.1,d:.3,v:.5,ft:'bp',f:450,f1:2300,g:.34,gc:.6,q:1.2},R);osc(b,{f:240,f1:170,g:.04,t0:.36,a:.002,d:.07,v:.3});clic(b,{t0:.36,f:3000,d:.004,v:.12},R);}});
D('ui.feuilleFerme',{fam:'interface',bus:'ui',dur:.35,db:-9,max:2,cd:.1,rj:.02,dit:'une feuille se referme : souffle qui descend',
  r:function(b,R){bruit(b,{c:'r',t0:0,a:.02,d:.18,v:.5,ft:'bp',f:2100,f1:420,g:.18,q:1.2},R);osc(b,{f:180,f1:130,g:.04,t0:.13,a:.002,d:.06,v:.25});}});
D('ui.refus',{fam:'interface',bus:'ui',dur:.3,db:-5,max:1,cd:.25,rj:0,dit:"refusé / verrouillé / pas assez d'argent : « non-non » sourd, jamais agressif",
  r:function(b,R){osc(b,{f:196,w:'sq',pw:.35,t0:0,a:.003,h:.03,d:.07,v:.3,flt:['lp',1100,500,.08,.8]});osc(b,{f:98,t0:0,a:.002,d:.07,v:.3});
    osc(b,{f:185,w:'sq',pw:.35,t0:.105,a:.003,h:.03,d:.08,v:.26,flt:['lp',1000,420,.09,.8]});osc(b,{f:92.5,t0:.105,a:.002,d:.08,v:.26});}});
D('ui.pop',{fam:'interface',bus:'ui',dur:.14,key:1,db:-5,max:3,cd:.05,dit:'une pastille / un badge apparaît : bulle qui éclate vers le haut',
  r:function(b,R){osc(b,{f:nE(12),f1:nE(31),g:.035,gc:.6,t0:0,a:.002,d:.08,v:.45});clic(b,{t0:.03,f:5000,d:.003,v:.2},R);}});
D('ui.compte',{fam:'interface',bus:'ui',dur:.1,key:1,db:-10,max:4,cd:0,bases:[0,12],rj:.004,vj:.5,dit:"un cran du montant qui s'égrène (la hauteur MONTE avec st)",
  r:function(b,R,o){clic(b,{t0:0,f:5500,d:.003,v:.25},R);osc(b,{f:nE(24+o.base),t0:0,a:.0008,d:.05,v:.45});osc(b,{f:nE(24+o.base)*2.76,t0:0,a:.0006,d:.02,v:.1});}});
D('ui.compteFin',{fam:'interface',bus:'rec',dur:1.3,key:1,db:-2,max:1,cd:.3,dit:"le montant s'arrête : cloche d'accord posé + poussière d'or",
  r:function(b,R){for(const [st,t,v] of [[24,0,.5],[28,.012,.34],[31,.024,.3],[36,.036,.18]])cloche(b,{f:nE(st),r:[1,2,2.76,5.4],m:[1,.3,.16,.05],d:[1.1,.5,.25,.08],t0:t,v:v,jit:.002},R);
    bruit(b,{c:'b',t0:.02,a:.01,d:.35,v:.07,ft:'hp',f:7500},R);osc(b,{f:165,f1:110,g:.08,t0:0,a:.002,d:.18,v:.28});}});
D('ui.bip',{fam:'interface',bus:'ui',dur:.4,key:1,db:-1,max:2,cd:.2,rj:0,vj:0,dit:"compte à rebours 3-2-1 : bip d'arcade de départ",
  r:function(b,R){osc(b,{f:nE(19),w:'sq',pw:.5,t0:0,a:.002,h:.09,d:.18,v:.26,flt:['lp',3200,1800,.2,.8]});osc(b,{f:nE(7),t0:0,a:.002,h:.09,d:.15,v:.3});}});
D('ui.go',{fam:'interface',bus:'ui',dur:1,key:1,db:+1,max:1,cd:.3,rj:0,vj:0,dit:"PARTEZ ! : la note haute tenue + l'accord + la crash",
  r:function(b,R){for(const [st,v] of [[24,.26],[19,.16],[12,.2]])osc(b,{f:nE(st),w:'sq',pw:.5,t0:0,a:.003,h:.22,d:.5,v:v,flt:['lp',5000,2000,.5,.7]});
    bruit(b,{c:'b',t0:0,a:.002,d:.7,v:.18,ft:'hp',f:5000},R);osc(b,{f:110,f1:55,g:.2,t0:0,a:.002,d:.35,v:.5});}});
D('ui.equipe',{fam:'interface',bus:'ui',dur:.6,key:1,db:-2,max:1,cd:.15,dit:'équiper (caisse, peinture, traînée) : loquet mécanique + quinte de confirmation',
  r:function(b,R){clic(b,{t0:0,f:2000,d:.012,v:.45},R);osc(b,{f:190,f1:115,g:.05,t0:0,a:.001,d:.08,v:.5});clic(b,{t0:.065,f:3500,d:.006,v:.3},R);
    cloche(b,{f:nE(19),r:[1,2,2.76],m:[1,.25,.1],d:[.35,.15,.06],t0:.1,v:.32},R);cloche(b,{f:nE(24),r:[1,2,2.76],m:[1,.25,.1],d:[.5,.2,.08],t0:.16,v:.36},R);}});
D('ui.debloque',{fam:'interface',bus:'rec',dur:1.4,key:1,db:0,max:1,cd:.3,dit:"déblocage : le cadenas saute + arpège qui monte + poussière d'or",
  r:function(b,R){clic(b,{t0:0,f:2500,d:.01,v:.5},R);osc(b,{f:2400,f1:1700,g:.1,t0:.005,a:.001,d:.12,v:.14});clic(b,{t0:.06,f:1800,d:.015,v:.4},R);osc(b,{f:160,f1:100,g:.05,t0:.06,a:.001,d:.1,v:.45});
    [12,16,19,24,28].forEach(function(st,i){cloche(b,{f:nE(st),r:[1,2,2.76,5.4],m:[1,.3,.14,.04],d:[.9,.4,.2,.06],t0:.13+i*.065,v:.3+i*.03,jit:.002},R);});
    bruit(b,{c:'b',t0:.3,a:.05,d:.6,v:.08,ft:'hp',f:7000},R);}});
D('ui.achat',{fam:'interface',bus:'rec',dur:1.7,st:1,key:1,db:+1,max:1,cd:.3,dit:'ACHAT : le tiroir-caisse (tiroir qui claque, double cloche, pièces qui roulent)',
  r:function(b,R){ // le tiroir : un claquement de tôle
    bruit(b,{c:'r',t0:0,a:.001,d:.12,v:.55,ft:'lp',f:900,q:.7},R);cloche(b,{f:520,r:[1,1.47,2.09,2.56],m:[1,.6,.4,.3],d:[.16,.1,.08,.06],t0:0,v:.22,jit:.01},R);
    // le « ka-CHING » : deux frappes de la cloche du tiroir, la seconde plus claire
    cloche(b,{f:nE(31),r:[1,2,2.76,3.9,5.4],m:[1,.4,.3,.12,.06],d:[1.3,.7,.45,.2,.1],t0:.07,v:.4,jit:.003,pan:-.1},R);
    cloche(b,{f:nE(31),r:[1,2,2.76,3.9,5.4],m:[1,.45,.35,.15,.08],d:[1.5,.8,.5,.22,.12],t0:.13,v:.46,jit:.003,pan:.1},R);
    for(let i=0;i<14;i++){const t=.16+R()*.5,f=2600+R()*3400;cloche(b,{f:f,r:[1,1.52,2.37],m:[1,.5,.3],d:[.05,.03,.02],t0:t,v:.05+R()*.06,pan:R()*1.6-.8},R);}
    osc(b,{f:130,f1:70,g:.1,t0:0,a:.002,d:.2,v:.4});}});
D('ui.record',{fam:'interface',bus:'rec',dur:2.2,st:1,key:1,db:+2,max:1,cd:1,dit:'NOUVEAU RECORD : fanfare de cuivres de synthé ta-ta-TAAA + timbale + cymbale',
  r:function(b,R){
    const stab=function(t,notes,h,d,v){for(const st of notes)for(const dt of [-.004,.004,0])osc(b,{f:nE(st)*(1+dt),w:'saw',t0:t,a:.006,h:h,d:d,v:v/3,pan:dt*120,flt:['lp',700,4200,.05,.9,.5]});};
    stab(0,[12,16,19],.05,.12,.12);stab(.15,[12,16,19],.05,.12,.12);stab(.3,[12,19,24,28],.35,1.1,.15);
    osc(b,{f:110,f1:62,g:.25,t0:.3,a:.002,d:.7,v:.5});bruit(b,{c:'n',t0:.3,a:.002,d:.3,v:.3,ft:'lp',f:400},R);
    bruit(b,{c:'b',t0:.05,a:.25,d:1.2,v:.1,ft:'hp',f:6000,pan:-.3,pan1:.3},R);
    [31,36,40,43].forEach(function(st,i){cloche(b,{f:nE(st),r:[1,2,2.76],m:[1,.3,.1],d:[.7,.3,.1],t0:.42+i*.06,v:.12,pan:(i%2?.5:-.5)},R);});}});
D('ui.mission',{fam:'interface',bus:'rec',dur:1.2,key:1,db:0,max:1,cd:.4,dit:'défi / mission accompli : le TAMPON qui claque + trois cloches qui montent',
  r:function(b,R){bruit(b,{c:'r',t0:0,a:.001,d:.08,v:.7,ft:'lp',f:1400},R);osc(b,{f:120,f1:62,g:.08,t0:0,a:.001,d:.16,v:.6});clic(b,{t0:0,f:2500,d:.008,v:.35},R);
    [12,19,24].forEach(function(st,i){cloche(b,{f:nE(st),r:[1,2,2.76,5.4],m:[1,.3,.15,.04],d:[.8,.35,.18,.05],t0:.14+i*.08,v:.3+i*.05},R);});}});
D('ui.banniere',{fam:'interface',bus:'rec',dur:1.8,db:0,max:1,cd:.6,dit:"bannière de niveau qui s'abat : impact de cinéma + anneau de tôle",
  r:function(b,R){osc(b,{f:72,f1:38,g:.4,t0:0,a:.002,d:.9,v:.8});bruit(b,{c:'r',t0:0,a:.001,d:.4,v:.5,ft:'lp',f:2400,f1:300,g:.3},R);clic(b,{t0:0,f:1800,d:.02,v:.5},R);
    cloche(b,{f:nE(-5),r:[1,2.76,5.4,8.9,13.3],m:[1,.5,.3,.15,.08],d:[1.4,.9,.5,.25,.12],t0:.004,v:.22,jit:.004},R);
    bruit(b,{c:'b',t0:.02,a:.01,d:.9,v:.06,ft:'hp',f:5000},R);}});
D('ui.carte',{fam:'interface',bus:'rec',dur:.9,key:1,db:-4,max:1,cd:.3,st:1,dit:'une carte se retourne / se révèle : souffle + éclat aigu',
  r:function(b,R){bruit(b,{c:'r',t0:0,a:.05,d:.24,v:.45,ft:'bp',f:1000,f1:4200,g:.24,q:1.1,pan:-.5,pan1:.5},R);
    cloche(b,{f:nE(36),r:[1,2,3],m:[1,.3,.1],d:[.7,.3,.1],t0:.2,v:.18},R);cloche(b,{f:nE(43),r:[1,2],m:[1,.2],d:[.5,.2],t0:.24,v:.1},R);}});

/* ---------- L'ARGENT — le MÉTAL : pièces, cloches, tiroir. Tout ce qui paie sonne en métal. ---------- */
/* LA PIÈCE. La gamme se joue en `st` (demi-tons au-dessus de mi5) : la pentatonique du combo.
   Anatomie : le CONTACT (clic 6 kHz, 2 ms) + la FONDAMENTALE (sinus, 0,45 s) + l'OCTAVE vitrée +
   la douzième + un mode inharmonique à ×5,43 (c'est lui qui dit « métal » et pas « verre ») + un
   petit corps une octave sous (sans lui la pièce est un sifflet). */
/* LA PIÈCE v2 — LE PETIT « TCHIC » GRAVE (2026-10-15, Sacha : « il y a trop plein de petits sons aigus quand on roule, avec des pièces ;
   les pièces, tu peux les faire un peu moins fort, un petit tintement, un petit tchic, un petit tchic grave ; pas plein de ding-ding-ding »).
   MESURÉ au banc (40 s de course) : 119 pièces, 3 par seconde, dont la note montait de mi5 à mi7 (659 Hz → 2,6 kHz) et sonnait 0,45 s.
   Ici une octave SOUS l'ancienne (mi4, 330 Hz ; le jeu plafonne la gamme du combo à l'octave : GAMME_P), une matière de vraie pièce de
   monnaie (modes 2,32 · 4,25 : la pièce, pas le verre) éteinte en 0,13 s — un tintement qui ne traîne pas, trois fois par seconde sans
   faire sonnerie. Le « tch » est un souffle bref à 2,4 kHz (le contact était à 6,5 kHz), le corps une octave dessous. Plus bas de 5 dB
   dans le jeu (blip : vol 0 au lieu de +4). L'ancienne recette : git, avant ce commit. */
D('piece',{fam:'argent',dur:.32,key:1,db:-5,max:6,cd:.018,v:2,rj:.004,vj:.8,pre:1,bases:[0,12],dit:'une pièce : un petit « tchic » grave, la note de la gamme du combo (st)',
  r:function(b,R,o){const f=nE(o.base);
    bruit(b,{c:'b',t0:0,a:.0006,d:.022,v:.32,ft:'bp',f:2400,q:1.3},R);clic(b,{t0:0,f:3200,d:.0015,v:.1},R);
    cloche(b,{f:f,r:[1,2.32,4.25,6.1],m:[1,.32,.14,.05],d:[.13,.06,.03,.02],t0:.002,v:.5,jit:.004},R);
    osc(b,{f:f*.5,w:'tri',t0:0,a:.001,d:.06,v:.16});}});
/* (2026-10-15) LA RÉCOLTE (toutes les 5 pièces) : la cascade mi6-si6-mi7 et sa poussière à 7,5 kHz devient deux pièces graves qui tombent
   dans la poche (mi4, si4) et le petit poids de la poche — « tchk-tchk ». */
D('piece.recolte',{fam:'argent',dur:.4,key:1,db:-6,max:2,cd:.1,st:1,dit:'la RÉCOLTE (toutes les 5 pièces) : deux pièces graves qui tombent dans la poche — « tchk-tchk » + le petit poids',
  r:function(b,R){[[0,0,-.25],[7,.05,.25]].forEach(function(n){bruit(b,{c:'b',t0:n[1],a:.0006,d:.02,v:.26,ft:'bp',f:2100,q:1.2,pan:n[2]},R);
      cloche(b,{f:nE(n[0]),r:[1,2.32,4.25],m:[1,.3,.12],d:[.16,.07,.03],t0:n[1]+.002,v:.42,pan:n[2],jit:.004},R);});
    osc(b,{f:150,f1:95,g:.06,t0:.05,a:.002,d:.1,v:.3});bruit(b,{c:'n',t0:.05,a:.002,d:.06,v:.3,ft:'lp',f:500},R);}});
})(typeof window!=='undefined'?window:globalThis);

/* <<<PALETTE>>> */
(function(G){
'use strict';
const D=G.CCSON_D,O=G.CCSON_OUTILS,osc=O.osc,bruit=O.bruit,cloche=O.cloche,corde=O.corde,clic=O.clic,Toile=O.Toile,filtre=O.filtre;
const nE=function(st){return 329.6276*Math.pow(2,st/12);};
const PD=[0,2,4,7,9];function pd(i){return PD[((i%5)+5)%5]+12*Math.floor(i/5);}

/* ================================ LES OUTILS DE COMPOSITION ====================================
   Des gestes de sound designer, pas des oscillateurs : un « pluck », un « stab », un souffle, un coup. Chaque
   famille les dose à sa façon — c'est ce qui fait qu'on les reconnaît sans les confondre. */

/* le GRAVE, lisible sur un téléphone : sous ~150 Hz un haut-parleur de téléphone ne rend RIEN. La fondamentale
   est donc TOUJOURS doublée de ses harmoniques 2 et 3 : au casque on sent le sub, sur le haut-parleur l'oreille
   reconstruit le grave absent (la « basse fantôme » des mixeurs) — une seule banque pour les deux. */
function grave(b,o,t0,f0,f1,g,d,v){
  osc(b,{f:f0,f1:f1,g:g,t0:t0,a:.002,d:d,v:v});
  osc(b,{f:f0*2,f1:f1*2,g:g,t0:t0,a:.002,d:d*.6,v:v*.3});osc(b,{f:f0*3,f1:f1*3,g:g,w:'tri',t0:t0,a:.002,d:d*.4,v:v*.12});
}
/* le PLUCK NÉON — la corde du synthé : deux dents de scie désaccordées + la sous-octave carrée, filtre qui se
   referme (le « pling » vient de là), et une vraie corde pincée dessous pour la matière. */
function pluck(b,R,f,t0,v,d,br,pan){
  br=br==null?1:br;
  for(const dt of [-.006,.006])osc(b,{f:f*(1+dt),w:'saw',t0:t0,a:.002,d:d,v:v*.3,pan:(pan||0)+dt*40,flt:['lp',900+5200*br,700,.13,.9,.45]});
  osc(b,{f:f*.5,w:'sq',pw:.5,t0:t0,a:.002,d:d*.6,v:v*.12,flt:['lp',1800*br+400,300,.1,.7]});
  corde(b,{f:f,t0:t0,d:d*1.2,v:v*.35,br:.5+.4*br,pan:pan},R);
}
/* le STAB — l'accord de cuivres de synthé : trois dents de scie par note, écartées en stéréo, filtre qui s'OUVRE
   à l'attaque (le « blam ») puis se referme. `notes` en demi-tons au-dessus de mi4. */
function stab(b,R,notes,t0,h,d,v,ouv){
  ouv=ouv||1;
  for(let n=0;n<notes.length;n++){const f=nE(notes[n]);
    for(const dt of [-.007,0,.007])osc(b,{f:f*(1+dt),w:'saw',t0:t0,a:.004,h:h,d:d,v:v/3,pan:dt*90,flt:['lp',600,1200+3800*ouv,.04,.85,.4]});}
}
/* la NAPPE — attaque lente, filtre fixe : ce qui tient un accord sous une récompense */
function nappe(b,R,notes,t0,a,h,d,v,fc){
  for(const st of notes){const f=nE(st);for(const dt of [-.005,.005])osc(b,{f:f*(1+dt),w:'saw',t0:t0,a:a,h:h,d:d,v:v/2,pan:dt*110,flt:['lp',fc||2000,fc||2000,1,.7]});}
}
/* le CHŒUR « AAAH » — dents de scie passées dans trois formants de voyelle : la couleur « sacrée » réservée
   aux moments rarissimes (DIVIN, frénésie, fin de monde). On le rend dans une toile à part, puis on filtre. */
function choeur(b,R,notes,t0,a,h,d,v){
  const t=Toile(b.sr,b.dur,!!b.R);
  for(const st of notes){const f=nE(st);for(const dt of [-.004,.003,.008])osc(t,{f:f*(1+dt),w:'saw',t0:t0,a:a,h:h,d:d,v:1,pan:dt*80,vib:[5.2,.004]});}
  const F=[[730,1,6],[1090,.55,7],[2440,.3,8]];
  for(const [fr,gn,q] of F){const u=Toile(b.sr,b.dur,!!b.R);u.L.set(t.L);if(t.R)u.R.set(t.R);filtre(u,'bp',fr,q);
    for(let i=0;i<b.n;i++){b.L[i]+=u.L[i]*gn*v*.6;if(b.R)b.R[i]+=u.R[i]*gn*v*.6;}}
}
/* le SOUFFLE qui passe — bruit rose en bande glissante, qui traverse la stéréo */
function swish(b,R,t0,d,f0,f1,v,p0,p1,q){bruit(b,{c:'r',t0:t0,a:d*.35,d:d*.9,v:v,ft:'bp',f:f0,f1:f1,g:d,gc:.8,q:q||1.2,pan:p0||0,pan1:p1==null?(p0||0):p1},R);}
/* la POUSSIÈRE D'OR — des micro-clochettes pentatoniques semées dans l'aigu (tonales : elles restent dans le morceau) */
function scintille(b,R,t0,dur,n,v,lo,hi){
  lo=lo==null?29:lo;hi=hi==null?41:hi;
  for(let i=0;i<n;i++){const k=Math.floor(R()*(hi-lo+1))+lo,st=pd(Math.round(k*5/12)),t=t0+Math.pow(R(),1.3)*dur;
    cloche(b,{f:nE(st),r:[1,2.76],m:[1,.2],d:[.18+R()*.2,.06],t0:t,v:v*(.5+R()*.5),pan:R()*1.6-.8},R);}
}
/* la PLUIE DE PIÈCES — des pièces qui tombent et rebondissent (une note de la gamme chacune) */
function pieces(b,R,t0,dur,n,v){
  for(let i=0;i<n;i++){const t=t0+Math.pow(R(),.8)*dur,st=pd(10+Math.floor(R()*7));
    clic(b,{t0:t,f:6500,d:.0015,v:v*.4},R);cloche(b,{f:nE(st),r:[1,2,3.01,5.43],m:[1,.35,.15,.1],d:[.22,.1,.05,.03],t0:t,v:v*(.4+R()*.6),pan:R()*1.6-.8,jit:.004},R);}
}
/* les CRÉPITEMENTS — des micro-explosions de bruit brun, densité qui s'égrène */
function crepite(b,R,t0,dur,n,v,f0,f1){
  for(let i=0;i<n;i++){const t=t0+Math.pow(R(),1.6)*dur;
    bruit(b,{c:'n',t0:t,a:.0006,d:.012+R()*.04,v:v*(.4+R()*.8),ft:'lp',f:(f0||500)+R()*((f1||1800)-(f0||500)),q:.7,pan:R()*1.4-.7},R);}
}
/* la TÔLE — modes inharmoniques d'une plaque de métal (2,39 · 3,86 · 5,3 · 7,1 : ni cloche ni verre) */
function tole(b,R,t0,f,v,d){d=d||.4;cloche(b,{f:f,r:[1,2.39,3.86,5.3,7.1],m:[1,.7,.5,.35,.25],d:[d,d*.7,d*.5,d*.35,d*.25],t0:t0,v:v,jit:.02},R);}
/* le PLASTIQUE creux — modes serrés et secs */
function plastique(b,R,t0,f,v){cloche(b,{f:f,f1:f*.82,g:.05,r:[1,1.58,2.24,3.1],m:[1,.55,.35,.2],d:[.11,.07,.05,.03],t0:t0,v:v,jit:.03},R);bruit(b,{c:'b',t0:t0,a:.0005,d:.03,v:v*.5,ft:'hp',f:2500},R);}
/* le BOIS (bloc de bois) — le TIC-TAC des alertes : sec, jamais une cloche (une cloche dit « gagné ») */
function bois(b,R,t0,f,v){cloche(b,{f:f,r:[1,2.46,4.6],m:[1,.35,.12],d:[.07,.035,.015],t0:t0,v:v},R);clic(b,{t0:t0,f:2000,d:.004,v:v*.4},R);}
/* la BULLE — une note qui monte très vite : l'eau, le jus, le « plop » */
function bulle(b,R,t0,f0,f1,d,v,pan){osc(b,{f:f0,f1:f1,g:d*.8,gc:.5,t0:t0,a:.001,d:d,v:v,pan:pan});}
/* le COUP — impact : prise + corps de bruit + grave */
function coup(b,R,o,t0,v,fc,f0,f1,dg){clic(b,{t0:t0,f:1800,d:.012,v:v*.5},R);bruit(b,{c:'r',t0:t0,a:.001,d:.16,v:v*.6,ft:'lp',f:fc||900,q:.7},R);grave(b,o,t0,f0||110,f1||48,.12,dg||.28,v*.8);}

/* ================== LE GRAVE QUI CLAQUE (2026-10-15, Sacha : « trop de petits sons aigus quand on roule, plein de ding-ding-ding ;
   plus de sons graves et discrets ; pour les figures, des sons plus graves, genre doum, doum — applique-toi bien pour les figures »)
   ⚠ MESURÉ AVANT (mesure-sons, haut-parleur = passe-haut 200 Hz, ce que rend un iPhone) : l'explosion qui lance une figure avait 94 % de
   son énergie sous 150 Hz et sortait 8 dB plus bas au haut-parleur qu'au casque (le choc de pose : 10 dB) — le « doum » n'existait qu'au
   casque. Les trois outils ci-dessous gardent le grave AUDIBLE au téléphone : le DOUM est saturé dans sa propre toile (la saturation
   fabrique les harmoniques 2 à 5, 110-450 Hz, que le haut-parleur rend ; l'oreille reconstruit la fondamentale absente), la BASSE vit à
   150-600 Hz, le WOUOM est un souffle brun. Exportés (`G.CCSON_GRAVE`) pour les blocs MOTEUR et FRÉNÉSIE. */
function mixe(b,t,g,pan){const a=((pan||0)+1)*Math.PI/4,gl=Math.cos(a)*g,gr=Math.sin(a)*g; // une toile MONO versée dans b (centrée = −3 dB par côté, comme osc)
  for(let i=0;i<b.n&&i<t.n;i++){const x=t.L[i];if(b.R){b.L[i]+=x*gl;b.R[i]+=x*gr;}else b.L[i]+=x*g;}}
/* le DOUM — la grosse caisse, en trois étages, saturés ensemble (sat) puis adoucis (passe-bas lp) :
   · le SOUS : un sinus qui TOMBE (f0×2,4 → f0 en ~60 ms : le « d » ; puis f0 → f1 : le « oum ») — le poids, au casque ;
   · le CORPS : un ton 5× plus haut sur la même chute (≈ 470 → 210 Hz), court — le « tom » que le haut-parleur d'un téléphone rend ;
     + un carré filtré (ses harmoniques impaires) et un bruit brun ;
   · le TOC à 1-1,5 kHz qui le dessine — sans lui, un grave est une bouillie.
   MESURÉ (essai-doum, passe-haut 200 Hz) : le sous seul perdait 12 dB au téléphone (77 % sous 150 Hz) ; avec le corps, 3,4 dB (46 %). */
function doum(b,R,t0,v,f0,f1,d,o){o=o||{};const t=Toile(b.sr,b.dur,false);
  osc(t,{f:f0*2.4,f1:f1,g:d*.7,gc:.28,t0:t0,a:.0012,d:d*.65,v:.3});
  osc(t,{f:f0*6.5,f1:f1*5,g:d*.5,gc:.4,t0:t0,a:.001,d:d*.35,v:.9});
  osc(t,{f:f0*2.4,f1:f1,g:d*.7,gc:.28,w:'sq',pw:.5,t0:t0,a:.0012,d:d*.55,v:.3,flt:['lp',1100,420,d*.5,.8,.5]});
  bruit(t,{c:'n',t0:t0,a:.001,d:o.corps||.09,v:.5,ft:'lp',f:o.fc||450,q:.7},R);
  O.sature(t,o.sat||2.2);filtre(t,'lp',o.lp||1500,.7);mixe(b,t,v,o.pan);
  if(o.toc!==0)clic(b,{t0:t0,f:o.toc||1200,d:.005,v:v*(o.vt||.3),ft:'bp',pan:o.pan},R);}
/* le WOUOM — l'air qui passe, dans le grave : un souffle brun dont le passe-bas s'ouvre (lo → hi) puis se referme, qui peut traverser
   la stéréo (p0 → p1). C'est le « wouom » d'un objet lourd qui tourne près de l'oreille, pas le « fffit » aigu d'avant. */
function wouom(b,R,t0,d,lo,hi,v,p0,p1,am){p0=p0||0;p1=p1==null?p0:p1;
  bruit(b,{c:'n',t0:t0,a:d*.42,d:d*.5,v:v,ft:'lp',f:lo,f1:hi,g:d*.42,gc:.8,q:1.2,pan:p0,pan1:p1,am:am},R);
  bruit(b,{c:'r',t0:t0+d*.36,a:.02,d:d*.5,v:v*.45,ft:'lp',f:hi,f1:lo,g:d*.5,gc:.7,q:.9,pan:p1,am:am},R);}
/* la BASSE — la note des figures, une octave sous l'ancienne (mi4) : deux dents de scie désaccordées dans un passe-bas qui part ouvert
   et se referme (le « bwom »), le sinus une octave sous (le poids) et un triangle sur la note (qu'elle reste lisible au téléphone). */
function basse(b,R,f,t0,v,d,pan,ouv){ouv=ouv==null?1:ouv;
  for(const dt of [-.005,.005])osc(b,{f:f*(1+dt),w:'saw',t0:t0,a:.003,d:d,v:v*.3,pan:(pan||0)+dt*40,flt:['lp',380+1100*ouv,240,d*.5,1.1,.45]});
  osc(b,{f:f*.5,w:'sin',t0:t0,a:.004,d:d*.8,v:v*.42,pan:pan||0});osc(b,{f:f,w:'tri',t0:t0,a:.002,d:d*.55,v:v*.2,pan:pan||0});}
G.CCSON_GRAVE={mixe:mixe,doum:doum,wouom:wouom,basse:basse};

/* ================================ LE VOL ET LES FIGURES (le STYLE : synthé néon) ================
   ⚠ UNE SEULE GAMME PAR VOL. Avant, cinq compteurs indépendants tiraient chacun la hauteur de SON côté (chaîne de vol,
   × d'aura, échelle d'argent, combo de pièces, palier de flow) : la « gamme qui monte » zigzaguait. Désormais le jeu
   tient UN compteur par vol (`ECH`, remis à zéro au décollage) et chaque figure prend le degré suivant de la
   pentatonique (`st`). La POSE résout la gamme sur la tonique : tension pendant le vol, résolution à l'atterrissage.
   Chaque figure garde sa MATIÈRE à elle par-dessus la note — on la reconnaît sans regarder. */
/* (2026-10-15, Sacha : « des sons plus graves, genre doum, doum ») LES FIGURES PASSENT DANS LE GRAVE. Toutes leurs notes jouaient de mi5 à
   ré#7 (659 Hz – 2,5 kHz, la gamme du vol montant de près de deux octaves) avec des souffles jusqu'à 3,6 kHz : la même zone que les pièces, qu'elles
   couvraient sans se distinguer. Leur note descend d'une octave (mi4, 330 Hz : `nE(0)`) et la gamme du vol tient dans l'octave (sonPdAR), leur matière devient un
   souffle brun (`wouom`), une basse (`basse`) et le coup sourd (`doum`) ; la gamme du vol reste (st), elle monte du grave vers le médium.
   Les anciennes recettes : git, avant ce commit. */
D('fig.maillon',{fam:'figures',dur:.5,key:1,db:0,max:3,cd:.04,pre:1,bases:[0,12],grp:'r',prio:1,dit:'un maillon de chaîne en vol (la note monte à chaque figure : st) : un « bom » de basse pincée',
  r:function(b,R,o){const f=nE(o.base);doum(b,R,0,.35,90,60,.16,{toc:900,vt:.12});basse(b,R,f,0,.5,.32,0,.6);corde(b,{f:f,t0:0,d:.35,v:.2,br:.45},R);}});
D('fig.vrille',{fam:'figures',dur:.6,st:1,key:1,db:0,max:3,cd:.05,v:2,pre:1,bases:[0,12],grp:'r',prio:1,dit:'un demi-tour de vrille : le souffle grave TOURNE autour de la caisse + la basse',
  r:function(b,R,o){const s=o.v?1:-1,f=nE(o.base);wouom(b,R,0,.32,140,900,.6,-.8*s,.8*s);basse(b,R,f,.04,.42,.32,.2*s,.5);}});
/* (2026-10-14, session SON) Les trois MATIÈRES DE TOUR des FIGURES v2 : la caisse tourne en vraie physique, le jeu joue UN son
   par tour complet et choisit la matière d'après l'AXE. Même famille que la vrille (souffle + note accordée, st = degré de la
   gamme du vol), mais on les reconnaît les yeux fermés : le TONNEAU s'enroule d'une oreille à l'autre (espace), la TOUPIE
   hache à plat (modulation), le SALTO plonge dans le grave et passe par-dessus la tête (filtre). Courts, un par tour : doux. */
/* (2026-10-15) UN TOUR = UN « DOUM » : chaque tour complet sonne un coup sourd accordé (son corps à 200-470 Hz, son sous-grave à 40-80 Hz) et le
   souffle de SON axe — le TONNEAU passe d'une oreille à l'autre, la TOUPIE est hachée à plat comme une pale, le SALTO passe par-dessus
   la tête (le passe-bas s'ouvre puis se referme). Le jeu les joue maintenant 5 dB au-dessus d'une pièce (figPose), et non plus 9 dessous. */
D('fig.tonneau',{fam:'figures',dur:.6,st:1,key:1,db:0,max:3,cd:.05,v:2,pre:1,bases:[0,12],grp:'r',prio:1,dit:'un tour de TONNEAU (axe de roulis) : le souffle grave s’enroule d’une oreille à l’autre + le « doum » accordé',
  r:function(b,R,o){const s=o.v?1:-1,f=nE(o.base);wouom(b,R,0,.34,160,1100,.55,-.9*s,.9*s);
    doum(b,R,.03,.42,f*.25,f*.18,.22,{toc:1000,vt:.12,pan:.15*s});basse(b,R,f,.03,.34,.3,.1*s,.5);}});
D('fig.toupie',{fam:'figures',dur:.5,st:1,key:1,db:0,max:3,cd:.05,v:2,pre:1,bases:[0,12],grp:'r',prio:1,dit:'un tour de TOUPIE (axe de lacet) : un « vrrrom » grave haché à plat comme une pale + le « doum » accordé',
  r:function(b,R,o){const s=o.v?1:-1,f=nE(o.base);bruit(b,{c:'n',t0:0,a:.06,d:.3,v:.7,ft:'lp',f:700,f1:380,g:.3,gc:.8,q:1.4,pan:-.35*s,pan1:.35*s,am:[19,.85]},R);
    doum(b,R,.02,.4,f*.25,f*.18,.2,{toc:850,vt:.12});basse(b,R,f,.02,.32,.24,.15*s,.35);}});
D('fig.salto',{fam:'figures',dur:.6,st:1,key:1,db:0,max:3,cd:.05,v:2,pre:1,bases:[0,12],grp:'r',prio:1,dit:'un tour de SALTO (axe de tangage) : le « wouom » vertical qui passe par-dessus la tête + le « DOUM » accordé',
  r:function(b,R,o){const f=nE(o.base);wouom(b,R,0,.36,120,1300,.62,0,0);
    doum(b,R,.1,.5,f*.25,f*.165,.26,{toc:1100,vt:.14});basse(b,R,f,.1,.36,.34,0,.6);}});
D('fig.essoreuse',{fam:'figures',dur:1.3,st:1,key:1,db:+3,max:1,cd:.3,grp:'r',prio:3,dit:'720° et plus — ESSOREUSE COSMIQUE : tourbillon grave + cuivres graves + le grand DOUM',
  r:function(b,R,o){for(let k=0;k<3;k++)wouom(b,R,k*.08,.34,140+k*60,1200,.42,k%2?.9:-.9,k%2?-.9:.9);
    doum(b,R,.12,.95,62,36,.5,{sat:2.6,toc:1100,vt:.22});stab(b,R,[-12,-5,0,4],.12,.12,.6,.18,.7);basse(b,R,nE(0),.12,.5,.6,0,.8);}});
D('fig.meteore',{fam:'figures',dur:1,st:1,key:1,db:0,max:1,cd:.3,bases:[0,12],grp:'r',prio:2,dit:'MÉTÉORE (nitro tenue en l’air) : la flamme qui rugit + crépitements sourds + la basse',
  r:function(b,R,o){bruit(b,{c:'n',t0:0,a:.03,h:.05,d:.5,v:.7,ft:'lp',f:300,f1:1400,g:.2,q:.7},R);crepite(b,R,.02,.6,14,.32,300,1300);
    basse(b,R,nE(o.base),.04,.5,.5,0,.8);doum(b,R,0,.6,70,40,.4,{toc:900});}});
D('fig.bigair',{fam:'figures',dur:1.1,st:1,key:1,db:0,max:1,cd:.3,bases:[0,12],grp:'r',prio:2,dit:'BIG AIR (1,8 s en l’air) : l’air qui se creuse + la note qui plane, dans le médium',
  r:function(b,R,o){wouom(b,R,0,.55,120,1000,.5,-.3,.3);nappe(b,R,[o.base-12,o.base-5],0,.12,.1,.7,.09,1300);
    cloche(b,{f:nE(o.base),r:[1,2,3],m:[1,.25,.08],d:[.9,.35,.12],t0:.08,v:.3},R);doum(b,R,.04,.35,70,46,.3,{toc:0});}});
D('fig.monstre',{fam:'figures',dur:1.6,st:1,key:1,db:+2,max:1,cd:.3,bases:[0,12],grp:'r',prio:3,dit:'AIR MONSTRE (3,4 s) : la nappe grave s’ouvre, le DOUM tombe, une cloche ronde',
  r:function(b,R,o){wouom(b,R,0,.75,100,1100,.5,-.6,.6);nappe(b,R,[o.base-12,o.base-5,o.base,o.base+4],0,.18,.2,1.1,.11,1200);
    doum(b,R,.05,.8,56,32,.6,{sat:2.4,toc:900});cloche(b,{f:nE(7+o.base),r:[1,2,2.76],m:[1,.3,.12],d:[1.2,.5,.2],t0:.12,v:.26},R);}});
D('fig.dauphin',{fam:'figures',dur:.9,st:1,key:1,db:0,max:2,cd:.2,bases:[0,12],grp:'r',prio:2,dit:'LE DAUPHIN : bloup + éclaboussure + le cri stylisé du dauphin',
  r:function(b,R,o){const nE=function(st){return 329.6276*Math.pow(2,(st+o.base)/12);};bulle(b,R,0,700,380,.09,.45);bruit(b,{c:'b',t0:.02,a:.004,d:.3,v:.25,ft:'bp',f:3200,q:.7},R);
    for(let k=0;k<3;k++)osc(b,{f:2400+k*300,f1:4200+k*200,g:.05,t0:.12+k*.07,a:.003,d:.06,v:.07,fm:{r:.5,i:.6,d:.05}});
    pluck(b,R,nE(12),.05,.45,.45,.9);}});
D('fig.dauphinRoyal',{fam:'figures',dur:1.3,st:1,key:1,db:+2,max:1,cd:.4,grp:'r',prio:3,dit:'DAUPHIN ROYAL : trois bonds qui montent + la couronne d’or',
  r:function(b,R,o){[0,4,7].forEach(function(st,i){bulle(b,R,i*.1,600+i*150,300+i*100,.1,.35);pluck(b,R,nE(12+st),i*.1,.35,.4,.9);});
    bruit(b,{c:'b',t0:.25,a:.004,d:.4,v:.2,ft:'bp',f:3000,q:.6},R);scintille(b,R,.3,.8,12,.12);}});
D('fig.goutte',{fam:'figures',dur:.18,st:0,key:1,db:-12,max:3,cd:.06,bases:[0,12],dit:'la nage du dauphin paie EN DIRECT : une goutte qui monte à chaque palier (st)',
  r:function(b,R,o){bulle(b,R,0,nE(12+o.base)*.8,nE(12+o.base)*1.25,.06,.5);}});
D('dauphin.banc',{fam:'figures',dur:1.2,st:1,db:-6,max:1,cd:1,bus:'amb',dit:'le banc de dauphins apparaît : clics et sifflets au loin',
  r:function(b,R,o){for(let k=0;k<7;k++){const t=R()*.9,f=3000+R()*2500;osc(b,{f:f,f1:f*(1.2+R()*.4),g:.08,t0:t,a:.005,d:.1,v:.06,fm:{r:.25,i:.8,d:.08},pan:R()*1.6-.8});}
    for(let k=0;k<12;k++)clic(b,{t0:R()*1.1,f:5000,d:.002,v:.08},R);}});
/* LA TROUPE DE SINGES (2026-10-14, session SON) — le babil qui déboule : des « hou-hou » ronds qui plongent (voyelle filtrée), des « ha » de souffle haché,
   deux cris qui montent. Cinq voix décalées et panoramiquées, hauteurs tirées au sort : une bande, pas un chanteur. Rien d'aigu qui pique — il revient souvent. */
function hou(b,R,t0,f,v,pan,d){osc(b,{f:f,f1:f*.7,g:d*.8,w:'saw',t0:t0,a:.025,h:d*.25,d:d,v:v*.45,pan:pan,vib:[8,.035],flt:['bp',f*3,f*2,d,1.5]});osc(b,{f:f,f1:f*.7,g:d*.8,t0:t0,a:.025,h:d*.25,d:d,v:v*.4,pan:pan,vib:[8,.035]});}
function haha(b,R,t0,v,pan){bruit(b,{c:'b',t0:t0,a:.006,d:.08,v:v,ft:'bp',f:1000,f1:1500,g:.08,q:1.8,pan:pan},R);osc(b,{f:560,f1:480,g:.08,w:'saw',t0:t0,a:.006,d:.07,v:v*.25,pan:pan,flt:['lp',1500,900,.08,.8]});}
D('singe.troupe',{fam:'figures',bus:'amb',dur:1.05,st:1,db:-6,max:1,cd:1,dit:'une troupe de singes déboule : « hou-hou » ronds, « ha-ha » hachés et deux cris qui montent (cinq voix, hauteurs tirées au sort)',
  r:function(b,R,o){for(let k=0;k<5;k++){const t=k*.09+R()*.05,f=330+R()*200,pan=(k-2)*.38;hou(b,R,t,f,.7,pan,.22);hou(b,R,t+.22,f*1.12,.6,pan,.2);if(k%2===0&&k<4)hou(b,R,t+.42,f*.95,.45,pan,.2);}
    for(let k=0;k<7;k++)haha(b,R,.42+k*.06+R()*.03,.33,R()*1.6-.8);
    for(let k=0;k<2;k++)osc(b,{f:1300+k*350,f1:2500+k*500,g:.14,w:'saw',t0:.3+k*.25,a:.012,h:.04,d:.16,v:.13,pan:k?.5:-.5,vib:[22,.03],fm:{r:1.5,i:1.2,d:.1},flt:['bp',2400,2800,.2,1.4]});}});
D('fig.bump',{fam:'figures',dur:.7,key:1,db:0,max:2,cd:.06,pre:1,bases:[0,12],grp:'r',prio:1,dit:'BUMP : la dalle qui rebondit (ressort caoutchouc) + la note (st)',
  r:function(b,R,o){osc(b,{f:220,f1:150,g:.25,t0:0,a:.002,d:.35,v:.4,vib:[22,.12]});clic(b,{t0:0,f:1500,d:.01,v:.3},R);pluck(b,R,nE(o.base),.02,.45,.4,.9);doum(b,R,0,.45,80,50,.2,{toc:0});}}); // (2026-10-15, Sacha : « plus de sons graves ») la note une octave plus bas, un doum sous le caoutchouc
D('air.regain',{fam:'figures',dur:.4,key:1,db:-5,max:2,cd:.15,dit:'le chrono d’airtime se RECHARGE (nuage, bump) : un « whoop » qui remonte',
  r:function(b,R,o){osc(b,{f:nE(7),f1:nE(19),g:.12,gc:.6,w:'tri',t0:0,a:.005,d:.2,v:.3});swish(b,R,0,.2,1200,4200,.18);}});
D('fig.snake',{fam:'figures',dur:1.4,st:1,key:1,db:+3,max:1,cd:.4,grp:'r',prio:4,dit:'SNAKE LOOP : le glissando serpent (plonge puis remonte) dans la gamme',
  r:function(b,R,o){for(const dt of [-.005,.005])osc(b,{f:nE(24),w:'saw',t0:0,a:.01,h:.1,d:.9,v:.1,flt:['lp',3000,3000,1,.8],pan:dt*100,vib:[6,.01],
      f1:nE(12),g:.18});
    osc(b,{f:nE(12),f1:nE(31),g:.4,gc:1.4,w:'tri',t0:.2,a:.01,d:.6,v:.25});stab(b,R,[12,19,24],.55,.1,.6,.12,1);scintille(b,R,.55,.6,8,.1);}});
/* LES PALIERS DE L'ÉCHELLE D'ARGENT (×2 CHAUD · ×3 EN FEU · ×4,5 MILLIONNAIRE · ×6 JACKPOT) : plus des clochettes — un
   CUIVRE qui monte, un cran plus gros à chaque marche. Le jackpot a son propre son : la machine à sous qui crache. */
D('fig.palier',{fam:'figures',dur:.9,st:1,key:1,db:+1,max:2,cd:.1,bases:[0,12],grp:'r',prio:2,dit:'palier de l’échelle ×2/×3/×4,5 : stab de cuivres qui monte (st)',
  r:function(b,R,o){wouom(b,R,0,.2,200,1400,.35);stab(b,R,[o.base-12,o.base-5,o.base],.06,.06,.4,.2,.8);doum(b,R,.06,.6,72,44,.3,{toc:1000});}}); // (2026-10-15) deux octaves plus bas : le stab de cuivres en mi3-si3-mi4, le DOUM dessous
/* (2026-10-15) le JACKPOT ×6 sans sonnette aiguë : la sonnette (mi7 ×8, 2,6 kHz) devient trois coups de gong grave qui montent (doum-doum-DOUM),
   la fanfare descend d'une octave, la cascade de pièces est faite de pièces GRAVES (la même matière que la pièce v2). */
D('fig.jackpot',{fam:'figures',dur:2.2,st:1,key:1,db:+6,max:1,cd:1,grp:'r',prio:5,dit:'×6 JACKPOT MAX : trois coups de gong graves (doum-doum-DOUM) + fanfare grave + cascade de pièces graves',
  r:function(b,R,o){[[0,.6,-.3],[.14,.7,.3],[.3,1,0]].forEach(function(k,i){doum(b,R,k[0],k[1],66-i*4,40-i*3,.32+i*.12,{toc:1000,pan:k[2]});
      cloche(b,{f:nE([0,4,7][i]),r:[1,2,2.76,5.4],m:[1,.5,.3,.1],d:[.9,.5,.25,.08],t0:k[0],v:.3,pan:k[2],jit:.003},R);});
    stab(b,R,[0,4,7,12],.5,.25,.9,.2,.8);basse(b,R,nE(0),.5,.5,.8,0,.8);
    for(let i=0;i<26;i++){const t=.55+Math.pow(R(),.8)*1.3,st=pd(5+Math.floor(R()*6))-12,p=R()*1.6-.8;bruit(b,{c:'b',t0:t,a:.0006,d:.016,v:.08,ft:'bp',f:2200,q:1.2,pan:p},R);
      cloche(b,{f:nE(st),r:[1,2.32,4.25],m:[1,.3,.12],d:[.14,.06,.03],t0:t+.002,v:.12+R()*.1,pan:p,jit:.004},R);}}});

/* ================================ LA POSE (le moment qui juge) ================================== */
D('pose.choc',{fam:'pose',bus:'fx',dur:.45,db:0,max:2,cd:.05,v:2,pre:1,rj:.03,dit:'la caisse touche le bitume : pneus + suspension + caisse (volume selon l’impact)',
  r:function(b,R,o){coup(b,R,o,0,.8,700,120,52,.22);bruit(b,{c:'b',t0:.004,a:.003,d:.1,v:.18,ft:'bp',f:1500,f1:950,g:.1,q:6},R);
    for(let k=0;k<4;k++)clic(b,{t0:.03+R()*.12,f:3500+R()*2000,d:.003,v:.06},R);}});
/* (2026-10-15, Sacha : « plus de sons graves ») LA POSE PARFAITE ATTERRIT DANS LE GRAVE : elle sonnait à 97 % entre 2 et 5 kHz (deux cloches
   mi7 / si7 et une poussière d'or jusqu'à 5 kHz : le son le plus aigu du vol). Le TCHAK reste (la famille), plus mat (1,4 kHz) ; dessous le
   DOUM de la caisse qui se pose pile, et une cloche ronde deux octaves plus bas. */
D('pose.parfait',{fam:'pose',dur:.9,key:1,db:+2,max:1,cd:.2,pre:1,dit:'PARFAIT : le « TCHAK » mat + le DOUM de la caisse qui se pose pile + une cloche ronde',
  r:function(b,R,o){for(let k=0;k<3;k++)bruit(b,{c:'b',t0:k*.008,a:.0005,d:.025,v:.5-k*.1,ft:'bp',f:1400,q:.9},R);
    clic(b,{t0:0,f:2600,d:.004,v:.22},R);doum(b,R,0,.8,74,42,.34,{toc:0,sat:2.4});
    cloche(b,{f:nE(12),r:[1,2,2.76],m:[1,.3,.15],d:[.7,.28,.12],t0:.01,v:.32},R);cloche(b,{f:nE(19),r:[1,2],m:[1,.2],d:[.45,.15],t0:.03,v:.14},R);}});
/* (2026-10-14, session SON) LA POSE DIVINE A SA SIGNATURE : c'était le tchak de la PARFAITE joué une quinte plus haut. Le même tchak (on
   reconnaît la famille), puis le ciel s'ouvre — le chœur « aaah » (la couleur sacrée, réservée), deux cloches, une pluie d'or plus longue. */
D('pose.divin',{fam:'pose',dur:1.8,st:1,key:1,db:+3,max:1,cd:.2,pre:1,dit:'DIVIN : le TCHAK de la PARFAITE et son DOUM, puis le ciel s’ouvre — chœur grave « aaah », cloches rondes, la basse',
  r:function(b,R,o){for(let k=0;k<3;k++)bruit(b,{c:'b',t0:k*.008,a:.0005,d:.025,v:.5-k*.1,ft:'bp',f:1600,q:.9},R); // (2026-10-15) deux octaves plus bas, avec le DOUM : voir pose.parfait
    clic(b,{t0:0,f:2800,d:.004,v:.22},R);doum(b,R,0,.9,66,36,.5,{toc:0,sat:2.5});cloche(b,{f:nE(19),r:[1,2,2.76],m:[1,.3,.15],d:[1,.35,.14],t0:.01,v:.3},R);cloche(b,{f:nE(26),r:[1,2],m:[1,.2],d:[.6,.2],t0:.06,v:.14},R);
    choeur(b,R,[-5,-1,2,7],.04,.18,.45,.9,.5);basse(b,R,nE(0),.04,.4,.9,0,.6);}});
/* (2026-10-15, Sacha : « rajoute tout un sound design pour les figures, avec des sons plus graves, genre doum, doum ; que les figures fassent
   plus de bruit que quand tu ramasses une pièce — applique-toi bien pour les figures ») LA SIGNATURE v2 : LE DOUM DE LA FIGURE PLANTÉE.
   Chaque figure plantée frappe d'abord le même coup sourd (la famille : on sait sans regarder qu'une figure est payée), puis SA phrase,
   jouée à la BASSE une octave sous l'ancienne (mi4 = 330 Hz, son sous-grave à 165 Hz ; la 1re note = le degré du maillon, st) avec la matière de son geste — le
   souffle brun qui roule, qui hache ou qui passe par-dessus. Avant : des cordes pincées de mi5 à ré#7, 85 % entre 0,5 et 2 kHz, au
   niveau d'une seule pièce. Une variante par figure — l'ordre est celui de FIG_SIGNE dans le jeu. */
D('fig.signe',{fam:'figures',dur:1.1,st:1,key:1,db:+2,max:3,cd:.04,v:12,pre:1,bases:[0,12],dit:'la SIGNATURE d’une figure plantée : le DOUM, puis sa phrase à la basse — 0 TONNEAU · 1 TOUPIE · 2 SHIMMY · 3 CHANDELLE · 4 SALTO ARRIÈRE · 5 SALTO AVANT · 6 DOUBLE TONNEAU · 7 TIRE-BOUCHON · 8 HÉLICO · 9 VRILLE PENCHÉE · 10 RODÉO · 11 SALTO COSMIQUE',
  r:function(b,R,o){const f=nE(o.base),B=function(k,t,v,d,pan,ouv){basse(b,R,f*k,t,v,d||.38,pan||0,ouv==null?.7:ouv);};
    doum(b,R,0,.85,62,38,.42,{sat:2.4,toc:1100,vt:.18});
    if(o.v===0){B(1,0,.5,.34,-.5);B(1.5,.08,.44,.42,.5);wouom(b,R,0,.3,160,1000,.4,-.8,.8);} /* TONNEAU : la quinte qui roule d'une oreille à l'autre */
    else if(o.v===1){B(1,0,.5,.26,0,.5);B(1,.07,.4,.3,0,.4);bruit(b,{c:'n',t0:0,a:.01,d:.24,v:.5,ft:'lp',f:700,f1:380,g:.24,q:1.3,am:[19,.85],pan:-.3,pan1:.3},R);} /* TOUPIE : la note frappée deux fois à plat, le souffle haché */
    else if(o.v===2){for(let k=0;k<4;k++)B(k%2?1.125:1,k*.05,.44-k*.05,.16,k%2?.6:-.6,.5);} /* SHIMMY : un trille grave qui se dandine gauche-droite */
    else if(o.v===3){osc(b,{f:f,f1:f*2,g:.22,gc:.6,w:'tri',t0:0,a:.01,h:.12,d:.2,v:.3});B(2,.2,.46,.45,0,.8);} /* CHANDELLE : ça se cabre, la note monte d'une octave et se pose en haut */
    else if(o.v===4){wouom(b,R,0,.3,130,1100,.45,0,0);B(1.5,0,.46,.3);B(1,.09,.52,.45);} /* SALTO ARRIÈRE : le wouom, la quinte qui RETOMBE */
    else if(o.v===5){wouom(b,R,0,.3,130,1100,.45,0,0);B(1,0,.46,.3);B(1.5,.09,.52,.45);} /* SALTO AVANT : le wouom, la quinte qui MONTE */
    else if(o.v===6){B(1,0,.46,.3,-.6);B(1.5,.07,.42,.3,.6);B(2,.14,.48,.45,-.3,.9);wouom(b,R,0,.36,160,1100,.4,-.8,.8);doum(b,R,.14,.5,70,42,.3,{toc:1000});} /* DOUBLE TONNEAU : deux roulés, le second DOUM, l'arpège monte à l'octave */
    else if(o.v===7){[1,1.25,1.5,2].forEach(function(k,i){B(k,i*.055,.42,.3,Math.sin(i*1.6)*.7,.5+i*.12);});} /* TIRE-BOUCHON : l'arpège grave en spirale */
    else if(o.v===8){bruit(b,{c:'r',t0:0,a:.02,d:.38,v:.4,ft:'lp',f:900,q:1.4,am:[17,.9]},R);B(1,0,.46,.3);B(2,.1,.44,.42,0,.8);} /* HÉLICO : les pales, la note qui saute l'octave */
    else if(o.v===9){B(1,0,.46,.3,-.3);B(1.682,.07,.44,.45,.3,.6);osc(b,{f:f*1.682,w:'sin',t0:.07,a:.02,d:.4,v:.12,vib:[6,.012],pan:.3});} /* VRILLE PENCHÉE : la sixte, de biais, qui ondule */
    else if(o.v===10){corde(b,{f:f*.5,t0:0,d:.5,v:.55,br:.7},R);corde(b,{f:f*.75,t0:.09,d:.45,v:.48,br:.7},R);doum(b,R,.09,.45,74,46,.24,{toc:900});B(1,.18,.46,.4);} /* RODÉO : deux ruades de corde grave (deux DOUM), puis la note */
    else{doum(b,R,.12,.9,54,30,.6,{sat:2.6,toc:1000,vt:.2});cloche(b,{f:f,r:[1,2,2.76,5.4],m:[1,.5,.3,.1],d:[1.1,.6,.3,.1],t0:.12,v:.28},R);
      [1,1.5,2,2.5].forEach(function(k,i){B(k,.12+i*.06,.38,.45,i%2?.5:-.5,.6+i*.1);});nappe(b,R,[o.base-12,o.base-5,o.base],.14,.15,.15,.7,.08,1100);} /* SALTO COSMIQUE : deux DOUM, le gong grave, l'arpège qui s'ouvre */
  }});
/* (2026-10-14, session SON ; les combos : GENERAL) LES COMBOS À TROIS. Un combo = trois figures, sa clé = leurs trois AXES triés (T tonneau,
   P toupie, S salto, M mixte). Sa signature (sonCombo, dans le jeu) : trois FRAPPES — une matière par axe, dans l'ordre de la clé, qui montent
   la pentatonique — puis le SCEAU. Vingt clés, vingt phrases : TTT tinte trois fois le verre, PST (LE GYROSCOPE) passe par les trois matières.
   (2026-10-15, Sacha : « genre doum, doum ») DOUM, DOUM, DOUM… BOUM : chaque frappe est un TAMBOUR accordé (sa note une octave sous
   l'ancienne note) avec la matière de son axe, en grave — le bol de verre, le bois, le fût, le métal — et le sceau est le grand coup
   sourd sous un cuivre grave. Le jeu les espace un peu plus (sonCombo : 110 ms au lieu de 85) : on les compte. */
D('combo.frappe',{fam:'figures',dur:.5,st:1,key:1,db:+2,max:6,cd:0,v:4,pre:1,bases:[0,12],dit:'une FRAPPE de combo (trois d’affilée) : un tambour grave accordé — 0 TONNEAU le bol qui roule · 1 TOUPIE le bois haché · 2 SALTO le fût profond · 3 MIXTE le métal',
  r:function(b,R,o){const f=nE(o.base);
    if(o.v===0){doum(b,R,0,.7,f*.25,f*.17,.24,{toc:1000,vt:.14});cloche(b,{f:f,r:[1,2.01,3.98],m:[1,.4,.15],d:[.32,.14,.06],t0:0,v:.3},R);wouom(b,R,0,.2,180,900,.3,-.7,.7);}
    else if(o.v===1){doum(b,R,0,.65,f*.25,f*.18,.2,{toc:850,vt:.16});marimba(b,R,f,0,.38,.24);bruit(b,{c:'n',t0:0,a:.004,d:.14,v:.4,ft:'lp',f:700,q:1.4,am:[28,.85]},R);}
    else if(o.v===2){doum(b,R,0,.9,f*.21,f*.14,.32,{toc:1100,vt:.16,sat:2.6});basse(b,R,f,0,.36,.3,0,.6);}
    else{doum(b,R,0,.65,f*.25,f*.17,.22,{toc:1300,vt:.16});cloche(b,{f:f,r:[1,2.76,5.4],m:[1,.45,.15],d:[.28,.12,.05],t0:0,v:.26,jit:.004},R);osc(b,{f:f*.5,w:'saw',t0:0,a:.002,d:.16,v:.14,flt:['lp',1400,350,.1,1.2]});}
  }});
D('combo.sceau',{fam:'figures',dur:1.4,st:1,key:1,db:+4,max:1,cd:.3,v:4,pre:1,bases:[0,12],dit:'le SCEAU du combo, après ses trois frappes : le grand BOUM sous un cuivre grave — 0 PUR (trois fois le même axe) · 1 MÉLANGÉ · 2 LE GYROSCOPE (les trois axes, le roi) · 3 LE GRAND CHAOS',
  r:function(b,R,o){const s=o.base;doum(b,R,0,1,58,32,.62,{sat:2.6,toc:1000,vt:.22,corps:.14});
    if(o.v===0){stab(b,R,[s-12,s-5,s],0,.06,.55,.5,.8);cloche(b,{f:nE(s),r:[1,2],m:[1,.2],d:[.55,.2],t0:.01,v:.18},R);}
    else if(o.v===1){stab(b,R,[s-12,s-8,s-5,s+2],0,.06,.6,.45,.7);basse(b,R,nE(s),0,.4,.6,0,.7);}
    else if(o.v===2){stab(b,R,[s-12,s-5,s,s+4],0,.1,.8,.5,.9);choeur(b,R,[s-5,s-1,s+2],.02,.12,.35,.7,.4);doum(b,R,.16,.6,66,40,.35,{toc:900});
      cloche(b,{f:nE(s+7),r:[1,2,2.76],m:[1,.3,.15],d:[.9,.35,.15],t0:.02,v:.2},R);}
    else{const t=Toile(b.sr,b.dur,!!b.R);stab(t,R,[s-12,s-6,s-1],0,.05,.5,.55,.8);O.decime(t,6,3);
      for(let i=0;i<b.n;i++){b.L[i]+=t.L[i];if(b.R)b.R[i]+=t.R[i];}
      crepite(b,R,0,.45,14,.35,200,1300);}
  }});
/* (2026-10-14, session SON — le son par figure, étape 2) LES FIGURES DES MONDES. Celles de LA BANQUISE et de l'eau payaient le même maillon
   que tout le reste : chacune a sa phrase, dans la matière de son monde (la glace tinte et glisse, la poudreuse feutre, l'eau fait des bulles),
   sur l'échelle du vol (la note = le degré du maillon, st). Une variante par figure — l'ordre est celui de FIG_MONDE dans le jeu. */
D('fig.monde',{fam:'figures',dur:.9,st:1,key:1,db:+1,max:3,cd:.04,v:9,pre:1,bases:[0,12],dit:'la SIGNATURE d’une figure de monde : 0 TREMPLIN DE GLACE · 1 GLISSE / SUR LE PIC · 2 POUDREUSE · 3 TRACE PARFAITE · 4 PATINOIRE · 5 DÉRAPAGE GLACE · 6 RICOCHET · 7 PLONGEON · 8 SURF',
  r:function(b,R,o){const f=nE(o.base),P=function(k,t,v,d,pan){pluck(b,R,f*k,t,v,d||.4,1,pan||0);},G=function(k,t,v,d,pan){cloche(b,{f:f*k,r:[1,2.01,3.98],m:[1,.35,.15],d:[d||.5,.2,.08],t0:t,v:v,pan:pan||0},R);};
    doum(b,R,0,.7,62,38,.36,{toc:1000}); /* (2026-10-15, Sacha : « des sons plus graves, genre doum ») comme fig.signe : le DOUM de la figure payée, puis sa phrase une octave plus bas (mi4), db −1 → +1 */
    if(o.v===0){osc(b,{f:f,f1:f*2,g:.18,gc:.6,w:'sin',t0:0,a:.005,h:.1,d:.2,v:.18});G(2,.17,.32,.6,0);clic(b,{t0:.17,f:6000,d:.003,v:.2},R);} /* TREMPLIN DE GLACE : ça s'envole, et le verre tinte en haut */
    else if(o.v===1){osc(b,{f:f*1.5,f1:f,g:.3,gc:.5,w:'sin',t0:0,a:.01,h:.15,d:.25,v:.14,vib:[7,.006]});G(1,0,.3,.45,-.3);} /* GLISSE : la note qui glisse sur la glace */
    else if(o.v===2){bruit(b,{c:'r',t0:0,a:.03,d:.3,v:.32,ft:'lp',f:2200,f1:700,g:.3,q:.7,pan:-.4,pan1:.4},R);P(1,.04,.36,.35,0);} /* POUDREUSE : un souffle feutré, la note étouffée */
    else if(o.v===3){G(1,0,.32,.45,-.4);G(1.5,.08,.3,.55,.4);scintille(b,R,.08,.4,6,.08,38,48);} /* TRACE PARFAITE : deux tintements nets, une pincée d'or */
    else if(o.v===4){for(let k=0;k<2;k++)bruit(b,{c:'b',t0:k*.11,a:.005,d:.09,v:.24,ft:'hp',f:5000,f1:2500,g:.09,q:.8,pan:k?.5:-.5},R);G(1,.02,.28,.4,-.3);G(1.25,.13,.26,.45,.3);} /* PATINOIRE : deux coups de lame, deux notes */
    else if(o.v===5){bruit(b,{c:'r',t0:0,a:.01,d:.32,v:.3,ft:'bp',f:3200,f1:1400,g:.3,q:2.2,pan:-.6,pan1:.6},R);P(1,.06,.4,.35,0);} /* DÉRAPAGE GLACE : la lame qui racle, puis la note */
    else if(o.v===6){bulle(b,R,0,f*.5,f*1.5,.08,.3,-.3);bulle(b,R,.07,f*.75,f*2,.07,.24,.3);P(1,.12,.38,.3,0);} /* RICOCHET : deux bulles qui rebondissent, la note */
    else if(o.v===7){bulle(b,R,0,f*.5,f*.25,.25,.34,0);bruit(b,{c:'n',t0:0,a:.01,d:.3,v:.4,ft:'lp',f:700,f1:250,g:.3,q:.7},R);P(.5,.12,.4,.45,0);} /* PLONGEON : on coule, la note grave */
    else{swish(b,R,0,.45,600,2400,.26,-.7,.7,.9);P(1,.08,.4,.3,-.2);P(1.5,.18,.36,.4,.2);} /* SURF : la vague qui passe, la quinte qui glisse dessus */
  }});
/* (2026-10-14, session SON — le son par figure, étape 3) LES BATTEMENTS EN VOL. SHIMMY et CHANDELLE n'ont pas de TOUR (un ressort qui bat,
   pas une rotation) : aucun tic ne les accompagnait en vol. Le shimmy a un « wik » à chaque aller-retour (le jeu alterne gauche / droite),
   la chandelle un « ça se cabre » au sommet de sa bosse. (2026-10-15) Deux octaves plus bas : le « wik » devient un « wom » de basse. */
D('fig.battement',{fam:'figures',dur:.4,st:1,key:1,db:0,max:4,cd:.03,v:2,pre:1,bases:[0,12],dit:'un BATTEMENT en vol : 0 SHIMMY (le « wom » grave de chaque aller-retour) · 1 CHANDELLE (ça se cabre, au sommet)',
  r:function(b,R,o){const f=nE(o.base);
    if(o.v===0){basse(b,R,f,0,.44,.16,0,.7);bruit(b,{c:'n',t0:0,a:.003,d:.07,v:.4,ft:'lp',f:900,f1:350,g:.07,q:1.2},R);doum(b,R,0,.25,90,60,.1,{toc:0});}
    else{osc(b,{f:f*.75,f1:f,g:.15,gc:.6,w:'tri',t0:0,a:.008,h:.06,d:.14,v:.3});wouom(b,R,0,.22,140,900,.32,0,0);basse(b,R,f,.13,.4,.3,0,.7);}
  }});
/* LES EXPLOSIONS DE FIGURE ont leur son. Elles empruntaient turbo.mini / turbo.super au DRIFT : la même bouffée pour deux gestes qui
   n'ont rien à voir. Ici, une charge qui claque (la poussée qui fait tourner la caisse) : 0 petite, 1 grosse. Pas de note : c'est un choc.
   (2026-10-15, Sacha : « doum, doum ») LE DOUM DU DÉPART : son grave (94 % sous 150 Hz) ne passait pas le haut-parleur d'un téléphone
   (−8 dB) et un clic à 3,8 kHz + des crépitements jusqu'à 3,2 kHz faisaient tout le bruit. Maintenant : le DOUM saturé (il s'entend au
   téléphone), le souffle de la charge à 160-800 Hz, un toc à 1,2 kHz ; la grosse a un second coup (« ba-DOUM ») et ses braises sourdes. */
D('fig.explose',{fam:'figures',bus:'fx',dur:.8,st:1,db:+4,max:3,cd:.05,v:2,pre:1,dit:'l’EXPLOSION qui lance une figure : le DOUM de la charge — 0 petite · 1 grosse (ba-DOUM)',
  r:function(b,R,o){const g=o.v?1:.7;
    doum(b,R,0,.9*g,o.v?62:72,o.v?34:42,.3+.18*o.v,{sat:2.4,toc:1200,vt:.2,corps:.1});
    bruit(b,{c:'r',t0:0,a:.004,d:.2+.12*o.v,v:.4*g,ft:'bp',f:160,f1:800,g:.12,gc:.7,q:.9,pan:-.2,pan1:.2},R);
    if(o.v){doum(b,R,.075,.7,56,32,.4,{sat:2.6,toc:0});crepite(b,R,.04,.3,8,.2,180,900);}
  }});
/* LE GAP a son son : le saut par-dessus le vide (le souffle qui traverse) et le pont qui se construit sous la caisse (l'arpège qui monte).
   Le DOUBLE GAP le fait deux fois, et finit sur un accord. (2026-10-15) Une octave et demie plus bas, posé sur un DOUM. */
D('fig.gap',{fam:'figures',dur:1.6,st:1,key:1,db:+1,max:1,cd:.3,v:2,pre:1,bases:[0,12],dit:'GAP FRANCHI (0) · DOUBLE GAP (1) : le souffle grave du vide traversé + l’arpège du pont, à la basse',
  r:function(b,R,o){const s=o.base,f=nE(s);wouom(b,R,0,.5,120,1100,.4,-.8,.8);doum(b,R,.06,.6,66,40,.36,{toc:1000});
    [0,4,7,12].forEach(function(st,i){basse(b,R,nE(s+st),.08+i*.06,.4,.36,i%2?.4:-.4,.6);});
    if(o.v){[12,16,19,24].forEach(function(st,i){basse(b,R,nE(s+st),.36+i*.05,.36,.36,i%2?-.4:.4,.7);});stab(b,R,[s-12,s-5,s],.6,.08,.5,.32,.8);doum(b,R,.6,.7,60,36,.4,{toc:1000});}
    else cloche(b,{f:f,r:[1,2,2.76],m:[1,.3,.15],d:[.6,.2,.1],t0:.3,v:.2},R);
  }});
/* LA POSE ORDINAIRE a son petit son : un « tock » franc et une clochette brève. Elle n'avait que le choc des roues — la PARFAITE claque
   (pose.parfait), la DIVINE ouvre le ciel (pose.divin) ; celle-ci reste en dessous : propre, rien de plus. (2026-10-15) Une octave plus bas. */
D('pose.nette',{fam:'pose',dur:.45,key:1,db:-3,max:1,cd:.2,pre:1,dit:'la POSE ordinaire (ni parfaite, ni lourde) : un tock grave et une clochette ronde, sous la PARFAITE',
  r:function(b,R,o){clic(b,{t0:0,f:1800,d:.004,v:.2},R);marimba(b,R,nE(7),0,.32,.2);cloche(b,{f:nE(19),r:[1,2.76],m:[1,.15],d:[.25,.08],t0:.01,v:.12},R);doum(b,R,0,.3,90,58,.12,{toc:0});}});
/* (2026-10-14, session SON ; la figure : GENERAL) LE SLIDE — le flanc qui frotte le bord de la route. Une BOUCLE de meulage (sonSlide la
   règle en direct : plus vite = plus fort et plus aigu, par handle.gain / handle.rate), une ATTAQUE au contact, une QUEUE au lâcher, et un
   « tchak » DOUX quand l'aura se paye. Rien de criard : les bandes de raclement restent sous 4 kHz, les étincelles sont des grains. */
D('fig.slide',{fam:'figures',bus:'fx',dur:2.4,st:1,db:-8,max:1,cd:.1,dit:'LE SLIDE (boucle) : le métal qui meule le bord — deux bandes de raclement hachées, le chant du métal, des étincelles en grains',
  r:function(b,R,o){bruit(b,{c:'b',t0:0,a:.001,h:2.4,d:.001,v:.22,ft:'bp',f:2900,q:2.6,am:[23,.55],pan:-.2},R);
    bruit(b,{c:'r',t0:0,a:.001,h:2.4,d:.001,v:.26,ft:'bp',f:1300,q:1.8,am:[11.3,.5],pan:.2},R);
    bruit(b,{c:'n',t0:0,a:.001,h:2.4,d:.001,v:.12,ft:'lp',f:420,am:[7.1,.35]},R);
    osc(b,{f:2310,w:'sin',t0:0,a:.001,h:2.4,d:.001,v:.018,vib:[5.3,.006]});osc(b,{f:3720,w:'sin',t0:0,a:.001,h:2.4,d:.001,v:.012,vib:[6.1,.005]});
    for(let i=0;i<46;i++)bruit(b,{c:'b',t0:R()*2.3,a:.0004,d:.004+R()*.01,v:.18+R()*.22,ft:'hp',f:4200+R()*2500,q:.7,pan:R()*1.4-.7},R);
    O.boucle(b,.4);}});
D('fig.slide.debut',{fam:'figures',bus:'fx',dur:.6,st:1,db:-3,max:1,cd:.15,dit:'le SLIDE commence : le métal touche (choc sec + crissement qui s’allume + gerbe d’étincelles)',
  r:function(b,R,o){clic(b,{t0:0,f:3200,d:.005,v:.4},R);cloche(b,{f:1180,r:[1,2.41,3.87,5.6],m:[1,.5,.3,.15],d:[.22,.12,.07,.04],t0:0,v:.16,jit:.01},R);
    bruit(b,{c:'b',t0:.005,a:.01,d:.3,v:.32,ft:'bp',f:1800,f1:3000,g:.2,q:2.2},R);crepite(b,R,.01,.35,14,.2,2600,6000);}});
D('fig.slide.fin',{fam:'figures',bus:'fx',dur:.8,st:1,db:-6,max:1,cd:.15,dit:'le SLIDE s’arrête : le meulage retombe (le filtre se referme) + les dernières étincelles',
  r:function(b,R,o){bruit(b,{c:'b',t0:0,a:.003,d:.35,v:.3,ft:'bp',f:2900,f1:900,g:.35,q:2.2},R);bruit(b,{c:'r',t0:0,a:.003,d:.3,v:.25,ft:'bp',f:1300,f1:500,g:.3,q:1.6},R);
    crepite(b,R,.02,.4,6,.16,2800,5800);}});
D('fig.slide.paye',{fam:'figures',dur:.7,key:1,db:-2,max:1,cd:.2,pre:1,dit:'le SLIDE est payé : un tchak doux + une clochette (l’aura encaissée)',
  r:function(b,R,o){bruit(b,{c:'b',t0:0,a:.0006,d:.03,v:.3,ft:'bp',f:1500,q:1},R);clic(b,{t0:0,f:2400,d:.004,v:.16},R);
    cloche(b,{f:nE(12),r:[1,2,2.76],m:[1,.25,.12],d:[.45,.18,.08],t0:.012,v:.24},R);doum(b,R,0,.35,84,52,.16,{toc:0});}}); // (2026-10-15) la clochette mi7 → mi5, sans poussière, un petit doum
/* (2026-10-14, session SON ; la machine : IDEE) LE FINAL SPIN A SES SONS — une machine à sous d'ARCADE. Elle empruntait ceux du jeu
   (ui.compteur pour les rouleaux, arret.tic, argent.*, fig.jackpot) : ils disaient « menu » ou « course », pas « machine ». Ici, du
   MÉCANIQUE : le levier qui descend sur son cliquet et claque en butée, le cran de chaque symbole qui passe (le cliquetis ralentit
   avec les rouleaux, tout seul : un cran par symbole), le TCHONK du rouleau qui se verrouille (une note qui monte d'un rouleau à
   l'autre), le tintement des pièces du compteur, deux gains, et le JACKPOT : la sonnette d'alarme, la fanfare, la cascade de pièces. */
D('spin.levier',{fam:'spin',bus:'fx',dur:.7,st:1,db:+1,max:1,cd:.2,dit:'FINAL SPIN : le LEVIER — il descend sur son cliquet (trois crans), claque en butée, le ressort vibre',
  r:function(b,R,o){for(let k=0;k<3;k++){clic(b,{t0:k*.045,f:2600-k*300,d:.004,v:.3},R);bruit(b,{c:'b',t0:k*.045,a:.0005,d:.02,v:.18,ft:'bp',f:1700,q:2},R);}
    coup(b,R,o,.15,.6,1100,150,60,.22);tole(b,R,.152,620,.12,.25);osc(b,{f:92,w:'tri',t0:.16,a:.003,d:.35,v:.12,vib:[11,.06]});}});
D('spin.cran',{fam:'spin',bus:'fx',dur:.12,db:-4,max:4,cd:.03,v:2,dit:'FINAL SPIN : un CRAN de rouleau (un symbole qui passe) — le cliquetis ralentit avec les rouleaux',
  r:function(b,R,o){clic(b,{t0:0,f:o.v?2900:2500,d:.003,v:.35},R);bruit(b,{c:'b',t0:0,a:.0004,d:.016,v:.25,ft:'bp',f:o.v?2100:1800,q:2.4},R);
    osc(b,{f:o.v?760:690,w:'sin',t0:0,a:.0005,d:.03,v:.08});}});
D('spin.arret',{fam:'spin',bus:'fx',dur:.6,key:1,db:+1,max:3,cd:.04,pre:1,dit:'FINAL SPIN : un rouleau se VERROUILLE — tchonk (le choc, le loquet de métal) + sa note (qui monte d’un rouleau à l’autre : st)',
  r:function(b,R,o){coup(b,R,o,0,.55,700,170,72,.18);tole(b,R,.004,880,.1,.18);clic(b,{t0:.003,f:3400,d:.004,v:.25},R);marimba(b,R,nE(12),.01,.32,.3);}});
D('spin.piece',{fam:'spin',dur:.3,key:1,db:-5,max:4,cd:.05,v:3,dit:'FINAL SPIN : une PIÈCE qui tombe dans le bac (le compteur du gain qui monte)',
  r:function(b,R,o){clic(b,{t0:0,f:6200,d:.0015,v:.3},R);cloche(b,{f:nE(24+[0,4,7][o.v]),r:[1,2.01,3.01,5.43],m:[1,.35,.15,.1],d:[.2,.09,.05,.03],t0:0,v:.3,jit:.004},R);}});
D('spin.gain',{fam:'spin',dur:1.4,st:1,key:1,db:+2,max:1,cd:.3,v:2,pre:1,dit:'FINAL SPIN : un GAIN — 0 petit (paire, consolation : trois notes et quelques pièces) · 1 BRELAN (l’arpège qui monte plus haut, plus de pièces)',
  r:function(b,R,o){const N=o.v?[0,4,7,12,16]:[0,4,7];N.forEach(function(st,i){marimba(b,R,nE(12+st),i*.07,.36,.4);});
    pieces(b,R,.1,o.v?.8:.4,o.v?12:5,.22);if(o.v){stab(b,R,[12,16,19],.36,.06,.45,.3,.9);scintille(b,R,.36,.6,8,.08,36,48);}}});
D('spin.jackpot',{fam:'spin',dur:3.2,st:1,key:1,db:+5,max:1,cd:1,pre:1,dit:'FINAL SPIN : le JACKPOT — la sonnette qui s’affole, la fanfare, la cascade de pièces',
  r:function(b,R,o){for(let k=0;k<20;k++)cloche(b,{f:k%2?nE(31):nE(28),r:[1,2.76,5.4],m:[1,.3,.1],d:[.09,.05,.03],t0:k*.06,v:.2,pan:k%2?.4:-.4},R);
    stab(b,R,[0,4,7,12],.05,.12,.7,.42,1);stab(b,R,[7,12,16,19],.42,.12,.9,.42,1);
    pieces(b,R,.3,2.2,46,.3);scintille(b,R,.4,1.6,18,.09,36,50);grave(b,o,.05,110,55,.1,.4,.4);}});
/* (2026-10-15 soir, Sacha : « rajouter des sons pour la machine à sous ») LA MACHINE VIT ENTRE SES COUPS. Elle avait son levier, ses crans,
   ses arrêts, ses pièces et ses gains ; il lui manquait tout ce qui se passe AUTOUR : elle s'ALLUME (le relais, le néon qui chauffe, les
   ampoules en chenillard), le JETON tombe dans la fente et roule dans la goulotte, le MOTEUR des rouleaux ronronne tant qu'ils tournent
   (une boucle que le jeu ralentit avec eux), le CLIQUET du levier tiré au doigt, le SUSPENSE quand deux symboles sont déjà pareils (le
   roulement qui accélère), le PRESQUE quand le 3e tombe à côté, et elle S'ÉTEINT. Mécanique et tonale (pentatonique de mi, key:1). */
D('spin.ouvre',{fam:'spin',dur:1.3,st:1,key:1,db:-2,max:1,cd:.5,pre:1,dit:'FINAL SPIN : la machine S’ALLUME — le relais claque, le néon bourdonne et chauffe, les ampoules s’allument en chenillard (une gamme qui monte)',
  r:function(b,R,o){clic(b,{t0:0,f:2200,d:.006,v:.3},R);coup(b,R,o,0,.35,700,120,70,.2);
    osc(b,{f:98,w:'saw',t0:.02,a:.25,h:.3,d:.5,v:.05,flt:['lp',300,1400,.5,.8],vib:[50,.004]});                       // le néon qui chauffe
    wouom(b,R,.02,.6,180,900,.18,-.4,.4);
    [0,4,7,9,12,16,19,21,24].forEach(function(st,i){const t=.12+i*.055,p=-.6+i*.15;clic(b,{t0:t,f:4200,d:.002,v:.08,pan:p},R);
      cloche(b,{f:nE(12+st),r:[1,2.01,3.01],m:[1,.3,.1],d:[.3,.12,.06],t0:t,v:.16,pan:p},R);});
    scintille(b,R,.55,.6,8,.06,36,48);}});
D('spin.jeton',{fam:'spin',bus:'fx',dur:.9,st:1,db:-1,max:1,cd:.2,dit:'FINAL SPIN : le JETON tombe dans la fente — il tinte sur la lèvre, roule dans la goulotte, tombe dans la caisse',
  r:function(b,R,o){cloche(b,{f:nE(14),r:[1,2.32,4.25,6.1],m:[1,.5,.25,.12],d:[.35,.18,.09,.05],t0:0,v:.3,jit:.006},R);clic(b,{t0:0,f:5200,d:.002,v:.25},R);
    for(let k=0;k<6;k++){const t=.07+k*.05*(1+k*.18),p=.3-k*.08;clic(b,{t0:t,f:3600-k*250,d:.003,v:.16*(1-k*.1),pan:p},R);
      cloche(b,{f:nE(21-k),r:[1,2.32,4.25],m:[1,.4,.2],d:[.06,.04,.02],t0:t,v:.07,pan:p},R);}
    coup(b,R,o,.52,.4,800,140,70,.18);tole(b,R,.525,330,.08,.2);}});
D('spin.roule',{fam:'spin',bus:'fx',dur:1.6,st:1,db:-9,max:1,cd:.1,dit:'FINAL SPIN : les ROULEAUX tournent (boucle) — le moteur ronronne, les bandes défilent (un frottement haché), la courroie siffle ; le jeu la ralentit avec eux',
  r:function(b,R,o){bruit(b,{c:'n',t0:0,a:.001,h:1.6,d:.001,v:.5,ft:'lp',f:380,am:[25,.55]},R);
    bruit(b,{c:'r',t0:0,a:.001,h:1.6,d:.001,v:.14,ft:'bp',f:1250,q:2,am:[25,.7],pan:-.25},R);
    bruit(b,{c:'r',t0:0,a:.001,h:1.6,d:.001,v:.08,ft:'bp',f:2600,q:3,am:[12.5,.6],pan:.3},R);
    osc(b,{f:110,w:'tri',t0:0,a:.001,h:1.6,d:.001,v:.08,vib:[2.5,.01]});osc(b,{f:220,w:'saw',t0:0,a:.001,h:1.6,d:.001,v:.03,flt:['lp',700,700,1,.7]});
    O.boucle(b,.4);}});
D('spin.cliquet',{fam:'spin',bus:'fx',dur:.12,db:-8,max:3,cd:.025,v:2,dit:'FINAL SPIN : le CLIQUET du levier tiré au doigt — un cran de métal à chaque palier de la course',
  r:function(b,R,o){clic(b,{t0:0,f:o.v?3400:3000,d:.0025,v:.35},R);tole(b,R,0,o.v?1450:1300,.05,.05);bruit(b,{c:'b',t0:0,a:.0003,d:.012,v:.15,ft:'bp',f:2000,q:2},R);}});
D('spin.tease',{fam:'spin',dur:2.6,st:1,key:1,db:-3,max:1,cd:.5,dit:'FINAL SPIN : le SUSPENSE — deux symboles pareils, le 3e rouleau tourne encore : un roulement qui accélère, une note qui monte, les ampoules qui s’affolent',
  r:function(b,R,o){let t=0,k=0;while(t<2.3){const g=t/2.3;bruit(b,{c:'b',t0:t,a:.0008,d:.05,v:.1+.18*g,ft:'bp',f:2400,q:.9,pan:k%2?.25:-.25},R);clic(b,{t0:t,f:2800,d:.003,v:.06+.08*g},R);t+=.11-.075*g;k++;}
    osc(b,{f:nE(-12),f1:nE(0),g:2.4,gc:.8,w:'saw',t0:0,a:.4,h:1.6,d:.5,v:.12,flt:['lp',400,2600,2.3,.9]});
    osc(b,{f:nE(-5),f1:nE(7),g:2.4,gc:.8,w:'saw',t0:0,a:.4,h:1.6,d:.5,v:.08,flt:['lp',400,2600,2.3,.9],pan:.3});
    for(let i=0;i<14;i++)cloche(b,{f:nE(24+[0,4,7][i%3]),r:[1,2.76],m:[1,.15],d:[.08,.04],t0:.3+i*.15,v:.035+.03*i/14,pan:i%2?.5:-.5},R);}});
D('spin.presque',{fam:'spin',dur:1.1,key:1,db:-5,max:1,cd:.5,dit:'FINAL SPIN : PRESQUE ! — deux pareils et le 3e à côté : un « wouin-wouin » doux qui retombe (un regret, pas une moquerie)',
  r:function(b,R,o){osc(b,{f:nE(7),f1:nE(4),g:.25,w:'sq',pw:.35,t0:0,a:.01,h:.12,d:.18,v:.12,flt:['lp',1600,900,.3,.8]});
    osc(b,{f:nE(4),f1:nE(-1),g:.5,gc:1.4,w:'sq',pw:.35,t0:.32,a:.01,h:.2,d:.4,v:.13,flt:['lp',1500,500,.6,.8],vib:[6,.012]});
    basse(b,R,nE(-12),.32,.25,.5,0,.4);}});
D('spin.ferme',{fam:'spin',bus:'fx',dur:.8,db:-6,max:1,cd:.4,dit:'FINAL SPIN : la machine S’ÉTEINT — le relais retombe, le néon s’éteint (le bourdon qui descend), un dernier tic',
  r:function(b,R,o){clic(b,{t0:0,f:1800,d:.006,v:.25},R);osc(b,{f:180,f1:55,g:.5,gc:1.5,w:'saw',t0:0,a:.005,d:.55,v:.08,flt:['lp',900,200,.5,.7]});
    wouom(b,R,0,.5,700,160,.12,.3,-.3);clic(b,{t0:.6,f:3000,d:.002,v:.08},R);}});
/* (2026-10-15 soir, Sacha : « les stalactites sous la route de montagne : qu'elles se brisent de manière satisfaisante quand on les traverse,
   avec un son de bris de verre ») LA STALACTITE BRISÉE — le CRAC du choc, l'éclatement en éclats de VERRE (modes 1 · 1,97 · 3,04 · 4,7,
   désaccordés : du verre, pas une cloche), leur pluie qui retombe, et un petit DOUM dessous (le poids, audible au téléphone). Trois variantes. */
D('banq.bris',{fam:'banquise',bus:'fx',dur:1.4,st:1,v:3,db:0,max:3,cd:.04,dit:'LA STALACTITE BRISÉE : le CRAC du choc, l’éclatement en éclats de verre qui tintent et retombent en pluie, un petit « doum » grave dessous',
  r:function(b,R,o){const p=R()*.5-.25;
    clic(b,{t0:0,f:4200,d:.004,v:.6,pan:p},R);bruit(b,{c:'b',t0:0,a:.0005,d:.09,v:.45,ft:'hp',f:2600,pan:p},R);
    bruit(b,{c:'b',t0:.004,a:.001,d:.22,v:.22,ft:'bp',f:5200,q:1.4,pan:-p},R);
    doum(b,R,0,.28,120,70,.14,{toc:0,pan:p});
    const n=26+o.v*6;for(let i=0;i<n;i++){const t=.008+Math.pow(R(),1.7)*.75,f=1800+R()*4200;
      cloche(b,{f:f,r:[1,1.97,3.04,4.7],m:[1,.45,.25,.1],d:[.08+R()*.18,.06,.04,.02],t0:t,v:(.05+R()*.09)*(1-t*.7),pan:R()*1.8-.9,jit:.03},R);
      if(R()<.4)clic(b,{t0:t,f:6000,d:.0015,v:.05,pan:R()*1.6-.8},R);}
    bruit(b,{c:'b',t0:.25,a:.05,h:.15,d:.55,v:.05,ft:'hp',f:5500,am:[31,.7]},R);
    O.echo(b,.09,.18,1,true);O.versStereo(b,.35,R);}});
D('pose.lourde',{fam:'pose',bus:'fx',dur:.9,db:+2,max:1,cd:.2,grp:'r',prio:2,dit:'POSÉ LOURD : la tôle qui encaisse — craquement + ressorts en butée + grave sale',
  r:function(b,R,o){coup(b,R,o,0,1,1400,90,40,.4);tole(b,R,.005,190,.3,.5);tole(b,R,.04,135,.22,.4);
    bruit(b,{c:'r',t0:0,a:.002,d:.25,v:.4,ft:'bp',f:900,q:1.5,am:[38,.8]},R);osc(b,{f:98,f1:92,g:.3,w:'saw',t0:.02,a:.01,d:.4,v:.08,flt:['lp',600,300,.3]});}});
D('pose.travers',{fam:'pose',bus:'fx',dur:1,db:+2,max:1,cd:.3,grp:'r',prio:3,dit:'DE TRAVERS : crissement qui dérape + tôle + la note qui s’effondre',
  r:function(b,R,o){bruit(b,{c:'b',t0:0,a:.01,h:.12,d:.35,v:.4,ft:'bp',f:1600,f1:900,g:.4,q:7},R);coup(b,R,o,0,.8,1000,100,45,.3);tole(b,R,.03,150,.25,.4);
    osc(b,{f:nE(7),f1:nE(-5),g:.5,gc:1.5,w:'saw',t0:.08,a:.01,d:.6,v:.1,flt:['lp',2200,500,.6]});}});
D('pose.contresens',{fam:'pose',bus:'fx',dur:1.1,db:+2,max:1,cd:.3,grp:'r',prio:3,dit:'À CONTRESENS : le klaxon de travers (deux tons faux) + tôle',
  r:function(b,R,o){coup(b,R,o,0,.8,1000,100,45,.3);for(const [f,t] of [[392,0.05],[370,.3]])for(const dt of [0,.012])osc(b,{f:f*(1+dt),w:'sq',pw:.4,t0:t,a:.005,h:.18,d:.12,v:.1,flt:['lp',1800,1800,1,1]});tole(b,R,.02,160,.2,.35);}});
D('pose.cheveu',{fam:'pose',dur:.8,key:1,db:+2,max:1,cd:.3,grp:'r',prio:3,dit:'AU CHEVEU / À L’ARRACHÉE : le « ZWIP » du rattrapage + le souffle de soulagement + cloche',
  r:function(b,R,o){osc(b,{f:nE(0),f1:nE(24),g:.1,gc:.5,w:'tri',t0:0,a:.003,d:.15,v:.3});swish(b,R,.02,.35,4000,900,.25,.5,-.5,.9);
    cloche(b,{f:nE(28),r:[1,2,2.76],m:[1,.3,.15],d:[.7,.3,.1],t0:.08,v:.3},R);}});
D('cratere',{fam:'pose',bus:'fx',dur:2.2,st:1,db:+9,max:1,cd:.5,grp:'r',prio:5,dit:'IMPACT MÉTÉORE : le cratère — onde de choc, sol qui se fend, pluie de gravats',
  r:function(b,R,o){clic(b,{t0:0,f:900,d:.03,v:.7},R);grave(b,o,0,75,26,.7,1.4,1);bruit(b,{c:'r',t0:0,a:.002,d:.9,v:.7,ft:'lp',f:2600,f1:180,g:.8,q:.6},R);
    bruit(b,{c:'n',t0:.05,a:.15,h:.2,d:1.4,v:.35,ft:'lp',f:260,q:.7},R);crepite(b,R,.15,1.7,40,.3,400,2400);
    swish(b,R,0,.6,3000,300,.25,-.8,.8,.8);}});
/* LE VERDICT — la chaîne s'encaisse. Toujours sur la TONIQUE (la résolution de la gamme du vol), et la taille dit la
   valeur : MONSTRE = un « cha-ching » + un stab ; DOUBLE = deux stabs + pièces ; TRIPLE = la totale (sub, chœur, cymbale). */
function chaChing(b,R,t0,v){ // la caisse enregistreuse, en miniature : claquement de tiroir + double cloche
  bruit(b,{c:'r',t0:t0,a:.001,d:.08,v:v*.5,ft:'lp',f:1000},R);
  cloche(b,{f:nE(31),r:[1,2,2.76,3.9,5.4],m:[1,.4,.3,.12,.06],d:[1.1,.6,.4,.2,.1],t0:t0+.05,v:v*.35,pan:-.12},R);
  cloche(b,{f:nE(31),r:[1,2,2.76,3.9,5.4],m:[1,.45,.35,.15,.08],d:[1.3,.7,.45,.22,.12],t0:t0+.1,v:v*.42,pan:.12},R);
}
D('verdict.1',{fam:'pose',dur:1.4,st:1,key:1,db:+2,max:1,cd:.3,grp:'r',prio:4,dit:'MONSTRE : cha-ching + stab de tonique',
  r:function(b,R,o){chaChing(b,R,0,.8);stab(b,R,[12,19,24],.02,.08,.5,.14,1);}});
D('verdict.2',{fam:'pose',dur:1.8,st:1,key:1,db:+4,max:1,cd:.3,grp:'r',prio:5,dit:'DOUBLE MONSTRE : cha-ching + deux stabs + pièces qui roulent',
  r:function(b,R,o){chaChing(b,R,0,.9);stab(b,R,[12,19,24],.02,.05,.2,.14,1);stab(b,R,[12,19,24,28],.16,.15,.7,.16,1.2);pieces(b,R,.2,.8,16,.18);grave(b,o,.16,100,50,.15,.3,.4);}});
D('verdict.3',{fam:'pose',dur:2.4,st:1,key:1,db:+6,max:1,cd:.3,grp:'r',prio:6,dit:'TRIPLE MONSTRE : la totale — stabs, sub, chœur, cymbale, pluie de pièces',
  r:function(b,R,o){chaChing(b,R,0,1);stab(b,R,[12,19,24],.02,.05,.2,.14,1);stab(b,R,[12,19,24],.14,.05,.2,.14,1);stab(b,R,[0,12,19,24,28],.28,.3,1.1,.18,1.4);
    grave(b,o,.28,90,38,.3,.8,.7);choeur(b,R,[12,19,24],.28,.08,.3,1.1,.08);bruit(b,{c:'b',t0:.28,a:.002,d:1.2,v:.14,ft:'hp',f:5500,pan:-.3,pan1:.3},R);
    pieces(b,R,.3,1.3,30,.2);}});
D('verdict.meteor',{fam:'pose',dur:1.8,st:1,key:1,db:+5,max:1,cd:.3,grp:'r',prio:5,dit:'METEOR (la nitro au contact) : braise qui explose + stab + cha-ching',
  r:function(b,R,o){bruit(b,{c:'n',t0:0,a:.003,d:.6,v:.7,ft:'lp',f:3000,f1:500,g:.5},R);crepite(b,R,0,.9,24,.35,600,3000);chaChing(b,R,.05,.8);stab(b,R,[12,19,24,31],.06,.12,.7,.16,1.3);grave(b,o,0,85,40,.3,.5,.6);}});
D('verdict.mega',{fam:'pose',dur:3,st:1,key:1,db:+8,max:1,cd:.5,grp:'r',prio:7,dit:'MEGA METEOR : le GONG d’or (quinte grave qui fleurit) + chœur + onde de choc',
  r:function(b,R,o){cloche(b,{f:nE(-5),r:[1,1.5,2,2.76,3.5,5.4],m:[1,.6,.5,.35,.2,.1],d:[2.6,2,1.6,1,.6,.3],t0:0,v:.5,jit:.004},R);
    grave(b,o,0,70,30,.6,1.3,.9);choeur(b,R,[0,7,12,19],.05,.15,.4,1.8,.1);stab(b,R,[12,19,24,28],.05,.2,1,.14,1.3);
    bruit(b,{c:'b',t0:.02,a:.3,d:1.8,v:.1,ft:'hp',f:5000,pan:-.4,pan1:.4},R);scintille(b,R,.1,2,16,.1);}});
/* L'ARGENT GROS — l'ancien tirage de quatre samples (dont deux aux droits douteux, et tous en HTMLAudio : muets au mixage
   sur iPhone) devient trois sons de matière cuits ici : le tiroir-caisse, la compteuse de billets, la cascade de pièces. */
D('argent.gros',{fam:'argent',dur:1.8,v:3,key:1,db:+1,max:1,cd:.4,grp:'r',prio:3,dit:'gros encaissement : tiroir-caisse / compteuse de billets / cascade de pièces (au hasard)',
  r:function(b,R,o){
    if(o.v===0){bruit(b,{c:'r',t0:0,a:.001,d:.12,v:.5,ft:'lp',f:900},R);tole(b,R,0,520,.18,.18);chaChing(b,R,.05,1);pieces(b,R,.2,.6,12,.14);}
    else if(o.v===1){ // la COMPTEUSE : le moteur qui siffle + les billets qui claquent 30 fois par seconde + le « ding » d'arrêt
      osc(b,{f:190,f1:260,g:.3,w:'saw',t0:0,a:.05,h:.7,d:.2,v:.05,flt:['lp',900,900,1,.8]});
      for(let k=0;k<26;k++)bruit(b,{c:'b',t0:.04+k*.032,a:.0008,d:.018,v:.28*(k<3?k/3:1),ft:'bp',f:3200+R()*800,q:1.3,pan:(R()-.5)*.3},R);
      cloche(b,{f:nE(31),r:[1,2,2.76,5.4],m:[1,.4,.2,.08],d:[1,.5,.25,.1],t0:.92,v:.35},R);}
    else{pieces(b,R,0,1.1,42,.28);chaChing(b,R,.02,.6);}}});
D('argent.palier',{fam:'argent',dur:2.4,st:1,key:1,db:+5,max:1,cd:2,grp:'r',prio:5,dit:'« TU COMPTES EN MILLIONS » : ka-ching + chœur + douche de pièces',
  r:function(b,R,o){chaChing(b,R,0,1);choeur(b,R,[12,16,19,24],.1,.1,.4,1.4,.1);stab(b,R,[12,19,24],.1,.2,.9,.14,1.2);pieces(b,R,.15,1.8,44,.2);grave(b,o,.1,90,40,.3,.6,.5);}});
/* (2026-10-15, Sacha : « pas plein de trucs aigus ») LA SÉRIE COMPLÈTE : l'arpège de six pièces de mi5 à mi7 + le ding de mi8 (2,6 kHz)
   devient quatre pièces GRAVES qui montent (la matière de la pièce v2, mi4 → mi5), un petit « doum » de poche et une cloche ronde. */
D('piece.serie',{fam:'argent',dur:.7,st:1,key:1,db:-3,max:1,cd:.3,dit:'SÉRIE COMPLÈTE (la dernière pièce du motif) : quatre pièces graves qui montent + un petit « doum » + une cloche ronde',
  r:function(b,R,o){[0,4,7,12].forEach(function(st,i){const t=i*.045,p=(i/3-.5)*.7;bruit(b,{c:'b',t0:t,a:.0006,d:.018,v:.22,ft:'bp',f:2200,q:1.2,pan:p},R);
      cloche(b,{f:nE(st),r:[1,2.32,4.25],m:[1,.3,.12],d:[.18,.07,.03],t0:t+.002,v:.36,pan:p,jit:.004},R);});
    doum(b,R,.15,.4,120,70,.16,{toc:0});cloche(b,{f:nE(12),r:[1,2,2.76],m:[1,.25,.08],d:[.5,.2,.06],t0:.16,v:.26},R);}});
D('billet.vole',{fam:'argent',dur:.12,st:1,key:1,db:-14,max:4,cd:.035,dit:'un billet volant arrive au compteur : froissé bref + tic (2026-10-15 : une octave et demie plus bas)',
  r:function(b,R,o){bruit(b,{c:'b',t0:0,a:.002,d:.04,v:.4,ft:'bp',f:2200,q:1.2},R);osc(b,{f:nE(12),t0:.01,a:.001,d:.035,v:.3});}});
D('pluie.billets',{fam:'argent',dur:2.8,st:1,key:1,db:0,max:1,cd:3,bus:'amb',dit:'IL PLEUT DES BILLETS : froissements qui tombent partout + pièces',
  r:function(b,R,o){for(let k=0;k<22;k++){const t=R()*2.3;bruit(b,{c:'b',t0:t,a:.02,d:.12+R()*.15,v:.12+R()*.1,ft:'bp',f:2500+R()*2500,q:1.5,am:[18+R()*20,.7],pan:R()*1.8-.9},R);}
    pieces(b,R,.1,2.4,18,.14);}});
D('report',{fam:'argent',dur:.5,st:1,key:1,db:-5,max:1,cd:.3,dit:'REPORT (la mise reportée au vol suivant) : pièce pichenette + souffle',
  r:function(b,R,o){cloche(b,{f:nE(24),r:[1,2,3.01,5.43],m:[1,.4,.2,.1],d:[.3,.12,.06,.04],t0:0,v:.3},R);cloche(b,{f:nE(31),r:[1,2,3.01],m:[1,.4,.2],d:[.35,.12,.06],t0:.07,v:.3},R);swish(b,R,.05,.2,1500,4500,.12);}});
D('mallette.chaude',{fam:'argent',dur:1.2,st:1,db:-2,max:1,cd:2,dit:'la mallette devient CHAUDE : montée de tension (le cœur va se mettre à battre)',
  r:function(b,R,o){osc(b,{f:nE(-12),f1:nE(-5),g:.9,w:'saw',t0:0,a:.5,h:.2,d:.4,v:.12,flt:['lp',300,1600,.9,1.2]});swish(b,R,0,.9,200,2000,.2,-.4,.4);grave(b,o,.9,70,50,.1,.2,.5);}});

/* ================================ L'AURA, LE FLOW, LA TRIADE, LA FRÉNÉSIE ====================== */
/* l'AURA au sol a SA matière : un marimba de synthèse (FM douce) — pas la cloche des figures, pas le métal de l'argent */
function marimba(b,R,f,t0,v,d){osc(b,{f:f,t0:t0,a:.001,d:d||.35,v:v,fm:{r:4,i:1.2,d:.06}});osc(b,{f:f*4,t0:t0,a:.0008,d:.04,v:v*.15});clic(b,{t0:t0,f:3000,d:.003,v:v*.2},R);}
D('aura.geste',{fam:'aura',dur:.45,key:1,db:-3,max:3,cd:.04,pre:1,bases:[0,12],grp:'r',prio:1,dit:'un geste d’aura au sol (frôlé, rase-bord, virage…) : note de marimba (st = le × d’aura) — une octave plus bas depuis le 15/10',
  r:function(b,R,o){marimba(b,R,nE(o.base),0,.55,.35);}}); // (2026-10-15, Sacha : « plus de sons graves et discrets ») mi4 au lieu de mi5, −1 dB
D('aura.x5',{fam:'aura',dur:1.1,st:1,key:1,db:+2,max:1,cd:.5,grp:'r',prio:3,dit:'× d’aura ×5 EN FEU : la flamme prend + accord qui monte',
  r:function(b,R,o){bruit(b,{c:'n',t0:0,a:.08,d:.5,v:.5,ft:'lp',f:300,f1:2200,g:.3},R);crepite(b,R,.05,.5,10,.25);[12,16,19].forEach(function(st,i){marimba(b,R,nE(st+12),.05+i*.05,.4,.5);});stab(b,R,[12,19],.18,.1,.5,.1,1);}});
D('aura.x8',{fam:'aura',dur:1.4,st:1,key:1,db:+3,max:1,cd:.5,grp:'r',prio:4,dit:'×8 DÉMENT : plus haut, plus large, un coup de grave',
  r:function(b,R,o){swish(b,R,0,.3,500,5000,.3,-.6,.6);[16,19,24,28].forEach(function(st,i){marimba(b,R,nE(st+12),i*.045,.4,.55);});stab(b,R,[16,24,28],.2,.15,.6,.14,1.3);grave(b,o,.2,90,40,.2,.4,.5);}});
D('aura.x10',{fam:'aura',dur:2,st:1,key:1,db:+5,max:1,cd:1,grp:'r',prio:5,dit:'×10 MAX : le sommet de l’aura — chœur + stab + poussière d’or',
  r:function(b,R,o){swish(b,R,0,.4,300,6000,.35,-.8,.8);[12,16,19,24,28,31].forEach(function(st,i){marimba(b,R,nE(st+12),i*.04,.35,.6);});
    stab(b,R,[12,19,24,31],.26,.3,1,.16,1.4);choeur(b,R,[12,19,24],.26,.1,.3,1.2,.08);grave(b,o,.26,80,36,.3,.7,.6);scintille(b,R,.3,1.4,14,.1);}});
D('aura.encaisse1',{fam:'aura',dur:.9,st:1,key:1,db:0,max:1,cd:.2,grp:'r',prio:2,dit:'la chaîne d’aura s’encaisse (petite) : deux notes qui se posent',
  r:function(b,R,o){marimba(b,R,nE(7),0,.45,.5);marimba(b,R,nE(12),.07,.5,.6);doum(b,R,.07,.3,90,58,.14,{toc:0});}}); // (2026-10-15, Sacha : « plus de sons graves ») les trois encaissements une octave plus bas, sans poussière d'or, posés sur un doum
D('aura.encaisse2',{fam:'aura',dur:1.2,st:1,key:1,db:+2,max:1,cd:.2,grp:'r',prio:3,dit:'encaissement d’aura (moyen, ≥ 600) : trois notes + stab',
  r:function(b,R,o){[7,12,16].forEach(function(st,i){marimba(b,R,nE(st),i*.06,.45,.55);});stab(b,R,[0,7,12],.14,.1,.5,.12,.8);doum(b,R,.14,.45,80,48,.2,{toc:0});}});
D('aura.encaisse3',{fam:'aura',dur:1.6,st:1,key:1,db:+4,max:1,cd:.2,grp:'r',prio:4,dit:'gros encaissement d’aura (≥ 2000) : arpège + stab + DOUM',
  r:function(b,R,o){[0,7,12,16,19].forEach(function(st,i){marimba(b,R,nE(st),i*.05,.42,.6);});stab(b,R,[0,7,12,16],.2,.2,.8,.16,1);doum(b,R,.2,.7,66,38,.4,{toc:1000,sat:2.4});}});
D('aura.record',{fam:'aura',dur:1.3,st:1,key:1,db:+3,max:1,cd:1,grp:'r',prio:4,dit:'record d’aura battu en course : « ta-DA » de marimba + cuivre',
  r:function(b,R,o){marimba(b,R,nE(19),0,.5,.3);marimba(b,R,nE(24),.1,.55,.8);stab(b,R,[12,19,24,28],.1,.15,.8,.14,1.3);scintille(b,R,.12,.8,10,.1);}});
D('aura.moyenne',{fam:'aura',dur:.9,st:1,key:1,db:+1,max:1,cd:.5,grp:'r',prio:2,dit:'« moyenne battue » (2026-10-14, session SON) : trois notes de marimba qui montent, un accord court et une cloche — petite récompense, sous la victoire',
  r:function(b,R,o){[12,19,24].forEach(function(st,i){marimba(b,R,nE(st),i*.07,.45,i===2?.7:.4);});stab(b,R,[12,19],.14,.05,.3,.08,1);cloche(b,{f:nE(31),r:[1,2,2.76],m:[1,.3,.1],d:[.3,.12,.05],t0:.2,v:.22},R);}});
D('aura.perdue',{fam:'aura',dur:.9,st:1,key:1,db:-2,max:1,cd:.5,dit:'la chaîne d’aura retombe : trois notes qui DESCENDENT, étouffées',
  r:function(b,R,o){[24,19,12].forEach(function(st,i){marimba(b,R,nE(st),i*.09,.4,.3);});filtre(b,'lp',2500,.7);}});
/* LE FLOW — l'ACCORD qui monte d'un degré à chaque palier (piano électrique FM + nappe) */
function piano(b,R,f,t0,v,d){osc(b,{f:f,t0:t0,a:.002,d:d||1,v:v,fm:{r:1,i:1.6,d:.35}});osc(b,{f:f*2,t0:t0,a:.001,d:(d||1)*.4,v:v*.2,fm:{r:14,i:.4,d:.02}});}
const FLOW_I=[null,[12,16,19],[14,19,23],[16,21,26]]; // mi · fa#-si · sol#-do# (la basse monte d'un degré)
for(let lv=1;lv<=3;lv++)D('flow.'+lv,{fam:'flow',dur:1.6,st:1,key:1,db:-1+lv,max:1,cd:.3,grp:'r',prio:2+lv,dit:'palier de FLOW '+['','I','II','III'][lv]+' : accord de piano électrique qui monte + nappe',
  r:function(b,R,o){const I=FLOW_I[lv];I.forEach(function(st,i){piano(b,R,nE(st),i*.05,.28,1.1);});nappe(b,R,I.map(function(x){return x-12;}),.02,.15,.2,1,.05,1600);
    if(lv>=2)scintille(b,R,.1,.6,4+lv*3,.08);if(lv>=3)grave(b,o,.1,85,40,.2,.4,.45);}});
D('flow.perdu',{fam:'flow',dur:.8,st:1,key:1,db:-2,max:1,cd:.3,dit:'un palier de FLOW perdu : deux notes de piano qui descendent',
  r:function(b,R,o){piano(b,R,nE(19),0,.3,.5);piano(b,R,nE(12),.1,.3,.6);filtre(b,'lp',3000,.7);}});
D('alerte.tic',{fam:'flow',bus:'fx',dur:.12,db:-4,max:2,cd:.06,pre:1,dit:'TIC d’alerte (chrono d’airtime, flow qui lâche, roule-ou-crève) : bloc de bois sec — un danger ne sonne JAMAIS en cloche',
  r:function(b,R,o){bois(b,R,0,1250,.6);}});
D('alerte.tac',{fam:'flow',bus:'fx',dur:.14,db:-2,max:2,cd:.06,dit:'le TAC (dernière demi-seconde) : plus grave, plus fort',
  r:function(b,R,o){bois(b,R,0,820,.7);osc(b,{f:160,f1:120,g:.05,t0:0,a:.001,d:.06,v:.3});}});
D('triade.revele',{fam:'flow',dur:2,st:1,key:1,db:+2,max:1,cd:1,grp:'r',prio:5,dit:'la TRIADE se révèle : cymbale à l’envers + motif de trois notes mystérieux',
  r:function(b,R,o){bruit(b,{c:'b',t0:0,a:.5,h:0,d:.05,v:.25,ft:'hp',f:4000},R); // cymbale inversée : ça ASPIRE vers la révélation
    [0,7,14].forEach(function(st,i){piano(b,R,nE(st+12),.52+i*.13,.3,1.2);});nappe(b,R,[0,7],.5,.3,.3,1,.06,1200);grave(b,o,.52,70,40,.2,.6,.5);}});
D('triade.renait',{fam:'flow',dur:.8,st:1,key:1,db:0,max:1,cd:.3,grp:'r',prio:2,dit:'un trait de la triade renaît : trois notes qui remontent',
  r:function(b,R,o){[12,19,24].forEach(function(st,i){piano(b,R,nE(st),i*.06,.28,.5);});}});
D('triade.meurt',{fam:'flow',bus:'fx',dur:.7,v:3,st:1,db:0,max:1,cd:.3,dit:'un trait de la triade MEURT (UNE FIGURE ! · TRICHE ! · NITRO !) : un son cassé différent par trait',
  r:function(b,R,o){
    if(o.v===0){cloche(b,{f:nE(7),r:[1,2.76,5.4],m:[1,.5,.3],d:[.3,.15,.08],t0:0,v:.3},R);bruit(b,{c:'b',t0:.01,a:.001,d:.15,v:.3,ft:'hp',f:3000},R);osc(b,{f:nE(7),f1:nE(-5),g:.3,t0:.02,a:.002,d:.3,v:.15});}   // la figure : le verre qui se fêle
    else if(o.v===1){osc(b,{f:110,w:'sq',pw:.5,t0:0,a:.003,h:.18,d:.1,v:.12,flt:['lp',1400,1400,1,.8]});osc(b,{f:116.5,w:'sq',pw:.5,t0:0,a:.003,h:.18,d:.1,v:.12,flt:['lp',1400,1400,1,.8]});} // la triche : le buzzer de faute
    else{bruit(b,{c:'n',t0:0,a:.002,d:.25,v:.5,ft:'lp',f:900,f1:200,g:.25},R);crepite(b,R,.02,.3,6,.2);}}});                                                // la nitro : la flamme qui s'étouffe
D('frenesie.arme',{fam:'flow',dur:1.5,st:1,key:1,db:0,max:1,cd:1,grp:'r',prio:4,dit:'la FRÉNÉSIE s’arme (« POSE UNE FIGURE ! ») : bourdon qui monte + pulsation',
  r:function(b,R,o){for(const dt of [-.006,.006])osc(b,{f:nE(-12),f1:nE(0),g:1.2,w:'saw',t0:0,a:.4,h:.6,d:.4,v:.08,pan:dt*80,flt:['lp',400,2600,1.2,1.3]});
    for(let k=0;k<5;k++)grave(b,o,k*.24,70,55,.05,.12,.25+k*.05);}});
D('frenesie.entre',{fam:'flow',dur:3.2,st:1,key:1,db:+7,max:1,cd:1,grp:'r',prio:8,dit:'LA FRÉNÉSIE PART : aspiration, IMPACT, supersaw grand ouvert, chœur, crash — le plus gros son de style',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.35,h:0,d:.03,v:.4,ft:'bp',f:600,f1:6000,g:.35,q:.8},R); // l'aspiration
    const T=.36;clic(b,{t0:T,f:1500,d:.02,v:.8},R);grave(b,o,T,80,30,.5,1.1,1);bruit(b,{c:'r',t0:T,a:.001,d:.5,v:.5,ft:'lp',f:3000,f1:300,g:.4},R);
    for(const st of [0,12,19,24,28])for(const dt of [-.012,-.005,0,.005,.012])osc(b,{f:nE(st)*(1+dt),w:'saw',t0:T,a:.005,h:.5,d:1.8,v:.028,pan:dt*60,flt:['lp',800,7000,.08,.9,.4]});
    choeur(b,R,[12,19,24],T,.05,.6,1.6,.1);bruit(b,{c:'b',t0:T,a:.002,d:2,v:.18,ft:'hp',f:4500,pan:-.4,pan1:.4},R);scintille(b,R,T+.1,2,20,.1);}});
D('frenesie.sort',{fam:'flow',dur:1.2,st:1,key:1,db:+1,max:1,cd:1,dit:'la FRÉNÉSIE s’éteint : le moteur qui cale — note qui s’effondre, filtre qui se ferme, crépitement',
  r:function(b,R,o){for(const dt of [-.008,.008])osc(b,{f:nE(12),f1:nE(-12),g:.9,gc:1.6,w:'saw',t0:0,a:.005,h:.2,d:.7,v:.1,pan:dt*80,flt:['lp',4000,250,.9,1]});crepite(b,R,.3,.7,10,.2,300,900);}});
D('frenesie.record',{fam:'flow',dur:1.4,st:1,key:1,db:+3,max:1,cd:2,grp:'r',prio:5,dit:'record de frénésie : stab rouge + chœur bref',
  r:function(b,R,o){stab(b,R,[12,16,19,24],0,.2,.9,.16,1.3);choeur(b,R,[12,19],.02,.05,.2,.8,.07);grave(b,o,0,90,40,.2,.4,.5);}});
D('plus.vite',{fam:'flow',dur:.5,st:1,db:-2,max:1,cd:1.5,dit:'PLUS VITE ! : souffle qui accélère vers l’avant',
  r:function(b,R,o){swish(b,R,0,.3,500,5000,.35,0,0,1);osc(b,{f:220,f1:880,g:.25,gc:.7,w:'tri',t0:0,a:.01,d:.25,v:.12});}});

/* ================================ LA MACHINE : NITRO, POUVOIRS, TURBOS ========================= */
D('nitro.plein',{fam:'machine',bus:'fx',dur:.6,st:1,key:1,db:-4,max:1,cd:.25,dit:'plein de nitro (fruit, portail, pose, bump) : le réservoir qui se remplit (glouglou qui monte + clic)',
  r:function(b,R,o){for(let k=0;k<5;k++)bulle(b,R,k*.05,170+k*60,330+k*90,.06,.28);swish(b,R,0,.3,300,1600,.15);clic(b,{t0:.3,f:1600,d:.006,v:.26},R);osc(b,{f:nE(0),t0:.3,a:.001,d:.12,v:.22});}}); // (2026-10-15, Sacha : « graves et discrets ») le glouglou plus bas, le ding mi6 → mi4
D('nitro.pleine',{fam:'machine',dur:.7,st:1,key:1,db:-6,max:1,cd:2,dit:'la jauge de nitro est PLEINE : dong-dong rond (2026-10-15 : deux octaves plus bas, sans scintillement)',
  r:function(b,R,o){cloche(b,{f:nE(7),r:[1,2,2.76],m:[1,.3,.1],d:[.35,.15,.05],t0:0,v:.32},R);cloche(b,{f:nE(12),r:[1,2,2.76],m:[1,.3,.1],d:[.5,.2,.08],t0:.08,v:.32},R);}});
D('nitro.sec',{fam:'machine',bus:'fx',dur:.7,db:-2,max:1,cd:1,dit:'panne SÈCHE de nitro (en vol : on perd le plané) : la flamme qui tousse et s’étrangle',
  r:function(b,R,o){for(let k=0;k<3;k++)bruit(b,{c:'n',t0:k*.13,a:.003,d:.08,v:.5-k*.12,ft:'lp',f:1200-k*300,q:.8},R);bruit(b,{c:'b',t0:.4,a:.01,d:.2,v:.2,ft:'bp',f:1800,f1:600,g:.2,q:1.5},R);osc(b,{f:180,f1:60,g:.4,w:'saw',t0:0,a:.01,d:.5,v:.06,flt:['lp',800,200,.4]});}});
/* (2026-10-14, session SON) L'ATCHOUM — la panne sèche en éternuement : « a… » (une aspiration qui monte, souffle + sifflet nasal), un temps, puis « TCHOUM » (pop d'échappement,
   corps brun, voyelle qui s'affaisse, miettes de crépitements). Comique sans être un bruitage de dessin animé : la matière reste la machine (bus fx, niveau de nitro.sec). */
D('caisse.atchoum',{fam:'machine',bus:'fx',dur:.6,db:-2,max:1,cd:1,dit:'panne SÈCHE, version éternuement : la flamme prend une grande inspiration (« a… ») puis éternue (« TCHOUM »)',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.2,d:.05,v:.3,ft:'bp',f:500,f1:2600,g:.24,q:1.4},R);osc(b,{f:420,f1:1100,g:.24,t0:0,a:.2,d:.05,v:.1,vib:[18,.03]});
    bruit(b,{c:'b',t0:.31,a:.002,d:.1,v:.55,ft:'bp',f:1500,f1:500,g:.1,q:1},R);bruit(b,{c:'n',t0:.31,a:.003,d:.2,v:.5,ft:'lp',f:900,q:.7},R);
    osc(b,{f:320,f1:90,g:.2,w:'saw',t0:.31,a:.005,d:.24,v:.2,flt:['lp',1300,300,.2,.8]});clic(b,{t0:.31,f:3000,d:.01,v:.35},R);crepite(b,R,.4,.12,4,.2);}});
/* (2026-10-15, Sacha : « trop de petits sons aigus ») LA GÂCHETTE À VIDE (et la figure refusée en vol, figRefus) : deux clics passe-HAUT à
   2,5 kHz — 75 % de l'énergie au-dessus de 5 kHz (centre 9 kHz, mesuré) : le son le plus aigu de la course. Les mêmes deux clics en bande
   à 1,5 kHz et 1 kHz, et le petit poids du chien qui retombe. */
D('nitro.vide',{fam:'machine',bus:'fx',dur:.12,db:-6,max:1,cd:.15,dit:'appui NITRO à vide (et figure refusée) : « tchk » de gâchette sèche, mat',
  r:function(b,R,o){clic(b,{t0:0,f:1500,d:.01,v:.6,ft:'bp'},R);clic(b,{t0:.035,f:1000,d:.008,v:.45,ft:'bp'},R);bruit(b,{c:'b',t0:.035,a:.002,d:.05,v:.15,ft:'bp',f:800,q:2},R);
    O.osc(b,{f:150,f1:95,g:.03,t0:.035,a:.001,d:.04,v:.07});}});
/* LES POUVOIRS ont chacun leur signature (avant : le souffle d'un pad + deux notes) */
D('pwr.n',{fam:'machine',dur:1.2,st:1,key:1,db:+2,max:1,cd:.4,grp:'r',prio:3,dit:'pouvoir NITRO INFINIE : allumage de réacteur + deux notes de feu',
  r:function(b,R,o){bruit(b,{c:'n',t0:0,a:.01,h:.1,d:.7,v:.7,ft:'lp',f:200,f1:3500,g:.25},R);crepite(b,R,.05,.8,18,.3,500,2500);grave(b,o,0,80,40,.2,.5,.6);
    stab(b,R,[16,23],.08,.1,.5,.12,1.2);}});
D('pwr.a',{fam:'machine',dur:1.4,st:1,key:1,db:+2,max:1,cd:.4,grp:'r',prio:3,dit:'pouvoir AIRTIME INFINI : carillons à vent + le souffle qui soulève',
  r:function(b,R,o){swish(b,R,0,.8,200,3000,.35,-.5,.5,.7);for(let k=0;k<7;k++)cloche(b,{f:nE(pd(10+((k*3)%7))),r:[1,2.76,5.4],m:[1,.3,.1],d:[.8,.3,.1],t0:.05+k*.07,v:.18,pan:(k%3-1)*.6},R);nappe(b,R,[16,23],.05,.2,.3,.8,.06,2400);}});
D('pwr.v',{fam:'machine',dur:1,st:1,key:1,db:+2,max:1,cd:.4,grp:'r',prio:3,dit:'pouvoir SPEED UP : l’étincelle électrique + la turbine qui monte',
  r:function(b,R,o){for(let k=0;k<4;k++)osc(b,{f:1800+k*400,f1:300,g:.06,t0:k*.02,a:.0005,d:.06,v:.12,fm:{r:3.3,i:3,d:.04}});osc(b,{f:600,f1:4200,g:.6,gc:.7,w:'saw',t0:0,a:.02,d:.6,v:.05,flt:['bp',1500,6000,.6,4]});
    stab(b,R,[14,21],.06,.1,.5,.12,1.2);grave(b,o,0,100,50,.1,.3,.4);}});
/* (2026-10-20, Léo : « le citron : petits crépitements électriques mignons, addictifs, peau de gaming audio sound design ») le ZAP du citron : cinq petits « bip » FM qui dévalent, un grain de crépitement, une minuscule cloche au bout — mignon, jamais agressif, à jouer en rafale */
D('citron.zap',{fam:'machine',bus:'fx',dur:.4,st:1,db:-3,max:3,cd:.05,dit:'citron : un petit crépitement électrique mignon et addictif (bips FM qui dévalent + grain de crépitement + minuscule cloche)',
  r:function(b,R,o){for(let k=0;k<5;k++)osc(b,{f:2200+k*430,f1:900+k*150,g:.04,t0:k*.045,a:.0004,d:.05,v:.11,fm:{r:2.7,i:2.2,d:.03},pan:(k%3-1)*.5});
    crepite(b,R,0,.3,14,.16,2500,7000);cloche(b,{f:3100,r:[1,2.76],m:[1,.3],d:[.12,.05],t0:.02,v:.08},R);}});
D('pwr.bientot',{fam:'machine',bus:'fx',dur:.5,st:1,key:1,db:-4,max:1,cd:.4,dit:'un pouvoir va finir (< 1,5 s) : tic-tac sec, trois fois',
  r:function(b,R,o){bois(b,R,0,1500,.5);bois(b,R,.16,1500,.5);bois(b,R,.32,1100,.6);}});
D('pwr.fin',{fam:'machine',dur:.8,st:1,key:1,db:0,max:1,cd:.3,dit:'un pouvoir s’éteint : le « power-down » (note qui retombe, filtre qui se ferme)',
  r:function(b,R,o){for(const dt of [-.006,.006])osc(b,{f:nE(19),f1:nE(7),g:.45,gc:1.3,w:'saw',t0:0,a:.005,h:.05,d:.45,v:.1,pan:dt*80,flt:['lp',3000,400,.5,1]});}});
D('pad',{fam:'machine',bus:'fx',dur:.8,st:1,key:1,db:+2,max:2,cd:.12,grp:'r',prio:2,dit:'pad turbo : la plaque de métal qui claque (TCHAK) + la poussée qui fend l’air + l’élan',
  r:function(b,R,o){clic(b,{t0:0,f:2000,d:.01,v:.6},R);cloche(b,{f:1250,r:[1,1.63,2.41,3.37],m:[1,.6,.4,.2],d:[.13,.08,.05,.03],t0:0,v:.3,jit:.01},R);
    swish(b,R,.005,.4,300,4200,.5,-.4,.4,1.1);grave(b,o,0,110,45,.12,.25,.55);
    for(const dt of [-.006,.006])osc(b,{f:nE(-12),f1:nE(12),g:.3,gc:.8,w:'saw',t0:.01,a:.01,d:.35,v:.05,pan:dt*80,flt:['lp',800,5000,.3,1]});}});
D('pad.neon',{fam:'machine',bus:'fx',dur:.5,key:1,db:0,max:2,cd:.08,bases:[0,12],dit:'pad de la LIGNE DE NÉON (N12) : clic néon + pluck qui monte (st)',
  r:function(b,R,o){clic(b,{t0:0,f:3000,d:.008,v:.4},R);swish(b,R,0,.25,800,4000,.3);pluck(b,R,nE(12+o.base),.01,.45,.35,1.2);}});
D('turbo.mini',{fam:'machine',bus:'fx',dur:.5,st:1,key:1,db:0,max:1,cd:.2,grp:'r',prio:2,dit:'MINI-TURBO (drift bleu relâché) : pfft + étincelle bleue',
  r:function(b,R,o){swish(b,R,0,.2,1500,5000,.4);cloche(b,{f:nE(24),r:[1,2.76],m:[1,.2],d:[.25,.08],t0:.02,v:.25},R);grave(b,o,0,100,55,.08,.15,.35);}});
D('turbo.super',{fam:'machine',bus:'fx',dur:.8,st:1,key:1,db:+2,max:1,cd:.2,grp:'r',prio:3,dit:'SUPER TURBO (drift or) : souffle + pétarade + deux notes',
  r:function(b,R,o){swish(b,R,0,.3,900,5500,.45,-.3,.3);crepite(b,R,0,.3,8,.3,400,1500);cloche(b,{f:nE(24),r:[1,2.76],m:[1,.2],d:[.3,.1],t0:.02,v:.25},R);cloche(b,{f:nE(31),r:[1,2.76],m:[1,.2],d:[.4,.12],t0:.08,v:.25},R);grave(b,o,0,95,45,.1,.25,.45);}});
D('turbo.ultra',{fam:'machine',bus:'fx',dur:1.2,st:1,key:1,db:+4,max:1,cd:.2,grp:'r',prio:4,dit:'ULTRA TURBO (drift rose) : l’arc électrique + accord qui scintille + gros souffle',
  r:function(b,R,o){for(let k=0;k<5;k++)osc(b,{f:2200+k*300,f1:400,g:.07,t0:k*.015,a:.0005,d:.07,v:.1,fm:{r:3.3,i:3,d:.05}});swish(b,R,0,.45,400,6500,.5,-.7,.7);crepite(b,R,0,.4,12,.3,500,2000);
    [24,28,31,36].forEach(function(st,i){cloche(b,{f:nE(st),r:[1,2,2.76],m:[1,.3,.1],d:[.6,.25,.08],t0:.04+i*.04,v:.2,pan:(i-1.5)*.3},R);});grave(b,o,0,90,40,.15,.35,.6);}});
/* LA FRONDE (2026-09-30) : la sortie d'un virage pris à fond, SANS glisser (le drift a ses turbos). L'élastique tendu qui LÂCHE — un
   « thwoung » boisé qui plonge — puis l'air qui s'ouvre et traverse la stéréo, et l'élan en quinte qui monte ; st = la force (tenue, corde). */
D('fronde',{fam:'machine',bus:'fx',dur:.9,st:1,key:1,db:+1,max:1,cd:.3,grp:'r',prio:2,dit:'LA FRONDE (sortie d’un virage serré pris sans glisser) : l’élastique qui lâche + l’air qui s’ouvre + l’élan (st = la force)',
  r:function(b,R,o){clic(b,{t0:0,f:1400,d:.008,v:.45},R);
    osc(b,{f:nE(-5),f1:nE(-24),g:.1,gc:.6,w:'tri',t0:0,a:.001,d:.18,v:.32,flt:['lp',3200,600,.14,1.4]});
    corde(b,{f:nE(-12),d:.3,v:.26,br:.85},R);
    swish(b,R,.02,.55,450,6200,.5,-.55,.55,1.1);
    cloche(b,{f:nE(19),r:[1,2.76],m:[1,.2],d:[.3,.1],t0:.08,v:.17},R);cloche(b,{f:nE(26),r:[1,2.76],m:[1,.2],d:[.45,.14],t0:.15,v:.17},R);
    grave(b,o,0,85,40,.12,.3,.5);}});
D('vitesse.pure',{fam:'machine',bus:'fx',dur:1,st:1,key:1,db:+1,max:1,cd:.5,bases:[0,12],grp:'r',prio:2,dit:'PURE SPEED (et ses paliers : st) : le mur d’air + cuivre qui monte',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.1,h:.1,d:.5,v:.4,ft:'bp',f:600,f1:3000,g:.4,q:.7},R);stab(b,R,[12+o.base,19+o.base],.08,.1,.5,.12,1.1);}});
D('virage',{fam:'machine',bus:'fx',dur:.3,st:1,db:-9,max:2,cd:.15,dit:'VIRAGE SERRÉ : le pneu qui zippe — plus bas et plus large depuis le 15/10',
  r:function(b,R,o){bruit(b,{c:'b',t0:0,a:.01,d:.15,v:.35,ft:'bp',f:900,f1:1250,g:.12,q:3},R);bruit(b,{c:'n',t0:0,a:.01,d:.12,v:.3,ft:'lp',f:400},R);}}); // (2026-10-15, Sacha : « trop de sons aigus ») le sifflet étroit de 1,8-2,4 kHz (Q 6) → 0,9-1,25 kHz (Q 3) + la gomme dessous, −3 dB
D('arret.tic',{fam:'machine',bus:'fx',dur:.2,st:1,key:1,db:-3,max:2,cd:.08,dit:'ROULE OU CRÈVE (la caisse s’arrête) : tic d’horloge qui s’accélère (le jeu règle la cadence)',
  r:function(b,R,o){bois(b,R,0,1250,.6);osc(b,{f:nE(7),w:'sq',pw:.3,t0:0,a:.002,d:.05,v:.06,flt:['lp',2000,2000,1,.8]});}});

/* ================================ LA PISTE ==================================================== */
D('portail',{fam:'piste',dur:2.2,st:1,key:1,db:+5,max:1,cd:.8,grp:'r',prio:5,dit:'PORTAIL de zone : aspiration, passage qui traverse la stéréo, accord qui s’ouvre, poussière',
  r:function(b,R,o){swish(b,R,0,.5,200,3000,.5,-.9,.9,.9);grave(b,o,.18,70,38,.3,.7,.6);
    for(const st of [0,12,16,19,24])for(const dt of [-.006,.006])osc(b,{f:nE(st)*(1+dt),w:'saw',t0:.15,a:.05,h:.25,d:1.3,v:.03,pan:dt*80,flt:['lp',700,6000,.4,.8]});
    cloche(b,{f:nE(36),r:[1,2,2.76],m:[1,.3,.1],d:[1.4,.5,.2],t0:.2,v:.2},R);bruit(b,{c:'b',t0:.18,a:.05,d:1.4,v:.08,ft:'hp',f:7000,pan:-.5,pan1:.5},R);scintille(b,R,.2,1.4,14,.08);}});
D('portail.proche',{fam:'piste',bus:'amb',dur:2,st:1,key:1,db:-6,max:1,cd:3,dit:'le portail approche : bourdon qui monte (ça tire vers le but)',
  r:function(b,R,o){nappe(b,R,[0,7],0,1.5,.2,.3,.1,900);bruit(b,{c:'r',t0:0,a:1.5,d:.4,v:.15,ft:'bp',f:300,f1:1500,g:1.8,q:1.5},R);}});
D('respawn',{fam:'piste',dur:.9,st:1,key:1,db:0,max:1,cd:.5,dit:'replacement / repêchage : aspiration à l’envers + scintillement + la caisse retombe',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.35,h:0,d:.04,v:.35,ft:'bp',f:800,f1:5000,g:.35,q:1},R);scintille(b,R,.3,.3,6,.1);cloche(b,{f:nE(24),r:[1,2,2.76],m:[1,.3,.1],d:[.5,.2,.08],t0:.35,v:.2},R);coup(b,R,o,.55,.4,700,110,55,.18);}});
D('nuage.entre',{fam:'piste',bus:'amb',dur:.6,st:1,db:-2,max:2,cd:.2,rj:.04,dit:'entrer dans un nuage : « pouf » feutré (l’ouate qui avale la caisse)',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.02,d:.45,v:.6,ft:'lp',f:1400,f1:300,g:.4,q:.6},R);grave(b,o,0,90,60,.2,.25,.25);bruit(b,{c:'b',t0:0,a:.01,d:.15,v:.08,ft:'hp',f:5000},R);}});
D('nuage.sort',{fam:'piste',bus:'amb',dur:.5,st:1,db:-8,max:2,cd:.2,rj:.04,dit:'sortir du nuage : l’air revient, plus clair',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.06,d:.3,v:.45,ft:'bp',f:1200,f1:3500,g:.3,q:.8},R);}});
D('nuage.defonce',{fam:'piste',bus:'amb',dur:.9,st:1,db:+2,max:1,cd:.3,dit:'défoncer un banc de nuage au sol : WHOUMPF + souffle',
  r:function(b,R,o){coup(b,R,o,0,.6,500,90,45,.3);bruit(b,{c:'r',t0:0,a:.01,d:.6,v:.6,ft:'lp',f:2000,f1:300,g:.5,q:.6,pan:-.4,pan1:.4},R);}});
/* LE SON DU NIVEAU 1 — LA MER DE NUAGES (2026-09-30, Sacha : « refonte totale du niveau 1, le fer de lance du jeu » ; GAMEPLAY refait
   l'IMAGE, la session SON fait l'OREILLE). Deux boucles sur le bus d'ambiance, qu'on SENT plus qu'on n'entend :
   · `nuages.ambiance` — EN COURSE, au niveau NUAGES : l'air d'altitude, haut et clair, qui respire une fois par boucle ; une épaisseur
     très basse ; deux rafales LOINTAINES qui traversent la stéréo ; et les HARMONIQUES DU VENT (harpe éolienne : des sinus hauts qui
     gonflent et s'éteignent, dans la tonalité de la musique — key). Le vent de la VITESSE reste celui du moteur (windG/whG) : celle-ci
     est le LIEU, pas la vitesse.
   · `chute.vent` — AU MENU (la CHUTE) : la chute libre. Le grondement brun qui respire, le souffle en deux bandes aux rafales décalées
     (jamais la même boucle deux fois de suite à l'oreille), le CLAQUEMENT de l'air sur les tôles (un battement de 16-19 Hz dans les
     médiums : c'est lui qui dit « on tombe vite ») et le sifflet des arêtes, étroit et discret. Le menu en règle le volume et la
     vitesse de lecture sur le plongeon (handle.gain / handle.rate). */
D('nuages.ambiance',{fam:'piste',bus:'amb',dur:8.8,st:1,key:1,db:-10,max:1,cd:1,dit:'LA MER DE NUAGES (boucle, en course au niveau 1) : l’air d’altitude qui respire, des rafales lointaines, les harmoniques du vent (dans la tonalité)',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.001,h:8.8,d:.001,v:.17,ft:'lp',f:5200,am:[.125,.5]},R);            // l'air, haut et clair, qui respire
    bruit(b,{c:'n',t0:0,a:.001,h:8.8,d:.001,v:.05,ft:'lp',f:230,am:[.25,.3]},R);                             // l'épaisseur, très bas (un téléphone ne la rend pas : elle ne porte rien)
    swish(b,R,.9,2.6,350,1400,.15,-.8,.35,.7);swish(b,R,4.9,2.8,300,1250,.13,.8,-.35,.7);                  // deux rafales lointaines
    [[24,1.2,3.2],[31,3.1,3.4],[28,5.4,3],[36,6.9,2.2]].forEach(function(p){osc(b,{f:nE(p[0]),t0:p[1],a:1.1,h:.4,d:p[2]*.6,v:.022,vib:[4.7,.003]});}); // la harpe éolienne
    O.boucle(b,.8);}}); // la boucle se referme sans couture (voir `boucle`)
D('chute.vent',{fam:'interface',bus:'amb',dur:6.6,st:1,db:-6,max:1,cd:.5,dit:'LA CHUTE LIBRE (boucle, menu) : le grondement, le souffle en rafales, l’air qui claque sur la carrosserie, le sifflet des arêtes',
  r:function(b,R,o){bruit(b,{c:'n',t0:0,a:.001,h:6.6,d:.001,v:.13,ft:'lp',f:160,am:[.23,.35]},R);            // le grondement
    bruit(b,{c:'r',t0:0,a:.001,h:6.6,d:.001,v:.26,ft:'bp',f:560,q:.6,am:[.37,.45],pan:-.45},R);              // le souffle, deux bandes…
    bruit(b,{c:'r',t0:0,a:.001,h:6.6,d:.001,v:.26,ft:'bp',f:820,q:.6,am:[.53,.45],pan:.45},R);               // …aux rafales décalées
    bruit(b,{c:'r',t0:0,a:.001,h:6.6,d:.001,v:.17,ft:'bp',f:1300,q:1.1,am:[16.7,.8],pan:-.2},R);             // le CLAQUEMENT sur les tôles
    bruit(b,{c:'r',t0:0,a:.001,h:6.6,d:.001,v:.12,ft:'bp',f:1900,q:1.2,am:[19.1,.7],pan:.25},R);
    bruit(b,{c:'b',t0:0,a:.001,h:6.6,d:.001,v:.035,ft:'bp',f:2600,q:7,am:[.31,.6],pan:.1},R);                // le sifflet des arêtes
    bruit(b,{c:'r',t0:0,a:.001,h:6.6,d:.001,v:.07,ft:'hp',f:2800,am:[.41,.4],pan:-.1},R);                     // la vitesse de l'air : un voile de souffle aigu
    O.boucle(b,.6);}});
D('chute',{fam:'piste',bus:'fx',dur:1.2,st:1,key:1,db:+1,max:1,cd:1,dit:'sortie de route / trou : le sifflet qui tombe + « oh-oh » (deux notes qui descendent)',
  r:function(b,R,o){osc(b,{f:1500,f1:280,g:1,gc:1.4,t0:0,a:.02,d:1,v:.12});bruit(b,{c:'r',t0:0,a:.1,d:.9,v:.2,ft:'bp',f:900,f1:250,g:1,q:1},R);
    osc(b,{f:nE(7),w:'sq',pw:.4,t0:.05,a:.005,h:.1,d:.12,v:.08,flt:['lp',1600,1600,1,.8]});osc(b,{f:nE(4),w:'sq',pw:.4,t0:.22,a:.005,h:.15,d:.2,v:.08,flt:['lp',1400,1400,1,.8]});}});
D('dosdane',{fam:'piste',bus:'fx',dur:.45,st:1,db:0,max:2,cd:.2,dit:'dos d’âne : « ba-DOUM » (roues avant puis arrière) + la suspension qui cliquette',
  r:function(b,R,o){coup(b,R,o,0,.55,700,130,60,.14);coup(b,R,o,.1,.7,700,110,50,.18);for(let k=0;k<5;k++)clic(b,{t0:.02+R()*.25,f:3000+R()*3000,d:.003,v:.08},R);}});
D('flaque.huile',{fam:'piste',bus:'fx',dur:.8,st:1,db:+1,max:1,cd:.3,dit:'flaque d’HUILE : le « splortch » gras + le pneu qui décroche',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.003,d:.25,v:.55,ft:'bp',f:500,f1:1200,g:.2,q:3,am:[28,.6]},R);osc(b,{f:200,f1:90,g:.15,t0:0,a:.003,d:.18,v:.3});
    bruit(b,{c:'b',t0:.1,a:.02,h:.15,d:.3,v:.25,ft:'bp',f:1400,q:8},R);}});
D('flaque.eau',{fam:'piste',bus:'fx',dur:.8,st:1,db:+1,max:1,cd:.3,dit:'flaque d’EAU : la gerbe qui éclabousse + bulles (plus d’huile qui crisse)',
  r:function(b,R,o){bruit(b,{c:'b',t0:0,a:.003,d:.45,v:.45,ft:'bp',f:2600,q:.6,pan:-.5,pan1:.5},R);bruit(b,{c:'r',t0:0,a:.002,d:.12,v:.5,ft:'lp',f:900},R);
    for(let k=0;k<8;k++)bulle(b,R,R()*.35,500+R()*500,1200+R()*900,.03,.12,R()*1.2-.6);}});
D('plot',{fam:'piste',bus:'fx',dur:.5,v:3,st:1,db:0,max:3,cd:.04,pre:1,rj:.05,dit:'PLOT percuté : « thwock » de plastique creux + il valse et rebondit',
  r:function(b,R,o){plastique(b,R,0,340+R()*60,.7);grave(b,o,0,130,70,.05,.1,.3);plastique(b,R,.09,300,.25);plastique(b,R,.17,280,.15);plastique(b,R,.23,270,.08);}});
D('porte',{fam:'piste',bus:'fx',dur:.6,st:1,db:+2,max:1,cd:.2,dit:'PORTE touchée (N4) : craquement + buzzer « ERR » (plus lourd qu’un plot)',
  r:function(b,R,o){plastique(b,R,0,260,.7);bruit(b,{c:'b',t0:0,a:.001,d:.05,v:.4,ft:'hp',f:900},R);for(const f of [110,116])osc(b,{f:f,w:'sq',pw:.5,t0:.06,a:.004,h:.15,d:.1,v:.1,flt:['lp',1300,1300,1,.8]});}});
D('frole',{fam:'piste',dur:.55,key:1,db:-2,max:3,cd:.06,pre:1,bases:[0,12],grp:'r',prio:1,dit:'FRÔLÉ / SLALOM : le souffle Doppler (l’objet PASSE) + le ting de la chaîne (st)',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.05,d:.28,v:.5,ft:'bp',f:1800,f1:400,g:.3,gc:.6,q:1.6},R);cloche(b,{f:nE(7+o.base),r:[1,2,3],m:[1,.3,.1],d:[.35,.12,.05],t0:.03,v:.3},R);}}); // (2026-10-15) le souffle 3,2 kHz → 1,8 kHz, le ting une octave plus bas
D('debris.tole',{fam:'piste',bus:'fx',dur:.3,v:2,db:-10,max:3,cd:.08,dit:'un bout de carrosserie se détache : cliquetis de tôle',
  r:function(b,R,o){for(let k=0;k<3;k++)tole(b,R,k*.05+R()*.03,1400+R()*1800,.12,.06);bruit(b,{c:'b',t0:0,a:.002,d:.08,v:.1,ft:'bp',f:4000,q:1},R);}});
D('debris.esquive',{fam:'piste',dur:.4,key:1,db:-3,max:2,cd:.1,bases:[0,12],dit:'débris esquivé (ESPACE) : le ting qui monte, DANS la gamme (st)',
  r:function(b,R,o){swish(b,R,0,.18,3000,800,.25,.5,-.5);cloche(b,{f:nE(19+o.base),r:[1,2,2.76],m:[1,.3,.1],d:[.35,.12,.04],t0:.02,v:.28},R);}});
D('decollage',{fam:'piste',bus:'fx',dur:.6,st:1,db:-3,max:1,cd:.3,dit:'décollage : l’air qui se creuse sous la caisse (volume selon la hauteur du saut)',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.03,d:.5,v:.5,ft:'bp',f:300,f1:1400,g:.4,q:.8},R);bruit(b,{c:'b',t0:0,a:.01,d:.15,v:.1,ft:'hp',f:4000},R);}});

/* ================================ LES FRUITS — le SPLOTCH (2026-09-30, Sacha : « quand tu ramasses un fruit, ça doit faire un
   bruit de fruit qu'on écrase ») ==================================================================================================
   Avant : une « bouche » par fruit (morsure, zeste, pépins, pop) — jolie, mais personne n'entendait un fruit ÉCRASÉ. Maintenant le
   CORPS de chaque son est un vrai splotch (`ecrase`), et chaque fruit garde SA signature par-dessus, plus discrète. Avec LA LIGNE
   PARFAITE un fruit tombe toutes les ~2,4 s : 4 PRISES par fruit (jamais deux fois la même d'affilée, `v`) + ±6 % de hauteur (`rj`)
   + ±1,5 dB (`vj`) — la même main qui écrase, jamais le même fruit. (`st` = le rang de la rafale : ça monte quand on enchaîne.) */
/* L'ÉCRASÉ. Ce qui fait « mouillé » à l'oreille, ce n'est pas un timbre, c'est un MOUVEMENT :
   1. la PEAU qui cède — un « tk » sourd (rose, passe-bas : c'est mou, pas un clic) et le POIDS qui s'affaisse (un grave qui tombe) ;
   2. le SPLOTCH — du bruit dans deux FORMANTS qui GLISSENT VERS LE BAS (la voyelle « splô » de la matière qui s'étale), HACHÉ en grains
      irréguliers de 2 à 8 ms (la pulpe ne coule pas d'un bloc, elle gicle par paquets : c'est CE hachage qui fait humide) ;
   3. la SUCCION — 2 à 4 petites bulles qui montent (l'air aspiré par la pulpe : le « squelch ») ;
   4. le JUS — des gouttes qui retombent, de plus en plus espacées, et un voile de bruine.
   o = {t: durée ×, f: hauteur × (petit fruit = aigu), jus: quantité de gouttes ×, mou: bulles graves en plus (banane), v, pan} */
function ecrase(b,R,t0,o){
  const sr=b.sr,T=o.t||1,F=o.f||1,J=o.jus==null?1:o.jus,v=o.v==null?.5:o.v,pan=o.pan||0;
  // 1. la peau cède, le poids s'affaisse
  bruit(b,{c:'r',t0:t0,a:.0006,d:.03,v:v*.6,ft:'lp',f:2400*F,q:.7,pan:pan},R);
  osc(b,{f:170*F,f1:70*F,g:.04*T,gc:.6,t0:t0,a:.001,d:.06*T,v:v*.2,pan:pan});   /* discret : plus fort, c'était un « boum » de grosse caisse, pas un fruit (mesuré : le grave écrasait le médium de 8 dB) */
  // 2. le splotch : deux formants qui descendent, hachés en grains
  const dur=.17*T,i0=Math.round(t0*sr),n=Math.min(b.n-i0,Math.ceil((dur*1.6)*sr));
  if(n>0){const q1=O.Bq(),q2=O.Bq(),P=[Math.cos((pan+1)*Math.PI/4),Math.sin((pan+1)*Math.PI/4)],kS=1-Math.exp(-1/(sr*.0012));let g=0,gv=0,gT=0;
    for(let i=0;i<n;i++){const t=i/sr;
      if((i&15)===0){const u=Math.min(1,t/dur);q1.c=O.bqC('bp',(1150-700*Math.pow(u,.55))*F,2.4,sr);q2.c=O.bqC('bp',(2700-1600*Math.pow(u,.65))*F,3.2,sr);}
      if(t>=gT){gT=t+(.002+R()*.006)*(1+2.2*t/dur);gv=R()<.28?.12:.45+R()*.55;}   // un paquet de pulpe de plus, de plus en plus espacés
      g+=(gv-g)*kS;                                                                // lissé à 1,2 ms : du mouillé, pas du grésillement
      const w=R()*2-1,sx=O.bqRun(q1,w)+O.bqRun(q2,w)*.6,x=sx*g*O.env(t,.004,.012*T,dur)*v*1.9,k=i0+i;
      if(b.R){b.L[k]+=x*P[0];b.R[k]+=x*P[1];}else b.L[k]+=x;}}
  // 3. la succion : de petites bulles qui montent
  const nb=2+Math.floor(R()*3);
  for(let k=0;k<nb;k++)bulle(b,R,t0+(.015+R()*.08)*T,(240+R()*160)*F,(620+R()*420)*F,.012+R()*.016,v*(.14+R()*.1),pan+(R()-.5)*.4);
  if(o.mou)for(let k=0;k<o.mou;k++)osc(b,{f:(420+R()*120)*F,f1:(150+R()*40)*F,g:.05,gc:.7,t0:t0+(.03+R()*.08)*T,a:.002,d:.06,v:v*.16,pan:pan});
  // 4. le jus : des gouttes qui retombent (de plus en plus rares) + un voile de bruine
  const ng=Math.round((5+R()*3)*J);
  for(let k=0;k<ng;k++){const f0=(1300+R()*1700)*F;bulle(b,R,t0+(.05+Math.pow(R(),1.7)*.34)*T,f0,f0*(1.35+R()*.5),.005+R()*.009,v*(.05+R()*.09),pan+(R()-.5)*.9);}
  bruit(b,{c:'b',t0:t0+.01,a:.004,d:.14*T,v:v*.07*J,ft:'hp',f:4800,q:.7,pan:pan-.3,pan1:pan+.3},R);
}
D('fruit.peche',{fam:'fruits',bus:'fx',dur:.55,v:4,rj:.06,vj:1.5,db:+1,max:2,cd:.05,pre:1,dit:'PÊCHE PLATE : le splotch rond et généreux, beaucoup de jus',
  r:function(b,R,o){ecrase(b,R,0,{t:1,f:1,jus:1.1,v:.55});}});
D('fruit.banane',{fam:'fruits',bus:'fx',dur:.6,v:4,rj:.06,vj:1.5,db:+1,max:2,cd:.05,dit:'BANANE : la peau qui claque puis la pulpe qui s’écrase MOLLE (bulles graves, peu de jus)',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.002,d:.05,v:.18,ft:'bp',f:2200,q:2},R);ecrase(b,R,.012,{t:1.3,f:.78,jus:.35,mou:3,v:.55});}});
D('fruit.grenade',{fam:'fruits',bus:'fx',dur:.55,v:4,rj:.06,vj:1.5,db:+1,max:2,cd:.05,dit:'GRENADE : le splotch + les pépins qui éclatent dedans (crépitement cristallin)',
  r:function(b,R,o){ecrase(b,R,0,{t:.9,f:1.1,jus:1.2,v:.5});
    for(let k=0;k<12;k++)bruit(b,{c:'b',t0:.01+Math.pow(R(),1.4)*.16,a:.0004,d:.005+R()*.008,v:.1+R()*.14,ft:'bp',f:3000+R()*3200,q:3},R);}});
D('fruit.orange',{fam:'fruits',bus:'fx',dur:.55,v:4,rj:.06,vj:1.5,db:+1,max:2,cd:.05,dit:'ORANGE : le splotch + le zeste qui GICLE (jet fin et acide)',
  r:function(b,R,o){ecrase(b,R,0,{t:1,f:1.06,jus:1.3,v:.55});bruit(b,{c:'b',t0:.005,a:.003,d:.16,v:.16,ft:'bp',f:5200,f1:3600,g:.12,q:1.6},R);}});
D('fruit.myrtille',{fam:'fruits',bus:'fx',dur:.3,v:4,rj:.06,vj:1.5,db:-1,max:3,cd:.04,dit:'MYRTILLE : un tout petit splotch aigu qui éclate (« plic »)',
  r:function(b,R,o){ecrase(b,R,0,{t:.5,f:1.75,jus:.45,v:.5});}});
D('fruit.pasteque',{fam:'fruits',dur:1.6,st:1,key:1,v:2,rj:.03,db:+5,max:1,cd:.3,grp:'r',prio:3,dit:'PASTÈQUE — le graal : l’écorce qui CRAQUE, un ÉNORME splotch et sa gerbe de jus, puis l’accord doré qui dit « jackpot »',
  r:function(b,R,o){for(let k=0;k<14;k++)bruit(b,{c:'b',t0:Math.pow(R(),1.8)*.07,a:.0004,d:.01+R()*.02,v:.2+R()*.3,ft:'bp',f:1200+R()*2200,q:1.5,pan:R()*.8-.4},R);
    ecrase(b,R,.02,{t:1.9,f:.7,jus:2.4,v:.7,pan:-.15});ecrase(b,R,.05,{t:1.5,f:.78,jus:1.2,v:.35,pan:.2});
    stab(b,R,[12,19,24,28],.26,.2,.9,.12,1.2);cloche(b,{f:nE(36),r:[1,2,2.76],m:[1,.3,.1],d:[1.1,.4,.15],t0:.28,v:.2},R);scintille(b,R,.28,1,12,.1);}});
D('fruit.rafale',{fam:'fruits',dur:.8,st:1,key:1,db:0,max:1,cd:.3,grp:'r',prio:2,dit:'RAFALE de fruits (3 et plus) : le mixeur qui s’emballe + trois notes',
  r:function(b,R,o){osc(b,{f:180,f1:420,g:.4,w:'saw',t0:0,a:.02,h:.1,d:.2,v:.05,flt:['lp',1200,1200,1,.8]});[12,16,19].forEach(function(st,i){marimba(b,R,nE(st),.1+i*.06,.4,.4);});}}); // (2026-10-15, Sacha : « graves et discrets ») les trois notes une octave plus bas (mi5-sol#5-si5)

/* ================================ LA MORT ===================================================== */
D('explosion',{fam:'mort',bus:'fx',dur:3.4,st:1,v:2,db:+13,max:1,cd:.5,dit:'l’EXPLOSION : claquement, boule de feu, grave qui tombe, tôles, gravats, grondement',
  r:function(b,R,o){bruit(b,{c:'b',t0:0,a:.0005,d:.09,v:.9,ft:'hp',f:900},R);                         // le claquement
    bruit(b,{c:'r',t0:0,a:.002,d:1.5,v:.95,ft:'lp',f:2200,f1:220,g:1,gc:.6,q:.6,pan:-.2,pan1:.2},R);    // la boule de feu
    grave(b,o,0,115,26,1,1.3,1);grave(b,o,0,230,85,.25,.35,.4);                                       // le coup de poitrine
    for(let k=0;k<4;k++)tole(b,R,.03+R()*.5,250+R()*650,.18,.5+R()*.4);                               // la tôle
    crepite(b,R,.12,2,48,.4,400,2400);                                                               // les gravats
    bruit(b,{c:'n',t0:.15,a:.25,h:.4,d:2.4,v:.55,ft:'lp',f:240,q:.7},R);                               // le grondement qui reste
    O.sature(b,1.4);}});
D('explosion.loin',{fam:'mort',bus:'fx',dur:2,st:1,db:+3,max:2,cd:.2,dit:'une explosion au loin (un bot de la meute) : étouffée, sans claquement',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.01,d:1.1,v:.8,ft:'lp',f:700,f1:180,g:.8,q:.6},R);grave(b,o,0,90,30,.7,1,.8);crepite(b,R,.1,1.2,14,.25,300,900);}});
D('mort.vide',{fam:'mort',bus:'fx',dur:.9,st:1,key:1,db:+4,max:1,cd:1,dit:'mort dans le VIDE : le sifflet de la chute qui se perd (« piouuu »)',
  r:function(b,R,o){osc(b,{f:1900,f1:160,g:.85,gc:1.6,t0:0,a:.01,d:.8,v:.2,vib:[7,.02]});bruit(b,{c:'r',t0:0,a:.05,d:.7,v:.15,ft:'bp',f:1500,f1:200,g:.7,q:1.2},R);}});
D('mort.arret',{fam:'mort',bus:'fx',dur:1,st:1,db:+4,max:1,cd:1,dit:'mort à l’ARRÊT (roule ou crève) : le moteur tousse trois fois et cale',
  r:function(b,R,o){for(let k=0;k<3;k++){bruit(b,{c:'n',t0:k*.2,a:.004,d:.1,v:.5-k*.1,ft:'lp',f:700,q:.8},R);osc(b,{f:70-k*8,t0:k*.2,a:.004,d:.12,v:.35,w:'saw',flt:['lp',400,400,1,.7]});}
    tole(b,R,.62,160,.25,.4);}});
D('mort.air',{fam:'mort',bus:'fx',dur:.8,st:1,db:+4,max:1,cd:1,dit:'mort par le CHRONO (trop longtemps en l’air) : le buzzer de fin de temps',
  r:function(b,R,o){for(const f of [103.8,110])osc(b,{f:f,w:'sq',pw:.5,t0:0,a:.005,h:.45,d:.15,v:.14,flt:['lp',1800,1800,1,.8]});}});
D('mort.police',{fam:'mort',bus:'fx',dur:1,st:1,db:+4,max:1,cd:1,dit:'mort par la POLICE : la sirène qui « whoop » + le coup de portière',
  r:function(b,R,o){osc(b,{f:500,f1:1300,g:.35,gc:.8,w:'saw',t0:0,a:.01,h:.1,d:.3,v:.08,flt:['lp',2500,2500,1,.7]});osc(b,{f:1300,f1:600,g:.3,w:'saw',t0:.4,a:.01,d:.25,v:.07,flt:['lp',2500,2500,1,.7]});coup(b,R,o,.08,.7,900,110,50,.25);}});
D('mort.feu',{fam:'mort',bus:'fx',dur:1.2,st:1,db:+4,max:1,cd:1,dit:'mort par le FEU : la flamme qui rugit et avale',
  r:function(b,R,o){bruit(b,{c:'n',t0:0,a:.15,h:.2,d:.7,v:.7,ft:'lp',f:300,f1:2500,g:.4,q:.7},R);crepite(b,R,0,1,24,.35,500,2500);}});
D('mort.foudre',{fam:'mort',bus:'fx',dur:.9,st:1,db:+4,max:1,cd:1,dit:'foudroyé : l’arc électrique qui grille',
  r:function(b,R,o){for(let k=0;k<10;k++)osc(b,{f:900+R()*2500,f1:200,g:.05,t0:k*.04+R()*.02,a:.0005,d:.05,v:.12,fm:{r:3.7,i:4,d:.04}});bruit(b,{c:'b',t0:0,a:.002,d:.5,v:.3,ft:'bp',f:5000,q:1,am:[60,.8]},R);}});

/* ================================ LES RIVAUX, LA MEUTE, LA CAMPAGNE ============================ */
D('victoire',{fam:'campagne',dur:1.8,st:1,key:1,db:+4,max:1,cd:1,grp:'r',prio:5,dit:'VICTOIRE sur un rival (caisse-nuage prise, poursuite semée, fourgon vidé, ligne parfaite) : stab qui monte + or',
  r:function(b,R,o){stab(b,R,[12,16,19],0,.05,.25,.14,1.1);stab(b,R,[16,19,24],.14,.05,.25,.14,1.2);stab(b,R,[19,24,28,31],.28,.3,1,.16,1.4);grave(b,o,.28,90,40,.2,.5,.5);scintille(b,R,.3,1.2,12,.1);}});
D('defaite',{fam:'campagne',dur:1.6,st:1,key:1,db:+3,max:1,cd:1,grp:'r',prio:5,dit:'DÉFAITE (le rival t’a semé, le banquier gagne) : le cuivre qui s’affaisse — jamais le son d’une victoire',
  r:function(b,R,o){for(const st of [12,16,19])for(const dt of [-.006,.006])osc(b,{f:nE(st)*(1+dt),f1:nE(st-3)*(1+dt),g:.8,gc:1.5,w:'saw',t0:0,a:.01,h:.3,d:.8,v:.045,pan:dt*80,flt:['lp',2500,500,1,.8]});
    grave(b,o,.3,70,45,.4,.6,.4);}});
D('monde.fin',{fam:'campagne',dur:3.8,st:1,key:1,db:+8,max:1,cd:3,grp:'r',prio:9,dit:'FIN DE MONDE (dix niveaux bouclés) : la grande fanfare — timbales, cuivres, chœur, cymbales, pluie d’or',
  r:function(b,R,o){const T=[0,.18,.36,.54];[[12,16,19],[14,19,23],[16,21,24],[19,24,28,31]].forEach(function(ac,i){stab(b,R,ac,T[i],i===3?.8:.08,i===3?1.8:.3,.15,1.2+i*.1);});
    for(let k=0;k<4;k++)grave(b,o,T[k],110-k*8,50,.15,.4,.5);choeur(b,R,[12,19,24,28],.54,.2,.8,2,.1);
    bruit(b,{c:'b',t0:.54,a:.002,d:2.6,v:.2,ft:'hp',f:4500,pan:-.5,pan1:.5},R);pieces(b,R,.6,2.6,40,.16);scintille(b,R,.6,2.6,24,.1);}});
D('rival.devant',{fam:'campagne',dur:.6,st:1,key:1,db:-3,max:1,cd:1,dit:'tu MÈNES (le banquier est derrière) : deux notes qui montent',
  r:function(b,R,o){pluck(b,R,nE(19),0,.4,.35,1);pluck(b,R,nE(24),.08,.45,.45,1);}});
D('rival.passe',{fam:'campagne',dur:.9,st:1,key:1,db:-1,max:1,cd:1,dit:'le rival REPASSE devant : il te dépasse en trombe (Doppler) + deux notes qui descendent',
  r:function(b,R,o){osc(b,{f:320,f1:190,g:.7,w:'saw',t0:0,a:.2,d:.5,v:.07,flt:['lp',1500,600,.7,.8],pan:-.8});swish(b,R,0,.6,2400,500,.3,-.8,.8,1.2);pluck(b,R,nE(24),.3,.35,.35,.8);pluck(b,R,nE(19),.4,.35,.4,.7);}});
D('fantome.accroche',{fam:'campagne',dur:.7,st:1,key:1,db:0,max:1,cd:.5,dit:'ACCROCHE ! (la caisse-nuage à portée) : le grappin qui mord + note tenue',
  r:function(b,R,o){clic(b,{t0:0,f:2500,d:.012,v:.5},R);tole(b,R,0,1800,.15,.2);osc(b,{f:nE(19),w:'tri',t0:.03,a:.02,h:.2,d:.3,v:.2,vib:[6,.01]});}});
D('alerte.dernier',{fam:'campagne',bus:'fx',dur:.2,st:1,db:-1,max:2,cd:.08,dit:'TU ES DERNIER (explosion dans…) : le bip d’alarme — le jeu l’accélère avec le compte à rebours',
  r:function(b,R,o){for(const f of [988,1046])osc(b,{f:f,w:'saw',t0:0,a:.002,h:.05,d:.07,v:.1,flt:['lp',3500,3500,1,.8]});}});
D('rival.boum',{fam:'campagne',bus:'fx',dur:.9,st:1,key:1,db:0,max:2,cd:.3,dit:'un bot de la meute saute LOIN (hors de portée d’oreille) : un « boum » assourdi dans la gamme',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.01,d:.5,v:.4,ft:'lp',f:600,f1:200,g:.4},R);osc(b,{f:nE(-12),t0:0,a:.005,d:.6,v:.2});}});
D('radar',{fam:'campagne',bus:'fx',dur:.6,st:1,key:1,db:0,max:1,cd:.3,dit:'RADAR (N11) : le déclic d’obturateur « k-chak » + le flash qui charge + deux bips dans la gamme',
  r:function(b,R,o){clic(b,{t0:0,f:3000,d:.008,v:.6},R);bruit(b,{c:'b',t0:0,a:.001,d:.03,v:.3,ft:'bp',f:2200,q:1.5},R);clic(b,{t0:.045,f:2400,d:.01,v:.45},R);
    osc(b,{f:2800,f1:6000,g:.12,t0:.05,a:.005,d:.1,v:.04});for(const [st,t] of [[31,.16],[36,.26]])osc(b,{f:nE(st),w:'sq',pw:.5,t0:t,a:.002,h:.05,d:.05,v:.07,flt:['lp',5000,5000,1,.7]});}});
D('foudre.eclair',{fam:'campagne',bus:'fx',dur:1,st:1,v:2,db:+6,max:1,cd:.3,dit:'l’ÉCLAIR frappe (N15) : le craquement IMMÉDIAT (le tonnerre vient après, selon la distance)',
  r:function(b,R,o){bruit(b,{c:'b',t0:0,a:.0003,d:.12,v:1,ft:'hp',f:1800},R);bruit(b,{c:'r',t0:.005,a:.001,d:.45,v:.6,ft:'lp',f:6000,f1:900,g:.4},R);bruit(b,{c:'b',t0:.01,a:.002,d:.6,v:.2,ft:'bp',f:6000,q:1,am:[70,.8]},R);O.sature(b,1.6);}});
D('tonnerre',{fam:'campagne',bus:'amb',dur:3,st:1,v:2,db:+4,max:1,cd:.5,dit:'le TONNERRE qui roule (joué en retard selon la distance)',
  r:function(b,R,o){bruit(b,{c:'n',t0:0,a:.04,h:.3,d:2.5,v:.8,ft:'lp',f:420,q:.7,am:[2.3,.5]},R);grave(b,o,0,55,40,1,1.5,.5);crepite(b,R,0,.6,8,.25,200,700);}});
D('abri',{fam:'campagne',dur:.6,st:1,key:1,db:-3,max:1,cd:.5,dit:'À L’ABRI : le souffle de soulagement + note douce',
  r:function(b,R,o){swish(b,R,0,.35,2500,700,.2);cloche(b,{f:nE(24),r:[1,2,2.76],m:[1,.25,.08],d:[.5,.2,.06],t0:.08,v:.22},R);}});
D('panne.gresille',{fam:'campagne',bus:'fx',dur:.7,st:1,v:2,db:-4,max:1,cd:.3,dit:'le néon VACILLE avant la panne (N16) : grésillement électrique haché',
  r:function(b,R,o){const t=Toile(b.sr,b.dur,false);osc(t,{f:100,w:'saw',t0:0,a:.005,h:.55,d:.1,v:.2,flt:['lp',3000,3000,1,.7]});osc(t,{f:200,w:'sq',pw:.3,t0:0,a:.005,h:.55,d:.1,v:.08});
    bruit(t,{c:'b',t0:0,a:.005,h:.55,d:.1,v:.08,ft:'bp',f:5000,q:1},R);let on=1,cpt=0;for(let i=0;i<b.n;i++){if(--cpt<=0){on=R()<.6?1:0;cpt=Math.floor(b.sr*(.01+R()*.05));}b.L[i]+=t.L[i]*on;}}});
D('trafic.accroche',{fam:'campagne',bus:'fx',dur:.8,st:1,db:+3,max:1,cd:.3,dit:'accrochage avec le TRAFIC (N19) : tôle froissée + verre',
  r:function(b,R,o){coup(b,R,o,0,.8,1600,100,45,.3);tole(b,R,0,300,.3,.45);for(let k=0;k<8;k++)cloche(b,{f:3000+R()*4000,r:[1,1.5],m:[1,.4],d:[.08,.04],t0:.02+R()*.2,v:.08,pan:R()*1.2-.6},R);}});
D('fourgon.porte',{fam:'campagne',bus:'fx',dur:.7,st:1,db:0,max:1,cd:.3,dit:'les portes du FOURGON (N17) : loquet + grosse tôle qui s’ouvre',
  r:function(b,R,o){clic(b,{t0:0,f:1800,d:.015,v:.5},R);tole(b,R,.02,140,.35,.6);bruit(b,{c:'r',t0:.02,a:.02,d:.3,v:.2,ft:'bp',f:600,q:2},R);}});
D('orbite.entre',{fam:'campagne',dur:2.4,st:1,key:1,db:+5,max:1,cd:2,grp:'r',prio:5,dit:'entrée en ORBITE : l’hyperespace (aspiration, tunnel, accord qui s’élève) puis le silence du vide',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.8,h:.2,d:.8,v:.5,ft:'bp',f:200,f1:5000,g:1.2,gc:1.4,q:1.2,pan:-.5,pan1:.5},R);grave(b,o,1,60,30,.8,1.2,.7);
    nappe(b,R,[-12,0,7,12],.8,.3,.4,1.2,.08,2200);cloche(b,{f:nE(36),r:[1,2,2.76],m:[1,.3,.1],d:[1.3,.5,.2],t0:1.05,v:.2},R);}});
D('orbite.sort',{fam:'campagne',bus:'fx',dur:2.6,st:1,db:+4,max:1,cd:2,dit:'la RENTRÉE en feu : le plasma qui gronde et crépite',
  r:function(b,R,o){bruit(b,{c:'n',t0:0,a:.3,h:1.2,d:.9,v:.6,ft:'lp',f:400,f1:1800,g:1.5,q:.8,am:[11,.3]},R);crepite(b,R,.2,2.2,50,.3,500,3000);grave(b,o,0,60,40,1.5,2,.4);}});
D('espace.ambiance',{fam:'campagne',bus:'amb',dur:6,st:1,db:-8,max:1,cd:1,dit:'le VIDE (orbite, espace) : un bourdon grave qui respire (boucle) — le vent, lui, se tait',
  r:function(b,R,o){for(const [st,v] of [[-24,.25],[-17,.12],[-12,.1]])osc(b,{f:nE(st),t0:0,a:.001,h:6,d:.001,v:v,vib:[.13,.004]});
    bruit(b,{c:'n',t0:0,a:.001,h:6,d:.001,v:.08,ft:'lp',f:200,am:[.17,.5]},R);
    O.boucle(b,.5);}}); // la boucle se referme sans couture (voir `boucle`)

/* ================================ L'INTERFACE, SUITE ========================================== */
D('ui.appui',{fam:'interface',bus:'ui',dur:.05,db:-12,max:2,cd:.03,pre:1,rj:.02,dit:'le doigt ENFONCE la touche (au contact, avant l’action) : micro-tick',
  r:function(b,R,o){clic(b,{t0:0,f:4500,d:.004,v:.4},R);osc(b,{f:900,f1:700,g:.01,t0:0,a:.0006,d:.02,v:.2});}});
D('ui.voletSort',{fam:'interface',bus:'ui',dur:.5,st:1,db:-10,max:1,cd:.12,rj:.03,dit:'le volet se LÈVE : le souffle repart de l’autre côté',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.05,d:.3,v:.5,ft:'bp',f:2600,f1:600,g:.3,q:1.1,pan:.7,pan1:-.7},R);}});
D('ui.modale',{fam:'interface',bus:'ui',dur:.5,key:1,db:-7,max:1,cd:.1,dit:'une fenêtre s’ouvre : souffle bref + tock posé',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.1,d:.3,v:.35,ft:'bp',f:700,f1:2000,g:.34,gc:.6,q:1.2},R);osc(b,{f:nE(19),t0:.36,a:.001,d:.08,v:.3});clic(b,{t0:.36,f:3000,d:.004,v:.1},R);}});
D('ui.ok',{fam:'interface',bus:'ui',dur:.35,key:1,db:-4,max:1,cd:.15,dit:'toast de SUCCÈS (coche verte) : deux notes claires qui montent',
  r:function(b,R,o){osc(b,{f:nE(24),t0:0,a:.001,d:.12,v:.35});osc(b,{f:nE(31),t0:.07,a:.001,d:.22,v:.35});clic(b,{t0:0,f:5000,d:.003,v:.15},R);}});
D('ui.erreur',{fam:'interface',bus:'ui',dur:.3,db:-5,max:1,cd:.2,dit:'toast d’ERREUR (croix rouge) : le « non-non » sourd',
  r:function(b,R,o){osc(b,{f:233,w:'sq',pw:.35,t0:0,a:.003,h:.03,d:.07,v:.25,flt:['lp',1100,500,.08,.8]});osc(b,{f:220,w:'sq',pw:.35,t0:.1,a:.003,h:.03,d:.09,v:.22,flt:['lp',1000,420,.09,.8]});}});
D('ui.danger',{fam:'interface',bus:'ui',dur:.3,db:-3,max:1,cd:.2,dit:'bouton DESTRUCTIF (EFFACER, QUITTER) : tock grave et sérieux',
  r:function(b,R,o){clic(b,{t0:0,f:1500,d:.008,v:.4},R);osc(b,{f:196,f1:150,g:.03,t0:0,a:.001,d:.12,v:.5});osc(b,{f:98,t0:0,a:.002,d:.1,v:.3});}});
D('ui.lettre',{fam:'interface',bus:'ui',dur:.06,key:1,db:-15,max:3,cd:.03,dit:'une lettre de bannière qui tombe : micro-frappe (une sur deux)',
  r:function(b,R,o){clic(b,{t0:0,f:3500,d:.004,v:.4},R);osc(b,{f:nE(24),t0:0,a:.0006,d:.025,v:.2});}});
D('ui.jauge',{fam:'interface',bus:'ui',dur:1.15,st:1,key:1,db:-10,max:1,cd:.3,dit:'une jauge se remplit (missions, aura, objectif, 1,1 s) : des tics qui montent la gamme et accélèrent',
  r:function(b,R,o){let t=0,k=0;while(t<1.05&&k<40){osc(b,{f:nE(12+pd(k)),t0:t,a:.0008,d:.04,v:.3});clic(b,{t0:t,f:5000,d:.002,v:.1},R);t+=Math.max(.035,.12*Math.pow(.86,k));k++;}}});
D('ui.carnet',{fam:'interface',dur:3.2,st:1,key:1,db:+6,max:1,cd:3,grp:'r',prio:8,dit:'CARNET BOUCLÉ (les trois défis — la récompense la plus rare) : tampon + fanfare + chœur + pluie d’or',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.001,d:.08,v:.7,ft:'lp',f:1400},R);grave(b,o,0,120,60,.08,.2,.6);
    stab(b,R,[12,16,19],.2,.05,.25,.14,1.1);stab(b,R,[16,19,24],.34,.05,.25,.14,1.2);stab(b,R,[19,24,28,31],.48,.5,1.6,.16,1.4);
    choeur(b,R,[12,19,24],.48,.15,.6,1.8,.1);grave(b,o,.48,90,40,.3,.6,.6);pieces(b,R,.5,2.4,36,.16);scintille(b,R,.5,2.4,20,.1);}});
D('garage.bascule',{fam:'interface',bus:'ui',dur:1.1,st:1,key:1,db:-5,max:1,cd:.2,dit:'le RETOURNEUR du garage (1,06 s) : la caisse avalée (0-340 ms), le scanner qui monte, le « clac » de la nouvelle en place',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.05,d:.3,v:.4,ft:'bp',f:2400,f1:400,g:.33,q:1.2,pan:.5,pan1:-.2},R);grave(b,o,.3,110,70,.05,.12,.3);
    osc(b,{f:nE(12),f1:nE(31),g:.25,gc:.7,w:'tri',t0:.34,a:.01,d:.3,v:.12});swish(b,R,.34,.25,1500,6000,.15,-.4,.4);
    clic(b,{t0:.6,f:2500,d:.008,v:.4},R);osc(b,{f:180,f1:120,g:.04,t0:.6,a:.001,d:.08,v:.35});cloche(b,{f:nE(24),r:[1,2,2.76],m:[1,.25,.1],d:[.3,.12,.05],t0:.62,v:.18},R);}});
/* (2026-09-30, Léo : « le bruit que fait la voiture quand on la tapote est un peu bizarre, change-le, améliore ») l'ancien « tonk »
   (5 modes de tôle en rapports de CLOCHE, 0,35 s de tenue) sonnait comme un gong. Une vraie caisse qu'on tape, c'est une TÔLE ÉPAISSE
   ÉTOUFFÉE (la garniture, le joint) : un toc sourd et court, le POIDS de la caisse, sa SUSPENSION qui s'enfonce et remonte (la caisse
   recule à l'écran), et un petit cliquetis de garniture. Quatre prises (±8 %) : on tape souvent. */
/* (2026-10-20 soir, Léo : « le bruit quand on touche la voiture est un peu nul — pour toutes les voitures ») le toc ÉTOUFFÉ ne disait rien
   sous le doigt. Désormais un vrai COUP DE JOINTURE sur une portière : l'attaque claque (deux clics, aigu + médium), le PANNEAU sonne
   (quatre modes de tôle, 90 ms), le creux de la caisse répond (bruit grave bref), le POIDS, et un petit « ting » métallique qui traîne
   150 ms — la tôle qui vibre. Plus présent (−2 dB au lieu de −5). Quatre prises (±8 %). */
D('garage.tole',{fam:'interface',bus:'ui',dur:.5,db:-2,max:2,cd:.08,v:4,dit:'taper sur la caisse (toutes) : le coup de jointure sur une portière — attaque qui claque, panneau qui sonne, creux de la caisse, poids, ting de tôle',
  r:function(b,R,o){const k=.92+R()*.16;
    clic(b,{t0:0,f:3200,d:.007,v:.5},R);clic(b,{t0:.002,f:1200,d:.012,v:.35},R);               // l'attaque : la jointure, sèche
    cloche(b,{f:300*k,r:[1,1.9,2.9,4.3],m:[1,.6,.4,.25],d:[.09,.06,.045,.03],t0:0,v:.6,jit:.04},R); // le panneau qui sonne
    bruit(b,{c:'r',t0:0,a:.001,d:.07,v:.35,ft:'lp',f:600*k,q:.9},R);                          // le creux de la caisse
    grave(b,o,0,120*k,70*k,.05,.12,.35);                                                      // le poids
    osc(b,{f:1450*k,w:'sin',t0:.004,a:.002,d:.14,v:.08});osc(b,{f:2200*k,w:'sin',t0:.004,a:.002,d:.09,v:.05}); // le ting de la tôle
    for(let i=0;i<2;i++)plastique(b,R,.03+i*.02+R()*.01,(1400+R()*500)*k,.035-i*.012);        // la garniture, à peine
  }});
/* (2026-10-20 soir, Léo : « clac mécanique quand ça sort ») LES CROCS DE LA SQUALE : l'action spéciale (voir CAR_ACTION). Un VÉRIN :
   le « zzt » du servo (45 ms), le CLAC d'acier des crocs en butée (clic + quatre modes de métal court + thud), le petit rebond 45 ms
   après, puis le retour lent : un souffle hydraulique qui crépite doucement 1,6 s. Un seul à la fois. */
D('squale.crocs',{fam:'interface',bus:'ui',dur:2.1,db:-3,max:1,cd:.1,dit:'LA SQUALE tapée : le servo, le CLAC d’acier des crocs en butée, le rebond, puis le vérin qui les rentre lentement',
  r:function(b,R,o){
    bruit(b,{c:'b',t0:0,a:.002,d:.045,v:.25,ft:'bp',f:1800,q:3,am:[90,.8]},R);                 // le servo
    clic(b,{t0:.045,f:3000,d:.006,v:.55},R);clic(b,{t0:.047,f:900,d:.01,v:.3},R);             // le CLAC
    cloche(b,{f:640,r:[1,1.5,2.7,4.1],m:[1,.5,.35,.2],d:[.06,.045,.03,.02],t0:.045,v:.55,jit:.03},R); // l'acier
    grave(b,o,.045,150,90,.04,.08,.4);                                                        // le thud de butée
    clic(b,{t0:.09,f:3000,d:.005,v:.25},R);cloche(b,{f:640,r:[1,1.5,2.7],m:[1,.5,.3],d:[.035,.025,.02],t0:.09,v:.25,jit:.03},R); // le rebond
    bruit(b,{c:'r',t0:.4,a:.3,h:.9,d:.45,v:.05,ft:'lp',f:900,q:.8,am:[14,.6]},R);              // le vérin qui rentre : souffle qui crépite
  }});
D('garage.lacher',{fam:'interface',dur:1.9,st:1,db:+3,max:1,cd:1,dit:'LE LÂCHER du garage (1,7 s) : le moteur qui s’ébroue, le turbo qui siffle, la caisse qui part + le WHOOSH du voile blanc (1,36 s)',
  r:function(b,R,o){for(const dt of [0,.01])osc(b,{f:48,f1:150,g:1.4,gc:1.6,w:'saw',t0:.05,a:.15,h:1.1,d:.3,v:.09,flt:['lp',300,2200,1.4,.9],pan:dt*50});
    osc(b,{f:700,f1:3200,g:1.3,gc:1.2,w:'saw',t0:.2,a:.4,h:.8,d:.2,v:.02,flt:['bp',1400,6400,1.3,6]});crepite(b,R,.05,.4,6,.25,300,900);
    swish(b,R,1.1,.5,300,5000,.5,-.6,.6,.9);grave(b,o,1.36,90,40,.2,.4,.6);}});
D('depart.logo',{fam:'interface',dur:1.6,st:1,key:1,db:+3,max:1,cd:1,dit:'le logo CASH CAR du départ claque : sub + accord d’or + poussière',
  r:function(b,R,o){grave(b,o,0,80,40,.3,.6,.8);clic(b,{t0:0,f:1800,d:.02,v:.5},R);stab(b,R,[12,19,24,28],0,.2,.9,.15,1.3);scintille(b,R,.05,1,12,.1);}});
D('mort.enseigne',{fam:'interface',bus:'ui',dur:.95,st:1,db:-6,max:1,cd:1,dit:'l’enseigne GAME OVER s’allume : le néon qui grésille et clignote (0,9 s)',
  r:function(b,R,o){const on=[[0,.06],[.12,.16],[.22,.25],[.3,.5]];for(const [a,z] of on){osc(b,{f:100,w:'saw',t0:a,a:.003,h:z-a-.01,d:z>.4?.4:.02,v:.12,flt:['lp',2500,2500,1,.7]});bruit(b,{c:'b',t0:a,a:.002,h:z-a-.01,d:z>.4?.3:.02,v:.05,ft:'bp',f:4500,q:1},R);clic(b,{t0:a,f:3000,d:.004,v:.3},R);}}});
D('mort.compteFin',{fam:'interface',dur:1.2,st:1,key:1,db:0,max:1,cd:.5,dit:'le montant de l’écran de mort se POSE (750 ms) : clac + accord',
  r:function(b,R,o){clic(b,{t0:0,f:2200,d:.012,v:.5},R);grave(b,o,0,120,60,.06,.15,.4);for(const [st,v] of [[12,.4],[19,.3],[24,.3]])cloche(b,{f:nE(st),r:[1,2,2.76],m:[1,.3,.1],d:[.9,.35,.1],t0:.005,v:v},R);}});
D('tuto.info',{fam:'interface',bus:'ui',dur:.4,key:1,db:-6,max:1,cd:.3,dit:'une carte de consigne de l’auto-école apparaît : « ding » d’information',
  r:function(b,R,o){cloche(b,{f:nE(24),r:[1,2,2.76],m:[1,.3,.1],d:[.35,.12,.05],t0:0,v:.3},R);cloche(b,{f:nE(28),r:[1,2],m:[1,.2],d:[.3,.1],t0:.06,v:.2},R);}});
D('tuto.bravo',{fam:'interface',dur:.6,key:1,db:-2,max:1,cd:.3,dit:'étape de l’auto-école réussie : quinte claire (DANS la gamme)',
  r:function(b,R,o){cloche(b,{f:nE(24),r:[1,2,2.76],m:[1,.3,.1],d:[.45,.15,.05],t0:0,v:.35},R);cloche(b,{f:nE(31),r:[1,2,2.76],m:[1,.3,.1],d:[.6,.2,.06],t0:.08,v:.35},R);scintille(b,R,.1,.3,4,.07);}});
D('tuto.rate',{fam:'interface',bus:'ui',dur:.4,key:1,db:-4,max:1,cd:.3,dit:'raté pendant l’auto-école : deux notes douces qui descendent',
  r:function(b,R,o){osc(b,{f:nE(19),w:'tri',t0:0,a:.003,d:.15,v:.3});osc(b,{f:nE(12),w:'tri',t0:.1,a:.003,d:.2,v:.3});}});
D('ui.pause',{fam:'interface',bus:'ui',dur:.2,st:1,db:-6,max:1,cd:.2,dit:'PAUSE : le souffle qui retombe (le jeu s’endort)',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.01,d:.15,v:.4,ft:'bp',f:2000,f1:400,g:.15,q:1},R);osc(b,{f:nE(12),f1:nE(7),g:.1,t0:0,a:.002,d:.12,v:.2});}});
D('caisse.debloquee',{fam:'interface',dur:2.2,st:1,key:1,db:+5,max:1,cd:2,grp:'r',prio:6,dit:'une CAISSE se débloque : la clé qui tourne, le moteur qui s’ébroue, l’arpège d’or',
  r:function(b,R,o){clic(b,{t0:0,f:2200,d:.01,v:.5},R);clic(b,{t0:.07,f:1700,d:.012,v:.4},R);
    osc(b,{f:55,f1:130,g:.5,gc:1.4,w:'saw',t0:.1,a:.05,h:.25,d:.3,v:.09,flt:['lp',300,1600,.5,.9]});crepite(b,R,.1,.3,5,.25,300,900);
    [12,16,19,24,28,31].forEach(function(st,i){cloche(b,{f:nE(st),r:[1,2,2.76,5.4],m:[1,.3,.14,.04],d:[1,.4,.2,.06],t0:.45+i*.06,v:.28+i*.02},R);});
    stab(b,R,[12,19,24,28],.8,.3,1,.14,1.3);scintille(b,R,.8,1.3,14,.1);}});
G.CCSON_T={grave:grave,pluck:pluck,stab:stab,nappe:nappe,choeur:choeur,swish:swish,scintille:scintille,pieces:pieces,crepite:crepite,tole:tole,plastique:plastique,bois:bois,bulle:bulle,coup:coup,marimba:marimba,piano:piano,chaChing:chaChing};
})(typeof window!=='undefined'?window:globalThis);
/* <<<FIN PALETTE>>> */

/* <<<POUVOIRS2>>> */
(function(G){
'use strict';
/* LES POUVOIRS v2 (session GAMEPLAY, main 3156160) : n NITRO MAX · a AIR MAX · v VITESSE ×2 · m AIMANT · b BOUCLIER · x AURA ×2,
   + DOUBLE / TRIPLE POUVOIR, le bouclier qui SAUVE une chute, MIRACULÉ, SANS FAUTE ×n, les paliers de vitesse. */
const D=G.CCSON_D,O=G.CCSON_OUTILS,osc=O.osc,bruit=O.bruit,cloche=O.cloche,clic=O.clic,T=G.CCSON_T;
const nE=function(st){return 329.6276*Math.pow(2,st/12);};
D('pwr.autre',{fam:'machine',dur:1,st:1,key:1,db:+2,max:1,cd:.4,grp:'r',prio:3,dit:'pouvoir (générique, pour un pouvoir sans signature) : éclat + deux notes',
  r:function(b,R,o){T.swish(b,R,0,.4,400,4000,.3);T.stab(b,R,[12,19],.06,.1,.5,.12,1.2);T.scintille(b,R,.1,.5,6,.08);}});
D('pwr.m',{fam:'machine',dur:1.4,st:1,key:1,db:+2,max:1,cd:.4,grp:'r',prio:3,dit:'POMME DORÉE (aimant) : un CARILLON D\u2019OR — une cascade de cloches qui monte, chaude, à l\u2019accord majeur',
  r:function(b,R,o){for(let k=0;k<7;k++)cloche(b,{f:nE(12+[0,2,4,7,9,12,14][k]),r:[1,2.76,5.4],m:[1,.35,.12],d:[.9,.35,.12],t0:.02+k*.06,v:.17,pan:(k%3-1)*.55},R);
    cloche(b,{f:nE(24),r:[1,2.76],m:[1,.3],d:[.7,.25],t0:.45,v:.14,pan:0},R);T.nappe(b,R,[12,16,19],.08,.15,.3,.7,.05,2800);}});
D('pwr.b',{fam:'machine',dur:1.5,st:1,key:1,db:+2,max:1,cd:.4,grp:'r',prio:3,dit:'pouvoir BOUCLIER : le champ de force d’acier qui se referme (vwoom) + la cloche d’acier',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.08,d:.6,v:.45,ft:'bp',f:300,f1:2400,g:.35,q:5},R);T.tole(b,R,.12,nE(7),.35,1.2);
    osc(b,{f:nE(-12),t0:.1,a:.05,h:.4,d:.6,v:.2,vib:[4,.01]});cloche(b,{f:nE(31),r:[1,2.39,3.86],m:[1,.4,.2],d:[1,.5,.25],t0:.14,v:.2},R);}});
D('pwr.x',{fam:'machine',dur:1.8,st:1,key:1,db:+2,max:1,cd:.4,grp:'r',prio:3,dit:'FRUIT DU DRAGON (aura ×2/×3) : le balayage inversé qui aspire + le BOL CHANTANT hypnotique (deux bols, un souffle d\u2019aigus qui tourne)',
  r:function(b,R,o){T.swish(b,R,0,.55,250,3600,.3,-.5,.5,.6);
    cloche(b,{f:nE(7),r:[1,2.01,2.99,4.2,5.9],m:[1,.55,.35,.2,.1],d:[1.3,.8,.5,.3,.15],t0:.5,v:.26,pan:-.2},R);cloche(b,{f:nE(14),r:[1,2.01,2.99,4.2],m:[1,.45,.28,.14],d:[1.1,.6,.4,.2],t0:.62,v:.2,pan:.25},R);
    T.nappe(b,R,[7,14],.5,.25,.5,1.1,.08,2200);}});
D('pwr.double',{fam:'machine',dur:1.1,st:1,key:1,db:+3,max:1,cd:.5,grp:'r',prio:4,dit:'DOUBLE POUVOIR : deux stabs qui montent + poussière',
  r:function(b,R,o){T.stab(b,R,[12,19],0,.05,.3,.14,1.1);T.stab(b,R,[16,24],.13,.15,.6,.15,1.3);T.scintille(b,R,.15,.6,8,.1);}});
D('pwr.triple',{fam:'machine',dur:1.5,st:1,key:1,db:+5,max:1,cd:.5,grp:'r',prio:5,dit:'TRIPLE POUVOIR : trois stabs + le grave + le chœur',
  r:function(b,R,o){T.stab(b,R,[12,19],0,.05,.3,.14,1.1);T.stab(b,R,[16,24],.12,.05,.3,.14,1.2);T.stab(b,R,[19,28,31],.24,.3,.9,.16,1.4);T.grave(b,o,.24,90,40,.2,.5,.55);
    T.choeur(b,R,[12,19,24],.24,.08,.3,.9,.08);T.scintille(b,R,.3,.9,12,.1);}});
D('pwr.bouclierCasse',{fam:'machine',bus:'fx',dur:1.6,st:1,key:1,db:+6,max:1,cd:.5,grp:'r',prio:6,dit:'le BOUCLIER SAUVE une chute : l’acier qui éclate en mille morceaux + le « whoomp » qui te rattrape + la note du salut',
  r:function(b,R,o){bruit(b,{c:'b',t0:0,a:.0005,d:.2,v:.7,ft:'hp',f:2500},R);for(let k=0;k<22;k++)cloche(b,{f:2200+R()*5000,r:[1,1.5,2.3],m:[1,.5,.3],d:[.1+R()*.15,.06,.04],t0:R()*.35,v:.08+R()*.08,pan:R()*1.8-.9},R);
    T.grave(b,o,0,90,40,.3,.5,.7);bruit(b,{c:'r',t0:.05,a:.2,h:0,d:.3,v:.45,ft:'bp',f:400,f1:3000,g:.35},R);
    osc(b,{f:nE(12),f1:nE(24),g:.3,gc:.6,w:'tri',t0:.3,a:.01,d:.5,v:.2});cloche(b,{f:nE(31),r:[1,2,2.76],m:[1,.3,.1],d:[1,.4,.12],t0:.5,v:.25},R);}});
D('pwr.bouclierFin',{fam:'machine',dur:1,st:1,key:1,db:-1,max:1,cd:.5,dit:'le bouclier s’éteint SANS avoir servi : le champ qui se dissout (shimmer qui retombe)',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.03,d:.6,v:.35,ft:'bp',f:3000,f1:400,g:.6,q:5},R);cloche(b,{f:nE(19),f1:nE(7),g:.5,r:[1,2.39],m:[1,.3],d:[.6,.3],t0:0,v:.2},R);}});
D('pwr.bouclierPlot',{fam:'machine',bus:'fx',dur:.6,v:2,st:1,db:+1,max:3,cd:.05,dit:'un plot DÉMOLI sous le bouclier : le BONK de l’acier + le plot qui s’envole loin',
  r:function(b,R,o){clic(b,{t0:0,f:2500,d:.008,v:.6},R);T.tole(b,R,0,640+R()*80,.35,.35);T.plastique(b,R,.01,330,.5);bruit(b,{c:'r',t0:.02,a:.01,d:.3,v:.25,ft:'bp',f:3000,f1:900,g:.3,q:1.5,pan:0,pan1:.8},R);}});
D('jeu.miracule',{fam:'pose',dur:2,st:1,key:1,db:+5,max:1,cd:1,grp:'r',prio:6,dit:'MIRACULÉ (posé après une chute perdue d’avance) : le chœur des anges + la cloche + le souffle de soulagement',
  r:function(b,R,o){T.choeur(b,R,[12,16,19,24],0,.25,.4,1.2,.12);cloche(b,{f:nE(31),r:[1,2,2.76,5.4],m:[1,.35,.18,.05],d:[1.6,.7,.3,.1],t0:.15,v:.3},R);
    T.swish(b,R,.1,.6,3000,600,.2,.5,-.5,.8);T.scintille(b,R,.2,1.4,14,.1);}});
D('jeu.palierVitesse',{fam:'machine',bus:'fx',dur:1.1,st:1,key:1,db:+2,max:1,cd:.5,bases:[0,12],dit:'palier de VITESSE (« 400 KM/H ! ») : le mur d’air qui éclate + le rapport qui passe + stab qui monte (st = le rang)',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.005,d:.5,v:.5,ft:'bp',f:800,f1:4500,g:.3,q:.8,pan:-.5,pan1:.5},R);clic(b,{t0:0,f:1500,d:.015,v:.4},R);T.grave(b,o,0,100,50,.1,.2,.4);
    T.stab(b,R,[12+o.base,19+o.base,24+o.base],.05,.12,.6,.15,1.3);}});
D('jeu.sansFaute',{fam:'pose',dur:.6,key:1,db:0,max:1,cd:.2,bases:[0,12],dit:'SANS FAUTE ×n (poses propres d’affilée) : la note du marimba qui monte d’un degré à chaque pose (st)',
  r:function(b,R,o){T.marimba(b,R,nE(12+o.base),0,.5,.45);T.marimba(b,R,nE(19+o.base),.06,.4,.5);T.scintille(b,R,.05,.3,4,.07);}});
})(typeof window!=='undefined'?window:globalThis);
/* <<<FIN POUVOIRS2>>> */

/* <<<DAUPHIN>>> */
(function(G){
'use strict';
/* LE DAUPHIN v4 (session GAMEPLAY, main c3ed6f2) : le banc grandit de 1 à 6 dauphins, un toutes les 0,6 s — chaque dauphin qui
   rejoint a son cri, sa petite gerbe, et une note qui monte avec le banc (st = rang dans le banc, converti en degré par le jeu). */
const D=G.CCSON_D,O=G.CCSON_OUTILS,osc=O.osc,bruit=O.bruit,T=G.CCSON_T;
const nE=function(st){return 329.6276*Math.pow(2,st/12);};
D('jeu.dauphin',{fam:'figures',dur:.7,key:1,db:-3,max:2,cd:.15,bases:[0,12],dit:'un dauphin REJOINT le banc : son cri stylisé + une petite gerbe + la note qui monte avec le banc (st)',
  r:function(b,R,o){for(let k=0;k<2;k++)osc(b,{f:2600+k*500,f1:4300+k*300,g:.06,t0:k*.07,a:.003,d:.07,v:.08,fm:{r:.5,i:.7,d:.05},pan:.3-k*.3});
    T.bulle(b,R,.1,650,330,.08,.3);bruit(b,{c:'b',t0:.11,a:.004,d:.18,v:.15,ft:'bp',f:3200,q:.7},R);
    T.pluck(b,R,nE(12+o.base),.12,.4,.4,.9);}});
})(typeof window!=='undefined'?window:globalThis);
/* <<<FIN DAUPHIN>>> */

/* <<<LOT2>>> */
(function(G){
'use strict';
/* LOT 2 — les sons demandés par le branchement : la mort dans une tour, le tampon et le compteur du garage, le raccourci. */
const D=G.CCSON_D,O=G.CCSON_OUTILS,osc=O.osc,bruit=O.bruit,cloche=O.cloche,clic=O.clic,T=G.CCSON_T;
const nE=function(st){return 329.6276*Math.pow(2,st/12);};
/* L'IMPACT D'IMMEUBLE (session GRAPHISME, villeImpact) : la caisse percute une TOUR de la ville en vol — éclair sur la façade, cratère
   en 0,14 s, 17 blocs de béton + 9 carreaux de verre projetés (ils tombent ~3 s). Joue AVANT l'explosion de la caisse — et SEUL quand
   le bouclier la sauve : il porte donc tout le choc, sans compter sur l'explosion. */
D('impact.immeuble',{fam:'mort',bus:'fx',dur:2.4,st:1,db:+6,max:1,cd:.5,dit:'la caisse percute une TOUR : le béton qui craque sourd + la vitre qui éclate + la pluie de verre et de gravats (~2 s)',
  r:function(b,R,o){T.coup(b,R,o,0,1,900,85,34,.5);bruit(b,{c:'r',t0:0,a:.001,d:.6,v:.6,ft:'lp',f:1800,f1:250,g:.5,q:.7},R);
    bruit(b,{c:'b',t0:.02,a:.0005,d:.3,v:.45,ft:'hp',f:3200,pan:-.3,pan1:.3},R);
    for(let k=0;k<34;k++)cloche(b,{f:2400+R()*5800,r:[1,1.5,2.2],m:[1,.5,.3],d:[.06+R()*.2,.05,.03],t0:.03+Math.pow(R(),1.3)*1.8,v:(.05+R()*.07)*(1-k/60),pan:R()*1.8-.9},R);
    for(let k=0;k<9;k++){const t=.25+Math.pow(R(),.8)*1.9;T.coup(b,R,o,t,.18+R()*.15,700,160+R()*80,70,.12);}
    T.crepite(b,R,.1,2,30,.25,250,1400);}});
D('ui.tampon',{fam:'interface',bus:'ui',dur:.35,db:-1,max:1,cd:.2,dit:'le TAMPON « À TOI ! » de l’achat qui s’abat (≈266 ms après l’appui) : caoutchouc sur papier',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.001,d:.07,v:.7,ft:'lp',f:1600},R);T.grave(b,o,0,140,70,.06,.14,.6);clic(b,{t0:0,f:2200,d:.006,v:.3},R);}});
D('ui.compteur',{fam:'interface',bus:'ui',dur:1,st:1,key:1,db:-9,max:1,cd:.3,dit:'le compteur $ du garage qui DÉFILE vers le bas (0,9 s) : la liasse qui se compte + la note qui descend',
  r:function(b,R,o){let t=0,k=0;while(t<.88&&k<40){bruit(b,{c:'b',t0:t,a:.0008,d:.016,v:.3,ft:'bp',f:3300+R()*600,q:1.3},R);
      if(k%3===0)osc(b,{f:nE(31-Math.min(12,k/2)),t0:t,a:.0008,d:.03,v:.18});t+=.022+.03*Math.pow(t/.9,2);k++;}
    clic(b,{t0:.9,f:2500,d:.006,v:.3},R);}});
D('raccourci',{fam:'piste',dur:1,st:1,key:1,db:+1,max:1,cd:.4,grp:'r',prio:3,dit:'RACCOURCI (+340 M) : le trou de ver — on saute un bout de route (souffle aspiré + quinte qui s’élève + or)',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.12,h:0,d:.2,v:.4,ft:'bp',f:600,f1:4500,g:.22,q:1.3,pan:.6,pan1:-.6},R);
    cloche(b,{f:nE(19),r:[1,2,2.76],m:[1,.3,.1],d:[.5,.2,.06],t0:.14,v:.28},R);cloche(b,{f:nE(26),r:[1,2,2.76],m:[1,.3,.1],d:[.7,.25,.08],t0:.2,v:.3},R);T.scintille(b,R,.2,.6,8,.09);}});
})(typeof window!=='undefined'?window:globalThis);
/* <<<FIN LOT2>>> */

/* <<<MOTEUR>>> */
(function(G){
'use strict';
/* LA SCÈNE DU PALIER MOTEUR (carte MOTEUR v5, session UHD) — la plus riche du jeu, qui s'empilait vers 1,7 s (visseuse, clanks,
   démarreur, fanfare de palier, souffle de pad, + la fanfare de record par-dessus). Recomposée d'UN SEUL TENANT sur les instants de
   l'image : `moteur.palier` part avec engSwapArme (≈834 ms après la carte) — visseuse 0-340 ms, PLONGÉE de la carte dans le capot
   (souffle qui descend, 166-646 ms), deux clanks de tôle (400/500 ms), et à 646 ms l'IMPACT (engImpact, ≈1 480 ms) : coup sourd, le
   démarreur qui lance le moteur neuf, la poussée, et la fanfare de palier qui monte. Les cylindres, eux, s'allument un par un sur la
   gamme (`moteur.cylindre`, st = degré). */
const D=G.CCSON_D,O=G.CCSON_OUTILS,osc=O.osc,bruit=O.bruit,cloche=O.cloche,clic=O.clic,T=G.CCSON_T;
const nE=function(st){return 329.6276*Math.pow(2,st/12);};
/* (2026-10-15, Sacha : « quand on roule, plein de ding-ding-ding-ding ») LE CYLINDRE QUI S'ALLUME = UN « TOUM » DE PISTON. MESURÉ au banc :
   30 cylindres en 40 s de course, chaque moteur neuf égrenant jusqu'à 16 cloches qui montaient de mi5 à mi9 (5,3 kHz) toutes les 50 ms.
   Maintenant un coup de piston sourd, accordé une octave et demie plus bas (si3), et le jeu garde la montée dans l'octave (engBig : sonPdAR). */
D('moteur.cylindre',{fam:'machine',dur:.25,key:1,db:-8,max:4,cd:0,bases:[0,12],dit:'un CYLINDRE du nouveau moteur s’allume : le « toum » sourd du piston, accordé (st, un degré par cylindre)',
  r:function(b,R,o){const f=nE(-5+o.base),t=O.Toile(b.sr,b.dur,false);
    osc(t,{f:f*1.8,f1:f,g:.03,gc:.4,t0:0,a:.001,d:.12,v:.8});osc(t,{f:f*.5,t0:0,a:.002,d:.08,v:.4});bruit(t,{c:'n',t0:0,a:.0008,d:.035,v:.5,ft:'lp',f:600},R);
    O.sature(t,2);O.filtre(t,'lp',1600,.7);for(let i=0;i<b.n;i++)b.L[i]+=t.L[i]*.7;clic(b,{t0:0,f:1500,d:.003,v:.12,ft:'bp'},R);}});
D('moteur.palier',{fam:'machine',dur:2.4,st:1,key:1,db:+4,max:1,cd:1,grp:'r',prio:5,dit:'le NOUVEAU MOTEUR entre dans le capot : visseuse, plongée, clanks, IMPACT + démarreur + poussée + fanfare de palier (calé sur la carte)',
  r:function(b,R,o){
    let t=0,pas=.028;while(t<.34){T.tole(b,R,t,1400+R()*500,.06,.05);t+=pas;pas*=1.06;}                 // la visseuse qui décélère
    bruit(b,{c:'r',t0:.17,a:.3,h:0,d:.2,v:.35,ft:'bp',f:3200,f1:500,g:.48,gc:.8,q:1.2,pan:.3,pan1:-.1},R); // la carte PLONGE
    T.tole(b,R,.40,520,.28,.3);T.tole(b,R,.50,340,.24,.3);                                            // la pièce tombe en place
    const I=.646;
    T.coup(b,R,o,I,.9,900,100,40,.35);                                                                // l'IMPACT dans le capot
    for(const dt of [0,.012])osc(b,{f:52,f1:240,g:.6,gc:1.3,w:'saw',t0:I,a:.03,h:.35,d:.4,v:.09,pan:dt*40,flt:['lp',420,2600,.6,.9]}); // le démarreur, puis ça PART
    bruit(b,{c:'r',t0:I,a:.02,d:.45,v:.4,ft:'bp',f:380,f1:3600,g:.35,q:1.1,pan:-.4,pan1:.4},R);       // la poussée
    T.crepite(b,R,I+.4,.5,10,.3,300,1200);                                                             // il crache
    [12,16,19,24].forEach(function(st,i){const d=i===3?1.1:.45;cloche(b,{f:nE(st),r:[1,2.76],m:[1,.35],d:[d,d*.5],t0:I+.03+i*.082,v:.3*(i===3?1.2:1)},R);}); // la fanfare de palier qui MONTE
    T.scintille(b,R,I+.25,.8,10,.1);}});
/* LE BRUIT DE MOTEUR DE JOUER (2026-10-16, Sacha : « chaque bouton doit avoir un son lorsqu'on clique dessus […] le bouton jouer doit avoir un
   bruit de moteur ») — `ui.jouer`, à l'appui de JOUER et de REJOUER (uiClic('jouer')). Un VRAI moteur, pas une dent de scie qui glisse comme
   les démarreurs d'avant : un V8 calculé explosion par explosion (`v8`).
   · le RÉGIME suit une petite mécanique : les gaz (0-1) le tirent vers 6 400 tr/min (constante 70 ms : la montée est raide), le frein
     moteur le ramène au ralenti de 850 (250 ms : la retombée est lente) — la courbe se calcule, on ne la dessine pas ;
   · chaque EXPLOSION est une impulsion — 8 cylindres en 4 temps = rpm/15 par seconde : 57 au ralenti, 420 en haut ; l'ordre d'allumage du
     V8 à vilebrequin croisé les rend INÉGALES (le motif de huit, `MOTIF`) : c'est le glouglou du ralenti, qui hésite un peu (plus de hasard) ;
   · l'impulsion passe dans le POT : deux résonances (130 et 420 Hz), un passe-bas qui s'ouvre avec les gaz et le régime (sourd au ralenti,
     rageur en haut), une saturation (la tôle qui vibre : les harmoniques 200 Hz-2 kHz que rend un haut-parleur de téléphone) ;
   · l'ADMISSION, un souffle rose aspiré (1,5-3 kHz), suit les gaz et le régime ; pied levé au-dessus de 2 500 tr/min : des RETOURS DE FLAMME.
   La scène (1,35 s) : la clé (0) · le DÉMARREUR, trois compressions (50-220 ms) · le moteur PREND (220 ms) · le COUP DE GAZ, VROUUM
   (270-450 ms, ≈ 6 000 tr/min) · la retombée qui pète dans le pot · le ralenti qui glougloute et s'efface (le départ prend le relais). */
function v8(b,R,o){ // o : {t0, fin, rpm0, gaz(t) → 0..1, v} — le moteur dans SA toile (mono), saturé, puis versé dans b ; rend les instants des retours de flamme
  const sr=b.sr,te=O.Toile(sr,b.dur,false),X=te.L,i0=Math.round(o.t0*sr),i1=Math.min(b.n,Math.round(o.fin*sr)),bqC=O.bqC,run=O.bqRun;
  const RAL=850,MAXR=6400,MOTIF=[1,.74,.94,.68,.97,.8,.88,.71];
  const r1=O.Bq(),r2=O.Bq(),pb=O.Bq(),ad=O.Bq();r1.c=bqC('bp',130,1.3,sr);r2.c=bqC('bp',420,2,sr);
  let rpm=o.rpm0||300,ph=.999,cyl=0,gz=0,gv=0,A=0,j=1e9,W=1,tau=1,p0=0,p1=0,p2=0,dp=-1;const pops=[],VO=new Float32Array(b.n);
  const kp=1-Math.exp(-1/(sr*.012)),kv=1-Math.exp(-1/(sr*.06));
  for(let i=i0;i<i1;i++){const t=i/sr;
    gz+=(o.gaz(t)-gz)*kp;gv+=(gz-gv)*kv;VO[i]=.36+.64*gv; // la pédale (12 ms) · le VOLUME qui la suit, posé APRÈS la saturation (60 ms) : sinon elle écrase l'écart entre le coup de gaz et le ralenti (mesuré : 5 dB au lieu de 12)
    const cib=RAL+(MAXR-RAL)*gz;rpm+=(cib-rpm)*(1-Math.exp(-(cib>rpm?14:4)/sr));
    const ff=rpm/15;ph+=ff/sr;
    if(ph>=1){ph-=1;const ral=Math.max(0,1-(rpm-RAL)/1800);ph+=(R()-.5)*.08*ral; // une EXPLOSION
      A=MOTIF[cyl&7]*(.86+.28*R())*(.26+.74*Math.min(1,gz*1.6));cyl++;j=0;
      const per=sr/ff;W=Math.max(2,Math.min(per*.55,.0028*sr));tau=Math.max(1,Math.min(per*.18,.0011*sr));
      if(gz<.08&&rpm>2500&&t-dp>.035&&pops.length<5&&R()<.09){pops.push(t);dp=t;}} // pied levé, haut dans les tours : ça pète dans le pot
    let x=0;if(j<W){x=A*(.7*Math.sin(Math.PI*j/W)+.6*Math.exp(-j/tau));j++;}
    if((i&15)===0){pb.c=bqC('lp',620+3400*gz*(.35+.65*rpm/MAXR)+600*rpm/MAXR,.9,sr);ad.c=bqC('bp',1500+1500*rpm/MAXR,1.1,sr);}
    const w=R()*2-1;p0=.99765*p0+w*.099046;p1=.963*p1+w*.2965164;p2=.57*p2+w*1.0526913;
    X[i]=run(pb,run(r1,x)*1.1+run(r2,x)*.55+x*.35)+run(ad,(p0+p1+p2+w*.1848)*.2)*.16*gz*(.3+.7*rpm/MAXR);}
  O.sature(te,2.4);for(let i=i0;i<i1;i++)X[i]*=VO[i]; // la tôle vibre
  const f0=Math.round((o.fin-.3)*sr);for(let i=f0;i<i1;i++)X[i]*=.5+.5*Math.cos(Math.PI*(i-f0)/(i1-f0)); // il s'efface : le départ prend le relais
  G.CCSON_GRAVE.mixe(b,te,o.v==null?1:o.v,0);
  return pops;
}
D('ui.jouer',{fam:'interface',bus:'fx',dur:1.35,db:+2,max:1,cd:.6,dit:'JOUER : le moteur — la clé, le démarreur (trois compressions), il PREND, le coup de gaz VROUUM, la retombée qui pète dans le pot, le ralenti qui glougloute',
  r:function(b,R,o){
    clic(b,{t0:0,f:3400,d:.004,v:.5},R);T.tole(b,R,.004,2600,.12,.05);clic(b,{t0:.032,f:2200,d:.005,v:.45},R); // la clé : deux crans
    for(const t of [.05,.115,.178]){bruit(b,{c:'n',t0:t,a:.004,d:.07,v:.55,ft:'lp',f:520,q:.8},R);bruit(b,{c:'r',t0:t,a:.003,d:.05,v:.9,ft:'bp',f:780,q:1.2},R);osc(b,{f:62,f1:48,g:.05,t0:t,a:.004,d:.06,v:.22});osc(b,{f:186,f1:144,g:.05,w:'tri',t0:t,a:.003,d:.05,v:.4});} // trois COMPRESSIONS : le vilebrequin passe le point mort haut
    osc(b,{f:150,f1:178,g:.17,w:'saw',t0:.04,a:.012,h:.15,d:.04,v:.4,vib:[16,.06],flt:['bp',1100,1400,.17,2.2]}); // le pignon du démarreur qui chante
    const pops=v8(b,R,{t0:.22,fin:1.35,rpm0:300,v:1,gaz:function(t){return t<.27?.55:t<.45?1:t<.48?1-(t-.45)/.03:0;}});
    for(const t of pops){bruit(b,{c:'n',t0:t,a:.0005,d:.02+R()*.03,v:.5+R()*.35,ft:'lp',f:900+R()*900,q:.7},R);osc(b,{f:85,f1:50,g:.03,t0:t,a:.001,d:.045,v:.22});clic(b,{t0:t,f:1800,d:.003,v:.18},R);}}});
})(typeof window!=='undefined'?window:globalThis);
/* <<<FIN MOTEUR>>> */

/* <<<GARAGE>>> */
(function(G){
'use strict';
/* L'ATELIER A UNE VOIX (le garage 3D était muet) : la pièce, pas la musique — le bourdon des tubes néon (100 Hz + harmoniques,
   le secteur), le TUBE QUI GRÉSILLE deux fois dans la boucle (celui qui clignote à l'image), et la ville au loin par la porte
   relevée. Très bas, sur le bus d'ambiance : on ne l'entend pas, on le SENT — et le garage devient un lieu. Boucle de 7 s sans
   couture (fondu enchaîné de ses extrémités). */
const D=G.CCSON_D,O=G.CCSON_OUTILS,osc=O.osc,bruit=O.bruit,clic=O.clic,T=G.CCSON_T;
D('garage.ambiance',{fam:'interface',bus:'amb',dur:7,st:1,db:-12,max:1,cd:.5,dit:'l’ATELIER (boucle) : le bourdon des néons, le tube qui grésille, la ville au loin par la porte',
  r:function(b,R,o){osc(b,{f:100,w:'saw',t0:0,a:.001,h:7,d:.001,v:.05,flt:['lp',520,520,1,.7]});osc(b,{f:50,t0:0,a:.001,h:7,d:.001,v:.1});osc(b,{f:150,t0:0,a:.001,h:7,d:.001,v:.025,pan:.3});
    bruit(b,{c:'r',t0:0,a:.001,h:7,d:.001,v:.07,ft:'lp',f:700,pan:-.2},R);                       // l'air de la pièce
    bruit(b,{c:'n',t0:0,a:.001,h:7,d:.001,v:.12,ft:'lp',f:180,am:[.11,.4],pan:.5},R);              // la ville, loin, par la porte
    for(const t0 of [1.7,4.9]){for(let k=0;k<7;k++){const t=t0+k*.03+R()*.02;clic(b,{t0:t,f:4000,d:.004,v:.12,pan:.6},R);osc(b,{f:100,w:'saw',t0:t,a:.002,h:.015,d:.01,v:.04,pan:.6});}}
    O.boucle(b,.6);}}); // la boucle se referme sans couture (voir `boucle`)
})(typeof window!=='undefined'?window:globalThis);
/* <<<FIN GARAGE>>> */

/* <<<LOT2B>>> */
(function(G){
'use strict';
/* LOT 2B — les sons que le branchement de la piste et de la campagne a réclamés. */
const D=G.CCSON_D,O=G.CCSON_OUTILS,osc=O.osc,bruit=O.bruit,cloche=O.cloche,clic=O.clic,T=G.CCSON_T;
const nE=function(st){return 329.6276*Math.pow(2,st/12);};
D('flaque.sec',{fam:'piste',bus:'fx',dur:.5,key:1,db:-4,max:1,cd:.3,dit:'« À SEC » (une rangée de flaques passée au sec) : le pneu qui accroche le sec + une note de marimba',
  r:function(b,R,o){bruit(b,{c:'b',t0:0,a:.004,d:.14,v:.3,ft:'bp',f:2100,f1:1600,g:.12,q:4},R);T.marimba(b,R,nE(24),.05,.4,.4);}});
D('drift.charge',{fam:'machine',bus:'fx',dur:.4,key:1,db:-4,max:2,cd:.1,bases:[0,12],dit:'le DRIFT change de palier (étincelles bleu → or → rose) : l’arc qui claque + la note qui monte (st)',
  r:function(b,R,o){for(let k=0;k<3;k++)osc(b,{f:1800+k*500,f1:3600,g:.04,t0:k*.012,a:.0005,d:.05,v:.08,fm:{r:3.3,i:2.5,d:.03}});
    cloche(b,{f:nE(19+o.base),r:[1,2,2.76],m:[1,.3,.12],d:[.28,.1,.04],t0:.01,v:.3},R);}});
D('fantome.prise',{fam:'campagne',dur:.2,key:1,db:-9,max:3,cd:.06,bases:[0,12],dit:'un cran de la PRISE de la caisse-nuage (la note monte à chaque cran : st)',
  r:function(b,R,o){T.pluck(b,R,nE(12+o.base),0,.45,.18,1.1);}});
D('fourgon.billets',{fam:'campagne',bus:'fx',dur:.3,v:3,db:-11,max:3,cd:.06,dit:'des billets et des pièces tombent du coffre du FOURGON',
  r:function(b,R,o){bruit(b,{c:'b',t0:0,a:.004,d:.1,v:.25,ft:'bp',f:2800+R()*1200,q:1.4,am:[26,.6]},R);cloche(b,{f:nE(24+[0,4,7][o.v]),r:[1,2,3.01,5.43],m:[1,.35,.15,.08],d:[.2,.08,.04,.03],t0:.03,v:.2},R);}});
D('portail.ouvre',{fam:'piste',dur:1.3,st:1,key:1,db:+1,max:1,cd:1,grp:'r',prio:3,dit:'le PORTAIL SE ROUVRE (après la prise) : l’ovule qui se déploie — souffle qui monte + accord qui s’ouvre',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.5,d:.4,v:.3,ft:'bp',f:300,f1:3000,g:.8,q:1.2,pan:-.4,pan1:.4},R);T.nappe(b,R,[0,7,12,16],.2,.3,.2,.6,.07,2400);
    cloche(b,{f:nE(31),r:[1,2,2.76],m:[1,.3,.1],d:[.8,.3,.1],t0:.55,v:.2},R);T.scintille(b,R,.5,.7,8,.08);}});
D('foudre.touche',{fam:'campagne',bus:'fx',dur:.8,st:1,db:+2,max:1,cd:.5,dit:'FOUDROYÉ mais vivant : l’arc électrique qui grille la carrosserie (sans mort)',
  r:function(b,R,o){for(let k=0;k<8;k++)osc(b,{f:900+R()*2500,f1:200,g:.05,t0:k*.045+R()*.02,a:.0005,d:.05,v:.12,fm:{r:3.7,i:4,d:.04}});
    bruit(b,{c:'b',t0:0,a:.002,d:.45,v:.3,ft:'bp',f:5000,q:1,am:[60,.8]},R);T.grave(b,o,0,110,60,.1,.2,.3);}});
})(typeof window!=='undefined'?window:globalThis);
/* <<<FIN LOT2B>>> */

/* <<<FRENPOSE>>> */
(function(G){
'use strict';
/* LA POSE EN FRÉNÉSIE (session UHD, demande de Sacha : « le son low honor de Red Dead Redemption 2 » — fichier Rockstar protégé,
   refusé ; il a choisi un son ORIGINAL dans le même esprit). À chaque atterrissage pendant la frénésie : UNE petite phrase sombre et
   brève — deux notes qui DESCENDENT d'une tierce mineure (si → sol#, dans la gamme), la seconde plus grave et plus longue. Attaque
   feutrée : un piano ÉTOUFFÉ (FM douce, marteau feutre) doublé d'une corde grave pincée, sans sous-grave, presque sec (bus fx). Elle
   revient souvent : discrète, sous le tchak du PARFAIT. */
const D=G.CCSON_D,O=G.CCSON_OUTILS,osc=O.osc,bruit=O.bruit,corde=O.corde,T=G.CCSON_T;
const nE=function(st){return 329.6276*Math.pow(2,st/12);};
function note(b,R,f,t0,v,d){
  osc(b,{f:f,t0:t0,a:.006,d:d,v:v,fm:{r:1,i:.9,d:.12}});                    // le piano étouffé : peu d'harmoniques, qui meurent vite
  osc(b,{f:f*2,t0:t0,a:.004,d:d*.35,v:v*.12});
  corde(b,{f:f,t0:t0,d:d*.9,v:v*.45,br:.18},R);                            // la corde grave, pincée tout doucement (br bas = sombre)
  bruit(b,{c:'r',t0:t0,a:.002,d:.03,v:v*.25,ft:'lp',f:900},R);               // le feutre du marteau
}
D('frenesie.pose',{fam:'flow',bus:'fx',dur:.9,key:1,db:-3,max:1,cd:.5,rj:.004,dit:'une POSE pendant la frénésie : deux notes sombres qui descendent (tierce mineure), piano étouffé + corde grave — dans l’esprit du « low honor »',
  r:function(b,R,o){note(b,R,nE(-5),0,.42,.28);note(b,R,nE(-8),.15,.5,.62);O.filtre(b,'lp',2600,.7);}});
})(typeof window!=='undefined'?window:globalThis);
/* <<<FIN FRENPOSE>>> */

/* <<<FRENCASH>>> */
(function(G){
'use strict';
/* LES DEUX SONS COMMANDÉS PAR LA SESSION UHD (2026-09-29) — appelés par le jeu depuis la frénésie ×3 et NITROOO, muets jusqu'ici.
   · `frenesie.cash` (frenCash : pièce, portail, butin de la ville — EN FRÉNÉSIE seulement, au plus toutes les 90 ms, PAR-DESSUS le son
     de la pièce) : le « ×3 » s'ENTEND — TROIS micro-pièces qui montent en 60 ms, une octave au-dessus de la pièce (elle garde sa note de
     combo, celui-ci la couronne), + une pincée de poussière d'or. Court, brillant, doux : il revient jusqu'à ~11 fois par seconde.
     Trois variantes (trois tercets pentatoniques) : un son répété à l'identique devient une alarme.
   · `nitrooo.palier` (nitroooTick : un palier par seconde de NITROOO tenue, st = sonPd(palier) — la gamme MONTE avec la vitesse) :
     la rentrée atmosphérique — bouffée de feu qui s'ouvre, braises qui crépitent, un ton de chauffe qui monte d'une quarte et se pose
     sur la note du palier, une cloche de palier, un coup sourd. Dans le chef d'orchestre sous `vitesse.pure` (prio 1 < 2) : aux
     secondes paires les deux partent ensemble, la salve NITROOO ×n passe devant, le palier recule de 9 dB. */
const D=G.CCSON_D,O=G.CCSON_OUTILS,osc=O.osc,bruit=O.bruit,cloche=O.cloche,clic=O.clic,T=G.CCSON_T;
const nE=function(st){return 329.6276*Math.pow(2,st/12);};
/* (2026-10-15, Sacha : « trop de petits sons aigus ») les tercets descendent de deux octaves (mi4-si4 au lieu de mi6-mi7), dans la matière
   de la pièce v2 (modes 2,32 · 4,25, « tch » à 2,2 kHz au lieu du clic à 7 kHz), sans la poussière à 7,5 kHz : jusqu'à 11 par seconde. */
const TERCETS=[[0,4,7],[2,7,9],[4,7,12]]; // mi4 · fa#4 · sol#4 · si4 · do#5 · mi5 : la pentatonique, autour de la pièce
D('frenesie.cash',{fam:'argent',dur:.35,st:1,key:1,db:-8,max:2,cd:.09,v:3,rj:.004,vj:.5,dit:'un gain EN FRÉNÉSIE (par-dessus la pièce) : le ×3 — trois petites pièces graves qui montent en 60 ms',
  r:function(b,R,o){const N=TERCETS[o.v%3];
    N.forEach(function(st,i){const t=i*.028,p=(i-1)*.35;
      bruit(b,{c:'b',t0:t,a:.0006,d:.016,v:.14+i*.03,ft:'bp',f:2200,q:1.2,pan:p},R);
      cloche(b,{f:nE(st),r:[1,2.32,4.25],m:[1,.3,.12],d:[.12+i*.04,.06,.03],t0:t+.002,v:.28+i*.06,pan:p,jit:.003},R);});}});
D('nitrooo.palier',{fam:'machine',bus:'fx',dur:.8,st:1,key:1,db:-2,max:1,cd:.3,bases:[0,12],grp:'r',prio:1,dit:'un PALIER de NITROOO (chaque seconde tenue, st) : bouffée de feu + braises + ton de chauffe qui monte se poser sur la note + cloche',
  r:function(b,R,o){const B=o.base;
    bruit(b,{c:'n',t0:0,a:.03,h:.03,d:.35,v:.55,ft:'lp',f:250,f1:2200,g:.12,q:.7},R);   // la bouffée : le feu qui s'ouvre
    T.swish(b,R,0,.28,700,4200,.25,-.3,.3);T.crepite(b,R,.05,.45,10,.22,600,2500);
    for(const dt of [-.006,.006])osc(b,{f:nE(7+B)*(1+dt),f1:nE(12+B)*(1+dt),g:.09,gc:.6,w:'saw',t0:.01,a:.005,h:.06,d:.3,v:.06,pan:dt*80,flt:['lp',900,5000,.12,.9,.5]});
    cloche(b,{f:nE(24+B),r:[1,2,2.76],m:[1,.3,.12],d:[.35,.15,.06],t0:.07,v:.18},R);
    T.grave(b,o,0,95,50,.1,.22,.4);}});
})(typeof window!=='undefined'?window:globalThis);
/* <<<FIN FRENCASH>>> */

/* <<<GARAGEFEU>>> */
(function(G){
'use strict';
/* LE RIDEAU DE FLAMMES A SA VOIX (2026-09-29, Léo : la porte du garage brûle — « c'est l'ambiance ») : une boucle de 6 s sur le bus
   d'ambiance, jouée tant que l'atelier est ouvert, par-dessus `garage.ambiance`. Le GRONDEMENT (bruit brun sous 320 Hz, qui respire
   à 0,33 et 0,5 Hz sans rapport : jamais un battement régulier), le SOUFFLE (bruit rose en bande 500-1100 Hz), le CRÉPITEMENT (une
   cinquantaine de micro-éclats semés sur toute la boucle, partout dans la stéréo) et quatre CLAQUEMENTS de bois qui éclate. Le jeu
   monte son gain pendant le LÂCHER (`garFeu` : +8 dB quand la caisse entre dans le feu). Pas de note : le feu n'a pas de tonalité. */
const D=G.CCSON_D,O=G.CCSON_OUTILS,osc=O.osc,bruit=O.bruit,clic=O.clic;
D('garage.feu',{fam:'interface',bus:'amb',dur:6.6,st:1,db:-9,max:1,cd:.5,rj:0,vj:0,dit:'le RIDEAU DE FLAMMES de la porte (boucle) : grondement qui respire, souffle, crépitement, bois qui claque',
  r:function(b,R,o){
    bruit(b,{c:'n',t0:0,a:.001,h:6.6,d:.001,v:.34,ft:'lp',f:320,am:[.33,.45],pan:-.15},R);           // le grondement
    bruit(b,{c:'n',t0:0,a:.001,h:6.6,d:.001,v:.22,ft:'lp',f:260,am:[.5,.5],pan:.2},R);
    bruit(b,{c:'r',t0:0,a:.001,h:6.6,d:.001,v:.07,ft:'bp',f:750,q:.8,am:[.7,.55]},R);                 // le souffle
    for(let i=0;i<52;i++){const t=R()*6.4;                                                            // le crépitement
      bruit(b,{c:'n',t0:t,a:.0006,d:.01+R()*.035,v:.2+R()*.35,ft:'lp',f:900+R()*2600,q:.7,pan:R()*1.6-.8},R);}
    for(const t of [.9,2.6,4.1,5.5]){const p=R()*1.2-.6;                                             // le bois qui claque
      clic(b,{t0:t,f:1800+R()*1200,d:.006,v:.35,pan:p},R);bruit(b,{c:'r',t0:t,a:.0008,d:.07,v:.25,ft:'bp',f:1300,q:1.2,pan:p},R);}
    O.boucle(b,.6);}});
})(typeof window!=='undefined'?window:globalThis);
/* <<<FIN GARAGEFEU>>> */

/* <<<FORET>>> */
(function(G){
'use strict';
/* LES VOIX DE LA FORÊT NOIRE (2026-10-14, Sacha : « la nuit, une ambiance de forêt hantée, avec des effets hantés et des bruits de
   loup-garou » ; le jour « belle, ensoleillée, avec des fleurs et des papillons »). Joués par foretSons / foretLoupCri (index.html), sur
   le bus d'AMBIANCE (loin, large, dans la salle). Aucun n'est une voix humaine (SANS_VOIX) : des bêtes, du bois, du vent.
   · `foret.loup` — LE HURLEMENT DU LOUP-GAROU : une voix synthétisée par FORMANTS (somme d'harmoniques pondérées par trois résonances qui
     glissent de « ou » à « a » puis reviennent à « ou »), la hauteur qui MONTE d'une octave en 0,4 s, tient en vibrant, puis retombe en
     se brisant ; un grognement grave à l'attaque (sous-harmonique), le souffle dans les formants, deux échos de forêt. Trois variantes :
     le hurlement proche, un plus lointain et plus aigu, et un DUO (un second loup répond un ton au-dessous).
   · `foret.chouette` — la hulotte : « hou… hou-hou-houuuu » (le chevrotement de la fin). · `foret.corbeau` — deux ou trois « kraa ».
   · `foret.oiseau` — des phrases de passereaux (merle, rouge-gorge, pinson) : des glissés rapides 2-5 kHz, quatre variantes.
   · `foret.abeille` — l'abeille qui frôle la caisse : le bourdonnement qui passe (Doppler, d'une oreille à l'autre).
   · `foret.pic` — le pic qui tambourine sur un tronc creux. · `foret.craque` — une branche qui casse puis grince (la nuit).
   · `foret.jourAmb` / `foret.nuitAmb` — deux BOUCLES très discrètes (−14 dB sous les autres ambiances) : le feuillage qui respire le
     jour, le vent grave qui gémit la nuit. ⚠ Rien au-dessus de ~2 kHz en continu : le souffle de la mer de nuages, 11-26 dB au-dessus
     de la musique dans les aigus, était le « son parasite » de Léo (2026-10-08). */
const D=G.CCSON_D,O=G.CCSON_OUTILS,osc=O.osc,bruit=O.bruit,cloche=O.cloche,clic=O.clic,TAU=Math.PI*2;
// LA VOIX À FORMANTS : f(t) la hauteur, F(t) → [[fréquence, largeur, gain]×3] les résonances, a(t) l'enveloppe ; harmoniques jusqu'à 5,5 kHz
function voix(b,t0,dur,f,F,a,o){o=o||{};const sr=b.sr,i0=Math.round(t0*sr),n=Math.min(b.n-i0,Math.round(dur*sr)),pan=o.pan||0,P=[Math.cos((pan+1)*Math.PI/4),Math.sin((pan+1)*Math.PI/4)];
  let ph=0,ph2=0;const NH=28,W=new Float32Array(NH+1);
  for(let i=0;i<n;i++){const t=i/sr,fr=f(t),av=a(t);ph+=fr/sr;if(ph>1)ph-=1;ph2+=fr*.5/sr;if(ph2>1)ph2-=1;
    if((i&31)===0){const R9=F(t);for(let k=1;k<=NH;k++){const fk=k*fr;if(fk>5500){W[k]=0;continue;}let g=0;for(const r of R9){const x=(fk-r[0])/r[1];g+=r[2]/(1+x*x);}W[k]=g/Math.sqrt(k);}}
    let s=0;for(let k=1;k<=NH;k++)if(W[k])s+=W[k]*Math.sin(TAU*k*ph);
    if(o.grogne){const gg=o.grogne(t);if(gg>0)s+=gg*Math.sin(TAU*ph2)*(.6+.4*Math.sin(TAU*31*t));}
    const x=s*av*(o.v||.2),k9=i0+i;if(b.R){b.L[k9]+=x*P[0];b.R[k9]+=x*P[1];}else b.L[k9]+=x;}}
function lisse(a,b,t){t=Math.max(0,Math.min(1,t));t=t*t*(3-2*t);return a+(b-a)*t;}
// UN HURLEMENT : départ f0, sommet f1 (atteint en `mo` s), tenue jusqu'à `te`, chute vers fe jusqu'à `dur`
function hurle(b,R,t0,dur,f0,f1,fe,mo,te,v,pan){
  const vib=5+R()*1.5,jit=R()*6;
  const f=t=>{let x;if(t<mo)x=lisse(f0,f1,t/mo);else if(t<te)x=f1*(1+.06*(t-mo)/(te-mo));else x=lisse(f1*1.06,fe,(t-te)/(dur-te));
    const vk=Math.min(1,Math.max(0,(t-mo*.8)/.5))*(1-.5*Math.max(0,(t-te)/(dur-te)));return x*(1+.016*vk*Math.sin(TAU*vib*t+jit)+.004*Math.sin(TAU*1.7*t));};
  const F=t=>{const u=t<mo?t/mo:t<te?1:1-(t-te)/(dur-te),k=Math.max(0,Math.min(1,u));   // « ou » → « a » → « ou »
    return [[lisse(330,720,k),90,1],[lisse(780,1180,k),130,.55],[lisse(2350,2650,k),260,.18]];};
  const a=t=>Math.min(1,t/.22)*(t>dur-.9?Math.max(0,(dur-t)/.9):1)*(1+.08*Math.sin(TAU*3.1*t));
  voix(b,t0,dur,f,F,a,{v:v,pan:pan,grogne:t=>t<.45?.5*(1-t/.45):0});
  bruit(b,{c:'r',t0:t0+.05,a:.2,h:dur-1.2,d:.8,v:.035*v/.2,ft:'bp',f:900,q:2.2,pan:pan},R);} // le souffle
D('foret.loup',{fam:'foret',bus:'amb',dur:5.2,st:1,v:3,db:+3,max:1,cd:2,rj:.02,dit:'LE LOUP-GAROU HURLE (la nuit, quand il se dresse sur son rocher) : voix à formants qui monte d’une octave, vibre, retombe en se brisant ; échos de forêt',
  r:function(b,R,o){const k=o.v;
    if(k===0)hurle(b,R,0,3.9,215,440,250,.42,2.7,.22,-.1);
    else if(k===1){hurle(b,R,0,3.3,260,520,320,.36,2.3,.16,.25);O.filtre(b,'lp',2600,.7);} // plus loin, plus aigu
    else{hurle(b,R,0,3.7,205,420,240,.4,2.6,.2,-.3);hurle(b,R,.85,3.4,185,375,220,.45,2.4,.13,.45);} // le DUO : un second loup répond
    O.echo(b,.21,.32,1,true);O.echo(b,.47,.18,1,true);O.versStereo(b,.5,R);}});
D('foret.chouette',{fam:'foret',bus:'amb',dur:2.6,st:1,v:2,db:-2,max:1,cd:1,dit:'la HULOTTE (la nuit) : « hou… hou-hou-houuuu », le chevrotement à la fin',
  r:function(b,R,o){const f0=o.v?410:385,p=R()*1.2-.6;
    osc(b,{f:f0*1.03,f1:f0,g:.08,t0:0,a:.04,h:.18,d:.18,v:.42,pan:p});
    osc(b,{f:f0*1.02,f1:f0*.99,g:.05,t0:.95,a:.02,h:.04,d:.08,v:.3,pan:p});
    osc(b,{f:f0*1.04,f1:f0*.95,g:.9,t0:1.12,a:.03,h:.65,d:.35,v:.4,pan:p,vib:[13,.022]});
    O.filtre(b,'lp',1400,.7);O.echo(b,.29,.25,1,true);O.versStereo(b,.4,R);}});
D('foret.corbeau',{fam:'foret',bus:'amb',dur:1.6,st:1,v:2,db:-4,max:1,cd:1,dit:'le CORBEAU : deux ou trois « kraa » rauques',
  r:function(b,R,o){const n=2+o.v,p=R()*1.4-.7;
    for(let k=0;k<n;k++){const t=k*(.36+R()*.08),f0=520+R()*60;
      voix(b,t,.26,u=>f0*(1-.18*u/.26)*(1+.05*Math.sin(TAU*47*u)),u=>[[1150,260,1],[1900,320,.7],[3000,420,.3]],u=>Math.min(1,u/.02)*Math.max(0,1-u/.26),{v:.22,pan:p});
      bruit(b,{c:'b',t0:t,a:.01,d:.22,v:.10,ft:'bp',f:1600,q:1.6,pan:p},R);}
    O.echo(b,.24,.22,1,true);}});
D('foret.oiseau',{fam:'foret',bus:'amb',dur:1.8,st:1,v:4,db:-6,max:2,cd:.6,dit:'un PASSEREAU (le jour) : une phrase de glissés rapides 2-5 kHz — merle, rouge-gorge, pinson',
  r:function(b,R,o){const p=R()*1.6-.8,k=o.v;let t=0;
    const n=k===0?6:k===1?9:k===2?5:7;
    for(let i=0;i<n;i++){let f0,f1,d;
      if(k===0){f0=1800+R()*900;f1=f0*(R()<.5?1.4:.75);d=.12+R()*.08;}           // merle : flûté, plus grave
      else if(k===1){f0=3200+R()*1600;f1=f0*(.7+R()*.6);d=.05+R()*.05;}           // rouge-gorge : perlé, aigu
      else if(k===2){f0=4200-i*380;f1=f0*.85;d=.07;}                               // pinson : la cascade qui descend
      else{f0=2600+R()*1200;f1=f0*1.6;d=.06+R()*.04;}
      osc(b,{f:f0,f1:f1,g:d*.8,t0:t,a:.006,h:d*.4,d:d*.6,v:.22,pan:p,fm:{r:2,i:.12,d:.05}});
      t+=d+.03+R()*.06;}
    if(k===2){osc(b,{f:2600,f1:4800,g:.09,t0:t,a:.004,d:.12,v:.2,pan:p});}
    O.filtre(b,'lp',6500,.7);O.echo(b,.17,.2,1,true);}});
D('foret.pic',{fam:'foret',bus:'amb',dur:1.4,st:1,v:2,db:-5,max:1,cd:2,dit:'le PIC qui tambourine sur un tronc creux (le jour)',
  r:function(b,R,o){const p=R()*1.4-.7,n=14+((R()*6)|0);let t=0;
    for(let i=0;i<n;i++){const u=i/n,dt=.052-.012*Math.sin(u*Math.PI);
      clic(b,{t0:t,f:2200,d:.004,v:.35*(1-u*.4),pan:p},R);
      osc(b,{f:620+R()*30,f1:540,g:.02,t0:t,a:.0006,d:.035,v:.25*(1-u*.35),pan:p});
      bruit(b,{c:'r',t0:t,a:.0006,d:.025,v:.12,ft:'bp',f:1300,q:2,pan:p},R);t+=dt;}
    O.echo(b,.13,.25,1,true);}});
D('foret.craque',{fam:'foret',bus:'amb',dur:1.2,st:1,v:2,db:-4,max:1,cd:1,dit:'une BRANCHE qui casse dans le noir, puis le bois qui grince',
  r:function(b,R,o){const p=R()*1.6-.8;
    clic(b,{t0:0,f:2600,d:.008,v:.6,pan:p},R);bruit(b,{c:'b',t0:0,a:.0008,d:.09,v:.35,ft:'bp',f:2100,q:1.3,pan:p},R);
    for(let k=0;k<4;k++)clic(b,{t0:.03+R()*.12,f:1800+R()*1500,d:.004,v:.25,pan:p},R);
    osc(b,{f:o.v?150:120,f1:o.v?95:70,g:.6,gc:.7,w:'saw',t0:.25,a:.08,h:.25,d:.3,v:.07,pan:p,flt:['bp',500,350,.6,6]});
    O.echo(b,.31,.3,1,true);O.versStereo(b,.4,R);}});
/* (2026-10-20, Léo : « les abeilles n'ont pas de son ») `foret.abeille` — L'ABEILLE QUI FRÔLE LA CAISSE (dbgAbeilles, à < 10 m) : un bourdonnement
   qui PASSE — le battement d'ailes (fondamentale ~230 Hz, harmoniques en 1/k, un « nez » vers 1,1 kHz), l'effet Doppler (plus aigu quand elle
   arrive, plus grave quand elle s'éloigne), le volume qui gonfle puis s'efface, et le côté qui glisse d'une oreille à l'autre. Les ailes
   hésitent (deux vibratos lents) : jamais un moteur. Deux variantes : l'ouvrière et le BOURDON (grave, plus lent). Cuite en PCM (pas de ffmpeg sur le Mac de Léo) : la prochaine
   cuisson complète avec ffmpeg la repassera en MP3, trois fois plus légère. */
D('foret.abeille',{fam:'foret',bus:'amb',dur:1.7,st:1,v:2,db:-7,max:1,cd:1.2,dit:'une ABEILLE qui frôle la caisse dans la forêt : le bourdonnement qui passe d’une oreille à l’autre (Doppler)',
  r:function(b,R,o){const sr=b.sr,k=o.v,f0=k===1?150+R()*15:225+R()*20,du=k===1?1.6:1.4,n=Math.min(b.n,Math.round(du*sr)),
      cote=R()<.5?-1:1,v1=4+R()*3,v2=9+R()*4,p1=R()*TAU,p2=R()*TAU,NH=14;let ph=0;
    for(let i=0;i<n;i++){const t=i/sr,u=t/du,x=(u-.5)*2;
      const am=Math.sin(Math.PI*u)*(1/(1+x*x*2.4)),f=f0*(1-.055*Math.tanh(2.6*x))*(1+.018*Math.sin(TAU*v1*t+p1)+.009*Math.sin(TAU*v2*t+p2));
      ph+=f/sr;ph-=Math.floor(ph);
      let s9=0;for(let h=1;h<=NH;h++){const fh=h*f,nez=1+1.6/(1+((fh-1100)/450)*((fh-1100)/450));s9+=Math.sin(TAU*h*ph)*nez/h;}
      s9*=am*.16*(.85+.15*Math.sin(TAU*f*.5*t));
      const pan=cote*Math.tanh(2.2*x)*.85,a=(pan+1)*Math.PI/4;b.L[i]+=s9*Math.cos(a);if(b.R)b.R[i]+=s9*Math.sin(a);}
    O.filtre(b,'hp',90,.7);O.filtre(b,'lp',3600,.7);O.echo(b,.11,.18,.5,true);}});
D('foret.jourAmb',{fam:'foret',bus:'amb',dur:9,st:1,db:-14,max:1,cd:1,dit:'la FORÊT LE JOUR (boucle, très bas) : le feuillage qui respire au vent, des oiseaux très loin',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.001,h:9,d:.001,v:.16,ft:'bp',f:700,q:.6,am:[.13,.6],pan:-.3},R);
    bruit(b,{c:'r',t0:0,a:.001,h:9,d:.001,v:.12,ft:'bp',f:1100,q:.7,am:[.21,.55],pan:.35},R);
    for(let k=0;k<5;k++){const t=.5+R()*7.5,f0=2400+R()*1500;osc(b,{f:f0,f1:f0*(R()<.5?1.3:.8),g:.08,t0:t,a:.01,h:.03,d:.08,v:.03,pan:R()*1.6-.8});}
    O.filtre(b,'lp',2200,.7);O.boucle(b,.6);}});
D('foret.nuitAmb',{fam:'foret',bus:'amb',dur:9,st:1,db:-14,max:1,cd:1,dit:'la FORÊT LA NUIT (boucle, très bas) : le vent grave qui gémit entre les troncs',
  r:function(b,R,o){bruit(b,{c:'n',t0:0,a:.001,h:9,d:.001,v:.35,ft:'lp',f:260,am:[.11,.55],pan:-.2},R);
    bruit(b,{c:'r',t0:0,a:.001,h:9,d:.001,v:.05,ft:'bp',f:300,f1:420,g:9,q:7,am:[.17,.7],pan:.3},R);   // le gémissement
    bruit(b,{c:'r',t0:0,a:.001,h:9,d:.001,v:.04,ft:'bp',f:470,f1:330,g:9,q:7,am:[.07,.8],pan:-.4},R);
    O.filtre(b,'lp',1200,.7);O.boucle(b,.6);}});
})(typeof window!=='undefined'?window:globalThis);
/* <<<FIN FORET>>> */
/* <<<BANQUISE>>> */
(function(G){
'use strict';
/* LES VOIX DE LA BANQUISE (2026-10-14, Sacha : « on peut faire des traces dans la poudreuse en frôlant le sol… glisser de manière ultra
   stylée sur les lacs gelés et les pics de glace »). Joués par banqVolFx / banqTouche / banqPlouf / banqSons (index.html). Aucune voix.
   · `banq.glisse` — LA GLISSE SUR LA GLACE (boucle) : le chuintement des patins (bruit rose en bande 1,4-2 kHz, haché par la glace),
     le grondement de la caisse sur le lac, des cristaux qui crépitent. Le jeu en règle le gain et la vitesse sur l'élan.
   · `banq.poudre` — LA POUDREUSE (boucle) : le souffle rond de la neige qui gicle (bruit brun et rose, sous 1,2 kHz), des bouffées.
   · `banq.plouf` — l'entrée dans la poudreuse : un « POUF » sourd, la neige qui retombe en pluie fine.
   · `banq.craque` — la glace touchée : le CLAC, puis le « PIOU » dispersif des lacs gelés (l'onde qui file dans la plaque : un sifflement
     qui descend très vite), un écho grave.
   · `banq.chant` — LE CHANT DES LACS GELÉS (la nuit, au loin) : de longs « piouuu » qui roulent sous la plaque, l'écho de la vallée.
   · `banq.vent` — LE VENT DE LA MONTAGNE (boucle, bas) : le souffle grave, un sifflement d'arête qui monte et descend.
   ⚠ Rien d'aigu en continu au-dessus de ~2 kHz : la leçon du « son parasite » des nuages (2026-10-08). */
const D=G.CCSON_D,O=G.CCSON_OUTILS,osc=O.osc,bruit=O.bruit,cloche=O.cloche,clic=O.clic;
// le « PIOU » d'une plaque de glace : l'onde de flexion est DISPERSIVE (les aigus arrivent d'abord) — un sifflement qui tombe en exponentielle
function piou(b,t0,f0,f1,dur,v,pan){osc(b,{f:f0,f1:f1,g:dur,gc:.45,t0:t0,a:.002,h:dur*.15,d:dur*.85,v:v,pan:pan});osc(b,{f:f0*1.5,f1:f1*1.2,g:dur*.7,gc:.45,t0:t0+.004,a:.002,d:dur*.5,v:v*.3,pan:pan});}
D('banq.glisse',{fam:'banquise',dur:3.4,st:1,db:-6,max:1,cd:.3,dit:'LA GLISSE SUR LA GLACE (boucle) : le chuintement des patins, le grondement du lac, des cristaux qui crépitent',
  r:function(b,R){bruit(b,{c:'r',t0:0,a:.001,h:3.4,d:.001,v:.34,ft:'bp',f:1650,q:.9,am:[13,.45],pan:-.15},R);
    bruit(b,{c:'r',t0:0,a:.001,h:3.4,d:.001,v:.22,ft:'bp',f:1150,q:1.1,am:[7.3,.5],pan:.2},R);
    bruit(b,{c:'n',t0:0,a:.001,h:3.4,d:.001,v:.30,ft:'lp',f:160,am:[2.1,.35]},R);                 // le lac qui gronde sous la caisse
    for(let k=0;k<44;k++)clic(b,{t0:R()*3.3,f:1900+R()*900,d:.004,v:.05+R()*.06,pan:R()*1.4-.7},R); // les cristaux
    O.filtre(b,'lp',2600,.7);O.boucle(b,.4);}});
D('banq.poudre',{fam:'banquise',dur:3.4,st:1,db:-5,max:1,cd:.3,dit:'LA POUDREUSE (boucle) : le souffle rond de la neige qui gicle, des bouffées',
  r:function(b,R){bruit(b,{c:'n',t0:0,a:.001,h:3.4,d:.001,v:.55,ft:'lp',f:520,am:[5.2,.45],pan:-.2},R);
    bruit(b,{c:'r',t0:0,a:.001,h:3.4,d:.001,v:.22,ft:'bp',f:850,q:.7,am:[3.1,.6],pan:.25},R);
    for(let k=0;k<9;k++){const t=R()*3.1;bruit(b,{c:'r',t0:t,a:.04,d:.35,v:.18,ft:'bp',f:600+R()*500,q:.8,pan:R()*1.2-.6},R);}
    O.filtre(b,'lp',1300,.7);O.boucle(b,.4);}});
D('banq.plouf',{fam:'banquise',dur:1.2,st:1,v:2,db:-3,max:2,cd:.15,dit:'L’ENTRÉE DANS LA POUDREUSE : un « POUF » sourd, la neige qui retombe en pluie fine',
  r:function(b,R,o){osc(b,{f:o.v?78:66,f1:38,g:.25,t0:0,a:.004,d:.32,v:.55});
    bruit(b,{c:'n',t0:0,a:.004,d:.45,v:.7,ft:'lp',f:900,f1:300,g:.4},R);
    bruit(b,{c:'r',t0:.01,a:.01,d:.5,v:.25,ft:'bp',f:1300,q:.7},R);
    bruit(b,{c:'r',t0:.18,a:.08,h:.1,d:.6,v:.06,ft:'bp',f:2000,q:.9,am:[23,.6]},R);               // la pluie de neige qui retombe
    O.versStereo(b,.5,R);}});
D('banq.craque',{fam:'banquise',dur:1.6,st:1,v:3,db:-3,max:2,cd:.12,dit:'LA GLACE TOUCHÉE : le CLAC, puis le « PIOU » dispersif des lacs gelés, un écho grave',
  r:function(b,R,o){const p=R()*.6-.3;
    clic(b,{t0:0,f:3200,d:.006,v:.55,pan:p},R);bruit(b,{c:'b',t0:0,a:.0006,d:.07,v:.32,ft:'bp',f:2400,q:1.2,pan:p},R);
    for(let k=0;k<3+o.v;k++)clic(b,{t0:.01+R()*.09,f:2200+R()*1600,d:.004,v:.18,pan:p},R);
    piou(b,.02,2300+o.v*300,260,.42+.1*o.v,.20,p);piou(b,.12+R()*.1,1700,190,.5,.10,-p);
    osc(b,{f:55,f1:40,g:.4,t0:0,a:.003,d:.45,v:.35});
    O.echo(b,.19,.28,1,true);O.versStereo(b,.4,R);}});
D('banq.chant',{fam:'banquise',bus:'amb',dur:3.6,st:1,v:3,db:-4,max:1,cd:2,dit:'LE CHANT DES LACS GELÉS (la nuit, au loin) : de longs « piouuu » qui roulent sous la plaque, l’écho de la vallée',
  r:function(b,R,o){const p=R()*1.4-.7;let t=0;const n=2+o.v;
    for(let k=0;k<n;k++){piou(b,t,1400+R()*900,150+R()*80,.7+R()*.5,.14,p+(R()-.5)*.3);t+=.25+R()*.55;}
    osc(b,{f:48,f1:36,g:1,t0:.05,a:.05,d:1.2,v:.18});
    O.filtre(b,'lp',3000,.7);O.echo(b,.33,.4,1,true);O.echo(b,.71,.22,1,true);O.versStereo(b,.6,R);}});
D('banq.vent',{fam:'banquise',bus:'amb',dur:9,st:1,db:-12,max:1,cd:1,dit:'LE VENT DE LA MONTAGNE (boucle, bas) : le souffle grave, un sifflement d’arête qui monte et descend',
  r:function(b,R){bruit(b,{c:'n',t0:0,a:.001,h:9,d:.001,v:.42,ft:'lp',f:300,am:[.11,.55],pan:-.25},R);
    bruit(b,{c:'r',t0:0,a:.001,h:9,d:.001,v:.06,ft:'bp',f:520,f1:760,g:9,q:6,am:[.13,.75],pan:.35},R);   // le sifflement d'arête
    bruit(b,{c:'r',t0:0,a:.001,h:9,d:.001,v:.05,ft:'bp',f:880,f1:610,g:9,q:6,am:[.07,.8],pan:-.4},R);
    O.filtre(b,'lp',1400,.7);O.boucle(b,.6);}});
})(typeof window!=='undefined'?window:globalThis);
/* <<<FIN BANQUISE>>> */
/* <<<VOLCAN>>> */
(function(G){
'use strict';
/* LES VOIX DU ROYAUME DE FEU (2026-10-14, Sacha : « il faut qu'il se passe des choses cool… une ambiance… bien travaillée »). Jouées par
   vlcEruption / vlcSons / vlcEruptTick (index.html), sur le bus d'AMBIANCE. Aucune voix humaine (SANS_VOIX) : de la roche, du feu, du gaz.
   · `volcan.eruption` — LE CRATÈRE QUI CRACHE : un coup de canon grave (sub qui plonge de 55 à 28 Hz), le souffle de l'explosion, une pluie de
     pierres qui crépite et cogne, puis le grondement qui roule longtemps. Deux variantes.
   · `volcan.gronde` — LA MONTAGNE QUI GRONDE (entre deux éruptions) : un roulement brun qui enfle et s'éteint, un sub qui tremble.
   · `volcan.geyser` — UN HORNITO QUI CRACHE : un souffle de gaz qui monte (300 → 1300 Hz), des éclats de lave qui pétillent.
   · `volcan.lave` — LA LAVE QUI BULLE (et les bombes qui tombent dans les lacs) : un « bloup » grave et épais, une bulle qui crève.
   · `volcan.amb` — LA BOUCLE (très bas, −14 dB) : le feu sourd des lacs, des crépitements épars. ⚠ Rien d'aigu en continu (le « son
     parasite » de Léo, 2026-10-08) : tout le souffle est sous 1,6 kHz. */
const D=G.CCSON_D,O=G.CCSON_OUTILS,osc=O.osc,bruit=O.bruit,clic=O.clic;
D('volcan.eruption',{fam:'volcan',bus:'amb',dur:6.5,st:1,v:2,db:+4,max:1,cd:3,rj:.03,dit:'L’ÉRUPTION : le coup de canon du cratère, le souffle, la pluie de pierres qui crépite, le grondement qui roule',
  r:function(b,R,o){const k=o.v,p=R()*.6-.3;
    osc(b,{f:k?50:58,f1:k?26:30,g:.7,gc:.6,t0:0,a:.006,h:.12,d:2.4,v:.9,pan:p});                      // le SUB qui plonge
    osc(b,{f:96,f1:42,g:.25,t0:0,a:.003,d:.7,v:.5,pan:p});                                             // le coup
    bruit(b,{c:'n',t0:0,a:.004,h:.18,d:1.9,v:.95,ft:'lp',f:1100,f1:170,g:1.3,pan:p},R);                // le souffle
    bruit(b,{c:'r',t0:0,a:.002,d:.45,v:.4,ft:'bp',f:1700,q:.6,pan:p},R);                               // l'éclat
    for(let i=0;i<46;i++){const t=.25+Math.pow(R(),1.6)*4.2,pn=R()*1.8-.9,v9=.22*(1-(t-.25)/4.5);     // les PIERRES qui retombent
      clic(b,{t0:t,f:1400+R()*2600,d:.006+R()*.01,v:v9,pan:pn},R);
      if(R()<.4)osc(b,{f:70+R()*60,f1:45,g:.08,t0:t,a:.002,d:.14,v:v9*1.6,pan:pn});}
    bruit(b,{c:'n',t0:.35,a:.7,h:1.6,d:3.2,v:.6,ft:'lp',f:150,am:[3.1,.35],pan:-p},R);                 // le GRONDEMENT qui roule
    O.sature(b,1.25);O.filtre(b,'lp',5200,.7);O.echo(b,.23,.28,1,true);O.versStereo(b,.5,R);}});
D('volcan.gronde',{fam:'volcan',bus:'amb',dur:4.4,st:1,v:3,db:0,max:1,cd:2,rj:.04,dit:'LA MONTAGNE GRONDE : un roulement brun qui enfle et s’éteint, un sub qui tremble',
  r:function(b,R,o){const p=R()*1.2-.6,f0=30+o.v*3;
    bruit(b,{c:'n',t0:0,a:1.3,h:.8,d:2.6,v:.85,ft:'lp',f:85,f1:135,g:3,am:[2.2+o.v*.7,.45],pan:p},R);
    osc(b,{f:f0,f1:f0*.85,g:4,t0:.2,a:1,h:1,d:2.2,v:.5,pan:p,vib:[2.3,.06]});
    for(let i=0;i<6;i++)clic(b,{t0:1+R()*2.2,f:900+R()*1200,d:.01,v:.06,pan:R()*1.6-.8},R);
    O.filtre(b,'lp',900,.7);O.versStereo(b,.6,R);}});
D('volcan.geyser',{fam:'volcan',bus:'amb',dur:2.6,st:1,v:3,db:-2,max:2,cd:.6,rj:.05,dit:'UN GEYSER DE LAVE : le gaz qui siffle en montant, les éclats qui pétillent, le coup sourd du départ',
  r:function(b,R,o){const p=R()*1.2-.6;
    osc(b,{f:84,f1:44,g:.3,t0:0,a:.004,d:.35,v:.45,pan:p});
    bruit(b,{c:'r',t0:0,a:.07,h:.55+o.v*.1,d:1.3,v:.6,ft:'bp',f:360,f1:1250,g:.55,q:1.1,pan:p},R);
    bruit(b,{c:'n',t0:0,a:.05,h:.5,d:1.1,v:.45,ft:'lp',f:420,pan:p},R);
    for(let i=0;i<26;i++){const t=.05+R()*1.7;clic(b,{t0:t,f:1600+R()*2400,d:.004+R()*.006,v:.16*(1-t/2),pan:p+R()*.6-.3},R);}
    O.filtre(b,'lp',5500,.7);O.echo(b,.17,.2,1,true);}});
D('volcan.lave',{fam:'volcan',bus:'amb',dur:1.1,st:1,v:4,db:-6,max:2,cd:.3,rj:.06,dit:'LA LAVE BULLE : un « bloup » grave et épais, une bulle qui crève',
  r:function(b,R,o){const p=R()*1.4-.7,f0=120+o.v*18;
    osc(b,{f:f0,f1:f0*.42,g:.14,gc:.7,t0:0,a:.012,h:.02,d:.28,v:.5,pan:p});
    osc(b,{f:f0*.8,f1:f0*.36,g:.12,t0:.22+R()*.08,a:.01,h:.01,d:.22,v:.32,pan:p});
    bruit(b,{c:'n',t0:.02,a:.004,d:.1,v:.35,ft:'lp',f:420,pan:p},R);
    clic(b,{t0:.3+R()*.1,f:700,d:.01,v:.12,ft:'bp',pan:p},R);
    O.filtre(b,'lp',1600,.7);O.echo(b,.11,.2,1,true);}});
D('volcan.amb',{fam:'volcan',bus:'amb',dur:9,st:1,db:-14,max:1,cd:1,dit:'LE ROYAUME DE FEU (boucle, très bas) : le feu sourd des lacs, des crépitements épars',
  r:function(b,R,o){bruit(b,{c:'n',t0:0,a:.001,h:9,d:.001,v:.42,ft:'lp',f:150,am:[.09,.5],pan:-.25},R);
    bruit(b,{c:'r',t0:0,a:.001,h:9,d:.001,v:.05,ft:'bp',f:260,q:1.5,am:[.13,.6],pan:.3},R);
    for(let i=0;i<20;i++)clic(b,{t0:.3+R()*8.2,f:1500+R()*2000,d:.006,v:.05,pan:R()*1.6-.8},R);
    for(let i=0;i<4;i++){const t=.5+R()*7.5,f0=90+R()*50;osc(b,{f:f0,f1:f0*.5,g:.15,t0:t,a:.01,d:.25,v:.12,pan:R()*1.4-.7});}
    O.filtre(b,'lp',1600,.7);O.boucle(b,.6);}});
})(typeof window!=='undefined'?window:globalThis);
/* <<<FIN VOLCAN>>> */
/* <<<AILES>>> */
(function(G){
'use strict';
/* LES GESTES DES AILES ONT LEUR SON (2026-10-16, session SON des ailes — Sacha, en commandant LES AILES VIVANTES : « les ailes X-Wing, quand
   tu boostes, elles doivent s'ouvrir comme dans le vrai jeu Star Wars ; les ailes de dragon, elles doivent battre, celles de pigeon et tout »).
   Joués par les bâtisseurs de AILES_POP (index.html, `ailSon`) EN VOL seulement : ni à la vitrine du garage, ni à la photo de la boutique.
   · `ailes.xwing` — LES PLANS SE VERROUILLENT EN X (au boost) : joué à l'image où `clac` passe à 1. Le K-CHAK du verrou (le pêne, puis la
     butée 7 ms après), la MASSE des plans qui s'arrête (un doum court, saturé : son corps à 200-500 Hz), la tôle qui sonne, le FRISSON des
     plans (un cliquetis à ~15 Hz qui s'éteint en 0,2 s, comme `clac*.03*sin(t*95)`), la pression qui s'équilibre (« tss »), le servo qui s'arrête.
   · `ailes.xwingFerme` — LES PLANS SE REFERMENT (0,45 s après le boost) : joué quand le verrou lâche (`cib` → 0). Le « tchk », le servo et la
     pression qui s'échappe pendant la course, puis le TONK des plans qui se reposent l'un sur l'autre à +0,15 s (le ressort : mesuré 0,13 à
     0,17 s de 30 à 120 images/s).
   · `ailes.dragon` — UN COUP D'AILE (à chaque descente, quand `ailBat` passe sous 0, au plus vite du coup) : le WOUF de l'air chassé (une bande
     rose 200-330 Hz + un souffle brun qui s'ouvre puis se referme), la poussée (un sinus grave saturé qui gonfle), la membrane de cuir qui
     frémit puis CLAQUE en se tendant au bas du coup. Fréquent (un coup toutes les 0,8 à 1,4 s) : discret, sous la pièce.
   · `ailes.pigeon` — IL SORT LES AILES : deux CLAPS au-dessus du dos à +0,155 s et +0,465 s (les crêtes de `clap`, voir AILES_POP.pigeon),
     le tchap des rémiges qui se frappent, le corps creux des deux ailes, les barbes qui froissent ; puis deux coups trop vite qui s'éteignent.
   ⚠ MONO (les deux ailes sont symétriques, derrière la caisse) et courts : sans ffmpeg sur le Mac, ils sont rangés en PCM (cuire.js PCM=1),
   chaque octet compte. Le grave a son énergie entre 150 et 500 Hz (la règle du DOUM, 15/10) : mesuré au passe-haut 200 Hz. */
const D=G.CCSON_D,O=G.CCSON_OUTILS,osc=O.osc,bruit=O.bruit,cloche=O.cloche,clic=O.clic,GR=G.CCSON_GRAVE;
function tole(b,R,t0,f,v,d){cloche(b,{f:f,r:[1,2.39,3.86,5.3,7.1],m:[1,.7,.5,.35,.25],d:[d,d*.7,d*.5,d*.35,d*.25],t0:t0,v:v,jit:.02},R);} // la plaque de métal (comme la PALETTE)
D('ailes.xwing',{fam:'ailes',bus:'fx',dur:.62,v:2,db:-1,max:1,cd:.2,rj:.015,dit:'LES AILES EN X SE VERROUILLENT (au boost, en vol) : le K-CHAK du verrou, la butée de métal, les plans qui vibrent, la pression qui siffle, le servo qui s’arrête',
  r:function(b,R,o){const k=o.v;
    clic(b,{t0:0,f:4200,d:.003,v:.8},R);bruit(b,{c:'b',t0:0,a:.0004,d:.03,v:.45,ft:'bp',f:3000+k*350,q:1.8},R);    // K : le pêne qui part
    clic(b,{t0:.007,f:1900,d:.006,v:.6,ft:'bp'},R);bruit(b,{c:'b',t0:.007,a:.0004,d:.035,v:.3,ft:'bp',f:1700,q:1.5},R); // CHAK : la butée
    GR.doum(b,R,.007,.55,100+k*10,58,.18,{corps:.05,fc:650,sat:2.8,lp:2600,toc:2300,vt:.3});                        // la MASSE des plans qui s'arrête net
    tole(b,R,.008,540+k*45,.2,.17);tole(b,R,.01,1310+k*70,.14,.09);tole(b,R,.009,2650+k*120,.06,.05);             // la tôle qui sonne un instant
    for(let i=0;i<6;i++)clic(b,{t0:.035+i*.033+R()*.004,f:2300+R()*1000,d:.003,v:.2*Math.pow(.68,i),ft:'bp'},R);   // le FRISSON des plans (≈ 15 Hz)
    bruit(b,{c:'r',t0:.018,a:.008,d:.2,v:.07,ft:'bp',f:4600,f1:2600,g:.18,q:1.6},R);                                 // « tss » : la pression qui s'équilibre
    osc(b,{f:900+k*60,f1:380,g:.13,gc:.7,w:'saw',t0:0,a:.002,d:.15,v:.045,flt:['lp',2400,700,.13,1.2]});           // le SERVO qui s'arrête
    O.filtre(b,'lp',7000,.7);}});
D('ailes.xwingFerme',{fam:'ailes',bus:'fx',dur:.5,v:2,db:-5,max:1,cd:.2,rj:.015,dit:'LES AILES EN X SE REFERMENT : le verrou qui lâche (tchk), le servo et la pression qui s’échappe, les plans qui se reposent l’un sur l’autre (tonk)',
  r:function(b,R,o){const k=o.v,T=.15; // T : la course des plans (le ressort de AILES_POP.xwing)
    clic(b,{t0:0,f:3000,d:.003,v:.35},R);bruit(b,{c:'b',t0:0,a:.0004,d:.014,v:.2,ft:'bp',f:2200,q:2},R);            // le verrou qui lâche
    bruit(b,{c:'r',t0:.004,a:.02,d:.22,v:.09,ft:'bp',f:2400,f1:1100,g:.16,q:1.3},R);                                 // « pfff » : la pression qui s'échappe
    osc(b,{f:470+k*30,f1:640,g:T,w:'saw',t0:.006,a:.015,h:T*.6,d:.05,v:.04,flt:['lp',1500,1500,T,1.1]});             // le SERVO pendant la course
    GR.doum(b,R,T,.4,120+k*10,72,.14,{corps:.04,fc:700,sat:2.2,lp:2200,toc:1700,vt:.25});                          // TONK : les plans se posent
    tole(b,R,T+.002,690+k*50,.09,.08);clic(b,{t0:T+.009,f:1500,d:.004,v:.18,ft:'bp'},R);                           // (et l'autre plan, juste après)
    O.filtre(b,'lp',6000,.7);}});
D('ailes.dragon',{fam:'ailes',bus:'fx',dur:.75,v:3,db:-7,max:2,cd:.25,rj:.03,dit:'UN COUP D’AILE DU DRAGON (à chaque descente) : le WOUF de l’air chassé, la poussée grave, la membrane de cuir qui frémit et claque en se tendant',
  r:function(b,R,o){const k=o.v,te=.12+k*.02;
    bruit(b,{c:'r',t0:0,a:.045,h:.02,d:.3,v:1.1,ft:'bp',f:200,f1:330+k*25,g:.06,q:.75},R);                           // L'AIR CHASSÉ : le corps, 200-330 Hz (ce que rend un téléphone)
    bruit(b,{c:'n',t0:0,a:.05,h:.03,d:.4,v:.7,ft:'lp',f:140,f1:560,g:.07,gc:.6,q:1.2,ft2:'hp',f2:150},R);           // …le souffle qui s'ouvre d'un coup (sans sa boue sous 150 Hz)
    bruit(b,{c:'n',t0:.08,a:.02,d:.35,v:.45,ft:'lp',f:560,f1:180,g:.3,gc:.7,q:1,ft2:'hp',f2:150},R);                // …et se referme
    {const t=O.Toile(b.sr,b.dur,false);osc(t,{f:68+k*5,f1:44,g:.3,t0:.01,a:.04,d:.32,v:.22});                        // LA POUSSÉE : un sinus grave qui gonfle,
      osc(t,{f:136+k*10,f1:92,g:.25,w:'tri',t0:.01,a:.04,d:.22,v:.3});O.sature(t,3);GR.mixe(b,t,.28,0);}             // saturé : ses harmoniques (150-400 Hz) passent au téléphone
    bruit(b,{c:'r',t0:.015,a:.03,d:.16,v:.45,ft:'bp',f:620,q:1.2,am:[38,.7]},R);                                     // LA MEMBRANE frémit pendant le coup
    bruit(b,{c:'b',t0:te,a:.002,d:.035,v:.55,ft:'bp',f:900+k*90,q:1.4},R);clic(b,{t0:te,f:700,d:.006,v:.3,ft:'bp'},R); // …et claque en se tendant, au bas du coup
    O.filtre(b,'lp',2400,.7);}});
D('ailes.pigeon',{fam:'ailes',bus:'fx',dur:.95,v:2,db:-3,max:1,cd:.5,rj:.03,dit:'LE PIGEON SORT LES AILES : deux CLAPS au-dessus du dos (le tchap des rémiges qui se frappent, les plumes qui froissent), puis le battement trop vite qui s’éteint',
  r:function(b,R,o){const k=o.v;
    const clap=function(t0,v){clic(b,{t0:t0,f:2300,d:.004,v:v*.55,ft:'bp'},R);                                       // le TCHAP des rémiges,
      bruit(b,{c:'b',t0:t0,a:.0006,d:.04,v:v*.5,ft:'bp',f:1250+k*120,q:.9},R);
      bruit(b,{c:'r',t0:t0,a:.0008,d:.07,v:v*.8,ft:'bp',f:480+k*40,q:1.2},R);                                         // le corps creux des deux ailes,
      bruit(b,{c:'r',t0:t0+.005,a:.004,d:.1,v:v*.12,ft:'bp',f:3400,q:1.1,am:[55,.6]},R);};                            // les barbes qui froissent
    const frou=function(t0,d,v,f){bruit(b,{c:'r',t0:t0,a:d*.5,d:d*.8,v:v,ft:'bp',f:f,q:.9,am:[24,.5]},R);};          // le froufrou d'un coup d'aile
    frou(.03,.12,.05,1100);clap(.155,1);frou(.24,.16,.07,950);clap(.465,.85);                                        // les deux claps, à l'image (clap = .62 dans AILES_POP.pigeon)
    frou(.62,.1,.06,1250);frou(.77,.09,.035,1150);                                                                    // il bat trop vite (6,5 coups/s), puis plane
    O.filtre(b,'lp',6500,.7);}});
   /* `ailes.air` (2026-10-18, Léo : SANS AILES) — LES BUSES À AIR COMPRIMÉ lâchent leur bouffée : à la sortie (toutes à la fois) et au boost
      (la poupe). La VANNE qui claque, le PSCHHT froid d'une bonbonne (un souffle aigu qui s'ouvre d'un coup puis s'étouffe), un corps sourd
      dessous. Pas de note : c'est de l'air. */
D('ailes.air',{fam:'ailes',bus:'fx',dur:.55,v:2,db:-4,max:1,cd:.15,rj:.03,dit:'SANS AILES : les buses à air comprimé lâchent leur bouffée — la vanne qui claque, le PSCHHT froid d’une bonbonne, le corps sourd du jet',
  r:function(b,R,o){const k=o.v;
    clic(b,{t0:.004,f:1900+k*150,d:.005,v:.38,ft:'bp'},R);                                                          // la VANNE,
    bruit(b,{c:'b',t0:.006,a:.004,d:.34,v:.5,ft:'hp',f:2400+k*250,f1:3600,g:.3,q:.7},R);                            // le jet froid, aigu, qui s'ouvre,
    bruit(b,{c:'b',t0:.008,a:.012,d:.24,v:.28,ft:'bp',f:5600,q:1.1,am:[31,.35]},R);                                 // son sifflement qui frémit,
    bruit(b,{c:'r',t0:.006,a:.006,d:.16,v:.45,ft:'bp',f:620+k*70,f1:380,g:.16,q:1},R);                              // le CORPS : la bouffée qui pousse
    O.filtre(b,'lp',9500,.7);}});
})(typeof window!=='undefined'?window:globalThis);
/* <<<FIN AILES>>> */
/* <<<RICHESSE>>> ================================================================================
   LA PLUIE DE RICHESSE, SES SONS À ELLE (2026-10-16, Léo : « redesign tout le sound design autour de ça ; Sacha a changé un truc, mon
   bail a disparu — fais le juste milieu pour que ce soit addictif »). Ce qui avait disparu : les pièces et le jackpot que la caisse
   crache quand on la TAPE à l'écran titre jouaient `piece`, `piece.recolte`, `fig.jackpot` — refaits le 15/10 par Sacha en « petit tchic
   grave » pour la COURSE (« trop de petits sons aigus quand on roule »). La course garde ses sons ; l'écran titre a désormais les siens.
   LE JUSTE MILIEU, mesurable : la note entre mi5 et mi6 (659-1 319 Hz : l'ancienne sonnette montait à mi7, 2,6 kHz ; le tchic tombait à
   mi4, 330 Hz), des pièces à la matière de vraie pièce (2,32 · 4,25) mais qui CHANTENT 0,25-0,35 s (le tchic : 0,13 s ; l'ancienne :
   0,45 s), la poussière d'or entre 3 et 5 kHz (l'ancienne : 7,5 kHz), et un corps doux une octave dessous qui donne du poids.
   L'ADDICTION, c'est la grammaire : le COUP monte d'un degré à chaque coup du combo (on sent la rafale qui chauffe), la gerbe PAIE
   par une cascade qui monte (petit → bon → gros → jackpot : plus de notes, plus haut, plus long), chaque MATIÈRE se reconnaît (le métal
   des pièces, le verre des vins, le cristal des gemmes, le souffle des fleurs) et les CŒURS qui éclatent un à un jouent une petite
   mélodie (chaque pop prend le degré suivant de la gamme : la nuée chante). Tout ce qui a une note est `key:1` (la tonalité du morceau).
   ⚠ Cuits en PCM (pas de ffmpeg sur ce Mac : `PCM=1 node atelier-son/cuire.js riche`) — d'où peu de variantes et du mono partout
   où la stéréo n'apporte rien : la banque ne prend que ~1 Mo. Une cuisson avec ffmpeg les repassera en MP3 d'elle-même. */
(function(G){
'use strict';
const D=G.CCSON_D,O=G.CCSON_OUTILS,osc=O.osc,bruit=O.bruit,cloche=O.cloche,corde=O.corde,clic=O.clic,pd=G.CCSON_pd;
const nE=function(st){return 329.6276*Math.pow(2,st/12);};
function piece(b,R,st,t0,v,pan,ch){ // LA PIÈCE DU JUSTE MILIEU : la prise (3,8 kHz, douce), la matière de vraie pièce qui chante un peu, le corps dessous
  ch=ch==null?1:ch;clic(b,{t0:t0,f:3800,d:.0018,v:.14*v,pan:pan},R);bruit(b,{c:'b',t0:t0,a:.0005,d:.016,v:.16*v,ft:'bp',f:3000,q:1.4,pan:pan},R);
  cloche(b,{f:nE(st),r:[1,2.32,4.25,2],m:[1,.34,.12,.16],d:[.3*ch,.13,.05,.18*ch],t0:t0+.002,v:.5*v,pan:pan,jit:.004},R);
  osc(b,{f:nE(st)*.5,w:'tri',t0:t0,a:.001,d:.09,v:.11*v,pan:pan});}
function or9(b,R,t0,dur,n,v){ // la poussière d'or, posée entre 3 et 5 kHz (l'ancienne sifflait à 7,5)
  for(let i=0;i<n;i++){const t=t0+Math.pow(R(),1.2)*dur,st=pd(15+Math.floor(R()*5));cloche(b,{f:nE(st),r:[1,2.76],m:[1,.15],d:[.16+R()*.14,.05],t0:t,v:v*(.5+R()*.5),pan:R()*1.6-.8},R);}}
function cascade(b,R,t0,degres,pas,v,ch){degres.forEach(function(dg,i){piece(b,R,pd(dg),t0+i*pas+(R()-.5)*.008,v*(.8+.2*i/degres.length),(i%2?.35:-.35)*(R()*.6+.4),ch);});}
function corps(b,t0,f0,f1,d,v){osc(b,{f:f0,f1:f1,g:d*.6,t0:t0,a:.002,d:d,v:v});osc(b,{f:f0*2,f1:f1*2,g:d*.6,t0:t0,a:.002,d:d*.55,v:v*.35});osc(b,{f:f0*3,f1:f1*3,g:d*.6,w:'tri',t0:t0,a:.002,d:d*.35,v:v*.12});} // le poids (lisible au téléphone : harmoniques 2-3)
function accord(b,R,notes,t0,a,d,v,fc){for(const st of notes){const f=nE(st);for(const dt of [-.004,.004])osc(b,{f:f*(1+dt),w:'saw',t0:t0,a:a,d:d,v:v/2,pan:dt*100,flt:['lp',fc||2600,(fc||2600)*.45,d,.7]});
  corde(b,{f:f,t0:t0,d:d*1.1,v:v*.35,br:.7,pan:(R()-.5)*.6},R);}}

// ---- LE COUP sur la caisse : la tôle qui encaisse, sourde et ronde (sans note : la note, c'est le combo)
D('riche.coup',{fam:'richesse',dur:.42,db:+1,max:4,cd:.03,v:2,rj:.02,vj:1.2,dit:'le COUP sur la caisse : la tôle qui encaisse — prise sèche, corps de bruit, « tonk » de carrosserie, poids',
  r:function(b,R){clic(b,{t0:0,f:2200,d:.01,v:.35},R);bruit(b,{c:'r',t0:0,a:.0008,d:.14,v:.45,ft:'lp',f:1300,q:.7},R);
    cloche(b,{f:170+R()*20,r:[1,2.39,3.86,5.3],m:[1,.55,.3,.15],d:[.22,.14,.08,.05],t0:.001,v:.32,jit:.03},R);corps(b,0,120,70,.2,.42);}});
// ---- LE COMBO : la note qui MONTE à chaque coup de la rafale (le jeu passe st = le degré du combo)
D('riche.combo',{fam:'richesse',dur:.5,key:1,db:-4,max:3,cd:.03,v:1,bases:[0,12],dit:'le COMBO : un « pling » qui monte d’un degré à chaque coup de la rafale (st)',
  r:function(b,R,o){const f=nE(12+o.base);clic(b,{t0:0,f:4200,d:.0015,v:.12},R);
    cloche(b,{f:f,r:[1,2,3.01],m:[1,.3,.1],d:[.38,.16,.06],t0:.001,v:.42,jit:.003},R);osc(b,{f:f*.5,w:'tri',t0:0,a:.002,d:.12,v:.1});}});
// ---- LA PIÈCE seule (« presque », la réplique)
D('riche.piece',{fam:'richesse',dur:.45,key:1,db:-4,max:6,cd:.02,v:2,rj:.004,vj:.8,bases:[0,12],dit:'une PIÈCE (juste milieu) : la matière de vraie pièce, en mi5, qui chante 0,3 s',
  r:function(b,R,o){piece(b,R,12+o.base,0,1,0);}});
// ---- LES GERBES : une cascade qui monte, plus longue et plus haut à chaque taille
D('riche.petit',{fam:'richesse',dur:.6,key:1,db:-3,max:2,cd:.08,v:2,grp:'r',prio:2,dit:'PETITE gerbe : deux pièces qui montent (mi5 → sol#5) et un froissement de billet',
  r:function(b,R){cascade(b,R,0,[5,7],.055,1,1);bruit(b,{c:'r',t0:.03,a:.01,d:.12,v:.08,ft:'bp',f:2600,q:1.5,am:[30,.6]},R);}});
D('riche.bon',{fam:'richesse',dur:.9,key:1,db:-2,max:2,cd:.1,v:2,grp:'r',prio:3,dit:'BONNE gerbe : quatre pièces en escalier (mi5 → mi6), un brin de poussière d’or',
  r:function(b,R){cascade(b,R,0,[5,6,7,8],.05,1,1);or9(b,R,.12,.4,4,.12);corps(b,0,110,82,.16,.2);}});
D('riche.gros',{fam:'richesse',dur:1.5,key:1,db:0,max:1,cd:.2,v:1,st:1,grp:'r',prio:4,dit:'GROSSE gerbe : six pièces qui grimpent jusqu’au si6, l’accord majeur qui s’épanouit, le poids dessous',
  r:function(b,R){cascade(b,R,0,[5,6,7,8,9,11],.045,1,1.1);accord(b,R,[12,16,19,24],.24,.008,.75,.16,2600);or9(b,R,.2,.7,8,.14);corps(b,.24,98,62,.35,.36);}});
D('riche.jackpot',{fam:'richesse',dur:2.6,key:1,db:+5,max:1,cd:1,st:1,grp:'r',prio:5,dit:'JACKPOT : la sonnette de la machine à sous (en mi6, plus en mi7), la fanfare, la pluie de pièces, trois DOUM qui montent',
  r:function(b,R){for(let k=0;k<10;k++){const t=k*.055;cloche(b,{f:nE(k%2?19:24),r:[1,2.76,5.4],m:[1,.32,.1],d:[.16,.06,.03],t0:t,v:.24,pan:k%2?.45:-.45},R);} // la sonnette qui s'affole, au juste milieu
    accord(b,R,[12,16,19,24],.56,.006,1.2,.2,3000);[[.56,0],[.7,4],[.86,7]].forEach(function(q,i){corps(b,q[0],(84-i*6)*Math.pow(2,q[1]/12),(50-i*4)*Math.pow(2,q[1]/12),.5,.3+i*.1);});
    for(let i=0;i<24;i++){const t=.6+Math.pow(R(),.85)*1.5;piece(b,R,pd(5+Math.floor(R()*6)),t,.35+R()*.4,R()*1.6-.8,.85);}
    or9(b,R,.7,1.6,16,.13);}});
// ---- LES MATIÈRES de la gerbe (une fois par gerbe, si elle en porte)
D('riche.gemme',{fam:'richesse',dur:.9,key:1,db:-7,max:2,cd:.15,v:1,dit:'les GEMMES : trois éclats de cristal, purs, qui se répondent dans l’aigu (si5-mi6-si6)',
  r:function(b,R){[[19,0,-.5],[24,.07,.5],[31,.15,0]].forEach(function(n){cloche(b,{f:nE(n[0])*(1+(R()-.5)*.003),r:[1,2.76,5.4,8.9],m:[1,.4,.18,.06],d:[.5,.22,.08,.04],t0:n[1],v:.3,pan:n[2]},R);});
    bruit(b,{c:'b',t0:0,a:.002,d:.25,v:.04,ft:'hp',f:4500,pan:-.4,pan1:.4},R);}});
D('riche.verre',{fam:'richesse',dur:.8,key:1,db:-6,max:2,cd:.15,v:1,dit:'le VERRE des vins : deux bouteilles qui trinquent (modes du verre 1 · 2 · 2,92), un tintement clair',
  r:function(b,R){[[0,-.3],[.06,.3]].forEach(function(q,i){clic(b,{t0:q[0],f:3400,d:.002,v:.16,pan:q[1]},R);
      cloche(b,{f:nE(i?19:16),r:[1,2,2.92,4.1],m:[1,.5,.25,.08],d:[.45,.25,.12,.05],t0:q[0]+.001,v:.34,pan:q[1],jit:.002},R);});}});
D('riche.bouchon',{fam:'richesse',dur:.5,db:-6,max:2,cd:.2,v:1,dit:'le BOUCHON qui saute : « POP » rond, une bulle qui monte, la mousse qui chuchote',
  r:function(b,R){clic(b,{t0:0,f:1600,d:.004,v:.3},R);osc(b,{f:420,f1:980,g:.03,gc:.5,t0:0,a:.0008,d:.06,v:.4});bruit(b,{c:'n',t0:0,a:.001,d:.04,v:.3,ft:'lp',f:900},R);
    bruit(b,{c:'b',t0:.05,a:.03,d:.3,v:.05,ft:'hp',f:5000,am:[38,.7]},R);}});
D('riche.fleurs',{fam:'richesse',dur:1,key:1,db:-8,max:2,cd:.2,v:1,dit:'les FLEURS : un souffle doux et trois notes de harpe qui montent (mi5 · sol#5 · si5)',
  r:function(b,R){bruit(b,{c:'r',t0:0,a:.06,d:.3,v:.07,ft:'bp',f:1400,f1:2400,g:.3,q:.9,pan:-.4,pan1:.4},R);
    [[12,.05],[16,.12],[19,.19]].forEach(function(n){corde(b,{f:nE(n[0]),t0:n[1],d:.7,v:.3,br:.55,pan:(R()-.5)*.8},R);});}});
// ---- LE CŒUR qui éclate : un « plop » de bulle rond, sa note (le jeu fait monter la gamme d'un pop à l'autre : la nuée chante)
D('riche.coeur',{fam:'richesse',dur:.35,key:1,db:-7,max:5,cd:.035,v:2,rj:.003,bases:[0,12],dit:'un CŒUR qui éclate : « plop » de bulle rond et sa petite note (st = le degré suivant de la gamme, pop après pop)',
  r:function(b,R,o){const f=nE(12+o.base);osc(b,{f:f*.62,f1:f*1.15,g:.035,gc:.5,t0:0,a:.0008,d:.06,v:.3});clic(b,{t0:.001,f:2600,d:.002,v:.1},R);
    cloche(b,{f:f,r:[1,2,3],m:[1,.22,.06],d:[.24,.09,.04],t0:.012,v:.34,jit:.002},R);}});
})(typeof window!=='undefined'?window:globalThis);
/* <<<FIN RICHESSE>>> */
