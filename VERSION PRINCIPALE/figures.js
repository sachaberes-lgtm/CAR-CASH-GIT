/* LES FIGURES — le catalogue et le lecteur (2026-10-14, Léo : « au lieu de supprimer les tricks, on va les accumuler ; dans une boîte blanche,
   un générateur où je peux voir ces différents tricks qu'on ajoute au jeu ; on peut les acheter dans le shop, les cumuler dans l'inventaire
   pour les enchaîner en double-cliquant, et ça les pose automatiquement, aléatoirement — et ça doit bien s'enchaîner »).
   PARTAGÉ par le jeu (index.html) et la BOÎTE BLANCHE (boite-figures.html) : ce qu'on voit dans la boîte, c'est ce que fait la caisse en jeu.

   Une figure = des MOUVEMENTS simultanés de la caisse autour de son milieu (repère de la caisse : x = sa gauche, y = son toit, z = son nez) :
     {a:[x,y,z], t:n}        n tours complets sur l'axe a (signe = sens) — elle prend son élan, file, se pose (smoothstep) ;
     {a:[x,y,z], b:amp, k:n} un aller-retour d'amplitude `amp` (en tours) : k = 1 une bosse (la chandelle), k > 1 des battements (le shimmy).
   Tout mouvement finit à l'identité : une figure repose TOUJOURS la caisse à l'endroit, et deux figures se CHEVAUCHENT sans à-coup (le
   lecteur lance la suivante quand la précédente passe 70 % : leurs rotations se composent pendant qu'elle ralentit).
   `p` = prix en pièces (0 = offerte d'office), `aura` = ce qu'elle verse à la chaîne, `D` = durée (s) — raccourcie en jeu s'il ne reste
   pas assez de vol (« ça les pose automatiquement »).
   Les figures GÉNÉRÉES dans la boîte (AJOUTER AU JEU) vivent dans localStorage « cashcarFigPerso » (même origine que le jeu) et passent au
   shop sur cet appareil ; pour les donner à tout le monde, les recopier dans BASE. */
