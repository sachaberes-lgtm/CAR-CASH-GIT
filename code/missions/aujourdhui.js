/* ===== AUJOURD'HUI — LA SÉRIE DE SEPT JOURS ET LE DÉFI DU JOUR (2026-10-20, Léo coche, séance « ce qu'on n'a jamais vraiment travaillé » :
   « une série de jours qui vaut le coup » · « le défi du jour, taillé pour toi ») =====
   Bâti SUR le retour du jour de Sacha (son/mute-cadeau.js, 14/10 : le ×2 de la 1re partie du jour, la série comptée par jourEtat/jourCommit) :
   rien de son horloge ne change, seule la PRIME de la série est remplacée.
   1. LA SÉRIE DE SEPT JOURS (`SERIE7`) — la prime de série valait 25 à 100 $ (une caisse coûte 1 500 $ à 2,5 M) : on ne la voyait pas, elle ne
      faisait revenir personne. Désormais un CALENDRIER de sept cases, en tête de l'écran MISSIONS : 150 $ · 250 $ · 1 JETON · 400 $ · 600 $ ·
      1 JETON · et au 7e jour UNE PEINTURE EXCLUSIVE (quatre, une par semaine : elles ne s'achètent pas, ni en boutique ni à la boutique du
      jour ; toutes à toi → 2 jetons). Le jour se gagne comme avant : la 1re partie COMPTÉE du jour (jourCommit, ≥ 15 s de course). Après le 7e,
      le calendrier repart au 1er jour (la série, elle, continue de se compter) ; un jour sauté le remet au 1er jour. Un jeton = un tirage de la
      machine FINAL SPIN (≈ 1 700 $ d'espérance, la seconde chance, le départ boosté, le jackpot) : c'est lui qui donne envie.
      Mesuré au modèle de Sacha (outils/jour-modele.cjs) : un joueur moyen gagne 350 à 700 $ par jour ; la semaine pleine verse 1 400 $ + 2 jetons
      + la peinture, contre 375 $ avant. `?serie=ancien` rend la prime de Sacha (0 · 25 · … · 100, JOUR.prime, que le modèle lit toujours).
   2. LE DÉFI DU JOUR (`DJ`, SAVE.d.dj) — UN défi par jour, tiré au 1er regard du jour, gardé jusqu'à minuit (heure de l'appareil) :
      · LA FAMILLE suit TON style : figures dans un saut, temps de vol posé, vitesse, survie, aura, poses parfaites d'affilée, frénésie (si tu l'as
        déjà atteinte) — chacune pèse 1 + ton record ÷ sa référence (plafonné à 3) : qui saute beaucoup reçoit plus de défis de figures. Jamais
        la même famille deux jours de suite. Le tirage vient de la date (même défi toute la journée, sur le même appareil).
      · LE SEUIL est calé sur TON meilleur (les records des missions, m2Etat().r) : égaler ton record pour les petits comptes (figures, poses),
        ~90 % pour le reste ; un plancher de débutant (2 figures, 3 s de vol, 45 s, 250 km/h, 1 500 d'aura, 2 poses, 8 s de frénésie).
      · Il se joue EN UNE PARTIE (les mesures de la course : m2ValCourse) ; réussi → +1 JETON tout de suite et la ligne du bas en course
        (« DÉFI DU JOUR RÉUSSI · +1 JETON ») — la machine FINAL SPIN s'ouvre à l'écran de fin. Rien en balade, bac à sable, parc ni auto-école.
   (2026-11-03 : la carte n'est plus dans MISSIONS — voir L'ÉCRAN DE SÉRIE plus bas) L'AFFICHAGE d'avant : la carte de la série (serieHtml, colonne de gauche de l'écran MISSIONS) — le titre (la série en cours), les sept cases (cochées, celle d'aujourd'hui
   qui bat, DEMAIN annoncé quand la case du jour est prise) et une phrase. L'écran de fin dit ce que la série a donné (jourFinTexte).
   (2026-10-22, Sacha : « enlève le défi du jour, je t'avais dit de l'enlever ») LE DÉFI DU JOUR EST ÉTEINT : `DJ.on` faux sauf `?defijour=1` — plus de tirage, de ligne
   ni de jeton ; le moteur (djTire, djTick…) reste là, intact, pour le rallumer. Seule la série de sept jours garde son affichage.
   Console : dbgSerie() · dbgSerie('jour',n) (pose la série à n jours, prise hier) · dbgDefiJour() · ('force','fig') · ('reussi') · ('demain'). */
const SERIE7={on:!/[?&]serie=ancien\b/.test(location.search),
  /* (2026-11-11, Sacha : « cet écran est minable, rends-le plus beau, plus fun, améliore les récompenses : on doit gagner une voiture épique après 7 jours, plus d'argent ») LA SEMAINE
     DE SÉRIE, refaite : 500 · 1 000 · 2 500 + 1 jeton · 5 000 · 10 000 + 1 jeton · 25 000 + 2 jetons + la peinture exclusive de la semaine · et le 7e jour UNE VOITURE ÉPIQUE (la même
     qu'on voit en silhouette dès le 1er jour) + 50 000. La semaine pleine verse 93 500 € + 4 jetons + une peinture + une épique (≥ 1 M €). Une case peut tout cumuler : cash, jeton, exclu, voiture. */
  /* (2026-11-14, Sacha : « 1 : 1 jeton · 2 : 20 000 € · 3 : 1 jeton + 50 000 € · 4 : 3 jetons · 5 : 1 trainer · 6 : 100 000 + 1 couleur aléatoire · 7 : 1 voiture épique ») LA SEMAINE
     DE SÉRIE v3. `tr` = une TRAÎNÉE tirée au hasard parmi celles de la boutique pas encore à toi ; `coul` = une PEINTURE au hasard pas encore à toi (sans défi de mission) ;
     les deux se tirent au moment du versement (serieDonne) et l'écran dit laquelle. Toutes à toi : la case donne des jetons à la place. Plus d'épique à gagner : 250 000 € + 3 jetons. */
  lots:[{jeton:1},{cash:20000},{cash:50000,jeton:1},{jeton:3},{tr:1},{cash:100000,coul:1},{voiture:1}],
  sac:{cash:250000,jeton:3}};
