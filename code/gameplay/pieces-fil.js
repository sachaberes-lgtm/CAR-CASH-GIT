/* ===== LE FIL DE PIÈCES (2026-11-09, Sacha : « mets plus de pièces sur la route et retravaille la génération des pièces sans qu'il y ait aucun bug.
   Des générations fun et variées, pas toujours les mêmes motifs, mais qu'on puisse toutes les récupérer d'un coup ») =====
   ⚠ L'ANCIEN GÉNÉRATEUR (zigzag, arc, cercle, jackpot, éparpillé) POSAIT DES MOTIFS QUE PERSONNE NE POUVAIT RAMASSER D'UN SEUL PASSAGE :
   un zigzag sautait de ±26 m en 10 m de route, un cercle de 11 m de rayon n'a que la moitié de ses pièces à portée de la caisse. La
   caisse ne tourne pas sur place : au volant plein pouce son rayon de braquage vaut 40 + 0,3 × vitesse (m, voir `lacetMax`), soit 55 m au
   départ et 120 m aux grands moteurs. Un motif n'est ramassable d'un coup que si son tracé est CONDUISIBLE à ce rayon-là.
   LA RÈGLE : tout est posé sur UN FIL — une ligne latérale `th` qui avance avec la piste, continue (jamais de saut) et dérivable (jamais
   plus raide que la caisse ne peut tourner). Chaque motif est une courbe `rel(u)` autour du fil (u de 0 à 1 le long du motif) ; sa
   LONGUEUR est CALCULÉE pour que la courbure max reste sous 1/Rd (Rd = 1,25 × rayon de braquage du moteur du moment, voir `filRayon`) :
   plus le moteur est fort, plus les vagues s'allongent, mais elles restent prenables d'un trait. Un motif commence et finit à plat (pente
   nulle) : le fil se raccorde au suivant sans à-coup, la glissade (changement de voie) déplace le fil d'une courbe douce.
   LES MOTIFS LARGES (flèche, cœur, double hélice, zigzag étroit, ruban…) tiennent dans ±2,6 m du fil : la caisse qui roule DROIT dessus
   les prend tous (portée de ramassage 3,8 m) — du fun sans slalom. Les MOTIFS EN COURBE (serpent, vague, entonnoir, glissade) demandent
   de suivre la ligne, que la longueur calculée rend possible. Le banc `outils/banc-pieces/fil.cjs` le PROUVE : un pilote simulé, avec la
   vraie loi de braquage, prend 100 % des pièces de chaque motif à tous les moteurs.
   LE RESTE DE LA RÈGLE : jamais une pièce ni le trajet entre deux pièces sur une flaque, un obstacle de la glace ou un trou (le motif glisse
   plus loin, ou à défaut perd ses pièces gênées) ; jamais de pièce hors route (le fil reste à 3,2 m du bord) ; un motif n'en recouvre pas
   un autre ; zéro appel au `rnd` de la piste (le fil a SON flux, `rc`) : la même piste donne les mêmes pièces.
   Fonction PURE (aucun accès au jeu) : le banc la charge telle quelle. `o` = {L, HALF, STR, rich, fruits, bloque(sp,lt), s0}. */
