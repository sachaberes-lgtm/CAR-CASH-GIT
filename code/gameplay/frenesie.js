/* LA ZONE ROUGE (2026-09-28, Sacha : « une petite part rouge dans la barre de flow — une zone de tolérance pour rester en frénésie
   plus souvent »). Une HYSTÉRÉSIS qu'on VOIT : on ENTRE en FRÉNÉSIE en remplissant la jauge jusqu'au bout (100, inchangé) ; on y
   RESTE tant que le remplissage ne repasse pas sous `FREN.seuil`. Les 12 derniers points de la jauge sont peints en rouge dès le
   départ — c'est la marge qu'on a le droit de brûler. (FLOW v2, même nuit) Ce qu'elle coûte à tenir vit dans `FLOW2.fren` : une
   brûlure permanente que la VITESSE module (en nitro ~3× moins, ralenti ~3× plus), la fuite passé le répit — et rien en vol.
   `flowLvDe` est le SEUL calcul du palier. */
const FREN={seuil:88,acc:0,scT:0,brT:0,kb:false,vu:false,appris:false,el:null,hS:0,t:0,rec:false,nitDit:false,chr:null,chrS:-1,
  tr:{n:0,m:0,p:0},k:3,dit:{n:false,m:false,p:false},trEl:null,trAff:'',arme:false,coup:false,butin:0}; // arme = jauge pleine, la frénésie attend son déclencheur (une figure POSÉE ; en ville aussi un SUPER TURBO, un raccourci — loi 20) · coup = ce déclencheur est en train d'armer : l'armement se tait // (v4) la TRIADE : charge (s) de chaque trait · k = traits vivants · dit = son appel déjà soufflé // (v3) t = depuis quand on la tient · rec = record battu pendant celle-ci · nitDit = « NITRO ! » déjà soufflé · chr = le chrono sous l'emblème
function flowLvDe(v){const b=Math.min(4,Math.floor(v/25));return (FLOW.lv===4&&v>=FREN.seuil)?4:b;}
function flowMult(){return ECO3.flow[FLOW.lv]||1;}          // ×1 · ×1,3 · ×1,5 · ×1,8 · ×3 sur l'argent (vague 3 : c'était +0,5 par palier, jusqu'à ×3 · 2026-09-29 : la FRÉNÉSIE ×2 → ×3 — voir ECO3)
/* flowAdd(q, famille) — `q` est la valeur BRUTE du geste ; la famille ('route' · 'style' · 'risque', style par défaut) et le
   barème FLOW2 disent ce qu'il vaut VRAIMENT ici, à cette vitesse. */
