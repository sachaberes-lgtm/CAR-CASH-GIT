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
D('piece',{fam:'argent',dur:.55,key:1,db:-4,max:6,cd:.018,v:2,rj:.003,vj:.6,pre:1,bases:[0,12],dit:'une pièce : la note de la gamme du combo (st)',
  r:function(b,R,o){const f=nE(12+o.base);clic(b,{t0:0,f:6500,d:.002,v:.22},R);
    cloche(b,{f:f,r:[1,2,3.01,5.43],m:[1,.42,.2,.12],d:[.45,.2,.09,.05],t0:0,v:.5,jit:.003},R);
    osc(b,{f:f*.5,w:'tri',t0:0,a:.001,d:.07,v:.07});}});
D('piece.recolte',{fam:'argent',dur:.8,key:1,db:-5,max:2,cd:.1,st:1,dit:'la RÉCOLTE (toutes les 5 pièces) : quinte-octave en cascade + poussière',
  r:function(b,R){[24,31,36].forEach(function(st,i){cloche(b,{f:nE(st),r:[1,2,3.01],m:[1,.35,.12],d:[.5,.2,.08],t0:i*.045,v:.3,pan:(i-1)*.4},R);});
    bruit(b,{c:'b',t0:.03,a:.01,d:.3,v:.08,ft:'hp',f:7500,pan:-.5,pan1:.5},R);}});
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

/* ================================ LE VOL ET LES FIGURES (le STYLE : synthé néon) ================
   ⚠ UNE SEULE GAMME PAR VOL. Avant, cinq compteurs indépendants tiraient chacun la hauteur de SON côté (chaîne de vol,
   × d'aura, échelle d'argent, combo de pièces, palier de flow) : la « gamme qui monte » zigzaguait. Désormais le jeu
   tient UN compteur par vol (`ECH`, remis à zéro au décollage) et chaque figure prend le degré suivant de la
   pentatonique (`st`). La POSE résout la gamme sur la tonique : tension pendant le vol, résolution à l'atterrissage.
   Chaque figure garde sa MATIÈRE à elle par-dessus la note — on la reconnaît sans regarder. */
D('fig.maillon',{fam:'figures',dur:.6,key:1,db:-1,max:3,cd:.04,pre:1,bases:[0,12],grp:'r',prio:1,dit:'un maillon de chaîne en vol (la note monte à chaque figure : st)',
  r:function(b,R,o){pluck(b,R,nE(12+o.base),0,.55,.45,1);clic(b,{t0:0,f:4000,d:.004,v:.15},R);}});
D('fig.vrille',{fam:'figures',dur:.6,st:1,key:1,db:-1,max:3,cd:.05,v:2,pre:1,bases:[0,12],grp:'r',prio:1,dit:'un demi-tour de vrille : le souffle TOURNE autour de la caisse + la note',
  r:function(b,R,o){const s=o.v?1:-1;swish(b,R,0,.28,700,3600,.35,-.85*s,.85*s,1.4);pluck(b,R,nE(12+o.base),.03,.5,.4,1,.2*s);}});
D('fig.essoreuse',{fam:'figures',dur:1.3,st:1,key:1,db:+3,max:1,cd:.3,grp:'r',prio:3,dit:'720° et plus — ESSOREUSE COSMIQUE : tourbillon + accord de cuivres + coup',
  r:function(b,R,o){for(let k=0;k<3;k++)swish(b,R,k*.09,.3,600+k*400,4200,.3,k%2?.9:-.9,k%2?-.9:.9,1.4);
    stab(b,R,[12,19,24,28],.12,.12,.6,.16,1.2);grave(b,o,.12,90,40,.2,.4,.6);scintille(b,R,.15,.6,10,.1);}});