const FIL_W=2.2; /* la demi-largeur des motifs larges : la caisse au centre les prend tous (portée de ramassage 3,8 m) */
const FIL_KIND=['serpent','vague','glissade','adn','ruban','chevron','pixel','train','eclair','entonnoir','libre'];
const FIL_PIX={
  coeur:['.X.X.','XXXXX','XXXXX','.XXX.','..X..'],
  losange:['..X..','.XXX.','XXXXX','.XXX.','..X..'],
  fleche:['..X..','.XXX.','XXXXX','..X..','..X..','..X..'],
  croix:['X...X','.X.X.','..X..','.X.X.','X...X'],
  smiley:['.X.X.','.....','X...X','.XXX.'],
  couronne:['X.X.X','XXXXX','XXXXX'],
  eclair:['..XXX','.XX..','XXXXX','..XX.','.XX..'],
  sablier:['XXXXX','.XXX.','..X..','.XXX.','XXXXX'],
  fleche2:['..X..','.XXX.','..X..','.XXX.','..X..','.XXX.']
};
const FIL_PIXN=Object.keys(FIL_PIX);
function filRayon(STR){return 1.25*(40+11.4*STR*STR);} /* le rayon de braquage prenable : 40 + 0,3 × 25,3 m/s (la croisière) × STR² × 1,5 de nitro, avec 25 % de marge */
function filPlan(rc,o){
  const L=o.L,HALF=o.HALF,STR=Math.max(1,o.STR||1),rich=Math.max(.5,o.rich||1),Rd=filRayon(STR);
  const M=Math.max(FIL_W+.9,HALF-3.2); /* M : la limite du fil (le bord de la route est à HALF + 1,8) */
  const W=FIL_W; /* la demi-largeur des motifs larges : la caisse au centre les prend tous */
  const kS=1+(STR-1)*.12; /* l'espacement suit un peu la vitesse (×1,13 au plus grand moteur) ; l'allongement des vagues, lui, suit le rayon de braquage */
  const sm=u=>u<=0?0:u>=1?1:u*u*u*(u*(u*6-15)+10); /* smootherstep : pente et courbure nulles aux bouts */
  const win=u=>sm(u/.16)*sm((1-u)/.16); /* le motif entre et sort à plat */
  const R=(a,b)=>a+rc()*(b-a),pick=a=>a[(rc()*a.length)|0],sp=(a,b)=>R(a,b)*kS;
  const SET=.5*Rd; /* la distance de stabilisation : la caisse a fini son changement de voie et sa direction s'est posée AVANT la première pièce du motif (sinon elle dépasse de 3-4 m) */
  const fruitOk=!!o.fruits,bloque=o.bloque||(()=>false),fin=L-90;
  let dernPix='';
  /* la longueur MINIMALE d'une courbe rel(u) : courbure ≤ 1/Rd, pente ≤ 0,8 (≈ 39°) */
  function fitLen(f){
    const N=96,h=1/N;let m1=0,m2=0;
    for(let i=1;i<N;i++){const u=i*h,a=f(u-h),b=f(u),c=f(u+h);m1=Math.max(m1,Math.abs(c-a)/(2*h));m2=Math.max(m2,Math.abs(c-2*b+a)/(h*h));}
    return Math.max(Math.sqrt(m2*Rd),m1/.8,40);
  }
  /* la longueur d'un changement de voie de Δ m (smootherstep : courbure max 5,77·Δ, pente max 1,875·Δ) */
  const shiftLen=d=>Math.max(Math.sqrt(5.77*Math.abs(d)*Rd),1.875*Math.abs(d)/.8,30);
  /* ---- les motifs : {len, coins:[{d,l,f?}], fin (déplacement du fil), serie, cen (le fil du motif)} ---- */
  function courbe(f,pas,fr){ /* des pièces tous les `pas` m le long de la courbe rel(u) */
    const len=fitLen(f),n=Math.max(5,Math.round(len/pas)),c=[];
    for(let i=0;i<n;i++){const u=i/(n-1);c.push({d:u*len,l:f(u),f:fr});}
    return {len:len,coins:c,fin:f(1),serie:true,cen:d=>f(d/len)};
  }
  const plat=()=>0;
  const MK={
    serpent(sc,sd){let a=(3.5+R(0,7.5))*sc,k=1+((rc()*3)|0),r;
      for(let t=0;t<14;t++){const A=a,K=k;r=courbe(u=>sd*A*Math.sin(6.2832*K*u)*win(u),sp(7,9.5),true);if(r.len<=330)break;if(k>1)k--;else a*=.8;}
      return r;},
    entonnoir(sc,sd){let a=(6+R(0,6))*sc,k=2+((rc()*2)|0),r;
      for(let t=0;t<14;t++){const A=a,K=k;r=courbe(u=>sd*A*Math.sin(6.2832*K*u)*(1-u)*win(u),sp(6.5,8.5),false);if(r.len<=330)break;if(k>1)k--;else a*=.8;}
      return r;},
    vague(sc,sd){let a=(5+R(0,7))*sc,r;
      for(let t=0;t<14;t++){const A=a;r=courbe(u=>sd*A*Math.pow(Math.sin(Math.PI*u),2),sp(6.5,9),true);if(r.len<=300)break;a*=.85;}
      return r;},
    glissade(sc,sd){const d=(9+R(0,13))*sc;return courbe(u=>sd*d*sm(u),sp(6,8),true);},
    adn(){const lam=(34+R(0,26))*kS,len=lam*(1.5+((rc()*3)|0)*.5),st=sp(3.4,4.6),n=Math.max(8,Math.round(len/st)),c=[];
      for(let i=0;i<n;i++){const d=i/(n-1)*len,l=W*Math.sin(6.2832*d/lam);c.push({d:d,l:l});c.push({d:d,l:-l});}
      return {len:len,coins:c,fin:0,serie:true,cen:plat};},
    ruban(){const rows=6+((rc()*5)|0),st=sp(6,8),ls=rc()<.5?[-1.4,1.4]:[-W,0,W],c=[];
      for(let i=0;i<rows;i++)for(const l of ls)c.push({d:i*st,l:l});
      return {len:(rows-1)*st,coins:c,fin:0,serie:true,cen:plat};},
    chevron(){const k=2+((rc()*2)|0),nr=3+((rc()*3)|0),st=sp(4.6,6),c=[];let d0=0;
      for(let j=0;j<k;j++){ /* chaque chevron : sa pointe vers l'avant (le plus grand s), ses bras derrière */
        const tip=d0+(nr-1)*st;
        for(let i=0;i<nr;i++){const w=i*W/(nr-1),d=tip-i*st;if(i===0)c.push({d:d,l:0});else{c.push({d:d,l:w});c.push({d:d,l:-w});}}
        d0=tip+st*1.6;}
      return {len:d0-st*1.6,coins:c,fin:0,serie:true,cen:plat};},
    pixel(){const nom=pick(FIL_PIXN.filter(n=>n!==dernPix)),G=FIL_PIX[nom],rs=sp(5.2,6.6)*(rc()<.3?1.6:1),cw=W/2,c=[];
      dernPix=nom;
      for(let ri=0;ri<G.length;ri++)for(let ci=0;ci<5;ci++)if(G[ri][ci]==='X')c.push({d:(G.length-1-ri)*rs,l:(ci-2)*cw});
      return {len:(G.length-1)*rs,coins:c,fin:0,serie:true,cen:plat,nom:nom};},
    train(){const n=15+((rc()*13)|0),st=sp(4.2,5.4),f=u=>1.2*Math.sin(6.2832*1.5*u)*win(u),Lf=Math.max((n-1)*st,fitLen(f)),nn=Math.round(Lf/st)+1,c=[];
      for(let i=0;i<nn;i++){const u=i/(nn-1);c.push({d:u*Lf,l:f(u)});}
      return {len:Lf,coins:c,fin:0,serie:true,cen:d=>f(d/Lf)};},
    eclair(){const n=8+((rc()*7)|0),st=sp(5,6.6),c=[];
      for(let i=0;i<n;i++)c.push({d:i*st,l:(i%2?-1:1)*W});
      return {len:(n-1)*st,coins:c,fin:0,serie:true,cen:plat};},
    libre(){const n=3+((rc()*3)|0),c=[];let d=0;
      for(let i=0;i<n;i++){c.push({d:d,l:(rc()*2-1)*3.2,f:true});if(i<n-1)d+=sp(14,26);}
      return {len:d,coins:c,fin:0,serie:false,cen:plat};}
  };
  /* ---- le tirage : jamais le même motif deux fois de suite, ni l'un des deux derniers (le 3e : moins souvent) ---- */
  const POIDS={serpent:16,vague:10,glissade:8,adn:10,ruban:10,chevron:8,pixel:15,train:5,eclair:9,entonnoir:6,libre:7};
  const DENSE={adn:1.2,ruban:1.4,chevron:1,pixel:.8,serpent:0,vague:-.4,glissade:-.3,train:-.3,eclair:0,entonnoir:-.3,libre:-.8},dr=Math.max(0,Math.min(1,(rich-1.2)/2));
  let h1='',h2='',h3='',derFin=false;
  function tire(th){
    let tot=0;const w={};
    for(const k of FIL_KIND){let p=POIDS[k];if(k===h1||k===h2)p=0;else if(k===h3)p*=.4;
      p*=DENSE[k]>0?1+DENSE[k]*dr:1+DENSE[k]*dr*.7; /* plus la route est riche, plus les motifs denses (hélice, ruban, chevron, image) reviennent */
      if(k==='glissade'&&Math.abs(th)>M*.5)p*=2.5; /* le fil est près d'un bord : une glissade le ramène */
      w[k]=p;tot+=p;}
    let x=rc()*tot;for(const k of FIL_KIND){x-=w[k];if(x<=0&&w[k]>0)return k;}
    return 'pixel';
  }
  const out=[];let ss=o.s0||200,th=0,gid=0,garde=0,nb=0;
  const dens=Math.min(.24,(o.dens||1.9)*30*Math.pow(rich,1.2)/1000); /* pièces par mètre visées : 1,9 × l'ancien flux, qui suit la progression (30/km au palier 1 → 130/km au palier 3,4) */
  while(ss<fin&&garde++<500){
    /* 1. la respiration d'avant : plus courte quand la route s'enrichit ; parfois une salve sans pause, parfois un vrai répit */
    const ideal=nb/dens-(ss-(o.s0||200)); /* la distance à laquelle les pièces posées donneraient exactement la densité visée : on s'y tient en moyenne */
    let gap=Math.min(300,Math.max(6,ideal*(.55+.9*rc())));
    if(rc()<.14)gap=Math.min(gap,10+R(0,10));else if(rc()<.12)gap=Math.min(380,gap*1.8+30); /* une salve (le motif colle au précédent) ou un vrai répit */
    if(derFin)gap=Math.max(gap,SET+6); /* après une glissade : le temps de se poser */
    const kind=tire(th),sgn=rc()<.5?-1:1;
    /* 2. le motif : à pleine échelle, retourné, ou réduit, selon ce qui TIENT dans la route à partir du fil */
    let mot=null,th2=th;
    for(const op of [[1,sgn],[1,-sgn],[.6,sgn],[.6,-sgn],[.35,sgn],[.35,-sgn]]){
      const m=MK[kind](op[0],op[1]);let lo=1e9,hi=-1e9;
      for(const c of m.coins){if(c.l<lo)lo=c.l;if(c.l>hi)hi=c.l;}
      const a=-M-lo,b=M-hi; /* le fil admissible au départ du motif : toutes ses pièces (et sa fin) dans ±M */
      if(a>b)continue;
      mot=m;th2=Math.min(b,Math.max(a,th));break;
    }
    if(!mot){mot=MK.ruban();th2=Math.min(M-W,Math.max(-M+W,th));} /* repli : un ruban, qui tient toujours */
    if(Math.abs(th2-th)>.05)gap=Math.max(gap,shiftLen(th2-th)+SET+6); /* la respiration est assez longue pour déplacer le fil prenablement */
    let s0=ss+gap;
    if(s0+mot.len>fin)break;
    /* 3. les obstacles : le motif glisse plus loin tant que ses pièces, ou le fil entre elles (un point tous les 3 m), touchent une flaque, un obstacle ou un trou */
    const dth=th2-th,sl=Math.abs(dth)>.05?shiftLen(dth):0; /* le changement de voie du fil : il se fait juste avant le motif, sur `sl` m */
    const pts=sd=>{const P=mot.coins.map(c=>[sd+c.d,th2+c.l]),n=Math.max(2,Math.round(mot.len/3));
      for(let i=0;i<=n;i++){const d=i/n*mot.len;P.push([sd+d,th2+mot.cen(d)]);}
      if(sl)for(let d=0;d<=sl;d+=3)P.push([sd-SET-sl+d,th+dth*sm(d/sl)]);
      return P;};
    let tent=0,gene=true;
    while(tent<9){gene=false;for(const q of pts(s0))if(bloque(q[0],q[1])){gene=true;break;}if(!gene)break;s0+=16;tent++;if(s0+mot.len>fin)break;}
    if(gene&&s0+mot.len>fin)break; /* plus de place : fin de piste */
    /* 4. on pose (à défaut d'un passage libre, le motif perd ses seules pièces gênées : la série ne se paie qu'avec celles qui restent) */
    const gold=rc()<.18,lot=mot.coins.slice().sort((a,b)=>a.d-b.d),id=mot.serie?gid+1:0;let nk=0;
    for(const c of lot){
      const sp0=s0+c.d,lt=th2+c.l;
      if(bloque(sp0,lt))continue;
      const f=!!c.f&&fruitOk&&rc()<.3,deux=!f&&(gold||rc()<.21);
      out.push({s:sp0,l:Math.max(-HALF,Math.min(HALF,lt)),f:f,g:id,deux:deux,k:kind});nk++;
    }
    if(nk&&mot.serie)gid++;
    nb+=nk;
    if(o.fil){ /* (banc) le fil lui-même : un point tous les 3 m, de la fin du motif d'avant à la fin de celui-ci */
      if(sl)for(let d=0;d<=sl;d+=3)o.fil.push({s:s0-SET-sl+d,l:th+dth*sm(d/sl)});
      for(let d=0;d<=mot.len;d+=3)o.fil.push({s:s0+d,l:th2+mot.cen(d)});}
    th=th2+mot.fin;ss=s0+mot.len;
    derFin=Math.abs(mot.fin)>.05;
    h3=h2;h2=h1;h1=kind;
  }
  return out;
}