function flowAdd(q,fam,trait){
  if(!(q>0)||!started||gameOver||PARK.on)return;
  fam=fam||'style';
  const t9=trait||(fam!=='route'?'n':null); // (v5) chaque geste a un AUTEUR : le style et le risque sont NARCISSE sauf trait désigné ; la route seule n'en a pas
  if(FLOW.lv===4&&t9){frenTrait(t9,fam==='risque'?1:(FLOW2.part[fam]||0)*Math.min(1,q/6));flowTag(t9,1);} // (v5) en frénésie le style nourrit aussi, au tiers
  const v0=FLOW.v,g=flowGainDe(q,fam,v0,FLOW.lv,FLOW.vit);
  if(FLOW.jr){FLOW.jr.push([+(performance.now()/1000).toFixed(2),fam,+q.toFixed(2),+g.toFixed(2),+v0.toFixed(1),+FLOW.vit.toFixed(2)]);if(FLOW.jr.length>80)FLOW.jr.shift();} // journal : seulement quand dbgFren('journal') l'a ouvert
  if(!(g>0)){ // refusé. Dans la TRIADE sous la vitesse, le jeu le DIT — une fois par partie, et jamais pour une pièce
    if(fam!=='route'&&FLOW.lv<4&&v0>=75&&FLOW.vit<FLOW2.gate&&!FLOW.lentVu){FLOW.lentVu=true;popTexte('PLUS VITE !',FLOW_COL[4],1);if(SONV2)sfx('plus.vite');}
    return;}
  FLOW.v=Math.min(100,v0+g);livre('f:'+fam,FLOW.v-v0);if(flowGardeDe(fam,v0))FLOW.idle=0;
  if(t9&&FLOW.lv<4)flowTag(t9,1); // (v5) l'auteur du geste s'affiche à côté de FLOW
  if(FLOW.lv===4){frenNourrit(g);return;}   // déjà en FRÉNÉSIE : chaque goutte de style fait SCINTILLER la jauge (et cogne dans l'emblème)
  const lv=Math.min(3,flowLvDe(FLOW.v)); // (v4) la jauge pleine ne fait plus entrer : elle ARME (voir frenArme) — c'est la POSE qui déclenche
  if(FLOW.v>=100&&!FREN.arme)frenArme();
  if(lv>FLOW.lv){FLOW.lv=lv;const rv9=lv>=3&&!FLOW.revele; /* (console de son) la TRIADE qui s'ouvre a SON son : pas « FLOW III » par-dessus */
    if(lv>=3&&!FLOW.revele)flowRevele(); // la rose est pleine : la TRIADE s'ouvre (et c'est elle qu'on annonce, pas « FLOW III »)
    else popTexte(FLOW_NOM[lv]+' · $×'+fmtMul(flowMult()),FLOW_COL[lv],1);
    flowPunch();
    hap([12,30,16]);try{if(!(SONV2&&rv9))flowSnd(lv);}catch(e){}
    fovPunch=Math.max(fovPunch,4+lv*2);}
}
function flowTagEl(t){
  const h=FLOW.el;if(!h)return null;
  let r=h.querySelector('.fT');
  if(!r){r=document.createElement('span');r.className='fT';r.innerHTML='<i data-t="n"></i><i data-t="m"></i><i data-t="p"></i>';
    const l=h.querySelector('.fL');if(l)l.after(r);else h.appendChild(r);FTAG.n.e=FTAG.m.e=FTAG.p.e=null;}
  const o=FTAG[t];return o.e||(o.e=r.querySelector('[data-t="'+t+'"]'));
}
function flowTag(t,s){ // s : +1 le trait gagne · -1 il perd
  const o=FTAG[t];if(!o||!started||PARK.on)return;
  const n=performance.now(),neuf=o.s!==s||n>o.fin;o.s=s;o.fin=n+(s<0?1800:1400);
  if(!neuf)return;
  const e=flowTagEl(t);if(!e)return;
  e.textContent=(s<0?'-':'+')+TR(TRAIT_NOM[t]);e.classList.toggle('moins',s<0);
  const k=o.k=!o.k;e.classList.remove(k?'on':'on2');e.classList.add(k?'on2':'on'); // deux animations jumelles : relance sans remise en page
  flowTagCompte();
}
function flowTagCompte(){const r=FLOW.el&&FLOW.el.querySelector('.fT');if(r)r.classList.toggle('trois',!!(FTAG.n.s&&FTAG.m.s&&FTAG.p.s));}
function flowTagTick(){const n=performance.now();let c=false;
  for(const t in FTAG){const o=FTAG[t];if(o.s&&n>o.fin){o.s=0;c=true;if(o.e)o.e.classList.remove('on','on2','moins');}}
  if(c)flowTagCompte();}
function flowTagRaz(){for(const t in FTAG){const o=FTAG[t];o.s=0;o.fin=0;if(o.e)o.e.classList.remove('on','on2','moins');}flowTagCompte();}
/* (v5) LA FAUTE — un geste raté coûte au trait qui l'a commis. Hors frénésie : le répit saute (la jauge fuit tout de suite) et `pts`
   points partent, jamais sous le palier en cours. En frénésie : le trait perd `part` de sa mémoire. */
function flowFaute(t,pts,part){
  if(!started||gameOver||PARK.on||!(FLOW.v>0))return;
  if(FLOW.lv===4){const T9=FLOW2.triade[t];if(T9&&part>0)FREN.tr[t]=Math.max(0,FREN.tr[t]-T9.mem*part);}
  else{FLOW.idle=Math.max(FLOW.idle,FLOW2.grace);if(pts>0)FLOW.v=Math.max(Math.floor(FLOW.v/25)*25,FLOW.v-pts);}
  flowTag(t,-1);
}
/* (v5) LA SÉRIE ENTIÈRE — Sacha : « NARCISSE récompense les séries de pièces entières ». Chaque motif de pièces (zigzag, arc, cercle,
   jackpot — pas l'éparpillé) porte un numéro posé par spawnPickups sans toucher au `rnd` seedé ; la DERNIÈRE pièce du motif, sur la face
   où on roule, le paie : un geste de style signé NARCISSE, à la mesure du motif. */
function serieEtat(){return serieEtat.s||(serieEtat.s={n:0,g:0,tot:[],got:{}});}
function coinSerie(p){
  const S=serieEtat(),k=p.grp*2+(p.face>0?0:1),c=S.got[k]=(S.got[k]||0)+1,n=S.tot[p.grp]|0;
  if(n<4||c!==n)return;
  flowAdd(3+n*.4,'style','n');
  popTexte(TR('SÉRIE COMPLÈTE')+' ×'+n,'#ffd75e',0);
  try{if(SONV2)sfx('piece.serie',{vol:1});else{ /* (2026-10-14, session SON) +4 comme la pièce : la SÉRIE COMPLÈTE (−31) sonnait sous une pièce seule (−30) — (2026-10-15) la pièce v2 sort à −35 : la série +1 = −32, toujours au-dessus */chimeNote(noteP(4,1),0,.05,.2);chimeNote(noteP(7,1),.07,.05,.3);}}catch(e){}
}
/* (v4, Sacha : « quand on passe en frénésie après avoir POSÉ UNE FIGURE — l'atterrissage est la condition pour déclencher la frénésie,
   en plus du score de flow — ça doit déclencher la voix TRIPLE MONSTRE et l'écriture TRIPLE MONSTER »). LA JAUGE PLEINE ARME (frenArme :
   la zone rouge bat, « POSE UNE FIGURE ! ») ; LA FRÉNÉSIE PART À LA POSE d'un vol qui a porté une figure (vrille, météore, dauphin,
   bump, BIG AIR…) et qui n'est pas RATÉE (tryLand → frenDeclenche). Désarmée si la jauge repasse sous la zone rouge (flowTick). */