D('fig.meteore',{fam:'figures',dur:1,st:1,key:1,db:0,max:1,cd:.3,bases:[0,12],grp:'r',prio:2,dit:'MÉTÉORE (nitro tenue en l’air) : la flamme qui rugit + crépitements + la note',
  r:function(b,R,o){const nE=function(st){return 329.6276*Math.pow(2,(st+o.base)/12);};bruit(b,{c:'n',t0:0,a:.03,h:.05,d:.5,v:.7,ft:'lp',f:400,f1:2600,g:.2,q:.7},R);crepite(b,R,.02,.6,16,.35,500,2600);
    pluck(b,R,nE(12),.04,.45,.5,1.2);grave(b,o,0,80,45,.3,.4,.5);}});
D('fig.bigair',{fam:'figures',dur:1.1,st:1,key:1,db:0,max:1,cd:.3,bases:[0,12],grp:'r',prio:2,dit:'BIG AIR (1,8 s en l’air) : l’air qui se creuse + la note qui plane',
  r:function(b,R,o){const nE=function(st){return 329.6276*Math.pow(2,(st+o.base)/12);};swish(b,R,0,.5,300,1800,.3,-.3,.3,.9);nappe(b,R,[12+o.base,19+o.base],0,.12,.1,.7,.07,2600);cloche(b,{f:nE(24),r:[1,2,3],m:[1,.3,.1],d:[.9,.4,.15],t0:.08,v:.3},R);}});
D('fig.monstre',{fam:'figures',dur:1.6,st:1,key:1,db:+2,max:1,cd:.3,bases:[0,12],grp:'r',prio:3,dit:'AIR MONSTRE (3,4 s) : la nappe s’ouvre, le grave tombe, la cloche sonne haut',
  r:function(b,R,o){const nE=function(st){return 329.6276*Math.pow(2,(st+o.base)/12);};swish(b,R,0,.7,200,2400,.35,-.6,.6,.8);nappe(b,R,[o.base,7+o.base,12+o.base,16+o.base],0,.18,.2,1.1,.1,1800);grave(b,o,.05,70,38,.4,.8,.55);
    cloche(b,{f:nE(31),r:[1,2,2.76,5.4],m:[1,.35,.2,.06],d:[1.3,.6,.3,.1],t0:.12,v:.28},R);scintille(b,R,.2,.9,8,.08);}});
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
D('fig.bump',{fam:'figures',dur:.7,key:1,db:0,max:2,cd:.06,pre:1,bases:[0,12],grp:'r',prio:1,dit:'BUMP : la dalle qui rebondit (ressort caoutchouc) + la note (st)',
  r:function(b,R,o){osc(b,{f:220,f1:150,g:.25,t0:0,a:.002,d:.35,v:.4,vib:[22,.12]});clic(b,{t0:0,f:1500,d:.01,v:.3},R);pluck(b,R,nE(12+o.base),.02,.45,.4,.9);}});
D('air.regain',{fam:'figures',dur:.4,key:1,db:-5,max:2,cd:.15,dit:'le chrono d’airtime se RECHARGE (nuage, bump) : un « whoop » qui remonte',
  r:function(b,R,o){osc(b,{f:nE(7),f1:nE(19),g:.12,gc:.6,w:'tri',t0:0,a:.005,d:.2,v:.3});swish(b,R,0,.2,1200,4200,.18);}});
D('fig.snake',{fam:'figures',dur:1.4,st:1,key:1,db:+3,max:1,cd:.4,grp:'r',prio:4,dit:'SNAKE LOOP : le glissando serpent (plonge puis remonte) dans la gamme',
  r:function(b,R,o){for(const dt of [-.005,.005])osc(b,{f:nE(24),w:'saw',t0:0,a:.01,h:.1,d:.9,v:.1,flt:['lp',3000,3000,1,.8],pan:dt*100,vib:[6,.01],
      f1:nE(12),g:.18});
    osc(b,{f:nE(12),f1:nE(31),g:.4,gc:1.4,w:'tri',t0:.2,a:.01,d:.6,v:.25});stab(b,R,[12,19,24],.55,.1,.6,.12,1);scintille(b,R,.55,.6,8,.1);}});
/* LES PALIERS DE L'ÉCHELLE D'ARGENT (×2 CHAUD · ×3 EN FEU · ×4,5 MILLIONNAIRE · ×6 JACKPOT) : plus des clochettes — un
   CUIVRE qui monte, un cran plus gros à chaque marche. Le jackpot a son propre son : la machine à sous qui crache. */