(function(){
  'use strict';
  var BASE=[
    {id:'tonneau',    n:'TONNEAU',        en:'BARREL ROLL',   c:'TONNEAU', ce:'ROLL',    p:0,     D:.6,  aura:50,  m:[{a:[0,0,1],t:1}]},
    {id:'toupie',     n:'TOUPIE 360',     en:'FLAT 360',      c:'TOUPIE',  ce:'SPIN',    p:2500,  D:.6,  aura:60,  m:[{a:[0,1,0],t:1}]},
    {id:'shimmy',     n:'SHIMMY',         en:'SHIMMY',        c:'SHIMMY',  ce:'SHIMMY',  p:2000,  D:.6,  aura:40,  m:[{a:[0,1,0],b:.06,k:3},{a:[0,0,1],b:.045,k:3}]},
    {id:'chandelle',  n:'CHANDELLE',      en:'SKY WHEELIE',   c:'CHANDEL', ce:'WHEELIE', p:3500,  D:.8,  aura:45,  m:[{a:[1,0,0],b:-.17,k:1}]},
    {id:'saltoa',     n:'SALTO ARRIERE',  en:'BACKFLIP',      c:'ARRIERE', ce:'BACK',    p:6000,  D:.7,  aura:90,  m:[{a:[1,0,0],t:-1}]},
    {id:'saltov',     n:'SALTO AVANT',    en:'FRONTFLIP',     c:'AVANT',   ce:'FRONT',   p:6000,  D:.7,  aura:90,  m:[{a:[1,0,0],t:1}]},
    {id:'double',     n:'DOUBLE TONNEAU', en:'DOUBLE ROLL',   c:'DOUBLE',  ce:'ROLL×2',  p:9000,  D:.8,  aura:110, m:[{a:[0,0,1],t:2}]},
    {id:'tirebouchon',n:'TIRE-BOUCHON',   en:'CORKSCREW',     c:'BOUCHON', ce:'CORK',    p:14000, D:.8,  aura:130, m:[{a:[1,0,0],t:-1},{a:[0,0,1],t:1}]},
    {id:'helico',     n:'HELICO 720',     en:'HELI 720',      c:'HELICO',  ce:'HELI',    p:18000, D:.85, aura:140, m:[{a:[0,1,0],t:2}]},
    {id:'penche',     n:'VRILLE PENCHEE', en:'OFF-AXIS SPIN', c:'PENCHEE', ce:'OFFAXIS', p:22000, D:.75, aura:120, m:[{a:[.7071,.7071,0],t:1}]},
    {id:'rodeo',      n:'RODEO',          en:'RODEO',         c:'RODEO',   ce:'RODEO',   p:30000, D:.9,  aura:160, m:[{a:[0,1,0],t:1},{a:[1,0,0],t:-1}]},
    {id:'cosmique',   n:'SALTO COSMIQUE', en:'COSMIC FLIP',   c:'COSMIQ',  ce:'COSMIC',  p:50000, D:1,   aura:220, m:[{a:[1,0,0],t:-2},{a:[0,0,1],t:1}]}];
  /* (2026-10-14, LES FIGURES v2) `c` / `ce` : le nom COURT du bouton de vol (8 lettres au plus, police pixel). Une figure générée prend le 1er mot de son nom. */
  var CLE_PERSO='cashcarFigPerso';
  function valide(f){
    if(!f||typeof f!=='object'||!/^[a-z0-9_]{2,24}$/.test(f.id)||typeof f.n!=='string'||!Array.isArray(f.m)||!f.m.length||f.m.length>3)return false;
    for(var i=0;i<f.m.length;i++){var o=f.m[i];if(!o||!Array.isArray(o.a)||o.a.length!==3)return false;
      if(o.t!=null&&(Math.round(o.t)!==o.t||o.t===0||Math.abs(o.t)>3))return false;if(o.t==null&&!(Math.abs(o.b)>0&&Math.abs(o.b)<.4&&o.k>=1&&o.k<=6))return false;}
    return true;}
  function perso(){try{var L=JSON.parse(localStorage.getItem(CLE_PERSO)||'[]');return Array.isArray(L)?L.filter(valide).slice(0,40):[];}catch(e){return [];}}
  var LISTE=[],PAR={};
  function rebatit(){LISTE=BASE.slice();PAR={};
    perso().forEach(function(f){if(!BASE.some(function(b){return b.id===f.id;})){f.perso=1;f.p=f.p>0?f.p:8000;f.D=Math.min(1.2,Math.max(.45,+f.D||.8));f.aura=Math.min(260,Math.max(30,f.aura|0||100));LISTE.push(f);}});
    LISTE.forEach(function(f){PAR[f.id]=f;});FIG.liste=LISTE;FIG.par=PAR;}
  // ---- quaternions à la main (x,y,z,w) : ce fichier ne dépend de rien, pas même de three ----
  function qAxe(ax,ang,o){var l=Math.hypot(ax[0],ax[1],ax[2])||1,s=Math.sin(ang/2)/l;o[0]=ax[0]*s;o[1]=ax[1]*s;o[2]=ax[2]*s;o[3]=Math.cos(ang/2);return o;}
  function qMul(a,b,o){var x=a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],y=a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],z=a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],w=a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2];o[0]=x;o[1]=y;o[2]=z;o[3]=w;return o;}
  var T1=[0,0,0,1],T2=[0,0,0,1],AXT=[0,0,0];
  // l'angle d'un mouvement à l'instant x (0 → 1) — sens : ±1 (le miroir, tiré au hasard pour les toupies et les tonneaux)
  function angle(o,x,sens){var X=Math.min(1,Math.max(0,x));
    if(o.t!=null)return X*X*(3-2*X)*o.t*6.2832*sens;
    var e=Math.sin(Math.PI*X);return o.k>1?o.b*6.2832*Math.sin(6.2832*o.k*X)*e*sens:o.b*6.2832*e;}
  // la rotation de la figure f à l'instant x → o (multipliée à droite de l'assiette de la caisse)
  function quat(f,x,sens,o){o=o||[0,0,0,1];o[0]=o[1]=o[2]=0;o[3]=1;
    for(var i=0;i<f.m.length;i++){var m=f.m[i],s=(m.a[0]!==0&&m.a[1]===0&&m.a[2]===0&&m.t!=null)?1:sens; // un salto garde son sens (avant / arrière) ; toupies, tonneaux, battements se tirent en miroir
      AXT[0]=m.a[0];AXT[1]=m.a[1];AXT[2]=m.a[2];qAxe(AXT,angle(m,x,s),T1);qMul(o,T1,T2);o[0]=T2[0];o[1]=T2[1];o[2]=T2[2];o[3]=T2[3];}
    return o;}
  // tirer une figure au hasard parmi celles qu'on POSSÈDE — jamais deux fois la même d'affilée si on en a plusieurs
  function tire(possedees,derniere,alea){alea=alea||Math.random;var L=(possedees||[]).filter(function(id){return !!PAR[id];});
    if(!L.length)L=['tonneau'];if(L.length>1&&derniere)L=L.filter(function(id){return id!==derniere;});return PAR[L[Math.floor(alea()*L.length)]]||PAR.tonneau;}
  /* LE LECTEUR : les figures en cours (`actifs`) et celles qui attendent (`file`). La suivante part quand la dernière lancée passe CHEV (70 %) :
     les deux rotations se composent — l'une ralentit pendant que l'autre prend son élan, la caisse ne s'arrête jamais entre deux figures. */
  var CHEV=.7;
  function Lecteur(){this.actifs=[];this.file=[];this.q=[0,0,0,1];this.der=null;}
  Lecteur.prototype.lance=function(f,sens,D){var e={f:f,t:0,D:Math.max(.3,D||f.D),s:sens||1};if(!this.actifs.length&&!this.file.length)this.actifs.push(e);else this.file.push(e);this.der=f.id;return e;};
  Lecteur.prototype.occupe=function(){return this.actifs.length+this.file.length;};
  Lecteur.prototype.reste=function(){var r=0,i;for(i=0;i<this.actifs.length;i++)r=Math.max(r,this.actifs[i].D-this.actifs[i].t);
    var dern=this.actifs[this.actifs.length-1],c=dern?Math.max(0,dern.D*CHEV-dern.t):0;for(i=0;i<this.file.length;i++){r=Math.max(r,c+this.file[i].D);c+=this.file[i].D*CHEV;}return r;};
  Lecteur.prototype.vide=function(){this.actifs.length=0;this.file.length=0;this.q[0]=this.q[1]=this.q[2]=0;this.q[3]=1;};
  // avance de dt ; rend la liste des figures FINIES à cette image (pour les payer) ; this.q = la rotation à appliquer
  Lecteur.prototype.tick=function(dt){var fin=[],i,A=this.actifs;
    for(i=0;i<A.length;i++)A[i].t+=dt;
    while(this.file.length){var d=A[A.length-1];if(d&&d.t<d.D*CHEV)break;var n=this.file.shift();if(d)n.t=Math.max(0,d.t-d.D*CHEV);A.push(n);}
    for(i=A.length-1;i>=0;i--)if(A[i].t>=A[i].D){fin.push(A[i].f);A.splice(i,1);}
    var q=this.q;q[0]=q[1]=q[2]=0;q[3]=1;
    for(i=0;i<A.length;i++){quat(A[i].f,A[i].t/A[i].D,A[i].s,T2);qMul(q,T2,T1);q[0]=T1[0];q[1]=T1[1];q[2]=T1[2];q[3]=T1[3];}
    return fin.reverse();};
  // l'angle total qu'il resterait à tourner (rad) — pour juger une pose en plein tour
  Lecteur.prototype.ecart=function(){return 2*Math.acos(Math.min(1,Math.abs(this.q[3])));};

  /* ===== LE CORPS — LES FIGURES EN VRAIE PHYSIQUE (2026-10-14, Sacha : « refonte totale du système de figures : on peut en équiper jusqu'à 3,
     mais c'est surtout la PHYSIQUE qui doit être exceptionnelle et super fun ; en l'air la voiture garde l'inertie de son mouvement » ·
     « le double-tap n'exécute pas juste une animation, ça donne une IMPULSION : le front flip fait une petite explosion au niveau des roues
     arrière qui propulse l'arrière de la voiture vers l'avant, et la figure d'après, un spin par exemple, doit S'ADDITIONNER à l'impulsion du
     front flip, se cumuler de manière fun, réaliste et jouissive » · inspiration Asphalt 8 et les jeux de BMX).
     Le Lecteur d'au-dessus JOUAIT une courbe (elle prenait son élan, filait, se posait d'elle-même à l'endroit). Ici la caisse est un CORPS :
     · un état — `q` (son assiette par rapport au vol, quaternion) et `w` (sa vitesse de rotation, rad/s, dans SON repère : x = sa gauche,
       y = son toit, z = son nez) ;
     · une figure = une EXPLOSION en un point de la caisse (sous les roues arrière pour le salto avant, sous les roues avant pour le salto
       arrière, sous un flanc pour le tonneau, un coup de côté à l'arrière et à l'avant pour la toupie) : elle AJOUTE un vecteur à `w` en
       `tImp` s. Deux figures s'ADDITIONNENT — un spin lancé pendant un salto penche l'axe de rotation : la caisse part en vrille penchée,
       vraie, que personne n'a dessinée ;
     · entre deux explosions, rien ne la freine (`drag` à peine) : c'est l'INERTIE. Les équations d'Euler (inerties `I` d'une caisse : elle
       roule plus facilement qu'elle ne tourne à plat) la font PRÉCESSER quand deux rotations se mêlent (`gyro` = la part du couplage gardée :
       assez pour le sentir, pas assez pour la jeter dans le chaos) ;
     · le bouton TENU = la poussée continue (`aHold`) : la toupie ACCÉLÈRE, on enchaîne ×2, ×3… on lâche quand on veut ;
     · quand les tours prévus sont faits (`fin`), et qu'on ne tient plus rien, LA PRISE : la caisse continue dans le sens où elle tourne
       jusqu'à l'endroit le plus proche devant elle (jamais de marche arrière), freine (`aCtl`) et s'y PLANTE avec un petit rebond (`pd`) ;
     · à vide (`aero`) : l'air la ramène dans l'axe du vol, doucement — ce qu'elle a hérité de la route (le lacet d'un virage, le coup de
       tremplin) se VOIT, se balance, puis se range. Un drift qui décolle part en TOUPIE (comme le flat spin d'Asphalt 8).
     Une figure ne paie qu'une fois PLANTÉE (ou posée à moins de `ok` de l'endroit) : `tick` rend les figures plantées, avec leur nombre de
     tours (`reps`). Les points d'explosion (`evts`) sont lus par le jeu pour les flammes, le son, la secousse. */
  var PHY={I:[1,1.12,.46],gyro:.12,tImp:.08,kImp:1.08,aHold:12,wMax:22,aCtl:85,wE:1.7,wMin:4.5,
    pd:{w:13,z:.42},aero:{w:3.2,z:.36},fin:.82,ok:.35,wPose:9,drag:.05,sub:1/120,w0max:3,q0max:.9};
  var AUTO={derive:{id:'derive',n:'TOUPIE DE DRIFT',en:'DRIFT SPIN',p:0,D:.85,aura:70,m:[{a:[0,1,0],t:1}],auto:1}};
  function vNorm(a){var l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];}
  function vDot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
  function qExpMul(q,w,h){ // q ← q ⊗ exp(w·h/2) — la rotation de l'image, dans le repère de la caisse
    var ang=Math.hypot(w[0],w[1],w[2])*h;if(ang<1e-9)return;var s=Math.sin(ang/2)/(ang/h),b=[w[0]*s,w[1]*s,w[2]*s,Math.cos(ang/2)];
    qMul(q,b,T1);var l=Math.hypot(T1[0],T1[1],T1[2],T1[3])||1;q[0]=T1[0]/l;q[1]=T1[1]/l;q[2]=T1[2]/l;q[3]=T1[3]/l;}
  // l'écart à l'endroit : l'axe (repère caisse) et l'angle (0 → π) de la rotation qui RAMÈNE la caisse à l'endroit (conj(q))
  function retour(q,o){var x=-q[0],y=-q[1],z=-q[2],w=q[3];if(w<0){x=-x;y=-y;z=-z;w=-w;}var s=Math.hypot(x,y,z);
    o.phi=2*Math.atan2(s,w);if(s<1e-9){o.n[0]=1;o.n[1]=0;o.n[2]=0;}else{o.n[0]=x/s;o.n[1]=y/s;o.n[2]=z/s;}return o;}
  /* LES POINTS D'EXPLOSION — en coordonnées de caisse NORMÉES (x × demi-largeur, y × demi-hauteur autour du milieu, z × demi-longueur) :
     où la flamme pousse (`p`) et dans quel sens elle pousse la caisse (`f` — le souffle part à l'opposé). Le couple p × f tourne dans le
     sens voulu : salto avant (x > 0, le nez plonge) = l'ARRIÈRE poussé vers le haut et l'avant ; tonneau (z > 0) = le flanc GAUCHE soulevé ;
     toupie (y > 0, le nez part à gauche) = l'avant poussé à gauche, l'arrière à droite. */
  function boums(tq,k){var L=[],c;
    c=tq[0];if(Math.abs(c)>=.3)L.push(c>0?{p:[0,-1,-.78],f:[0,.92,.38],k:k*Math.abs(c)}:{p:[0,-1,.78],f:[0,.92,-.38],k:k*Math.abs(c)});
    c=tq[2];if(Math.abs(c)>=.3)L.push({p:[c>0?.92:-.92,-1,0],f:[0,1,0],k:k*Math.abs(c)});
    c=tq[1];if(Math.abs(c)>=.3){L.push({p:[0,-.2,.9],f:[c>0?1:-1,0,0],k:k*Math.abs(c)*.7});L.push({p:[0,-.2,-.9],f:[c>0?-1:1,0,0],k:k*Math.abs(c)*.7});}
    return L;}
  function Corps(){this.q=[0,0,0,1];this.w=[0,0,0];this.figs=[];this.evts=[];this.mode='aero';this.budget=Infinity;this.poseK=0;this.n=0;this.der=null;
    this.r={n:[1,0,0],phi:0};this.tPrise=0;}
  Corps.prototype.vide=function(){this.q[0]=this.q[1]=this.q[2]=0;this.q[3]=1;this.w[0]=this.w[1]=this.w[2]=0;this.figs.length=0;this.evts.length=0;this.mode='aero';this.tPrise=0;};
  // l'élan HÉRITÉ de la route au décollage : l'assiette d'écart `q0` (bornée) et la rotation `w0` (bornée, rad/s, repère caisse)
  Corps.prototype.herite=function(q0,w0){
    var q=this.q;q[0]=q0[0];q[1]=q0[1];q[2]=q0[2];q[3]=q0[3];if(q[3]<0){q[0]=-q[0];q[1]=-q[1];q[2]=-q[2];q[3]=-q[3];}
    var a=2*Math.acos(Math.min(1,q[3]));if(a>PHY.q0max){var s=Math.sin(PHY.q0max/2)/Math.max(1e-9,Math.sin(a/2));q[0]*=s;q[1]*=s;q[2]*=s;q[3]=Math.cos(PHY.q0max/2);}
    for(var i=0;i<3;i++)this.w[i]=Math.max(-PHY.w0max,Math.min(PHY.w0max,+w0[i]||0));};
  /* LANCER une figure : ses explosions partent tout de suite et S'AJOUTENT à ce qui tourne déjà. `sens` : le miroir (toupies, tonneaux,
     battements — un salto garde son sens). `D` : en combien de temps elle ferait ses tours (le jeu la raccourcit s'il reste peu de vol : elle
     tourne plus vite). o.tient : le doigt est encore sur le bouton (poussée continue) · o.vise : la vitesse visée est un TOTAL (la toupie de
     drift reprend l'élan qu'a déjà la caisse au lieu de s'y ajouter). */
  Corps.prototype.lance=function(f,sens,D,o){o=o||{};D=Math.max(.3,D||f.D);sens=sens||1;
    var r={f:f,s:sens,D:D,t:0,mv:[],imp:[0,0,0],impT:PHY.tImp,tient:!!o.tient,tenu:0,fini:false,paye:false,reps:0,osc:null,boums:[],force:false},tq=[0,0,0];
    for(var i=0;i<f.m.length;i++){var m=f.m[i],a=vNorm(m.a);
      if(m.t!=null){var d=(m.a[0]!==0&&m.a[1]===0&&m.a[2]===0)?(m.t>0?1:-1):(m.t>0?1:-1)*sens,tours=Math.abs(m.t),sp=6.2832*tours/D*PHY.kImp;
        if(o.vise)sp=Math.max(0,sp-vDot(this.w,a)*d);
        r.mv.push({a:a,d:d,tours:tours,th:0});for(var j=0;j<3;j++){r.imp[j]+=a[j]*d*sp;tq[j]+=a[j]*d*sp;}}
      else{ // un BATTEMENT (shimmy, chandelle) : un ressort qui bat — l'impulsion le lance, sa raideur le fait battre k fois en D
        var amp=m.b*6.2832*(m.k>1?sens:1),wo=m.k>1?6.2832*m.k/D:1.7*Math.PI/D,zo=m.k>1?.06:.5,rz=Math.sqrt(1-zo*zo),
          v0=amp*wo/Math.exp(-zo/rz*Math.atan2(rz,zo)); // la vitesse qui porte le ressort amorti JUSTE à l'amplitude voulue (le 1er sommet)
        r.osc={w:wo,z:zo};for(var j2=0;j2<3;j2++){r.imp[j2]+=a[j2]*v0;tq[j2]+=a[j2]*v0;}}}
    var mag=Math.hypot(tq[0],tq[1],tq[2]);if(mag>1e-6)r.boums=boums([tq[0]/mag,tq[1]/mag,tq[2]/mag],Math.min(1.6,mag/11));
    for(var b=0;b<r.boums.length;b++)this.evts.push(r.boums[b]);
    this.figs.push(r);this.n++;this.der=f.id;return r;};
  Corps.prototype.tiens=function(r,on){if(r)r.tient=!!on&&!r.paye;};
  Corps.prototype.occupe=function(){var n=0;for(var i=0;i<this.figs.length;i++)if(!this.figs[i].paye)n++;return n;};
  // le temps qu'il faut encore pour finir les tours prévus ET se planter à l'endroit (s) — pour doser une figure de plus
  // ⚠ l'explosion encore EN COURS compte (MESURÉ au banc du jeu : à la 1re image du salto, la caisse ne tournait pas encore — 1,5 rad/s —,
  // le temps estimé faisait 3,6 s et la figure se croyait sans assez de vol : elle s'annulait aussitôt)
  Corps.prototype.reste=function(){var t=0,any=false,W=[this.w[0],this.w[1],this.w[2]],i,r;
    for(i=0;i<this.figs.length;i++){r=this.figs[i];if(r.paye||!(r.impT>0))continue;var u=r.impT/PHY.tImp;W[0]+=r.imp[0]*u;W[1]+=r.imp[1]*u;W[2]+=r.imp[2]*u;}
    for(i=0;i<this.figs.length;i++){r=this.figs[i];if(r.paye)continue;any=true;
      if(r.osc&&!r.mv.length){t=Math.max(t,r.D-r.t);continue;}
      for(var j=0;j<r.mv.length;j++){var m=r.mv[j],rem=Math.max(0,m.tours*6.2832*PHY.fin-m.th),v=Math.max(1.5,Math.abs(vDot(W,m.a)));t=Math.max(t,rem/v+(r.tient?.35:0));}}
    return any?t+Math.hypot(W[0],W[1],W[2])/PHY.aCtl+.14:0;};
  Corps.prototype.ecart=function(){return 2*Math.acos(Math.min(1,Math.abs(this.q[3])));};
  Corps.prototype.tick=function(dt){var fin=[];if(!(dt>0))return fin;var n=Math.max(1,Math.ceil(dt/PHY.sub)),h=dt/n;for(var k=0;k<n;k++)this.pas(h,fin);return fin;};
  Corps.prototype.pas=function(h,fin){
    var w=this.w,F=this.figs,P=PHY,I=P.I,i,j,r,m;
    // 1. LES EXPLOSIONS (réparties sur tImp) et LA POUSSÉE TENUE
    for(i=0;i<F.length;i++){r=F[i];r.t+=h;
      if(r.impT>0){var u=Math.min(h,r.impT)/P.tImp;w[0]+=r.imp[0]*u;w[1]+=r.imp[1]*u;w[2]+=r.imp[2]*u;r.impT-=h;}
      if(r.tient&&!r.paye&&r.mv.length){r.tenu+=h;for(j=0;j<r.mv.length;j++){m=r.mv[j];if(vDot(w,m.a)*m.d<P.wMax){var g=P.aHold*h*m.d;w[0]+=m.a[0]*g;w[1]+=m.a[1]*g;w[2]+=m.a[2]*g;}}}}
    // 2. LE COUPLAGE GYROSCOPIQUE (Euler, sans couple extérieur) : I0·ẇ0 = (I1−I2)·w1·w2, etc.
    var gx=(I[1]-I[2])/I[0]*w[1]*w[2],gy=(I[2]-I[0])/I[1]*w[2]*w[0],gz=(I[0]-I[1])/I[2]*w[0]*w[1],kg=P.gyro*h;
    w[0]+=gx*kg;w[1]+=gy*kg;w[2]+=gz*kg;
    // 3. QUI COMMANDE : une figure qui tourne encore (libre), une figure finie à planter (prise), ou personne (l'air la range)
    var tourne=false,aPlanter=false,osc=null,tient=false;
    for(i=0;i<F.length;i++){r=F[i];if(r.paye)continue;
      if(r.osc&&r.t<r.D)osc=r.osc;
      if(!r.mv.length)continue;
      if(r.tient)tient=true;
      if(!r.fini){var ok=true,mort=false;for(j=0;j<r.mv.length;j++){m=r.mv[j];if(m.th<m.tours*6.2832*P.fin){ok=false;
          // ANNULÉE : une explosion contraire a éteint la rotation sur SON axe (un tonneau à gauche sur un tonneau à droite) — elle ne finira jamais, même si
          // la caisse tourne encore sur un autre : au bout de 0,35 s, elle sort du compte (et ne paie pas)
          if(r.impT<=0&&!r.tient&&Math.abs(vDot(w,m.a))<1.2){m.cale=(m.cale||0)+h;if(m.cale>.35)mort=true;}else m.cale=0;}}
        if(ok&&!r.tient)r.fini=true;else if(mort||(!r.tient&&r.t>r.D*2.2+.4)){r.fini=true;r.force=true;}} // (trois rotations empilées qui se mêlent : passé 2,2 fois sa durée, on se replace — elle paie si l'essentiel est fait)
      if(!r.fini||r.tient)tourne=true;else aPlanter=true;}
    // plus le temps de finir (le viseur dit quand on touche) : on lâche tout et on se replace — ce qui n'a pas fini ne comptera pas
    // CALÉE : deux explosions qui s'annulent (un salto avant puis un salto arrière) laissent la caisse presque immobile, n'importe où — l'air ne
    // finira pas la figure à sa place : au bout de 0,2 s, on se replace (rien ne paie)
    var sp0=Math.hypot(w[0],w[1],w[2]);this.cale=tourne&&!tient&&sp0<2.5?(this.cale||0)+h:0;
    if(tourne&&!tient&&(this.cale>.2||this.budget<this.reste()+.05)){for(i=0;i<F.length;i++){r=F[i];if(!r.paye&&r.mv.length&&!r.fini){r.fini=true;r.force=true;}}tourne=false;aPlanter=true;}
    var sp=Math.hypot(w[0],w[1],w[2]),R=this.r;
    if(tourne){this.mode='libre';var dk=1-P.drag*h;w[0]*=dk;w[1]*=dk;w[2]*=dk;}
    else if(aPlanter&&this.mode!=='plante'){this.mode='prise';this.tPrise+=h;
      retour(this.q,R);var nf0=R.n[0],nf1=R.n[1],nf2=R.n[2],pf=R.phi,dn=w[0]*nf0+w[1]*nf1+w[2]*nf2;
      if(dn<0&&sp>.5&&pf>.5&&!(this.budget<(6.2832-pf)/sp+.1&&this.budget>pf/Math.max(sp,P.wMin)))
        {nf0=-nf0;nf1=-nf1;nf2=-nf2;pf=6.2832-pf;} // elle CONTINUE dans son sens jusqu'à l'endroit devant elle — sauf si elle vient de le dépasser (elle revient), ou si le sol arrive avant (on revient en arrière : sauver sa peau)
      if(pf<.22&&sp<P.wE*2.2)this.mode='plante';
      else{var tg=Math.sqrt(P.wE*P.wE+2*P.aCtl*pf),cap=Math.max(sp,P.wMin);if(tg>cap)tg=cap;
        var e0=nf0*tg-w[0],e1=nf1*tg-w[1],e2=nf2*tg-w[2],em=Math.hypot(e0,e1,e2),lim=P.aCtl*1.6*h*(this.budget<.5?2:1);if(em>lim){e0*=lim/em;e1*=lim/em;e2*=lim/em;}
        w[0]+=e0;w[1]+=e1;w[2]+=e2;}}
    if(!tourne&&(this.mode==='plante'||!aPlanter)){ // LE RESSORT : le planté (raide, un rebond) ou l'air (mou : l'élan hérité se voit, puis se range)
      if(!aPlanter&&this.mode!=='aero'&&this.mode!=='plante')this.mode='aero'; // le planté va au bout de son rebond (il ne repasse pas au ressort mou en pleine course)
      var pr=this.mode==='plante'?P.pd:osc||P.aero,wn=pr.w*(this.mode==='aero'&&!osc?1+2.5*this.poseK:1),z=pr.z+(this.mode==='aero'&&!osc?.4*this.poseK:0);
      retour(this.q,R);var kp=wn*wn*R.phi,kd=2*z*wn;
      w[0]+=(kp*R.n[0]-kd*w[0])*h;w[1]+=(kp*R.n[1]-kd*w[1])*h;w[2]+=(kp*R.n[2]-kd*w[2])*h;}
    // 4. L'ASSIETTE AVANCE
    qExpMul(this.q,w,h);
    // 5. LES TOURS FAITS, figure par figure (la part de la rotation sur SON axe)
    for(i=0;i<F.length;i++){r=F[i];for(j=0;j<r.mv.length;j++){m=r.mv[j];m.th+=vDot(w,m.a)*m.d*h;}}
    // 6. PLANTÉE : à l'endroit, presque immobile — les figures finies paient (leurs tours comptés), les battements à la fin de leur durée
    var ang=this.ecart();
    for(i=F.length-1;i>=0;i--){r=F[i];if(r.paye)continue;
      if(r.mv.length){if(r.fini&&this.mode==='plante'&&ang<.12&&sp<2.5)this.paye(r,fin);}
      else if(r.t>=r.D){this.paye(r,fin);}}
    for(i=F.length-1;i>=0;i--)if(F[i].paye&&F[i].t>F[i].D*.5)F.splice(i,1);
    if(this.mode==='plante'&&ang<.012&&sp<.1){this.q[0]=this.q[1]=this.q[2]=0;this.q[3]=1;w[0]=w[1]=w[2]=0;this.mode='aero';this.tPrise=0;}
  };
  // une figure qui paie : ses tours comptés sur son axe principal (×2 si on a tenu pour un tour de plus) — une figure FORCÉE (plus le temps) ne paie que si elle a fait l'essentiel
  Corps.prototype.paye=function(r,fin){r.paye=true;r.tient=false;
    if(!r.mv.length){r.reps=1;fin.push(r);return;}
    var mm=r.mv[0];for(var j=1;j<r.mv.length;j++)if(r.mv[j].tours>mm.tours)mm=r.mv[j];
    var x=mm.th/(6.2832*mm.tours);r.reps=Math.max(1,Math.floor(x+.3));
    if(r.force&&x<.7){r.rate=true;return;}
    fin.push(r);};
  /* À LA POSE : ce qui tourne encore est jugé — près de l'endroit (< ok) et presque arrêtée, les figures finies (ou presque) comptent. Posée à
     plus de 52°, ou en tournant encore à toute vitesse (> `wPose` : le bouton tenu jusqu'au sol — la caisse tombait parfois dans l'axe par
     chance, MESURÉ au banc), c'est la CHUTE. Rend {payees, ratee}. */
  Corps.prototype.pose=function(){var a=this.ecart(),sp=Math.hypot(this.w[0],this.w[1],this.w[2]),pay=[],rat=false;
    for(var i=0;i<this.figs.length;i++){var r=this.figs[i];if(r.paye)continue;
      if(!r.mv.length){if(r.t>=r.D*.6&&a<PHY.ok)this.paye(r,pay);continue;}
      var x=1;for(var j=0;j<r.mv.length;j++)x=Math.min(x,r.mv[j].th/(6.2832*r.mv[j].tours));
      if(a<PHY.ok&&x>.75&&sp<PHY.wPose){r.force=false;this.paye(r,pay);}else if(a>.9||sp>=PHY.wPose)rat=true;}
    return {payees:pay,ratee:rat,ecart:a};};
  function nomReps(f,reps,lang){var n=FIG.nom(f,lang);return reps>1?n+' ×'+reps:n;}
  // ---- LE GÉNÉRATEUR (la boîte blanche) : une figure neuve, tirée au hasard, toujours jouable ----
  var AXES=[[1,0,0],[0,1,0],[0,0,1],[.7071,.7071,0],[0,.7071,.7071],[.7071,0,.7071],[.5774,.5774,.5774]];
  // le nom dit le geste : le 1er mot suit l'axe du premier mouvement (salto, toupie, tonneau, penché, balancement) ; le 2nd ne s'accorde pas
  var MOTS1={x:['SALTO','LOOPING','CULBUTE'],y:['TOUPIE','PIROUETTE','TORNADE'],z:['TONNEAU','VRILLE','TIRE-BOUCHON'],p:['CYCLONE','RODEO','TOURBILLON'],b:['SHIMMY','CHALOUPE','DANDINE']};
  var MOTS2=['COSMIQUE','NEON','DU BANQUIER','MILLIONNAIRE','TURBO','DU CHAT','DE MINUIT','SAUVAGE','EXPRESS','MAGNUM','XXL','DE LUXE'];
  function genere(alea){alea=alea||Math.random;var n=alea()<.55?1:2,m=[],us={};
    for(var i=0;i<n;i++){var k;do{k=Math.floor(alea()*AXES.length);}while(us[k]);us[k]=1;
      if(n===1&&alea()<.18)m.push({a:AXES[k].slice(),b:+(alea()<.5?.08+alea()*.1:-(.08+alea()*.1)).toFixed(3),k:alea()<.5?1:2+Math.floor(alea()*3)});
      else m.push({a:AXES[k].slice(),t:(alea()<.5?-1:1)*(alea()<.75?1:2)});}
    var tours=0;m.forEach(function(o){tours+=o.t?Math.abs(o.t):.4;});
    var m0=m[0],nz=m0.a.filter(function(v){return Math.abs(v)>.1;}).length,cle=m0.t==null?'b':nz>1?'p':Math.abs(m0.a[0])>.1?'x':Math.abs(m0.a[1])>.1?'y':'z';
    var L1=MOTS1[cle],nom=L1[Math.floor(alea()*L1.length)]+' '+MOTS2[Math.floor(alea()*MOTS2.length)];
    return {id:'g'+Date.now().toString(36).slice(-6)+Math.floor(alea()*1296).toString(36),n:nom,en:nom,p:Math.round((4000+tours*9000)/500)*500,
      D:+Math.min(1.1,.55+tours*.16).toFixed(2),aura:Math.round(40+tours*55),m:m,perso:1};}
  function ajoute(f){if(!valide(f))return false;var L=perso().filter(function(x){return x.id!==f.id;});L.push({id:f.id,n:f.n,en:f.en||f.n,p:f.p,D:f.D,aura:f.aura,m:f.m});
    try{localStorage.setItem(CLE_PERSO,JSON.stringify(L.slice(-40)));}catch(e){return false;}rebatit();return true;}
  function retire(id){var L=perso().filter(function(x){return x.id!==id;});try{localStorage.setItem(CLE_PERSO,JSON.stringify(L));}catch(e){}rebatit();}
  var FIG={liste:[],par:{},quat:quat,tire:tire,Lecteur:Lecteur,genere:genere,ajoute:ajoute,retire:retire,rebatit:rebatit,valide:valide,CHEV:CHEV,CLE_PERSO:CLE_PERSO,
    Corps:Corps,PHY:PHY,auto:AUTO,boums:boums,nomReps:function(f,r,l){return nomReps(f,r,l);},
    nom:function(f,lang){return lang==='en'&&f.en?f.en:f.n;}};
  window.FIG=FIG;rebatit();
})();