/* LE RALENTI DE LA FRÉNÉSIE (2026-09-29, Sacha : « quand on débloque la frénésie, rajoute un ralenti le temps que le texte parte »).
   SEULE exception au verdict du 26/09 (« enlève tous les modes ralentis du jeu ») : les anciens déclencheurs (slowT/hitT) restent
   muets, vidés dans la boucle. Le temps du jeu tombe à ×RALENTI.k en 0,1 s (le titre TRIPLE MONSTER claque), TIENT pendant que le
   sang coule, puis revient en douceur pendant que le titre s'efface — RALENTI.d secondes RÉELLES = la vie exacte de #frenTitre
   (ftVie, 2,7 s). La pause le fige (il reprend où il en était), la mort et le retour au menu l'annulent. `dbgRalenti(d)` au banc. */
const RALENTI={t:0,d:2.7,k:.3};
function ralentiPose(d){RALENTI.d=d||2.7;RALENTI.t=RALENTI.d;}
function ralentiDt(dt){ // dt RÉEL → dt du JEU (appelé par la boucle, après le vidage de slowT/hitT)
  if(RALENTI.t<=0)return dt;
  if(!running||gameOver){RALENTI.t=0;return dt;}
  if(paused)return dt;
  RALENTI.t=Math.max(0,RALENTI.t-dt);const u=1-RALENTI.t/RALENTI.d,k=RALENTI.k;
  return dt*(1+(k-1)*THREE.MathUtils.smoothstep(u,0,.04)*(1-THREE.MathUtils.smootherstep(u,.45,1)));}
function frenArme(){
  FREN.arme=true;FLOW.aff=-1;
  if(FREN.coup)return; // (loi 20) le geste qui arme DÉCLENCHE aussi (voir flowAddDecl) : « DRIFT OU FIGURE ! » par-dessus TRIPLE MONSTER serait un contresens
  popTexte(FLOW2.decl.drift<=3?'DRIFT OU FIGURE !':'POSE UNE FIGURE !',FLOW_COL[4],2);hap([10,30,10]); // (loi 20) l'armement dit CE QUI déclenche ICI : en ville, le drift aussi
  try{pixBurst(FLOW.el&&FLOW.el.querySelector('.fZ'),8);if(SONV2)sfx('frenesie.arme');else chimeNote(noteP(7,1),0,.06,.25);}catch(e){}
}
/* (loi 20 de FLOW2, 2026-09-30) LE GESTE QUI DÉCLENCHE. En VILLE (`FLOW2.decl`), le relâcher d'un SUPER/ULTRA TURBO (driftTick) et le
   RACCOURCI posé (tryLand) font partir la frénésie armée, comme une figure posée. Ce geste peut lui-même REMPLIR la jauge : flowAddDecl
   le verse en taisant l'armement (FREN.coup) — la frénésie part dans la foulée (ou la pose ratée la vide), l'annonce d'armement
   n'aurait vécu que le temps de se faire recouvrir. */