D('fig.palier',{fam:'figures',dur:.9,st:1,key:1,db:+1,max:2,cd:.1,bases:[0,12],grp:'r',prio:2,dit:'palier de l’échelle ×2/×3/×4,5 : stab de cuivres qui monte (st)',
  r:function(b,R,o){swish(b,R,0,.18,800,5000,.2);stab(b,R,[12+o.base,19+o.base,24+o.base],.06,.06,.4,.17,1.1);grave(b,o,.06,110,55,.12,.2,.35);}});
D('fig.jackpot',{fam:'figures',dur:2.2,st:1,key:1,db:+6,max:1,cd:1,grp:'r',prio:5,dit:'×6 JACKPOT MAX : la machine à sous qui sonne + cascade de pièces + fanfare',
  r:function(b,R,o){for(let k=0;k<8;k++)cloche(b,{f:nE(36),r:[1,2.76,5.4],m:[1,.4,.15],d:[.12,.06,.03],t0:k*.06,v:.22,pan:k%2?.4:-.4},R); // la sonnette qui s'affole
    stab(b,R,[12,16,19,24],.5,.25,.9,.18,1.3);grave(b,o,.5,90,40,.3,.6,.6);pieces(b,R,.55,1.4,34,.22);scintille(b,R,.6,1.2,14,.1);}});

/* ================================ LA POSE (le moment qui juge) ================================== */
D('pose.choc',{fam:'pose',bus:'fx',dur:.45,db:0,max:2,cd:.05,v:2,pre:1,rj:.03,dit:'la caisse touche le bitume : pneus + suspension + caisse (volume selon l’impact)',
  r:function(b,R,o){coup(b,R,o,0,.8,700,120,52,.22);bruit(b,{c:'b',t0:.004,a:.003,d:.1,v:.18,ft:'bp',f:1500,f1:950,g:.1,q:6},R);
    for(let k=0;k<4;k++)clic(b,{t0:.03+R()*.12,f:3500+R()*2000,d:.003,v:.06},R);}});
D('pose.parfait',{fam:'pose',dur:.9,key:1,db:+2,max:1,cd:.2,pre:1,dit:'PARFAIT : le « TCHAK » (claquement sec en trois éclats) + l’étincelle d’or',
  r:function(b,R,o){for(let k=0;k<3;k++)bruit(b,{c:'b',t0:k*.008,a:.0005,d:.025,v:.6-k*.12,ft:'bp',f:1800,q:.9},R);
    clic(b,{t0:0,f:5000,d:.006,v:.4},R);cloche(b,{f:nE(36),r:[1,2,2.76],m:[1,.3,.2],d:[.6,.25,.12],t0:.01,v:.3},R);cloche(b,{f:nE(43),r:[1,2],m:[1,.2],d:[.4,.15],t0:.03,v:.14},R);
    scintille(b,R,.02,.35,6,.1,36,46);}});
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
D('piece.serie',{fam:'argent',dur:1,st:1,key:1,db:-1,max:1,cd:.3,dit:'SÉRIE COMPLÈTE (la dernière pièce du motif) : arpège de pièces qui grimpe + ding',
  r:function(b,R,o){[12,16,19,24,28,31].forEach(function(st,i){cloche(b,{f:nE(st),r:[1,2,3.01,5.43],m:[1,.4,.18,.1],d:[.35,.15,.07,.04],t0:i*.035,v:.26,pan:(i/5-.5)*.8},R);});
    cloche(b,{f:nE(36),r:[1,2,2.76],m:[1,.3,.1],d:[.8,.3,.1],t0:.22,v:.3},R);}});