/* LES QUATRE PEINTURES DE LA SÉRIE (srBraise…, PEINT_CAT, economie/boutique.js) font partie du tirage de la couleur du 6e jour */
function serieCase(n){return ((Math.max(1,n|0)-1)%7)+1;} /* le jour de série n → sa case du calendrier (1 … 7) */
function serieVoiture(){ /* LA VOITURE DE LA SEMAINE : une épique tirée une fois et GARDÉE (SAVE.d.serieCar) — l'écran la montre en silhouette dès le 1er jour, le 7e jour elle sort du portail. -1 : plus aucune épique à gagner */
  let i=SAVE.d.serieCar;if(typeof i==='number'&&i>=0&&spinEpiqueOk(i))return i;
  i=spinEpique();if(SAVE.d.serieCar!==i){SAVE.d.serieCar=i;SAVE.mark();}return i;}
function serieLot(c){ /* le lot de la case c, AVANT le tirage : une COPIE (cash, jeton, tr = 1 une traînée, coul = 1 une couleur, voiture = 1) */
  const B=SERIE7.lots[c-1]||SERIE7.lots[0],L={};for(const k in B)L[k]=B[k];
  if(L.voiture&&serieVoiture()<0){delete L.voiture;for(const k in SERIE7.sac)L[k]=(L[k]|0)+SERIE7.sac[k];} /* plus aucune épique à gagner : un gros sac */
  if(L.tr&&!serieTrPool().length){delete L.tr;L.jeton=(L.jeton|0)+2;} /* toutes les traînées à toi : deux jetons */
  if(L.coul&&!serieCoulPool().length){delete L.coul;L.jeton=(L.jeton|0)+1;} /* toutes les couleurs à toi : un jeton */
  return L;}
function serieTrPool(){const r=[];try{for(const d of COSM.trainee)if(d.p>0&&!d.mis&&!d.pack&&!d.eur&&!shopOwned('trainee',d.id))r.push(d.id);}catch(e){}return r;} /* les traînées de la boutique (à l'argent du jeu) pas encore à toi */
function serieCoulPool(){const r=[];try{for(const d of COSM.peinture)if(d.id!=='usine'&&!(d.def&&d.def.k!=='serie')&&!d.pack&&!shopOwned('peinture',d.id))r.push(d.id);}catch(e){}return r;} /* les peintures pas encore à toi, sauf celles d'une MISSION (elles se gagnent) */
function serieHasard(L){return L.length?L[(Math.random()*L.length)|0]:'';}
function serieDonne(n){ /* appelée par jourCommit (la 1re partie comptée du jour) : verse le lot de la case du jour n, rend {c, cash, jeton, tr, exclu (la couleur), car} */
  const c=serieCase(n),L=serieLot(c),o={c:c,cash:0,jeton:0,tr:'',exclu:'',car:-1};
  if(L.cash){SAVE.d.bank=Math.min(1e30,bank()+L.cash);gagneAjoute(L.cash);bankMaxMaj();o.cash=L.cash;}
  if(L.jeton){SAVE.d.spinJ=Math.min(9,(SAVE.d.spinJ|0)+L.jeton);o.jeton=L.jeton;}
  if(L.voiture){const i=serieVoiture();if(i>=0){if(!Array.isArray(SAVE.d.owned))SAVE.d.owned=[];if(SAVE.d.owned.indexOf(i)<0)SAVE.d.owned.push(i);
    try{carWas[i]=true;}catch(e){} /* comme la machine : la course suivante ne la recrie pas « NOUVELLE CAISSE » */o.car=i;SAVE.d.serieCar=-1;}} /* la prochaine épique se tirera à la semaine suivante */
  if(L.tr){const id=serieHasard(serieTrPool());if(id){const k='trainee:'+id;if(SAVE.d.shop.own.indexOf(k)<0)SAVE.d.shop.own.push(k);o.tr=id;}}
  if(L.coul){const id=serieHasard(serieCoulPool());if(id){const k='peinture:'+id;if(SAVE.d.shop.own.indexOf(k)<0){SAVE.d.shop.own.push(k);try{const c9=m2Etat().c;(c9.pg||(c9.pg=[])).push(id);}catch(e){}}o.exclu=id;}}
  SAVE.mark();return o;}
function serieVu(o){return {cash:o.cash|0,jeton:o.jeton|0,tr:o.tr||'',exclu:o.exclu||'',voiture:o.car>=0?1:0};} /* ce qui a été VERSÉ, dans la forme d'un lot (pour l'affichage) */
function serieApercu(k){const c=serieCase(k),L=serieLot(c);return {c:c,cash:L.cash|0,jeton:L.jeton|0,tr:L.tr?serieHasard(serieTrPool()):'',exclu:L.coul?serieHasard(serieCoulPool()):'',car:L.voiture?serieVoiture():-1};} /* (banc) un versement pour de faux : rien n'est donné */
function serieExcluTxt(L){if(typeof L.exclu!=='string'||!L.exclu)return L.coul?TR('UNE COULEUR'):'';const d=COSM.peinture.find(function(x){return x.id===L.exclu;});return d?TR(d.n):TR('UNE COULEUR');}
function serieTrTxt(L){if(typeof L.tr!=='string'||!L.tr)return L.tr?TR('UNE TRAÎNÉE'):'';const d=COSM.trainee.find(function(x){return x.id===L.tr;});return d?TR(d.n):TR('UNE TRAÎNÉE');}
function serieTrIco(L){let n='tr_hyper';try{const d=typeof L.tr==='string'&&COSM.trainee.find(function(x){return x.id===L.tr;});if(d){const k=d.ico||('tr_'+d.id);if(PXI_G[k])n=k;}}catch(e){}return n;}
function serieLotTxt(L){ /* la pièce MAÎTRESSE du lot : « VOITURE ÉPIQUE » · « +€ 20 000 » · « +1 JETON » · « MATRICE » (la traînée) · « BRAISE FIDÈLE » */
  if(L.voiture)return TR('VOITURE ÉPIQUE');if(L.cash)return '+'+fmtC(L.cash);if(L.jeton)return '+'+L.jeton+' '+TR(L.jeton>1?'JETONS':'JETON');
  if(L.tr)return serieTrTxt(L);return serieExcluTxt(L);}
