/* ===== JADE, LA ROUTE UNIQUE — LE PLAN (2026-11-17, Sacha : « la map Jade commence toujours par une boucle, une grande descente et une autre boucle, alors que ça pourrait
   commencer par un virage, une descente, une remontée, passer dans un couloir de pierre, après les ponts, après une boucle, après remonter ») =====
   MESURÉ : chaque route suivait la même trame (ouverture → saut → envers → climax → saut : quatre rôles imposés sur cinq places), ne jouait que les 8 scènes de sa famille
   (15 au catalogue), et les 17 scènes des verbes dormaient derrière `?jade=avatar`. Désormais UN SAC de 32 modules (gameplay/route-uniques.js) et un plan par route :
   - L'ORDRE : tout le sac dans un ordre tiré au hasard pesé (ce qui vient de passer ne revient pas) ; aucun rôle n'a de place : la route peut commencer par un saut, un envers,
     le temps fort, un pont… Les seules règles : jamais deux fois le même verbe de suite, jamais deux sauts ni deux envers de suite, au plus 0-2 sauts (S : les grands sauts,
     B : les boucles, une au plus) et 0-1 envers (E) dans les sept premiers, et UN temps fort (F : balcon, gouffre, belvédère, plongeon) dans les trois premiers — il porte
     la marque du climax, où qu'il tombe.
   - L'OUVERTURE (sept) : calme · virage · plonge · balcon · bosse (ça descend, ça remonte, ça bascule) · esse · direct (droit dans le 1er module).
   - LE CAP (cinq tempéraments, la boussole de jadeAGenG) : libre · dérive (toujours du même côté : une grande hélice) · zigzag · serpent (un axe tenu, jusqu'à ±100° du
     cap de départ : la route part franchement à gauche ou à droite) · crochet (un serpent qui vire de 110-170° en route).
   - LE RELIEF (cinq) : falaise (28-40°) · plateaux (3-14°, des marches) · vagues (ça remonte) · gradins · mixte.
   - LE DÉCOR : un des six biais d'itinéraire (jadeAvDecoBiais), tiré lui aussi.
   - LES PETITS MODULES (neuf, 1,5 à 3,5 s chacun — une route ne tient que deux à quatre grandes scènes de 8-10 s : c'est eux qui font « on roule 100 mètres, un virage, ça
     descend, ça passe dans une île, ça remonte, ça passe dans les ponts ») : porte · arche · gorge (le couloir de pierre) · passerelles (les ponts) · bosse · toboggan ·
     épingle · île (on passe DANS l'île : une mésa dessous, un toit dessus) · remontée. Ils ne posent que des décors que la vallée sait déjà bâtir (pics, tours, îles :
     mêmes gabarits, mêmes matières). Le plan les tresse avec les grandes scènes : jamais trois grandes de suite, jamais plus de deux petits de suite.
   Aucun de ces quatre tirages n'est celui de la route d'avant. `jscene=` (banc) garde le paquet d'avant. */
const JU_ROLE={spirale:'B',stade:'B',colimacon:'B',puits:'B',cirque:'S',passe:'S',corniche:'S',lacets:'S',ange:'S',couloir:'E',envers:'E',pierres:'E',mur:'M',balcon:'F',gouffre:'F',belvedere:'F',plongee:'F',
  porte:'P',arche:'P',gorge:'P',passerelles:'P',bosse:'P',toboggan:'P',epingle:'P',ile:'P',remontee:'P'};
const JU_PETITS=['porte','arche','gorge','passerelles','bosse','toboggan','epingle','ile','remontee'];
const JU_W={spirale:.5,stade:.5,colimacon:.5,puits:.5,cirque:1.35,passe:1.35,corniche:1.35,lacets:1.35,ange:1.35,couloir:1.2,envers:1.2,pierres:1.2}; /* les quatre boucles pèsent ensemble comme deux modules (« toujours les deux mêmes boucles ») */
const JU_CAP=['libre','derive','zigzag','serpent','crochet'],JU_RELIEF=['falaise','plateaux','vagues','gradins','mixte'],JU_OUV=['calme','virage','plonge','balcon','bosse','esse','direct'];
if(JADE_RU){for(const c of JU_PETITS)if(JA_CLES.indexOf(c)<0)JA_CLES.push(c);
  Object.assign(JAV_VERBE,{porte:'enfilee',arche:'couverte',gorge:'serree',passerelles:'suspendue',bosse:'ballottee',toboggan:'plongee',epingle:'contournee',ile:'posee',remontee:'gravie'});}