D('billet.vole',{fam:'argent',dur:.12,st:1,key:1,db:-14,max:4,cd:.035,dit:'un billet volant arrive au compteur : froissé bref + tic',
  r:function(b,R,o){bruit(b,{c:'b',t0:0,a:.002,d:.04,v:.4,ft:'bp',f:3600,q:1.2},R);osc(b,{f:nE(31),t0:.01,a:.001,d:.035,v:.3});}});
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
D('aura.geste',{fam:'aura',dur:.45,key:1,db:-2,max:3,cd:.04,pre:1,bases:[0,12],grp:'r',prio:1,dit:'un geste d’aura au sol (frôlé, rase-bord, virage…) : note de marimba (st = le × d’aura)',
  r:function(b,R,o){marimba(b,R,nE(12+o.base),0,.55,.35);}});
D('aura.x5',{fam:'aura',dur:1.1,st:1,key:1,db:+2,max:1,cd:.5,grp:'r',prio:3,dit:'× d’aura ×5 EN FEU : la flamme prend + accord qui monte',
  r:function(b,R,o){bruit(b,{c:'n',t0:0,a:.08,d:.5,v:.5,ft:'lp',f:300,f1:2200,g:.3},R);crepite(b,R,.05,.5,10,.25);[12,16,19].forEach(function(st,i){marimba(b,R,nE(st+12),.05+i*.05,.4,.5);});stab(b,R,[12,19],.18,.1,.5,.1,1);}});
D('aura.x8',{fam:'aura',dur:1.4,st:1,key:1,db:+3,max:1,cd:.5,grp:'r',prio:4,dit:'×8 DÉMENT : plus haut, plus large, un coup de grave',
  r:function(b,R,o){swish(b,R,0,.3,500,5000,.3,-.6,.6);[16,19,24,28].forEach(function(st,i){marimba(b,R,nE(st+12),i*.045,.4,.55);});stab(b,R,[16,24,28],.2,.15,.6,.14,1.3);grave(b,o,.2,90,40,.2,.4,.5);}});
D('aura.x10',{fam:'aura',dur:2,st:1,key:1,db:+5,max:1,cd:1,grp:'r',prio:5,dit:'×10 MAX : le sommet de l’aura — chœur + stab + poussière d’or',
  r:function(b,R,o){swish(b,R,0,.4,300,6000,.35,-.8,.8);[12,16,19,24,28,31].forEach(function(st,i){marimba(b,R,nE(st+12),i*.04,.35,.6);});
    stab(b,R,[12,19,24,31],.26,.3,1,.16,1.4);choeur(b,R,[12,19,24],.26,.1,.3,1.2,.08);grave(b,o,.26,80,36,.3,.7,.6);scintille(b,R,.3,1.4,14,.1);}});
D('aura.encaisse1',{fam:'aura',dur:.9,st:1,key:1,db:0,max:1,cd:.2,grp:'r',prio:2,dit:'la chaîne d’aura s’encaisse (petite) : deux notes qui se posent',
  r:function(b,R,o){marimba(b,R,nE(19),0,.45,.5);marimba(b,R,nE(24),.07,.5,.6);scintille(b,R,.08,.3,4,.08);}});
D('aura.encaisse2',{fam:'aura',dur:1.2,st:1,key:1,db:+2,max:1,cd:.2,grp:'r',prio:3,dit:'encaissement d’aura (moyen, ≥ 600) : trois notes + stab',
  r:function(b,R,o){[19,24,28].forEach(function(st,i){marimba(b,R,nE(st),i*.06,.45,.55);});stab(b,R,[12,19,24],.14,.1,.5,.1,1);scintille(b,R,.15,.5,7,.1);}});
D('aura.encaisse3',{fam:'aura',dur:1.6,st:1,key:1,db:+4,max:1,cd:.2,grp:'r',prio:4,dit:'gros encaissement d’aura (≥ 2000) : arpège + stab + grave + or',
  r:function(b,R,o){[12,19,24,28,31].forEach(function(st,i){marimba(b,R,nE(st),i*.05,.42,.6);});stab(b,R,[12,19,24,28],.2,.2,.8,.14,1.3);grave(b,o,.2,90,40,.2,.4,.45);scintille(b,R,.22,1,12,.1);}});