function serieVue(){ /* l'état du calendrier pour l'affichage : {c : la case du jour (1-7) · pris : la case du jour est déjà gagnée · faits : cases cochées · n : la série vivante} */
  const a=jourAuj();if(!a||!JOUR.on)return null;const e=jourEtat(a);
  if(e.dispo)return {c:serieCase(e.suiv),pris:false,faits:serieCase(e.suiv)-1,n:e.n,casse:e.n>0&&e.suiv===1};
  return {c:serieCase(e.n),pris:true,faits:serieCase(e.n),n:e.n,casse:false};}

/* ---- LE DÉFI DU JOUR ---- */
const DJ={on:/[?&]defijour=1\b/.test(location.search),t:0, /* (2026-10-22, Sacha : « enlève le défi du jour, je t'avais dit de l'enlever ») éteint : ni tirage, ni ligne, ni jeton ; ?defijour=1 le rallume */
  fam:[{k:'fig',  u:'',    ref:4,    min:2,   K:1,   t:'FAIS {v} FIGURES DANS UN SEUL SAUT',en:'LAND {v} TRICKS IN A SINGLE JUMP'},
       {k:'airP', u:'s',   ref:5,    min:3,   K:.9,  t:'TIENS {v} S EN L\'AIR ET POSE-TOI PROPREMENT',en:'STAY {v} S IN THE AIR AND LAND CLEAN'},
       {k:'vie',  u:'mn',  ref:120,  min:45,  K:.9,  t:'SURVIS {v} EN UNE PARTIE',en:'SURVIVE {v} IN ONE RUN'},
       {k:'kmh',  u:'kmh', ref:500,  min:250, K:.95, t:'ATTEINS {v} KM/H',en:'HIT {v} KM/H'},
       {k:'aura', u:'aura',ref:15000,min:1500,K:.85, t:'FAIS {v} D\'AURA EN UNE PARTIE',en:'SCORE {v} AURA IN ONE RUN'},
       {k:'parf', u:'',    ref:3,    min:2,   K:1,   t:'ENCHAÎNE {v} POSES PARFAITES',en:'CHAIN {v} PERFECT LANDINGS'},
       {k:'frenT',u:'s',   ref:20,   min:8,   K:.8,  t:'TIENS LA FRÉNÉSIE {v} S',en:'HOLD FRENZY FOR {v} S'}]};
