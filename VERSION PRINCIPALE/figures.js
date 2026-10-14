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
    {id:'tonneau',    n:'TONNEAU',        en:'BARREL ROLL',   p:0,     D:.6,  aura:50,  m:[{a:[0,0,1],t:1}]},
    {id:'toupie',     n:'TOUPIE 360',     en:'FLAT 360',      p:2500,  D:.6,  aura:60,  m:[{a:[0,1,0],t:1}]},
    {id:'shimmy',     n:'SHIMMY',         en:'SHIMMY',        p:2000,  D:.6,  aura:40,  m:[{a:[0,1,0],b:.06,k:3},{a:[0,0,1],b:.045,k:3}]},
    {id:'chandelle',  n:'CHANDELLE',      en:'SKY WHEELIE',   p:3500,  D:.8,  aura:45,  m:[{a:[1,0,0],b:-.17,k:1}]},
    {id:'saltoa',     n:'SALTO ARRIERE',  en:'BACKFLIP',      p:6000,  D:.7,  aura:90,  m:[{a:[1,0,0],t:-1}]},
    {id:'saltov',     n:'SALTO AVANT',    en:'FRONTFLIP',     p:6000,  D:.7,  aura:90,  m:[{a:[1,0,0],t:1}]},
    {id:'double',     n:'DOUBLE TONNEAU', en:'DOUBLE ROLL',   p:9000,  D:.8,  aura:110, m:[{a:[0,0,1],t:2}]},
    {id:'tirebouchon',n:'TIRE-BOUCHON',   en:'CORKSCREW',     p:14000, D:.8,  aura:130, m:[{a:[1,0,0],t:-1},{a:[0,0,1],t:1}]},
    {id:'helico',     n:'HELICO 720',     en:'HELI 720',      p:18000, D:.85, aura:140, m:[{a:[0,1,0],t:2}]},
    {id:'penche',     n:'VRILLE PENCHEE', en:'OFF-AXIS SPIN', p:22000, D:.75, aura:120, m:[{a:[.7071,.7071,0],t:1}]},
    {id:'rodeo',      n:'RODEO',          en:'RODEO',         p:30000, D:.9,  aura:160, m:[{a:[0,1,0],t:1},{a:[1,0,0],t:-1}]},
    {id:'cosmique',   n:'SALTO COSMIQUE', en:'COSMIC FLIP',   p:50000, D:1,   aura:220, m:[{a:[1,0,0],t:-2},{a:[0,0,1],t:1}]}];
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
    nom:function(f,lang){return (lang==='en'||lang==='zh')&&f.en?f.en:f.n;}};
  window.FIG=FIG;rebatit();
})();