D('aura.record',{fam:'aura',dur:1.3,st:1,key:1,db:+3,max:1,cd:1,grp:'r',prio:4,dit:'record d’aura battu en course : « ta-DA » de marimba + cuivre',
  r:function(b,R,o){marimba(b,R,nE(19),0,.5,.3);marimba(b,R,nE(24),.1,.55,.8);stab(b,R,[12,19,24,28],.1,.15,.8,.14,1.3);scintille(b,R,.12,.8,10,.1);}});
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
  r:function(b,R,o){for(let k=0;k<5;k++)bulle(b,R,k*.05,250+k*90,500+k*140,.05,.25);swish(b,R,0,.3,500,3500,.15);clic(b,{t0:.3,f:3000,d:.006,v:.3},R);osc(b,{f:nE(24),t0:.3,a:.001,d:.12,v:.2});}});
D('nitro.pleine',{fam:'machine',dur:.7,st:1,key:1,db:-6,max:1,cd:2,dit:'la jauge de nitro est PLEINE : ding-ding + scintillement',
  r:function(b,R,o){cloche(b,{f:nE(31),r:[1,2,2.76],m:[1,.3,.1],d:[.35,.15,.05],t0:0,v:.3},R);cloche(b,{f:nE(36),r:[1,2,2.76],m:[1,.3,.1],d:[.5,.2,.08],t0:.08,v:.3},R);scintille(b,R,.1,.4,5,.07);}});
D('nitro.sec',{fam:'machine',bus:'fx',dur:.7,db:-2,max:1,cd:1,dit:'panne SÈCHE de nitro (en vol : on perd le plané) : la flamme qui tousse et s’étrangle',
  r:function(b,R,o){for(let k=0;k<3;k++)bruit(b,{c:'n',t0:k*.13,a:.003,d:.08,v:.5-k*.12,ft:'lp',f:1200-k*300,q:.8},R);bruit(b,{c:'b',t0:.4,a:.01,d:.2,v:.2,ft:'bp',f:1800,f1:600,g:.2,q:1.5},R);osc(b,{f:180,f1:60,g:.4,w:'saw',t0:0,a:.01,d:.5,v:.06,flt:['lp',800,200,.4]});}});
D('nitro.vide',{fam:'machine',bus:'fx',dur:.12,db:-6,max:1,cd:.15,dit:'appui NITRO à vide : « tchk » de gâchette sèche',
  r:function(b,R,o){clic(b,{t0:0,f:2500,d:.01,v:.6},R);clic(b,{t0:.035,f:1800,d:.008,v:.4},R);bruit(b,{c:'b',t0:.035,a:.002,d:.05,v:.15,ft:'bp',f:1200,q:2},R);}});
/* LES POUVOIRS ont chacun leur signature (avant : le souffle d'un pad + deux notes) */
D('pwr.n',{fam:'machine',dur:1.2,st:1,key:1,db:+2,max:1,cd:.4,grp:'r',prio:3,dit:'pouvoir NITRO INFINIE : allumage de réacteur + deux notes de feu',
  r:function(b,R,o){bruit(b,{c:'n',t0:0,a:.01,h:.1,d:.7,v:.7,ft:'lp',f:200,f1:3500,g:.25},R);crepite(b,R,.05,.8,18,.3,500,2500);grave(b,o,0,80,40,.2,.5,.6);
    stab(b,R,[16,23],.08,.1,.5,.12,1.2);}});
D('pwr.a',{fam:'machine',dur:1.4,st:1,key:1,db:+2,max:1,cd:.4,grp:'r',prio:3,dit:'pouvoir AIRTIME INFINI : carillons à vent + le souffle qui soulève',
  r:function(b,R,o){swish(b,R,0,.8,200,3000,.35,-.5,.5,.7);for(let k=0;k<7;k++)cloche(b,{f:nE(pd(10+((k*3)%7))),r:[1,2.76,5.4],m:[1,.3,.1],d:[.8,.3,.1],t0:.05+k*.07,v:.18,pan:(k%3-1)*.6},R);nappe(b,R,[16,23],.05,.2,.3,.8,.06,2400);}});