function djHache(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function djArrondi(f,x){if(f.u==='kmh'||f.u==='mn')return Math.round(x/10)*10;if(f.u==='aura'){const p=Math.pow(10,Math.max(0,Math.floor(Math.log10(Math.max(1,x)))-1));return Math.round(x/p)*p;}
  return Math.round(x);}
function djRecord(f){try{return +m2Val({k:f.k})||0;}catch(e){return 0;}} /* le record à vie (les missions le tiennent) */
function djTire(jour,hier){ /* le défi d'un jour : la famille (ton style, tirée sur la date), le seuil (ton meilleur) */
  const s=m2Etat(),R=[];let tot=0;
  for(const f of DJ.fam){if(f.k===hier)continue;if(f.k==='frenT'&&!(s.r&&s.r.frenN))continue;const w=1+Math.min(2,djRecord(f)/f.ref);R.push([f,w]);tot+=w;}
  let x=(djHache('dj:'+jour)%100000)/100000*tot,f=R[0][0];for(const q of R){x-=q[1];if(x<=0){f=q[0];break;}}
  const b=djRecord(f),v=Math.max(f.min,djArrondi(f,b*f.K));return {d:jour,k:f.k,v:v,b:0,ok:0,y:hier||''};}
function djFam(k){for(const f of DJ.fam)if(f.k===k)return f;return DJ.fam[0];}
function djEtat(){ /* le défi d'AUJOURD'HUI (tiré s'il le faut) ; null si l'horloge est illisible ou le défi éteint */
  if(!DJ.on)return null;const a=jourAuj();if(!a)return null;const S=SAVE.d.dj;
  if(S.d!==a){const n=djTire(a,S.d?S.k:'');SAVE.d.dj=n;SAVE.mark();return n;}return S;}
function djTxt(D){const f=djFam(D.k),v=D.v,x=f.u==='mn'?m2Mn(v):f.u==='aura'?fmtAura(v):m2Nb(v);return String(LANG==='fr'?f.t:f.en).replace('{v}',x);}
function djM(D){const f=djFam(D.k);return {id:'dj',k:f.k,u:f.u,v:D.v,t:f.t,en:f.en};} /* le défi habillé en mission (m2Txt, m2Prog le lisent) */
function djTick(dt){ /* m2Tick (chaque image de course, missions allumées) : le meilleur essai du jour, la réussite */
  if(!DJ.on||(DJ.t-=dt)>0)return;DJ.t=.25;
  const D=djEtat();if(!D||D.ok)return;let v=0;try{v=m2ValCourse(djM(D))||0;}catch(e){return;}
  if(v>D.b){D.b=Math.min(D.v,D.k==='airP'||D.k==='vie'||D.k==='frenT'?Math.floor(v*10)/10:Math.floor(v));SAVE.mark();}
  if(v>=D.v){D.ok=1;D.b=D.v;SAVE.d.spinJ=Math.min(9,(SAVE.d.spinJ|0)+1);SAVE.flush();
    try{if(m2EnC()){M2L.q.unshift({k:'dj',tx:sansAcc(TR('RÉUSSI')),p:'+1 '+TR('JETON')});if(!M2L.on)m2LigneSuit();} /* la ligne du bas, EN TÊTE de la file : jamais fondue dans « n MISSIONS RÉUSSIES » */
      else toast(pxi('coche')+' '+TR('DÉFI DU JOUR RÉUSSI')+' · +1 '+TR('JETON'),true);}catch(e){}
    try{hap([12,40,18]);}catch(e){}}}
/* (2026-11-05, jury HYG-12) djReste : fonction jamais appelée, retirée */ /* ms jusqu'à minuit (l'appareil) */

/* ===== L'ÉCRAN DES MISSIONS À LA MORT (2026-11-05, Sacha : « prends le meilleur écran de mission que t'avais fait, mets-le quand on meurt, la 1re fois, et chaque jour
   quand on meurt la 1re fois ; enlève-le de la mission ») =====
   Le même portail que l'onglet MISSIONS (mcVedette, inchangé : l'anneau qui s'arme, le canon, la silhouette qui garde son secret) est montré SEUL, sur la scène et
   l'œilleton de l'écran de série (.swScene, .swAnneau : mêmes matières). Il s'ouvre AVANT lui, au même guetteur (le jour versé : J.fin.s) ; CONTINUER (ou n'importe quel
   toucher) l'enchaîne tout de suite sur l'écran de série (mvwFerme appelle serieWOuvre). Dans l'onglet MISSIONS, qui ne montre plus cette vedette : toutes les missions
   repassent en liste normale (voir m2Vue.listeTab, ecran-revelation.js) — on peut toujours les suivre et les récupérer là. */
const MVW={on:false,vu:null,t0:0,id:0},MVW_ON=/[?&]mvw=1\b/.test(location.search);
Object.assign(I18N,{'TA PROCHAINE RÉCOMPENSE':'YOUR NEXT REWARD'});
function mvwOuvre(fin){ // fin = ce que jourCommit a versé (J.fin) ; sans paramètre : la dernière fin de partie
  const f=fin||JOUR.fin;if(!f||!f.s||MVW.on)return false;
  if(!MVW_ON){MVW.vu=f;return serieWOuvre(f);} /* (2026-11-11, Sacha : « enlève ces écrans du code du jeu, on doit avoir des écrans mission que quand on gagne un truc ») le portail « TA PROCHAINE RÉCOMPENSE » ne s'ouvre plus : direct l'écran de série (le gain du jour) ; ?mvw=1 le rallume */
  const s=m2Etat(),L=m2Lignes(),V=m2Vue(L,s,false); // vu=false : l'anneau s'arme, comme à l'arrivée sur l'onglet MISSIONS
  if(!(V.vedM&&V.vedM.r&&V.vedM.r.car)){MVW.vu=f;return serieWOuvre(f);} /* (2026-11-07, Sacha : « une mission qui rapporte juste de l'argent, pas d'écran comme ça, c'est juste pour les voitures ») la prochaine récompense n'est pas une caisse : on saute ce portail, direct l'écran de série */
  MVW.on=true;MVW.vu=f;const id=++MVW.id;
  let el=document.getElementById('mvW');if(!el){el=document.createElement('div');el.id='mvW';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.appendChild(el);}
  el.setAttribute('aria-label',sansAcc(TR('MISSIONS')));
  el.innerHTML='<div class="swScene"></div><i class="swAnneau"></i>'
    +'<div class="mvBloc"><small class="mvKick">'+sansAcc(TR('TA PROCHAINE RÉCOMPENSE'))+'</small>'
    +'<div class="mcHero">'+V.ved+'</div>'
    +'<div class="pbtn pb-gold mvBt" role="button" tabindex="0"><span>'+sansAcc(TR('CONTINUER'))+'</span></div></div>';
  el.className='';void el.offsetWidth;el.classList.add('on');
  try{if(SONV2)sfx('ui.volet');}catch(e){}hap(10);
  const ems=el.querySelectorAll('.mcJ i[data-w]'),rgs=el.querySelectorAll('.mcPo .pr[data-o]'),hds=el.querySelectorAll('.mcPo .hd[data-r]');
  setTimeout(function(){if(!MVW.on||MVW.id!==id)return;requestAnimationFrame(function(){
    ems.forEach(function(e){e.style.width=e.getAttribute('data-w')+'%';});rgs.forEach(function(e){e.style.strokeDashoffset=e.getAttribute('data-o');});
    hds.forEach(function(e){e.style.transform='rotate('+e.getAttribute('data-r')+'deg)';});});},REDUCED_MOTION?0:700);
  return true;}
function mvwFerme(){const el=document.getElementById('mvW');if(!MVW.on||!el)return;
  try{if(SONV2)sfx('ui.tampon');else uiClic('ok');}catch(e){}hap(10);
  el.classList.add('fin');MVW.on=false;const f=MVW.vu;
  setTimeout(function(){if(!MVW.on){el.className='';el.innerHTML='';}},REDUCED_MOTION?0:420);
  serieWOuvre(f);} // enchaîne tout de suite sur l'écran de série (qui se referme tout seul si le jour n'a rien d'autre à montrer)
document.addEventListener('click',function(e){const el=document.getElementById('mvW');if(!el||!MVW.on||!el.contains(e.target))return;e.stopPropagation();e.preventDefault();mvwFerme();},true);
document.addEventListener('keydown',function(e){if(!MVW.on)return;if(e.code==='Enter'||e.code==='Space'||e.code==='Escape'){e.preventDefault();e.stopPropagation();mvwFerme();}},true);
/* ===== L'ÉCRAN DE SÉRIE (2026-11-03, Sacha : « la série rapporte un peu plus d'argent chaque jour, puis une voiture épique à la fin ; enlève-la de l'écran missions, mets-la
   dans un écran en plus quand tu meurs, ta 1re partie de la journée, stylé et bien travaillé ») =====
   La série de sept jours (SERIE7) ne vit plus dans MISSIONS. Le jour où la 1re partie COMPTÉE est finie (jourCommit a versé la case : J.fin.s), l'écran de mort arrive, puis
   1 s plus tard L'ÉCRAN DES MISSIONS CI-DESSUS, qui enchaîne sur cet écran (z-index 96) : l'œilleton s'ouvre, sept marches montent (150 → 1 300 $), la case du jour se
   remplit d'or et le gain s'égrène ; au 7e jour la marche est un PORTAIL vert d'où sort la voiture épique gagnée (silhouette qui se remplit, nom, rareté). (2026-11-22) Toucher
   avant la fin ne fait plus rien ; seul CONTINUER ferme (voir serieWFerme).
   Il attend l'offre de seconde chance, la révélation d'une secrète et la machine FINAL SPIN (qui, elle, l'attend). Console : dbgSerie('ecran', n) l'ouvre sur le jour n sans rien verser. */
const SERIEW={on:false,vu:null,t0:0,id:0,btT:0};
function serieWAttend(){try{const f=JOUR.fin;return !!(SERIEW.on||MVW.on||(f&&f.s&&(SERIEW.vu!==f||MVW.vu!==f)&&started&&gameOver));}catch(e){return false;}}
/* (2026-11-11, Sacha : « cet écran est minable, rends-le plus beau, plus fun, améliore les récompenses : une voiture épique après 7 jours, plus d'argent ») L'ÉCRAN DE SÉRIE REFAIT :
   des RAYONS d'or qui tournent et des étincelles derrière ; six CARTES (J1 … J6) dont la pile de billets grossit et change de couleur (gris · bleu · orange · vert · jaune · violet), avec les
   jetons et la peinture en pastilles ; et LA CARTE DU 7e JOUR, grande, au liseré épique : la silhouette de la voiture à gagner (la même toute la semaine, SAVE.d.serieCar), « ENCORE N JOURS ».
   Le jour J, la carte du jour se remplit d'or, le gain s'égrène avec ses pastilles ; le 7e jour la silhouette se remplit et la voiture ÉPIQUE sort du portail, avec le gros bonus. */
const SW_T=[['#b4bcc7','#707a88'],['#5f9bff','#2f5cc0'],['#ffa447','#c4651e'],['#4fdc86','#22934f'],['#ffe056','#c9a51d'],['#bd7bff','#7f3ccb']]; /* un billet par palier : le 5 gris, le 20 bleu, le 50 orange, le 100 vert, le 200 jaune, le 500 violet */
function swPile(n,t){ /* une pile de n billets, en pixels (24 × 26) : le billet du dessus porte son cartouche */
  let r='';for(let i=0;i<n;i++){const y=19-3*i;
    r+='<rect x="2" y="'+y+'" width="20" height="7" fill="'+t[1]+'"/><rect x="2" y="'+y+'" width="20" height="6" fill="'+t[0]+'"/><rect x="2" y="'+y+'" width="20" height="1" fill="#fff" opacity=".5"/>';
    if(i===n-1)r+='<rect x="4" y="'+(y+2)+'" width="16" height="3" fill="#fff" opacity=".3"/><rect x="11" y="'+(y+1)+'" width="2" height="5" fill="'+t[1]+'"/><rect x="10" y="'+(y+2)+'" width="4" height="3" fill="'+t[1]+'"/>';}
  return '<svg class="swSv" viewBox="0 0 24 26" shape-rendering="crispEdges" aria-hidden="true">'+r+'</svg>';}
function swPieces(n){ /* une pile de n jetons d'or, en pixels (24 × 26) */
  let r='';for(let i=0;i<n;i++){const y=20-4*i,x=i%2?3:5;
    r+='<rect x="'+(x-1)+'" y="'+(y-1)+'" width="18" height="7" fill="#4a2a00"/><rect x="'+x+'" y="'+y+'" width="16" height="5" fill="#c4861b"/><rect x="'+x+'" y="'+y+'" width="16" height="3" fill="#ffd34a"/><rect x="'+(x+2)+'" y="'+y+'" width="12" height="1" fill="#fff6c2"/>';}
  return '<svg class="swSv" viewBox="0 0 24 26" shape-rendering="crispEdges" aria-hidden="true">'+r+'</svg>';}
function swNbBillets(v){return v>=100000?5:v>=50000?4:v>=20000?2:1;}
function swJetTxt(n){return n+' '+TR(n>1?'JETONS':'JETON');}
function swPastilles(L){let h='';
  if(L.cash&&L.jeton)h+='<u class="swPl jt">'+pxi('piece')+'<span>×'+L.jeton+'</span></u>';
  if(L.exclu||L.coul)h+='<u class="swPl pn">'+pxi('pinceau')+'</u>';return h;}
function swCarte(k,c,L){const v=k===c?'auj':k<c?'fait':'futur',t=SW_T[k-1];let ico,lab;
  if(L.cash){ico=swPile(swNbBillets(L.cash),t);lab=fmtC(L.cash);}
  else if(L.jeton){ico=swPieces(Math.min(5,L.jeton+1));lab=swJetTxt(L.jeton);}
  else if(L.tr){ico='<span class="swTr">'+pxi(serieTrIco(L))+'</span>';lab=TR('TRAÎNÉE');}
  else{ico=swPieces(2);lab='';}
  return '<i class="swJ '+v+'" style="--i:'+k+';--c1:'+t[0]+';--c2:'+t[1]+'"><em>'+(LANG==='en'?'D':'J')+k+'</em><span class="swIco">'+ico+'</span>'
    +'<b>'+sansAcc(lab)+'</b><span class="swBo">'+swPastilles(L)+'</span>'+(k<c?'<s class="swOk">'+pxi('coche')+'</s>':'')+'</i>';}
function swBons(L){let h=''; /* ce qui vient EN PLUS de la pièce maîtresse (serieLotTxt) */
  if(L.cash&&L.jeton)h+='<u class="swPl jt">'+pxi('piece')+'<span>+'+sansAcc(swJetTxt(L.jeton))+'</span></u>';
  if(L.tr&&!L.cash&&!L.jeton)h+='<u class="swPl tr">'+pxi(serieTrIco(L))+'<span>'+sansAcc(TR('NOUVELLE TRAÎNÉE'))+'</span></u>';
  if(L.exclu)h+='<u class="swPl pn">'+pxi('pinceau')+'<span>'+sansAcc(serieExcluTxt(L))+'</span></u>';return h;}
function swMonte(el,V,id,fin){ /* le gain qui s'égrène : « + € 0 » → « + € V » en 1 s, une pièce tous les 70 ms */
  const T0=performance.now(),D=REDUCED_MOTION?1:1100;let last=0;
  (function m(now){if(!SERIEW.on||SERIEW.id!==id)return;const u=Math.min(1,(now-T0)/D),v=V*(1-Math.pow(1-u,3));el.textContent='+'+fmtC(u<1?v:V);
    if(u<1&&now-last>70){last=now;try{if(SONV2)sfx('spin.piece');}catch(e){}}if(u<1)requestAnimationFrame(m);else fin();})(T0);}
function serieWOuvre(fin){ // fin = ce que jourCommit a versé ({n, casse, s:{c,cash,jeton,car}}) ; sans paramètre : la dernière fin de partie
  const f=fin||JOUR.fin;if(!f||!f.s||SERIEW.on)return false;
  SERIEW.on=true;SERIEW.vu=f;SERIEW.t0=performance.now();SERIEW.btT=0;const id=++SERIEW.id,o=f.s,c=o.c||serieCase(f.n),L=serieVu(o),J=(LANG==='en'?'D':'J'); /* (2026-11-14) L = ce qui a été VERSÉ (la traînée et la couleur tirées), pas le lot de la table */
  const car=o.car>=0?o.car:(c<7?serieVoiture():-1),jourCar=o.car>=0;
  let el=document.getElementById('serieW');if(!el){el=document.createElement('div');el.id='serieW';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.appendChild(el);}
  el.setAttribute('aria-label',sansAcc(TR('SÉRIE DE CONNEXION')));
  let cs='';for(let k=1;k<=6;k++)cs+=swCarte(k,c,k===c?L:serieLot(k));
  const ni=serieLot(serieCase(c+1)),pied=sansAcc(TR('REVIENS DEMAIN'))+(LANG==='fr'?' : ':': ')+'<b>'+sansAcc(serieLotTxt(ni))+'</b>'+(f.casse?'<i>'+sansAcc(TR('SÉRIE PERDUE · ON REPART AU 1ER JOUR'))+'</i>':'');
  const ri=rarInfo('epique'),reste=7-c,
    hx=jourCar?'':sansAcc(reste===1?TR('DEMAIN !'):TR('ENCORE {n} JOURS').replace('{n}',reste));
  let et='';for(let k=0;k<16;k++)et+='<i style="left:'+((Math.random()*100)|0)+'%;--d:'+(Math.random()*6).toFixed(2)+'s;--t:'+(5+Math.random()*5).toFixed(1)+'s;--s:'+(2+((Math.random()*3)|0)*2)+'px"></i>';
  el.style.setProperty('--rc',ri.c);
  el.innerHTML='<div class="swScene"></div><i class="swRayons"></i><div class="swEtinc">'+et+'</div><i class="swAnneau"></i>'
    +'<div class="swBloc"><div class="swG"><div class="swHd"><small>'+sansAcc(TR('SÉRIE DE CONNEXION'))+'</small><b>'+pxi('flamme')+sansAcc(TR('JOUR'))+' '+c+'<i>/ 7</i></b>'+(f.n>7?'<em>'+sansAcc(TR('SÉRIE')+' '+f.n+' '+TR('JOURS'))+'</em>':'')+'</div>'
    +'<div class="swGrille">'+cs+'</div></div><div class="swD">'
    +(car>=0?'<div class="swHero '+(jourCar?'auj':'futur')+'"><div class="swHt"><em>'+J+'7</em>'+pxi('flamme')+'<span class="swRar">'+sansAcc(TR(ri.n1))+'</span>'+pxi('flamme')+'</div>'
      +'<div class="swPh"><img class="c" alt=""><img class="n" alt=""><i class="swLigne"></i><s class="swQ">?</s></div><div class="swNom"></div><div class="swHx">'+hx+'</div></div>':'')
    +'<div class="swGain"><small>'+sansAcc(TR(jourCar?'EN BONUS':'AUJOURD\'HUI'))+'</small><b>+'+fmtC(0)+'</b><div class="swBons">'+swBons(L)+'</div></div>'
    +'<div class="swPied">'+pied+'</div>'
    +'<div class="pbtn pb-gold swBt" role="button" tabindex="0"><span>'+sansAcc(TR('CONTINUER'))+'</span></div></div></div>';
  el.className='';void el.offsetWidth;el.classList.add('on');if(car>=0)el.classList.add('voiture');
  try{if(SONV2)sfx('ui.volet');}catch(e){}hap(10);
  const T=function(fn,ms){setTimeout(function(){if(SERIEW.on&&SERIEW.id===id)fn();},REDUCED_MOTION?0:ms);};
  const b=el.querySelector('.swGain b'),V=L.cash|0,nomEl=el.querySelector('.swNom'),rien=jourCar&&!V&&!L.jeton; /* le 7e jour : la voiture seule, pas de case de gain vide */
  if(rien)el.classList.add('seule');
  if(nomEl)nomEl.textContent=sansAcc(TR(jourCar?CARS[car].name:'VOITURE ÉPIQUE'));
  SERIEW.fini=function(){SERIEW.btT=performance.now();el.classList.add('plein','gain','nom','bt');if(b)b.textContent=V?'+'+fmtC(V):sansAcc(jourCar?'+'+swJetTxt(L.jeton|0):serieLotTxt(L));};
  const gain=function(){el.classList.add('plein','gain');
    if(rien)return;if(!V){b.textContent=sansAcc(jourCar?'+'+swJetTxt(L.jeton):serieLotTxt(L));el.classList.add('bons');try{if(SONV2)sfx('ui.achat');}catch(e){}hap([12,40,12]);try{pixBurst(b,12);}catch(e){}return;}
    swMonte(b,V,id,function(){try{if(SONV2)sfx('ui.achat');}catch(e){}hap([12,40,12]);try{pixBurst(b,12);}catch(e){}el.classList.add('bons');
      try{pixBurst(el.querySelector('.swJ.auj')||b,10);}catch(e){}});};
  if(car>=0){
    const go=function(url){if(!SERIEW.on||SERIEW.id!==id)return;const a=el.querySelector('img.c'),n=el.querySelector('img.n');
      if(url){a.src=url;n.src=url;}else el.querySelector('.swPh').classList.add('vide');
      if(jourCar){
        T(function(){el.classList.add('plein');try{if(SONV2)sfx('ui.debloque');}catch(e){}hap([20,60,20,60,60]);},1900);
        T(function(){el.classList.add('nom');try{pixBurst(el.querySelector('.swNom'),12);}catch(e){}},3400);
        T(function(){gain();},3900);T(function(){el.classList.add('bt');SERIEW.btT=performance.now();},5500);}
      else{T(function(){gain();},400);T(function(){el.classList.add('bt');SERIEW.btT=performance.now();},2100);}};
    T(function(){try{carPhoto(car,go);}catch(e){go(null);}},jourCar?1100:900);
  }else{T(gain,1300);T(function(){el.classList.add('bt');SERIEW.btT=performance.now();},2900);}
  if(!jourCar&&car>=0)T(function(){el.classList.add('plein');},1500); /* la carte du jour se remplit d'or avec le gain */
  return true;}
/* (2026-11-22, Sacha : « quand on a des séries de connexions quotidiennes et qu'on gagne de l'argent, quand on tape sur l'écran en boucle, on peut skip trop rapidement, du coup on peut rater l'information »)
   L'ÉCRAN DE SÉRIE NE SE ZAPPE PLUS : un toucher pendant que le gain s'égrène ne fait rien ; il se ferme par le bouton CONTINUER seulement (ou le clavier), pas avant 0,7 s après son apparition.
   Secours : si le bouton n'est jamais venu au bout de 9 s (photo de la voiture qui n'arrive pas), un toucher pose tout. */
function boutonVu(b){try{if(!b)return false;const r=b.getBoundingClientRect();return r.height>4&&r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth;}catch(_){return false;}} /* le bouton est-il ENTIER dans l'écran ? (lu aussi par m2RevFerme) */
function serieWFerme(e){const el=document.getElementById('serieW');if(!SERIEW.on||!el)return;const now9=performance.now();
  if(!el.classList.contains('bt')){if(now9-SERIEW.t0>9000){if(SERIEW.fini)SERIEW.fini();el.classList.add('bons');}return;} // pas fini : on regarde
  if(now9-(SERIEW.btT||SERIEW.t0)<700)return;
  if(REDUCED_MOTION&&now9-SERIEW.t0<2500)return; /* (2026-11-22) « réduire les animations » : tout est posé d'un coup, le bouton avec — l'écran reste quand même 2,5 s (il se zappait en 0,8 s) */
  /* à côté du bouton : il se signale — SAUF s'il n'est pas entier à l'écran (petit écran : 320 × 568, Safari et ses barres) : sans cela plus rien ne fermait, n'importe quel toucher ferme alors */
  if(e&&e.target&&e.target.closest&&!e.target.closest('.swBt')&&boutonVu(el.querySelector('.swBt'))){try{gSecoue(el.querySelector('.swBt'));}catch(_){}return;}
  try{if(SONV2)sfx('ui.tampon');else uiClic('ok');}catch(e){}hap(10);
  try{carSnapshot();}catch(e){}
  el.classList.add('fin');SERIEW.on=false;setTimeout(function(){if(!SERIEW.on){el.className='';el.innerHTML='';}},REDUCED_MOTION?0:420);}
document.addEventListener('click',function(e){const el=document.getElementById('serieW');if(!el||!SERIEW.on||!el.contains(e.target))return;e.stopPropagation();e.preventDefault();serieWFerme(e);},true);
document.addEventListener('keydown',function(e){if(!SERIEW.on)return;if(e.code==='Enter'||e.code==='Space'||e.code==='Escape'){e.preventDefault();e.stopPropagation();serieWFerme();}},true);
setInterval(function(){try{ // le guetteur : l'écran de mort est là, la série du jour a été versée → 0,9 s plus tard, l'écran des missions, qui enchaîne sur celui de série
  const f=JOUR.fin;if(MVW.on||SERIEW.on||!f||!f.s||MVW.vu===f){MVW.t0=0;return;}
  if(!(started&&gameOver)||garageOn||SANDBOX||!document.querySelector('#mDead.on')||M2REV.on||ecranWipe._on||(typeof chanceAttend==='function'&&chanceAttend())||(typeof SPIN!=='undefined'&&SPIN.ouvert)){MVW.t0=0;return;}
  if(!MVW.t0)MVW.t0=performance.now();else if(performance.now()-MVW.t0>900){MVW.t0=0;mvwOuvre(f);}
}catch(e){}},200);
Object.assign(I18N,{'EN BONUS':'BONUS','DEMAIN !':'TOMORROW!','ENCORE {n} JOURS':'{n} MORE DAYS','SÉRIE DE CONNEXION':'LOGIN STREAK','REVIENS DEMAIN':'COME BACK TOMORROW','VOITURE ÉPIQUE':'EPIC CAR','TRAÎNÉE':'TRAIL','NOUVELLE TRAÎNÉE':'NEW TRAIL','UNE TRAÎNÉE':'A TRAIL','UNE COULEUR':'A PAINT'});
Object.assign(I18N,{'DÉFI DU JOUR':'DAILY CHALLENGE','DÉFI DU JOUR RÉUSSI':'DAILY CHALLENGE DONE','JETON':'TOKEN','JETONS':'TOKENS','RÉUSSI':'DONE','MEILLEUR ESSAI':'BEST TRY',
  'NOUVEAU DÉFI DANS':'NEW CHALLENGE IN','NOUVEAU DANS':'NEW IN','AUJOURD\'HUI':'TODAY','DEMAIN':'TOMORROW','REVIENS DEMAIN':'COME BACK TOMORROW','JOUR':'DAY',
  'SÉRIE PERDUE · ON REPART AU 1ER JOUR':'STREAK LOST · BACK TO DAY 1','JOUE UNE PARTIE POUR LA CASE DU JOUR':'PLAY A RUN FOR TODAY\'S BOX','UNE PARTIE POUR LE RÉUSSIR':'ONE RUN TO DO IT',
  'FAIS {v} FIGURES DANS UN SEUL SAUT':'LAND {v} TRICKS IN A SINGLE JUMP','BRAISE FIDÈLE':'FAITHFUL EMBER','AURORE BORÉALE':'NORTHERN LIGHTS','LAGON INTERDIT':'FORBIDDEN LAGOON','NUIT ÉTOILÉE':'STARRY NIGHT',
  'Sept jours d\'affilée sur l\'asphalte, la laque en garde la chaleur.':'Seven days in a row on the asphalt, and the paint keeps the heat.',
  'Le ciel du Grand Nord, pour ceux qui reviennent chaque jour.':'The sky of the far north, for those who come back every day.',
  'Une eau que personne n\'a le droit de voir. Toi si.':'Water nobody is allowed to see. Except you.',
  'La nuit entière sur ta carrosserie, une semaine de plus.':'The whole night on your body panels, one more week.'});
window.dbgSerie=function(a,n){ /* (banc) l'état du calendrier · ('jour',n) : la série à n jours, prise HIER (la case suivante est à jouer) · ('pris',n) : prise aujourd'hui */
  if(a==='verse'){const k=Math.max(1,n|0),cpt=function(){const w=SAVE.d.shop.own;return {banque:bank(),jetons:SAVE.d.spinJ|0,trainees:w.filter(function(x){return x.indexOf('trainee:')===0;}).length,peintures:w.filter(function(x){return x.indexOf('peinture:')===0;}).length,voitures:(SAVE.d.owned||[]).length};},
    av=cpt(),o=serieDonne(k);SAVE.flush();serieWOuvre({n:k,casse:false,s:o});const ap=cpt(),d={};for(const x in ap)d[x]=ap[x]-av[x];return {lot:o,verse:d};} /* (2026-11-14) VERSE vraiment la case du jour n (banc), ouvre l'écran, rend ce qui a bougé */
  if(a==='ecran'){const k=Math.max(1,n|0);return serieWOuvre({n:k,casse:false,s:serieApercu(k)});} /* (2026-11-03) l'écran de série sur le jour n, sans rien verser */
  if(a==='mission'){const k=Math.max(1,n|0);return mvwOuvre({n:k,casse:false,s:serieApercu(k)});} /* (2026-11-05) l'écran des missions seul (puis la série), sans rien verser */
  if(a==='jour'||a==='pris'){const t=new Date();if(a==='jour')t.setDate(t.getDate()-1);const y=t.getFullYear(),m=t.getMonth()+1,d=t.getDate();
    SAVE.d.jour={d:y+'-'+(m<10?'0':'')+m+'-'+(d<10?'0':'')+d,n:Math.max(0,n|0)};SAVE.flush();}
  const S=serieVue();return {actif:SERIE7.on,vue:S,lotDuJour:S?serieLot(S.c):null,demain:S?serieLot(serieCase(S.c+1)):null,traineesAGagner:serieTrPool().length,couleursAGagner:serieCoulPool().length,jetons:SAVE.d.spinJ|0};};
window.dbgDefiJour=function(a,k){ /* (banc) le défi d'aujourd'hui · ('force','fig') : cette famille · ('reussi') · ('demain') : retirer le défi (le prochain regard en tire un neuf) */
  if(a==='force'){const f=djFam(k),b=djRecord(f);SAVE.d.dj={d:jourAuj(),k:f.k,v:Math.max(f.min,djArrondi(f,b*f.K)),b:0,ok:0,y:''};SAVE.flush();}
  else if(a==='reussi'){const D=djEtat();if(D&&!D.ok){D.ok=1;D.b=D.v;SAVE.d.spinJ=Math.min(9,(SAVE.d.spinJ|0)+1);SAVE.flush();}}
  else if(a==='demain'){SAVE.d.dj.d='';SAVE.flush();}
  const D=djEtat();if(!D)return 'éteint';const m=djM(D);
  return {jour:D.d,famille:D.k,texte:djTxt(D),seuil:D.v,meilleurDuJour:D.b,reussi:!!D.ok,record:djRecord(djFam(D.k)),hier:D.y,poids:DJ.fam.map(function(f){return f.k+' '+(1+Math.min(2,djRecord(f)/f.ref)).toFixed(2);}),jetons:SAVE.d.spinJ|0};};