function flowAddDecl(q,fam,trait){FREN.coup=true;try{flowAdd(q,fam,trait);}finally{FREN.coup=false;}}
function frenDeclenche(){
  FREN.arme=false;FLOW.v=100;FLOW.lv=4;FLOW.idle=0;FLOW.aff=-1;
  frenDebut(); // (v3) le chrono part — et l'annonce dit ce qu'il y a à BATTRE (le record de tenue), sinon ce que ça paie
  const rc9=(SAVE.d.frenRec||0)>=5?SAVE.d.frenRec:0;
  // (×3, 2026-09-29) passé la 1re de la session (la règle des trois traits), le sous-titre dit TOUJOURS ce que ça paie — et le record à battre à côté
  const cash9='CASH ×'+fmtMul(flowMult());
  slam('FRÉNÉSIE !',!FREN.vu?'TIENS LES TROIS TRAITS':rc9?cash9+' · '+TR('RECORD')+' '+frenDuree(rc9):cash9,FLOW_COL[4],'#ffb000',44,2,22);FREN.vu=true;flashEcran('rgba(255,42,61,.6)');
  try{annSpeak('frenesie');}catch(e){} // (2026-09-28, Sacha : « ça doit déclencher la voix TRIPLE MONSTRE quand la frénésie est atteinte ») — à chaque fois, hors règle du 1/3 ; l'interrupteur VOIX reste maître
  try{frenMus(true);}catch(e){} // …et SON morceau tombe (THE DARK TRIAD — voir MUSIC_FREN)
  flowPunch();
  hap([20,40,20,40,40]);try{flowSnd(4);}catch(e){}
  fovPunch=Math.max(fovPunch,12);
  ralentiPose(2.7); // (2026-09-29, Sacha) le RALENTI, le temps que TRIPLE MONSTER parte — voir RALENTI
  flowHudMaj(9); // l'emblème (#triade.on) se pose TOUT DE SUITE : le titre TRIPLE MONSTER de la session UI l'attend
}
/* EN FRÉNÉSIE, LA JAUGE SCINTILLE QUAND ON LA NOURRIT (Sacha : « la barre doit devenir toute rouge et scintiller quand elle reçoit
   encore du flow »). Les gouttes s'accumulent (le RASE-BORD en verse un filet à chaque image, une pièce 0,7) : à 1,2 point on relance
   l'éclat — au plus toutes les 110 ms, un filet continu scintille donc EN CONTINU. Deux classes jumelles (.sc1/.sc2) : un nouveau nom
   d'animation repart de zéro sans forcer de mise en page. La gerbe de braises, elle, se retient (420 ms) : une gerbe, pas une nuée. */
function frenNourrit(q){
  FREN.acc+=q;const t=performance.now();
  if(FREN.acc<1.2||t-FREN.scT<110)return;
  FREN.acc=0;FREN.scT=t;
  const h=FLOW.el,k=FREN.kb=!FREN.kb;
  if(h){h.classList.remove(k?'sc1':'sc2');h.classList.add(k?'sc2':'sc1');}
  const tr=frenEl();if(tr&&tr.classList.contains('on')){tr.classList.remove(k?'bat1':'bat2');tr.classList.add(k?'bat2':'bat1');}
  if(h&&t-FREN.brT>420){FREN.brT=t;try{pixBurst(h.querySelector('.fZ'),4);}catch(e){}}
}
/* LA FRÉNÉSIE ×3 (2026-09-29, Sacha : « en mode frénésie on doit gagner 3× l'argent, adapte ça de manière cool au gameplay »). Toute la
   paie de course passe par flowMult() (ECO3.flow[4] = 3). Sur téléphone le compteur d'argent est masqué (écran nu) : le ×3 doit donc se
   VOIR là où l'argent naît. Chaque gain en frénésie (frenCash — pièces, portail, butins de la ville) :
   · fait FRAPPER le « $×3 » de la bande du flow (qui bat or ⇄ rouge tant qu'elle tient, <style id="frenX3">) et, au plus toutes les
     0,4 s, en fait jaillir une petite gerbe de pixels d'OR (pixCouleurs le reconnaît : c'est de l'argent, pas une braise) ;
   · fait jaillir un petit « ×3 » de la pièce elle-même (fx3Tag : cinq étiquettes recyclées, rien n'est créé en jeu) ;
   · s'ajoute au BUTIN de cette frénésie, dit quand elle tombe : « FRÉNÉSIE 0:18 · +$ 1,2 k » (frenFin).
   Bridé à ~11 frappes/s : une ligne de pièces fait CRÉPITER la bande sans la faire vibrer en continu. */