D('pwr.v',{fam:'machine',dur:1,st:1,key:1,db:+2,max:1,cd:.4,grp:'r',prio:3,dit:'pouvoir SPEED UP : l’étincelle électrique + la turbine qui monte',
  r:function(b,R,o){for(let k=0;k<4;k++)osc(b,{f:1800+k*400,f1:300,g:.06,t0:k*.02,a:.0005,d:.06,v:.12,fm:{r:3.3,i:3,d:.04}});osc(b,{f:600,f1:4200,g:.6,gc:.7,w:'saw',t0:0,a:.02,d:.6,v:.05,flt:['bp',1500,6000,.6,4]});
    stab(b,R,[14,21],.06,.1,.5,.12,1.2);grave(b,o,0,100,50,.1,.3,.4);}});
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
D('vitesse.pure',{fam:'machine',bus:'fx',dur:1,st:1,key:1,db:+1,max:1,cd:.5,bases:[0,12],grp:'r',prio:2,dit:'PURE SPEED (et ses paliers : st) : le mur d’air + cuivre qui monte',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.1,h:.1,d:.5,v:.4,ft:'bp',f:600,f1:3000,g:.4,q:.7},R);stab(b,R,[12+o.base,19+o.base],.08,.1,.5,.12,1.1);}});
D('virage',{fam:'machine',bus:'fx',dur:.3,st:1,db:-6,max:2,cd:.15,dit:'VIRAGE SERRÉ : le pneu qui zippe',
  r:function(b,R,o){bruit(b,{c:'b',t0:0,a:.01,d:.15,v:.35,ft:'bp',f:1800,f1:2400,g:.12,q:6},R);}});
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
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.05,d:.28,v:.5,ft:'bp',f:3200,f1:600,g:.3,gc:.6,q:2},R);cloche(b,{f:nE(19+o.base),r:[1,2,3],m:[1,.3,.1],d:[.35,.12,.05],t0:.03,v:.28},R);}});
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
  r:function(b,R,o){osc(b,{f:180,f1:420,g:.4,w:'saw',t0:0,a:.02,h:.1,d:.2,v:.05,flt:['lp',1200,1200,1,.8]});[12,16,19].forEach(function(st,i){marimba(b,R,nE(st+12),.1+i*.06,.4,.4);});}});

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
D('garage.tole',{fam:'interface',bus:'ui',dur:.55,db:-5,max:2,cd:.08,v:4,dit:'taper sur la caisse au garage : le TOC étouffé d’une portière, le poids de la caisse, sa suspension qui rebondit, la garniture qui cliquette',
  r:function(b,R,o){const k=.92+R()*.16;
    clic(b,{t0:0,f:2200,d:.005,v:.26},R);                                                     // la jointure
    cloche(b,{f:190*k,r:[1,1.62,2.31,3.48],m:[1,.55,.32,.14],d:[.1,.065,.04,.022],t0:0,v:.5,jit:.04},R); // la tôle épaisse, étouffée
    bruit(b,{c:'r',t0:0,a:.0008,d:.06,v:.3,ft:'lp',f:750*k,q:.8},R);                          // le creux du panneau
    grave(b,o,0,96*k,60*k,.05,.16,.4);                                                        // le poids
    osc(b,{f:58*k,f1:50*k,g:.3,t0:.03,a:.03,d:.32,v:.13,vib:[6,.04]});                        // la suspension qui s'enfonce et remonte
    bruit(b,{c:'b',t0:.04,a:.02,d:.12,v:.03,ft:'bp',f:1700*k,q:5,am:[22,.7]},R);              // l'amortisseur, à peine
    for(let i=0;i<3;i++)plastique(b,R,.018+i*.017+R()*.01,(1300+R()*600)*k,.05-i*.012);      // la garniture qui cliquette
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
D('pwr.m',{fam:'machine',dur:1.3,st:1,key:1,db:+2,max:1,cd:.4,grp:'r',prio:3,dit:'pouvoir AIMANT : le champ magnétique qui ronfle (« wub ») + les pièces qui filent vers la caisse',
  r:function(b,R,o){osc(b,{f:110,t0:0,a:.05,h:.3,d:.5,v:.35,vib:[9,.12]});osc(b,{f:220,w:'saw',t0:0,a:.05,h:.3,d:.4,v:.05,vib:[9,.12],flt:['lp',900,900,1,1.5]});
    for(let k=0;k<7;k++){const f=nE(24+[0,2,4,7,9,12,14][k]);osc(b,{f:f*.6,f1:f,g:.08,gc:.5,t0:.15+k*.07,a:.002,d:.12,v:.13,pan:(k%2?.5:-.5)});}
    T.stab(b,R,[16,23],.1,.1,.5,.1,1.1);}});
D('pwr.b',{fam:'machine',dur:1.5,st:1,key:1,db:+2,max:1,cd:.4,grp:'r',prio:3,dit:'pouvoir BOUCLIER : le champ de force d’acier qui se referme (vwoom) + la cloche d’acier',
  r:function(b,R,o){bruit(b,{c:'r',t0:0,a:.08,d:.6,v:.45,ft:'bp',f:300,f1:2400,g:.35,q:5},R);T.tole(b,R,.12,nE(7),.35,1.2);
    osc(b,{f:nE(-12),t0:.1,a:.05,h:.4,d:.6,v:.2,vib:[4,.01]});cloche(b,{f:nE(31),r:[1,2.39,3.86],m:[1,.4,.2],d:[1,.5,.25],t0:.14,v:.2},R);}});
D('pwr.x',{fam:'machine',dur:1.4,st:1,key:1,db:+2,max:1,cd:.4,grp:'r',prio:3,dit:'pouvoir AURA ×2 : le chœur d’or bref + les cloches doublées à l’octave',
  r:function(b,R,o){T.choeur(b,R,[12,19,24],0,.05,.25,.8,.1);[24,31].forEach(function(st,i){cloche(b,{f:nE(st),r:[1,2,2.76],m:[1,.4,.15],d:[.8,.35,.12],t0:.06+i*.09,v:.26},R);cloche(b,{f:nE(st+12),r:[1,2],m:[1,.2],d:[.6,.2],t0:.075+i*.09,v:.12},R);});
    T.scintille(b,R,.1,.8,10,.1);}});
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
D('moteur.cylindre',{fam:'machine',dur:.3,key:1,db:-8,max:4,cd:0,bases:[0,12,24],dit:'un CYLINDRE du nouveau moteur s’allume : l’étincelle + la note qui monte (st, un degré par cylindre)',
  r:function(b,R,o){bruit(b,{c:'n',t0:0,a:.0008,d:.03,v:.35,ft:'lp',f:1800},R);clic(b,{t0:0,f:3000,d:.004,v:.25},R);
    cloche(b,{f:nE(12+o.base),r:[1,2,2.76],m:[1,.3,.12],d:[.22,.09,.04],t0:.002,v:.35},R);}});
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
const TERCETS=[[24,28,31],[26,31,33],[28,31,36]]; // mi6 · fa#6 · sol#6 · si6 · do#7 · mi7 : la pentatonique, au-dessus de la pièce
D('frenesie.cash',{fam:'argent',dur:.45,st:1,key:1,db:-7,max:2,cd:.09,v:3,rj:.004,vj:.5,dit:'un gain EN FRÉNÉSIE (par-dessus la pièce) : le ×3 — trois micro-pièces qui montent en 60 ms + poussière d’or',
  r:function(b,R,o){const N=TERCETS[o.v%3];
    N.forEach(function(st,i){const t=i*.028,p=(i-1)*.35;
      clic(b,{t0:t,f:7000,d:.0015,v:.16+i*.04,pan:p},R);
      cloche(b,{f:nE(st),r:[1,2,3.01,5.43],m:[1,.35,.14,.1],d:[.16+i*.06,.07,.04,.02],t0:t,v:.26+i*.06,pan:p,jit:.003},R);});
    bruit(b,{c:'b',t0:.02,a:.004,d:.14,v:.05,ft:'hp',f:7500,pan:-.4,pan1:.4},R);}});
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