/* LE BANC (2026-11-17, la vérification en jeu) : forcer dans le NOUVEAU plan — `?jsceneu=porte,arche` met ces modules en tête de l'ordre (jscene= repasse par l'ancien paquet) ;
   `?jouv=` (une des sept ouvertures), `?jcap=`, `?jrelief=` imposent ce tirage. Sans ces paramètres : rien ne change. */
const JU_FORCE=(function(){const q=typeof location==='undefined'?'':location.search,g=function(k,L){const m=new RegExp('[?&]'+k+'=([a-z,]+)').exec(q);return m&&(!L||L.indexOf(m[1])>=0)?m[1]:null;},m=g('jsceneu');
  return {m:m?m.split(','):null,ouv:g('jouv',JU_OUV),cap:g('jcap',JU_CAP),relief:g('jrelief',JU_RELIEF)};})();
function jadeUCle(g,kv){return kv>=1.6?g+':L':g;} /* (la clé dit si les lacets sont permis : un même graine à un autre palier n'hérite pas d'un plan tiré sans eux) */
function jadeUPlan(g,kv){return ruPlan('jade',jadeUCle(g,kv),function(v){ /* v : la variante du plan (0, sauf une route refaite parce que sa suite de modules avait déjà été jouée : ruRefait) */const h=mulberry32((Math.imul(g>>>0,0x9E3779B1)^0x51ED270B^Math.imul(v|0,0x7F4A7C15))>>>0),V=JAV_VERBE,sauteur=function(k){return JU_ROLE[k]==='S'||JU_ROLE[k]==='B';},renv=function(k){return JU_ROLE[k]==='E'||JU_ROLE[k]==='M';};
  const brut=ruOrdre('jade',JA_CLES.filter(function(k){return JU_ROLE[k]!=='P'&&(k!=='lacets'||kv>=1.6);}).map(function(k){return {k:k,w:JU_W[k]||1};}),h),petits=ruOrdre('jade',JU_PETITS.map(function(k){return {k:k};}),h);
  const u1=h(),nS=u1<.1?0:u1<.55?1:2,nE=h()<.12?0:1,G=[],reste=[];let s=0,e=0,b=0;
  for(const k of brut){const d=G[G.length-1],ro=JU_ROLE[k];
    if(G.length>=6||(d&&V[d]===V[k])||(sauteur(k)&&(s>=nS||(d&&sauteur(d))))||(ro==='B'&&b>=1)||(ro==='E'&&e>=nE)||(renv(k)&&d&&renv(d))){reste.push(k);continue;}
    G.push(k);if(sauteur(k))s++;if(ro==='B')b++;if(ro==='E')e++;}
  const monte=function(test,n){for(let i=0;i<Math.min(n,G.length);i++)if(test(G[i]))return;let q=-1;for(let i=n;i<G.length;i++)if(test(G[i])){q=i;break;}let f;if(q>=0)f=G.splice(q,1)[0];else{f=brut.filter(test)[0];if(!f)return;q=reste.indexOf(f);if(q>=0)reste.splice(q,1);}G.splice(Math.min(G.length,(h()*n)|0),0,f);};
  if(h()<.45)monte(function(k){return JU_ROLE[k]==='F';},2);if(nS&&h()<.5)monte(sauteur,2);if(nE)monte(function(k){return JU_ROLE[k]==='E';},3); /* (le contrôle adverse, 17/11 : l'envers avait disparu de 71-91 % des routes ; Sacha, 13/11 : « exploite à fond l'endroit et l'envers ») deux routes sur trois gardent un passage à l'envers, à une place tirée */ /* (les scènes calmes doivent passer aussi souvent que les autres : rien n'est forcé à chaque route) près d'une fois sur deux, un temps fort monte dans les deux premières grandes scènes ; de même un saut ; une fois sur cinq un envers */
  let climax=null;for(const k of G)if(JU_ROLE[k]==='F'){climax=k;break;}
  /* la tresse : grandes scènes (G) et petits modules (P) */
  const ordre=[];let iG=0,iP=0,nG=0,nP=0;
  while(iG<G.length||iP<petits.length){const d=ordre[ordre.length-1];let p=iG>=G.length?true:iP>=petits.length?false:nP>=2?false:nG>=2?true:h()<(nG===1?.6:.42);
    if(p&&d&&V[d]===V[petits[iP]]&&iG<G.length)p=false;
    if(p){ordre.push(petits[iP++]);nP++;nG=0;}else{ordre.push(G[iG++]);nG++;nP=0;}}
  const cap=ruChoix('jade','cap',JU_CAP,h),relief=ruChoix('jade','relief',JU_RELIEF,h),ouv=ruChoix('jade','ouv',JU_OUV,h),itin=+ruChoix('jade','itin',['0','1','2','3','4','5'],h);
  const p={ordre:ordre,reste:reste,climax:climax,cap:cap,relief:relief,ouv:ouv,itin:itin,sg:h()<.5?-1:1,axe:(h()*2-1)*100,cro:.3+h()*.35,pas:3.2+h()*2.2,pasV:1+h()*2,ry:.5+h()*1};
  if(JU_FORCE.m){const v=JU_FORCE.m.filter(function(c){return JA_CLES.indexOf(c)>=0;});p.ordre=v.concat(ordre.filter(function(c){return v.indexOf(c)<0;}));} /* (banc) ?jsceneu=, ?jouv=, ?jcap=, ?jrelief= */
  if(JU_FORCE.ouv)p.ouv=JU_FORCE.ouv;if(JU_FORCE.cap)p.cap=JU_FORCE.cap;if(JU_FORCE.relief)p.relief=JU_FORCE.relief;
  p.sig=[p.cap,p.relief,p.ouv,itin,p.sg,Math.round(p.axe),p.ordre.join('>')].join('|');return p;});}