const FX3={m:null,pool:null,i:0,t:0,bT:0,k:false,v:new THREE.Vector3()};
function frenCash(g,pos){
  if(FLOW.lv!==4||!(g>0))return;
  FREN.butin+=g;
  const n=performance.now();if(n-FX3.t<90)return;FX3.t=n;
  const m=FX3.m||(FX3.m=FLOW.el?FLOW.el.querySelector('.fM'):null);
  if(m){const k=FX3.k=!FX3.k;m.classList.remove(k?'cj1':'cj2');m.classList.add(k?'cj2':'cj1'); // deux animations jumelles : relance sans remise en page
    if(n-FX3.bT>400){FX3.bT=n;try{pixBurst(m,4);}catch(e){}}}
  if(pos)try{fx3Tag(pos);}catch(e){}
  if(SONV2)sfx('frenesie.cash',{vol:4}); /* (2026-10-14, session SON) +4 comme la pièce : conçu 3 dB SOUS elle, il était passé 7 dB sous (−37 contre −30) — le ×3 ne s'entendait plus */ // (console de son) l'argent qui tombe EN FRÉNÉSIE, par-dessus le son de la pièce : trois micro-pièces qui montent (le ×3) — recette dans atelier-son/recettes.js (bloc FRENCASH) ; au plus toutes les 90 ms
}
function fx3Tag(pos){ // le « ×3 » qui jaillit de la pièce : l'étiquette la plus ancienne du bassin est recyclée, projetée là où l'argent est né
  if(!FX3.pool){FX3.pool=[];for(let j=0;j<5;j++){const e=document.createElement('i');e.className='fx3';e.setAttribute('aria-hidden','true');document.body.appendChild(e);FX3.pool.push({e:e,k:false});}}
  const v=FX3.v.copy(pos).project(camera);if(v.z>1||v.x<-1.05||v.x>1.05||v.y<-1.05||v.y>1.05)return; // derrière la caméra ou hors champ : rien
  const o=FX3.pool[FX3.i=(FX3.i+1)%FX3.pool.length],e=o.e,t9='×'+fmtMul(flowMult());
  if(e.textContent!==t9)e.textContent=t9;
  e.style.left=Math.round((v.x*.5+.5)*innerWidth)+'px';e.style.top=Math.round((-v.y*.5+.5)*innerHeight)+'px';
  const k=o.k=!o.k;e.classList.remove(k?'on':'on2');e.classList.add(k?'on2':'on');
}
/* (2026-10-14, GAMEPLAY — Sacha : « mets plutôt le PLUS 1 FLOTTANT à côté de la voiture ») LE « +1 » DE LA PIÈCE. Trois étiquettes recyclées (rien
   n'est créé en jeu), posées à côté de la caisse projetée à l'écran : à droite de sa silhouette (rayon = 0,55 × sa longueur, la même mesure que le
   contre-jour), un peu au-dessus de son centre. Des pièces rapprochées (< 0,6 s) ne s'EMPILENT pas : la même étiquette compte +2, +3… et repart.
   Ramené dans l'écran s'il déborde. Le style : .p1f (à côté de .fx3). */
const P1F={pool:null,i:0,n:0,t:0,cur:null,v:new THREE.Vector3(),w:new THREE.Vector3()};
function piece1Plus(){
  if(!started||gameOver||!carGroup.visible)return;
  if(!P1F.pool){P1F.pool=[];for(let j=0;j<3;j++){const e=document.createElement('i');e.className='p1f';e.setAttribute('aria-hidden','true');document.body.appendChild(e);P1F.pool.push({e:e,k:false});}}
  const n=performance.now(),suite=!!P1F.cur&&n-P1F.t<600;P1F.t=n;P1F.n=suite?P1F.n+1:1;
  const v=P1F.v.copy(carGroup.position).project(camera);if(v.z>1||v.x<-1.05||v.x>1.05||v.y<-1.05||v.y>1.05)return; /* hors champ : rien */
  const R=.55*((CARS[level]&&CARS[level].l)||4.2),w=P1F.w.setFromMatrixColumn(camera.matrixWorld,0).multiplyScalar(R).add(carGroup.position).project(camera);
  const cx=(v.x*.5+.5)*VP.w,cy=(.5-v.y*.5)*VP.h,dx=Math.max(16,Math.abs(w.x-v.x)*.5*VP.w);
  const o=suite?P1F.cur:(P1F.cur=P1F.pool[P1F.i=(P1F.i+1)%P1F.pool.length]),e=o.e,t='+'+P1F.n;
  if(e.textContent!==t)e.textContent=t;
  e.style.left=Math.round(Math.min(VP.w-56,cx+dx+10))+'px';e.style.top=Math.round(Math.max(24,cy-dx*.35))+'px';
  const k=o.k=!o.k;e.classList.remove(k?'on':'on2');e.classList.add(k?'on2':'on');
}
/* L'EMBLÈME « THE DARK TRIAD » (#triade) : il NAÎT de la zone rouge — parti du bout de la jauge, il vient CLAQUER à sa place (onde de
   choc, braises), puis tourne deux tours à gauche, deux tours à droite, en frappant au départ de chaque double tour ; il tremble quand
   la zone lâche ; il meurt en vrillant quand la frénésie tombe. Tout est en CSS : le JS ne pose que trois classes (.on/.sort/.tremble). */
/* LA TRIADE S'OUVRE (2026-09-28, Sacha : « la barre violette pâle et rouge doit être cachée au début et ne se révéler que quand la
   partie rose est pleine »). La jauge démarre en TROIS cellules ; la rose pleine, la 4e s'ouvre — les trois autres se serrent pour lui
   faire place — et le jeu pose la règle de la triade : RISQUE + VITESSE (la 1re fois de la session ; ensuite, juste son nom). Elle
   reste ouverte jusqu'à la fin de la partie : on sait ce qu'on chasse. */
function flowRevele(){
  FLOW.revele=true;FLOW.aff=-1;
  const h=FLOW.el;
  if(h){h.classList.add('revele','ouvre');clearTimeout(flowRevele._t);flowRevele._t=setTimeout(function(){h.classList.remove('ouvre');},700);
    try{pixBurst(h.querySelector('.fSeg>i:nth-child(4)'),10);}catch(e){}}
  if(FREN.arme){} /* (2026-09-30, banc) un seul geste peut ouvrir la 4e cellule ET armer : « DRIFT OU FIGURE ! » (ce qui déclenche, MAINTENANT) passe avant la règle — elle se dira la prochaine fois */
  else if(FLOW2.lieu==='ville'&&!FREN.apprisV){FREN.apprisV=true;popTexte('DRIFT · RACCOURCI · VITESSE',FLOW_COL[4],2);} /* (2026-09-30) au singulier : 28 signes tombaient au plancher de 10 px et le rebond d'entrée sortait de l'écran (375-390 px) */ // (passe qualité) dans l'ordre des traits sous l'emblème : NARCISSE · MACHIAVEL · PSYCHO // (loi 15) en VILLE la triade se gagne sur la route : on le dit, une fois
  else{popTexte(FREN.appris?'DARK TRIAD':'FIGURE · RACCOURCI · NITRO',FLOW_COL[4],2);FREN.appris=true;} // (v4) la règle de la triade, en trois mots · (2026-09-30) « TRICHE » nommait un défaut : on dit le GESTE (le nom MACHIAVEL, lui, reste)
  try{if(SONV2)sfx('triade.revele');else{subBoom(.14);chimeNote(noteP(0,0),.05,.07,.6);}}catch(e){}
  hap([10,40,10]);
}
function frenEl(){return FREN.el||(FREN.el=document.getElementById('triade'));}
function frenEntre(){
  const tr=frenEl();if(!tr)return;
  clearTimeout(FREN.hS);tr.classList.remove('sort','bat1','bat2','tremble');
  // d'où il part : le centre de la zone rouge, relevé une fois (sa place est connue du CSS seul — on la mesure, on ne la recopie pas)
  let ox=0,oy=0;
  try{const z=FLOW.el&&FLOW.el.querySelector('.fZ');
    if(z){tr.classList.add('mesure');const a=zRect(z),b=zRect(tr),k9=zK(tr);tr.classList.remove('mesure');
      if(b.width>0){ox=Math.round((a.left+a.width/2-(b.left+b.width/2))/k9);oy=Math.round((a.top+a.height/2-(b.top+b.height/2))/k9);}}}catch(e){} // (2026-09-29) ÷ zoom : --ox/--oy sont lus dans le bloc rétréci (hudTaille)
  tr.style.setProperty('--ox',ox+'px');tr.style.setProperty('--oy',oy+'px');
  tr.classList.add('on');
  setTimeout(function(){if(tr.classList.contains('on'))try{pixBurst(tr.querySelector('.trDA')||tr.querySelector('.trPiece'),12);}catch(e){}},300); // l'impact : la gerbe part quand il se pose
}
function frenSort(){
  const tr=frenEl();if(!tr||!tr.classList.contains('on'))return;
  tr.classList.remove('on','bat1','bat2','tremble');tr.classList.add('sort');
  clearTimeout(FREN.hS);FREN.hS=setTimeout(function(){tr.classList.remove('sort');},440);
}
function flowReset(){
  if(FLOW.lv===4){try{frenMus(false);}catch(e){}frenFin(true);} // la frénésie meurt avec la caisse (ou la partie) : son morceau aussi — sa tenue, elle, compte
  FLOW.v=0;FLOW.lv=0;FLOW.idle=0;FLOW.tk=0;FLOW.aff=-1;FREN.acc=0;
  FLOW.revele=false;FLOW.lentVu=false;FLOW.nit=false;if(FLOW.el)FLOW.el.classList.remove('revele','ouvre','lent','gele');
  FREN.tr.n=FREN.tr.m=FREN.tr.p=0;FREN.k=3;FREN.arme=false;FLOW.psyT=0;FLOW.lent9=false;FLOW.psyOk=false;flowTagRaz();}
/* (v3) LA FRÉNÉSIE, UN BUT EN SOI (Sacha : « atteindre la frénésie doit être un but en soi »). Chaque frénésie a sa DURÉE, et la
   plus longue jamais tenue est un RECORD (`SAVE.d.frenRec`, en secondes) : on la voit courir sous l'emblème (#frenChrono), l'annonce
   d'entrée dit le chiffre à battre, le battre se crie (une fois par frénésie), et l'écran de mort dit la plus longue de la partie.
   RUNX.fren = frénésies de la partie · RUNX.frenMax = la plus longue (s). */