/* LES PETITS MODULES — S9 : le catalogue de jadeAGenG ; X : sa tortue et ses outils (les mêmes que jadeAvScenes) */
function jadeUScenes(S9,X){const r=X.r,rd=X.rd,vT=X.vT,rP=X.rP,RH=X.RH,C=X.C,P=X.P,va=X.va,arcP=X.arcP,crete=X.crete,centre=X.centre,dec=X.dec,pic=X.pic,cote=X.cote,k=X.k;
  const sous=function(kk,rr){return dec({t:'ile',k:kk,rel:1,s:1,lat:4,dy:0,r:rr,massif:rr>=38?1:0,av:{anc:'haut',m:1.5,plat:1}});},toit=function(kk,rr,clear,s,lat){return dec({t:'ile',k:kk,rel:1,s:s||0,lat:lat||0,dy:clear,r:rr,inv:1,av:{anc:'bas',m:5,plat:1}});};
  /* LA PORTE : deux tours serrées et leur linteau, sur une droite courte */
  S9.porte=function(){const t0=-(6+r()*14)*rd;va((.35+r()*.3)*vT,(r()-.5)*8*rd,t0);const i9=k();for(const s9 of [-1,1])pic(i9,s9,20+r()*14,170+r()*160,3.5+r()*1.5);dec({t:'pic',k:i9,dessus:1,r:14+r()*8,clear:30+r()*8,gap:6});va((.3+r()*.3)*vT,(r()-.5)*10*rd,t0);};
  /* L'ARCHE : un virage doux sous le ventre d'une île renversée, un îlot au bord */
  S9.arche=function(){const a=(28+r()*30)*rd,sg=cote(a),t0=-(8+r()*12)*rd,Rp=Math.max(2.3*rP,(1.2+r()*.5)*vT/a);arcP(Rp,sg*a*.5,t0);toit(k(),26+r()*14,24+r()*8,0,0);arcP(Rp,sg*a*.5,t0);
    dec({t:'ile',k:k(),rel:1,s:-sg,lat:RH+20+r()*40,dy:-(20+r()*40),r:9+r()*8,bord:1});};
  /* LA GORGE (le couloir de pierre) : 1,1-1,8 s entre deux murs de pics, en tournant un peu */
  S9.gorge=function(){const a=(18+r()*26)*rd,sg=cote(a),t0=-(10+r()*14)*rd,i0=k();va((1.1+r()*.7)*vT,sg*a,t0);const i1=k();let acc=0;
    for(let i=i0+1;i<=i1;i++){acc+=C[i].distanceTo(C[i-1]);if(acc<36)continue;acc=0;for(const s9 of [-1,1])pic(i,s9,13+r()*11,160+r()*200,3.5+r()*2.5);}};
  /* LES PASSERELLES (les ponts) : deux ou trois ponts courts de mésa en mésa — chaque travée se creuse et remonte, un petit angle à chaque pile */
  S9.passerelles=function(){const n=2+(r()<.45?1:0);let sg=cote(.5);va(.3*vT,sg*4*rd,-1.5*rd);
    for(let j=0;j<n;j++){const ri=44+r()*8,i0=k();va(Math.max(2*ri+44,.3*vT),sg*3*rd,0,{n:2});sous(i0+1,ri);
      if(j<n-1){va(.3*vT,sg*(6+r()*8)*rd,-(9+r()*5)*rd);va(.35*vT,sg*(6+r()*8)*rd,(5+r()*4)*rd);va(.2*vT,0,-1.5*rd);if(r()<.6)sg=-sg;}}
    crete(-(22+r()*10)*rd,sg*(18+r()*8)*rd);};
  /* LA BOSSE : ça remonte, la crête entre deux tours, ça replonge */
  S9.bosse=function(){const sg=cote(.5);va((.4+r()*.25)*vT,sg*(8+r()*10)*rd,(9+r()*8)*rd);va((.2+r()*.25)*vT,sg*(6+r()*8)*rd,X.th());const i9=k();for(const s9 of [-1,1])pic(i9,s9,14+r()*8,140+r()*140,6+r()*3);crete(-(24+r()*16)*rd,sg*(12+r()*10)*rd);};
  /* LE TOBOGGAN : une crête, une seconde à 44-52°, la ressource en virage devant un îlot */
  S9.toboggan=function(){const sg=cote(.8),tp=-(44+r()*8)*rd;crete(tp,sg*(14+r()*12)*rd);va((.6+r()*.5)*vT,sg*(14+r()*14)*rd,tp);va(.6*vT,sg*(12+r()*10)*rd,-(10+r()*8)*rd);dec({t:'ile',k:k(),rel:1,s:-sg,lat:RH+14+r()*30,dy:4+r()*14,r:9+r()*7,bord:1});};
  /* L'ÉPINGLE : un demi-tour de 115-165° enroulé autour d'une tour */
  S9.epingle=function(){const a=(115+r()*50)*rd,sg=cote(a),Rp=(1.9+r()*.4)*rP,t0=-(14+r()*14)*rd;va(.25*vT,0,t0);const c=centre(Rp,sg),y0=P.y,i0=k();arcP(Rp,sg*a,t0);dec({t:'tour',x:c.x,z:c.z,r:Rp-RH-7,top:Math.max(y0,P.y)+110+r()*140,foot:Math.min(y0,P.y)-140,k:i0});};
  /* L'ÎLE : la route posée sur une mésa, un îlot renversé en toit, deux îlots au bord — on passe DANS l'île, puis on bascule de l'autre côté */
  S9.ile=function(){const sg=cote(.4),ri=46+r()*8;va(.35*vT,sg*(4+r()*6)*rd,-1.5*rd);const i0=k();va(Math.max(2*ri+44,.3*vT),sg*(3+r()*8)*rd,0,{n:2});sous(i0+1,ri);toit(i0+1,18+r()*10,26+r()*8,r()<.5?-1:1,r()*10);
    for(const s9 of [-1,1])dec({t:'ile',k:i0+1,rel:1,s:s9,lat:RH+18+r()*10,dy:-2+r()*12,r:7+r()*5,bord:1});crete(-(20+r()*14)*rd,-sg*(16+r()*10)*rd);};
  /* LA REMONTÉE : la route grimpe à 9-15° le long d'un escalier d'îlots, jusqu'à la crête */
  S9.remontee=function(){const sg=cote(.7),tu=(9+r()*6)*rd,i0=k();va(.4*vT,sg*(8+r()*8)*rd,tu);va((.6+r()*.6)*vT,sg*(14+r()*20)*rd,tu);const i1=k();
    for(let j=0;j<3;j++){const ii=Math.round(i0+(i1-i0)*(.25+.3*j));dec({t:'ile',k:ii,rel:1,s:-sg,lat:RH+12+r()*26,dy:-10+r()*20,r:8+r()*8,bord:1});}crete(-(18+r()*16)*rd,sg*(14+r()*10)*rd);};}