function frenDuree(t){t=Math.max(0,Math.floor(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');}
function frenDebut(){FREN.t=0;FREN.butin=0;FREN.rec=false;FREN.nitDit=false;FREN.chrS=-1;RUNX.fren=(RUNX.fren|0)+1;frenChrono();
  const T9=FLOW2.triade;FREN.tr.n=T9.n.mem;FREN.tr.m=T9.m.mem;FREN.tr.p=T9.p.mem;FREN.k=3;FREN.dit.n=FREN.dit.m=FREN.dit.p=false;FREN.trAff='';frenTraitsMaj();flowTag('n',1);flowTag('m',1);flowTag('p',1);} // (v4) on y entre les trois traits PLEINS : on vient de les prouver
function frenTient(dt){
  FREN.t+=dt;
  const r=SAVE.d.frenRec||0;
  if(!FREN.rec&&r>=5&&FREN.t>r){FREN.rec=true;FREN.chrS=-1; // le record tombe EN DIRECT : on le crie, on ne le garde pas pour l'écran de mort
    popTexte('RECORD DE FRÉNÉSIE !','#ffd75e',3);hap([10,30,10,30,30]);try{if(SONV2)sfx('frenesie.record');else{chimeNote(noteP(0,1),0,.06,.4);chimeNote(noteP(4,1),.09,.06,.4);chimeNote(noteP(7,1),.18,.07,.6);}}catch(e){}}
  frenChrono();
}
function frenChrono(){ // écrit seulement quand la seconde change
  const c=FREN.chr||(FREN.chr=document.getElementById('frenChrono'));if(!c)return;
  const s9=Math.floor(FREN.t);if(s9===FREN.chrS)return;FREN.chrS=s9;
  c.textContent=frenDuree(s9);c.classList.toggle('rec',FREN.rec);
}
/* (v4) LA TRIADE — les trois traits de la frénésie. `frenTrait(t, part)` : un geste nourrit un trait (part = fraction de sa mémoire ;
   1 = plein). `frenTriade(dt)` : chaque image, PSYCHO se nourrit du nitro ou de la vitesse, les trois se vident au sol, on compte les
   vivants (FREN.k) ; un trait qui MEURT se crie une fois par frénésie avec ce qu'il réclame (« UNE FIGURE ! », « RACCOURCI ! », « NITRO ! »),
   un trait qui RENAÎT sonne. `frenTraitsMaj()` peint les trois barres sous l'emblème (écrit seulement quand l'affichage change). */
const TRAITS=[['n','NARCISSE','UNE FIGURE !','#ffd75e'],['m','MACHIAVEL','RACCOURCI !','#7dffec'],['p','PSYCHO','NITRO !','#ff7a24']]; // (2026-09-30) l'appel de MACHIAVEL était « TRICHE ! » : il nommait un défaut, les deux autres disent quoi FAIRE
function frenTrait(t,part){
  if(FLOW.lv!==4||!t||!FLOW2.triade[t])return;
  const mem=FLOW2.triade[t].mem,av=FREN.tr[t];
  FREN.tr[t]=Math.min(mem,av+mem*(part==null?1:part));
  if(av<=0&&FREN.tr[t]>0){try{if(SONV2)sfx('triade.renait');else chimeNote(noteP(t==='n'?4:t==='m'?7:9,1),0,.07,.3);}catch(e){}hap(8);} // il RENAÎT
  frenNourrit(3); // la jauge scintille : on vient de la nourrir
  const el=frenTraitEl(t);if(el){const k=el._k=!el._k;el.classList.remove(k?'fl1':'fl2');el.classList.add(k?'fl2':'fl1');}
}
function frenTriade(dt,air,nit){
  const T9=FLOW2.triade,tr=FREN.tr,a9n=tr.n>0,a9m=tr.m>0,a9p=tr.p>0; // (v5) qui vivait avant cette image : morts et renaissances s'affichent
  if(nit||FLOW.vit>=T9.p.vit)tr.p=T9.p.mem;                            // PSYCHO : le pied au plancher
  if(!air)for(const t in tr)tr[t]=Math.max(0,tr[t]-dt);                 // EN VOL, RIEN NE MEURT (comme le flow)
  const k=(tr.n>0)+(tr.m>0)+(tr.p>0);
  if(a9n!==tr.n>0)flowTag('n',a9n?-1:1);if(a9m!==tr.m>0)flowTag('m',a9m?-1:1);if(a9p!==tr.p>0)flowTag('p',a9p?-1:1);
  if(SONV2&&!a9p&&tr.p>0)sfx('triade.renait'); // (console de son) PSYCHO renaît au nitro / à la vitesse sans passer par frenTrait : il sonne comme les deux autres
  // un trait MORT : le jeu dit ce qu'il réclame — une fois par trait et par frénésie, un appel à la fois (deux morts ensemble : 0,9 s d'écart)
  const n9=performance.now();
  if(mode==='drive'&&n9-(FREN.appT||0)>900)for(const d of TRAITS)if(tr[d[0]]<=0&&!FREN.dit[d[0]]){FREN.dit[d[0]]=true;FREN.appT=n9;popTexte(d[0]==='n'&&FLOW2.lieu==='ville'?'DRIFT !':d[2],d[3],2); /* (passe qualité) en VILLE, NARCISSE se nourrit du drift, pas des figures */
    try{if(SONV2)sfx('triade.meurt',{var:d[0]==='n'?0:d[0]==='m'?1:2});else chimeNote(noteP(0,0),0,.05,.3);}catch(e){}hap([8,30,8]);break;}
  FREN.k=k;
  frenTraitsMaj();
}
function frenTraitEl(t){const b=FREN.trEl||(FREN.trEl=document.getElementById('frenTraits'));return b?b.querySelector('[data-t="'+t+'"]'):null;}
function frenTraitsMaj(){
  const b=FREN.trEl||(FREN.trEl=document.getElementById('frenTraits'));if(!b)return;
  let key='';const T9=FLOW2.triade;
  for(const d of TRAITS){const f=FREN.tr[d[0]]/T9[d[0]].mem;key+=Math.ceil(f*20)+(f<=0?'m':f<.3?'f':'v');}
  if(key===FREN.trAff)return;FREN.trAff=key;
  for(const d of TRAITS){const el=b.querySelector('[data-t="'+d[0]+'"]');if(!el)continue;const f=FREN.tr[d[0]]/T9[d[0]].mem;
    el.style.setProperty('--f',(Math.ceil(f*20)/20).toFixed(2));el.classList.toggle('mort',f<=0);el.classList.toggle('faible',f>0&&f<.3);}
}
function frenFin(mort){ // la frénésie est tombée (mort = avec la caisse : on ne dit rien, la voix du crash a la parole)
  const t=FREN.t;if(!(t>0))return;FREN.t=0;
  if(SONV2&&!mort)sfx('frenesie.sort'); // (console de son) la frénésie LÂCHE (la mort et la pose ratée ont leur son)
  RUNX.frenMax=Math.max(RUNX.frenMax||0,t);
  const r=SAVE.d.frenRec||0,neuf=t>r&&t>=5;
  if(neuf){SAVE.d.frenRec=Math.floor(t*10)/10;SAVE.mark();} // arrondi PAR DÉFAUT : le chrono affiche des secondes entières tronquées, le record dit le même chiffre
  const b9=FREN.butin;FREN.butin=0; // (×3) LE BUTIN : ce que cette frénésie a rapporté — dit à la sortie, sauf quand le record a la parole (la ligne tient dans l'écran)
  if(!mort&&t>=3)popTexte(TR('FRÉNÉSIE')+' '+frenDuree(t)+(neuf&&r>=5?' · '+TR('RECORD'):b9>=1?' · +'+fmtC(b9):''),neuf&&r>=5?'#ffd75e':FLOW_COL[4],3);
}
/* (v4) LA POSE RATÉE : le flow retombe à ZÉRO, frénésie comprise (sa tenue compte pour le record). La triade reste ouverte : on sait
   ce qu'on vient de perdre. Le jeu dit pourquoi : « DE TRAVERS ! » ou « À CONTRESENS ! ». */
function flowCasse(contre,txt){
  if(SONV2)sfx(contre?'pose.contresens':'pose.travers'); // (console de son) la pose RATÉE se dit à l'oreille, flow ou pas
  if(!(FLOW.v>0))return;
  const lv0=FLOW.lv;
  if(lv0===4){try{frenMus(false);}catch(e){}frenFin(true);}
  FLOW.v=0;FLOW.lv=0;FLOW.idle=0;FLOW.tk=0;FREN.acc=0;FREN.arme=false;
  if(!(contre&&!txt&&DMT.act))popTexte(txt||(contre?'À CONTRESENS !':'DE TRAVERS !'),'#ff5e7a',3);flowTag('n',-1); /* (LE DEMI-TOUR) à contresens, le panneau MAUVAIS SENS le dit déjà */ // (v5) la pose ratée, c'est NARCISSE qui tombe
  if(!SONV2){if(lv0>0){try{flowDropSnd(lv0);}catch(e){}}try{clank9(0,150,.14);}catch(e){}} /* (console) pose.travers / pose.contresens, en tête, les remplacent */
  hap([30,40,30,40,60]);shake=Math.max(shake,.6);
  if(lv0>=2)try{flashEcran('rgba(255,42,61,.35)');}catch(e){}
  flowTick(0);
}
function flowDropSnd(lv){ // (2026-09-25) le palier PERDU : son accord redescend, deux notes douces — on informe, on ne punit pas
  if(SONV2){if(lv>0&&lv<4)sfx('flow.perdu');return;} // (console de son) la FRÉNÉSIE qui tombe (4) sonne dans frenFin : frenesie.sort
  if(!(lv>0))return;const I=FLOW_ACC[lv];
  chimeNote(noteP(I[2],1),0,.05,.12);chimeNote(noteP(I[0],1),.09,.045,.22);
}
