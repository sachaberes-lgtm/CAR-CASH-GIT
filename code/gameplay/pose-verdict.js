/* ===== (vague 3, 2026-09-27) LE VERDICT DE POSE SUR TÉLÉPHONE — user : « rajoute les textes monster et tout » =====
   `trickMsg` écrit dans #trickBox, que l'ÉCRAN NU masque : sur téléphone, MONSTRE / DOUBLE / TRIPLE MONSTRE ne se
   lisaient plus — l'annonceur les criait dans le vide. `trickMsg` reste LE point d'entrée (aucune ligne d'appel touchée) : sur
   téléphone, il remet ses textes ici.
   · UN LOT PAR IMAGE : la pose appelle trickMsg plusieurs fois dans la même image (PILE AU CENTRE, À RECULONS, FACE CACHÉE ×2, puis le
     verdict) — on les ramasse et on les solde en fin de tâche (microtâche) : UNE carte, le verdict en titre, les bonus en pastilles ;
   · UN GESTE = UN TEXTE : ce que le texte sur la caisse dit déjà (PARFAIT, DIVIN, AU CHEVEU, les figures en vol et leurs points
     d'aura, la RAFALE) ne se répète pas ici ; le portail, le moteur, les pouvoirs ont leur propre voix. Montent au couloir :
     le verdict de pose et ses bonus, et la voiture de police qui saute ;
   · UNE VOIX AU CENTRE : la carte passe par la file du couloir (`hautPasse`, famille « ver ») — le rang fixe la priorité ;
   · le montant est LU dans le texte du verdict (jamais recalculé ici : l'économie reste seule maîtresse des chiffres) ;
   · le texte TIENT dans 84 % de l'écran (police pixel : 1 em par lettre + l'interlettrage). */
const VERD={buf:[],pend:false,el:null,h:0,t:0};
const VERD_DEF=[ // [texte de l'annonceur, rang, mot du dessus, mot du rang, couleur] — du plus long au plus court
  ['TRIPLE MONSTRE',3,'TRIPLE','MONSTRE','#ffd75e'],['DOUBLE MONSTRE',2,'DOUBLE','MONSTRE','#ff3ec8'],
  ['MONSTRE',1,'','MONSTRE','#5ee6ff']];
const VERD_TAG=[[/^FACE CACH/,'#ffd75e'],[/^PILE AU CENTRE/,'#5ee6ff']];   // les bonus de pose (pastilles)
const VERD_SEUL=[[/^💥 /,'#ff3b5c',1]]; /* (2026-09-29) reconnu par l'emoji : « IS TOAST! » en anglais */                         // les cartes simples [motif, couleur, priorité]
const VERD_TAILLE=[22,30,34,38,40,44]; // le mot du rang (px) : carte simple · MONSTRE < DOUBLE < TRIPLE — plafonné par la largeur
HAUT_MIN.ver=700; // le temps de lecture garanti d'un verdict (le mot, puis le montant)
HAUT_COUPE.ver=function(){if(VERD.el)VERD.el.classList.remove('on');document.body.classList.remove('verdOn');clearTimeout(VERD.t);};
Object.assign(I18N,{'MONSTRE':'MONSTER','METEORE':'METEOR','POSÉ LOURD':'HEAVY LANDING'});
function verdNet(t){ // traduit, sans emoji (la police pixel n'en a pas), sans la vanne après le tiret, sans capitale accentuée
  return sansAcc(String(TR(t)).replace(/[\u2190-\u2BFF\uD83C-\uDBFF\uDC00-\uDFFF\uFE0F]/g,'').split(' — ')[0]).replace(/[<>&"]/g,'').trim();
}
function verdPousse(txt,tier){VERD.buf.push(String(txt));if(!VERD.pend){VERD.pend=true;Promise.resolve().then(verdSolde);}}
function verdSolde(){
  VERD.pend=false;const b=VERD.buf;VERD.buf=[];
  if(!running||gameOver||mode==='boom')return;
  let v=null,seul=null;const tags=[];
  for(const t of b){
    const i=t.lastIndexOf('  +'),tete=(i>=0?t.slice(0,i):t).trim(); // le verdict : [grade] + mot de l'annonceur + « ␣␣+ » + montant
    const d=VERD_DEF.find(function(q){return tete===q[0]||tete.endsWith(' '+q[0]);});
    if(d){v={d:d,mt:i>=0?t.slice(i+3).trim():'',lourd:/LOURD/.test(tete)};continue;}
    const g=VERD_TAG.find(function(q){return q[0].test(t);});if(g){tags.push([verdNet(t),g[1]]);continue;}
    const s=VERD_SEUL.find(function(q){return q[0].test(t);});if(s&&!seul)seul=[verdNet(t),s[1],s[2]];
  }
  tags.length=0; // (2026-09-29, Sacha) plus de pastilles FACE CACHÉE ×2 / PILE AU CENTRE / POSÉ LOURD : le verdict parle seul
  if(v){verdMontre(v.d[2],v.d[3],v.d[4],v.d[1],v.mt,tags,0);} // PARFAIT / DIVIN : c'est le texte sur la caisse qui le dit
  else if(tags.length)verdMontre('',tags[0][0],tags[0][1],0,'',tags.slice(1),0);
  else if(seul)verdMontre('',seul[0],seul[1],0,'',[],seul[2]);
}
function verdMontre(l1,l2,col,rang,mt,tags,pS){
  hautPasse(function(){verdAffiche(l1,l2,col,rang,mt,tags);},rang?1400:1100,'ver',rang?(rang>=5?3:rang>=3?2:1):pS,rang?{ttl:1600}:null); // un verdict attend jusqu'à 1,6 s (une carte de défi en cours) : « +$ » se lit encore juste après la pose
}
function verdAffiche(l1,l2,col,rang,mt,tags){
  let e=VERD.el;
  if(!e){e=VERD.el=document.createElement('div');e.id='verdHud';e.setAttribute('aria-hidden','true');document.body.appendChild(e);}
  const W=VP.w*.84,fit=function(t,max,ls){return Math.max(10,Math.min(max,Math.floor(W/Math.max(1,t.length))-ls));},
    T1=l1?verdNet(l1):'',T2=verdNet(l2),base=Math.round((VERD_TAILLE[rang]||22)*Math.max(.8,Math.min(1,VP.h/800))*figK()); // écran court (SE) : un cran plus petit, la caisse reste libre
  let h='';
  if(T1)h+='<b class="vK" style="font-size:'+fit(T1,Math.round(base*.56),2)+'px" data-t="'+T1+'">'+T1+'</b>';
  h+='<b class="vT" style="font-size:'+fit(T2,base,2)+'px" data-t="'+T2+'">'+T2+'</b>';
  if(mt){const m='+'+String(mt).replace(/[<>&"]/g,'');h+='<em class="vM" style="font-size:'+fit(m,Math.round((rang>=3?20:18)*figK()),1)+'px">'+m+'</em>';}
  if(tags.length)h+='<span class="vTags">'+tags.map(function(g){return '<i style="--tc:'+g[1]+'">'+g[0]+'</i>';}).join('')+'</span>';
  e.innerHTML=h;e.style.setProperty('--vc',col);e.dataset.r=rang;
  e.classList.remove('on');void e.offsetWidth;e.classList.add('on');
  VERD.h=e.offsetHeight; // lu UNE fois par verdict : le geste sur la caisse se pose dessous (popSuit)
  document.body.classList.add('verdOn');clearTimeout(VERD.t);VERD.t=setTimeout(function(){document.body.classList.remove('verdOn');},rang?1350:1050);
  if(rang>=3)setTimeout(function(){try{pixBurst(e.querySelector('.vT'),rang>=5?12:rang>=4?10:8);}catch(x){}},120); // les gros rangs éclatent en confettis
}
// (2026-09-28, HUD v5) l'échelle du × de chaîne est CELLE DES SHIFT LIGHTS du flow : blanc, cyan, or, rose, violet, puis le rouge du feu
// (le vert, couleur de l'ARGENT, ne dit plus « ×3 »)
const X_COUL=['#dfeeff','#dfeeff','#35e6ff','#ffc93a','#ff4fc2','#9b6bff','#ff3924','#ff3924','#ff3924','#ff3924','#ff3924'];
const ENG_V9=new THREE.Vector3();
/* (2026-09-28, user : « le moteur doit apparaître au niveau de la voiture, au-dessus, et donner l'impression de rétrécir et de rentrer
   dans le capot ») LA CARTE SUIT LA CAISSE. Le capot (repère de la caisse, `userData.capot`) et le haut de la caisse sont projetés à
   l'écran à chaque image ; le moteur flotte juste AU-DESSUS (le titre et le nom au-dessus de lui : le capot reste visible avant la plongée), suit la voiture au sol comme en vol
   (lissé : les secousses de caméra ne font pas trembler les textes), et reste dans l'écran. À la plongée, le moteur fonce vers le
   CAPOT en accélérant, rétrécit à 10 %, tourne de plus en plus vite (la scène d'atelier, armée pour ça), et tout ce qui passe sous la
   ligne du capot s'efface (`uClipY`) : il s'enfonce dans la tôle. Les textes, eux, s'effacent au début de la plongée. */
const ENG_V8=new THREE.Vector3();
function engBigSuit(){ // le moteur 3D de la carte : OÙ le recoller dans l'image, à quelle taille, avec quelle opacité (lu par engQuadDraw)
  if(!engBig.on){ENG_Q.op=0;return;}
  const n=performance.now(),t=n-engBig.t0,RM=REDUCED_MOTION;
  // le CAPOT et le HAUT DE LA CAISSE à l'écran
  const cp=carGroup.userData.capot||[0,1,1.2];
  ENG_V9.set(cp[0],cp[1],cp[2]).applyMatrix4(carGroup.matrixWorld).project(camera);
  const hx=(ENG_V9.x*.5+.5)*VP.w,hy=(-ENG_V9.y*.5+.5)*VP.h;engBig.hx=hx;engBig.hy=hy;
  ENG_V8.copy(carGroup.position).addScaledVector(camera.up,1.9).project(camera);
  const yHaut=Math.min(hy,(-ENG_V8.y*.5+.5)*VP.h);
  // (v5) le MOTEUR POSÉ SUR LE TOIT : le bas de sa silhouette (~1,25 × la hauteur de la scène) effleure la caisse ; l'étiquette et le nom
  // au-dessus de lui ; la carte suit la voiture partout (au sol, en vol), bornée seulement par les bords de l'écran — plus par le couloir
  // des annonces, qui la faisait flotter haut au milieu de la route
  const S=engBig.s||1,hC=(engBig.hC||104)*S,wC=(engBig.wC||150)*S;
  const yS=yHaut-(engBig.ph||75)*.42;
  let cx=THREE.MathUtils.clamp(hx,wC/2+8,VP.w-wC/2-8),cy=Math.max(hC/2+8,yS-(engBig.ry||0)*S);
  if(engBig.sx==null||engBig.plonge){if(engBig.sx==null){engBig.sx=cx;engBig.sy=cy;}}
  else{const k9=Math.min(1,(n-(engBig._n||n))/1000*14);engBig.sx+=(cx-engBig.sx)*k9;engBig.sy+=(cy-engBig.sy)*k9;}
  engBig._n=n;
  const el=engBig.el;if(el&&!engBig.plonge){const l9=engBig.sx.toFixed(0)+'px',t9=engBig.sy.toFixed(0)+'px';
    if(el.style.left!==l9)el.style.left=l9;if(el.style.top!==t9)el.style.top=t9;} // (perf) on n'écrit que ce qui a bougé d'un pixel
  let s=1,op=1,x=engBig.sx+(engBig.rx||0)*S,y=engBig.sy+(engBig.ry||0)*S;
  if(t<220&&!RM){const u=t/220,e=1-(1-u)*(1-u)*(1-u);s=.55+.45*e;op=Math.min(1,u*6);} // l'entrée — (v5.1) opaque en 40 ms, il GRANDIT depuis la caisse : le fondu depuis le transparent se lisait « fantôme gris » sur les captures
  ENG_Q.fl=RM?0:Math.max(0,1-t/260); // (v4) l'éclat d'apparition (lu par engQuadDraw)
  if(!RM&&!engBig.plonge)y+=Math.sin(t*.0041)*3; // il FLOTTE au-dessus de la caisse (±3 px, un souffle d'1,5 s)
  let clip=-1;
  if(engBig.plonge){ // LA PLONGÉE : vers le CAPOT, en accélérant, en rétrécissant — et il s'enfonce sous la ligne du capot
    const u=Math.min(1,(n-engBig.plonge)/ENG_PLONGE),e=u*u;
    x+=(hx-x)*e;y+=(hy-y)*e;s*=1-.9*e;op*=RM?0:1-Math.max(0,(u-.9)/.1);
    if(!RM&&u>.15)clip=Math.max(0,(VP.h-hy)*curDPR); // sous la ligne du capot : dans la tôle
  }
  engCarteMat.userData.uClip.value=clip;
  ENG_Q.x=x;ENG_Q.y=y;ENG_Q.w=engBig.pw*s*ENG_QK;ENG_Q.h=engBig.ph*s*ENG_QK;ENG_Q.op=op;
}
function laneY(){ // où tombe le couloir des annonces (--laneA, safe area comprise) — relu seulement quand la hauteur d'écran change
  if(!laneY.v||laneY.h!==VP.h){laneY.h=VP.h;let p=avE('laneProbe');
    if(!p){p=document.createElement('div');p.id='laneProbe';p.style.cssText='position:fixed;left:0;top:var(--laneA);width:0;height:0;visibility:hidden;pointer-events:none';document.body.appendChild(p);avEl.laneProbe=p;}
    laneY.v=p.getBoundingClientRect().top||VP.h*.4;}
  return laneY.v;
}
const POP_V9=new THREE.Vector3();
function popSuit(){ // (HUD v4) le geste JAILLIT DE LA CAISSE : tant que le texte vit, il suit la voiture à l'écran — au sol comme en vol
  if(!(performance.now()<(popTexte._s||0)+950))return;const e=avE('popTxt');if(!e)return;
  const la=laneY();
  // AU-DESSUS de la caisse s'il y a la place sous le couloir des annonces (au sol, toujours) ; sinon DESSOUS (en vol, la caméra
  // centre la caisse : au-dessus, le geste se posait sur l'annonce)
  POP_V9.copy(carGroup.position).addScaledVector(camera.up,2.6).project(camera);const yH=(-POP_V9.y*.5+.5)*VP.h,xC=(POP_V9.x*.5+.5)*VP.w; // le TOIT de la caisse à l'écran
  POP_V9.copy(carGroup.position).addScaledVector(camera.up,-1.4).project(camera);const yB=(-POP_V9.y*.5+.5)*VP.h;  // son bas de caisse
  const mini=la+(HAUT.cur&&performance.now()<HAUT.fin?(HAUT.cur.k==='ver'?Math.max(64,VERD.h-44):64):34); // (vague 2) une voix occupe le couloir (annonce, niveau, défi) : le geste se pose plus bas · (vague 3) sous le VERDICT, plus haut qu'une annonce
  /* (2026-09-29, Sacha : « les textes de figure bloquent la vue ») EN VOL, le dessous de la caisse, c'est la RÉCEPTION qu'on vise : le geste ne s'y
     pose plus. Pas la place au-dessus (une annonce occupe le couloir) → il s'efface : la liste des figures, à gauche, le garde. Au sol : comme avant. */
  const vol9=mode==='fall',haut9=yH-56>=mini;if(vol9!==!!popSuit._v||haut9!==!!popSuit._h){popSuit._v=vol9;popSuit._h=haut9;e.classList.toggle('cache',vol9&&!haut9);}
  const y=haut9?Math.min(yH-56,VP.h*.64):THREE.MathUtils.clamp(yB+24,mini,VP.h*.74);
  const t9=y.toFixed(0)+'px';if(e.style.top!==t9)e.style.top=t9; // (perf) on n'écrit que ce qui a bougé d'un pixel
  // (vague 2, H5) il suit aussi la caisse en LARGEUR, mais borné : « AUPHIN EN VOL +8 » sortait de l'écran par la gauche
  const hw=(popTexte._w||0)*.58+8,x=Math.max(hw,Math.min(VP.w-hw,xC)),l9=x.toFixed(0)+'px';if(e.style.left!==l9)e.style.left=l9; // .58 : le rebond d'entrée (×1,15) compris
}
/* (HUD v4) LE RECORD À BATTRE — la meilleure partie (SAVE.d.auraMax) s'affiche sous le compteur, avec sa jauge : on la voit se
   remplir, elle BAT à 85 %, et le jour où on la dépasse EN COURSE, le jeu le crie (une fois par partie). C'est le « encore une ». */
function recInit(){CHA.rec=SAVE.d.auraMax||0;CHA.recB=false;CHA.recP=-1;
  const r=avE('avRec');if(!r)return;r.className=CHA.rec>0?'':'vide';
  avE('avRecT').textContent=TR('RECORD')+' '+fmtAura(CHA.rec);avE('avRecF').style.setProperty('--r','0');}
function recMaj(a){
  if(!(CHA.rec>0)||CHA.recB)return;const p=Math.min(1,a/CHA.rec),p2=Math.round(p*100);if(p2===CHA.recP)return;CHA.recP=p2;
  avE('avRecF').style.setProperty('--r',p.toFixed(2));avE('avRec').classList.toggle('presque',p>=.85);
  // (HUD v5) À PORTÉE, la ligne ne dit plus le record : elle dit ce qu'il MANQUE — « ENCORE 120 » (le crochet qui fait tenter le coup)
  avE('avRecT').textContent=p>=.85?TR('ENCORE')+' '+fmtAura(Math.max(0,Math.ceil(CHA.rec-a))):TR('RECORD')+' '+fmtAura(CHA.rec);
}
function recBattu(){
  CHA.recB=true;const r=avE('avRec');
  // (vague 2, H3) « NOUVEAU RECORD ! » voulait dire trois choses (l'aura, le meilleur palier, l'écran de mort) : ici, seule l'ANNONCE
  // crie « RECORD BATTU » ; la ligne du tableau de bord devient ce qu'on a DE PLUS que le record, et elle grimpe avec le compteur
  if(r){r.classList.remove('presque');r.classList.add('battu');recSurplus(CHA.vAff|0);avE('avRecF').style.setProperty('--r','1');}
  // l'annonce passe par la file (priorité 3) — à moins d'une seconde d'une carte MOTEUR, elle devient son ruban (hautFusion)
  const f9=function(){slamMontre('RECORD BATTU !','AURA '+fmtAura(auraRun),'#ffd75e','#ff7ad5',38,30);if(SONV2)sfx('aura.record');}; // (console de son) le son part quand la carte S'AFFICHE…
  hautPasse(f9,1450,'rec',3,{ru:'AURA '+fmtAura(auraRun)});
  if(SONV2&&!(HAUT.cur&&HAUT.cur.f===f9)&&!HAUT.q.some(function(w){return w.f===f9;}))sfx('aura.record'); // …sauf si elle a FUSIONNÉ dans la carte MOTEUR (hautFusion) : jamais montrée seule, elle sonne maintenant
  flashEcran('rgba(255,215,94,.5)');hap([20,50,20,50,40]);
  if(!SONV2)try{chimeNote(noteP(4,1),0,.12,.2);chimeNote(noteP(6,1),.1,.12,.2);chimeNote(noteP(8,1),.2,.14,.4);}catch(e){} /* (console) aura.record, joué avec la carte */
}
function recSurplus(a){const t=avE('avRecT');if(!t)return;const s='+'+fmtAura(Math.max(0,a-CHA.rec))+' '+TR('AU-DESSUS');if(t.textContent!==s)t.textContent=s;}
// (vague 2) les libellés neufs du HUD de course (police pixel : capitales SANS accent)
Object.assign(I18N,{'NOUVEAU SOMMET':'NEW PEAK','AU-DESSUS':'ABOVE','ASTUCE':'TIP'});
Object.assign(I18N,{'AU PIED DES TOURS':'AT THE FOOT OF THE TOWERS','IL PLEUT ENTRE LES VILLES':'RAIN BETWEEN THE CITIES','VILLE VITRÉE':'GLASS CITY','LE CIEL DANS LES VITRES':'THE SKY IN THE GLASS','REFLETS DORES':'GOLDEN REFLECTIONS','LES TOURS S EMBRASENT':'THE TOWERS CATCH FIRE','LES BUREAUX BRILLENT':'THE OFFICES GLOW'}); // (2026-10-17) LA VILLE VITRÉE
Object.assign(I18N,{'NOUVEL ATH !':'NEW ATH!','JACKPOT !':'JACKPOT!','CRYPTOCITY':'CRYPTOCITY','CRYPTO CITY':'CRYPTO CITY','BULL RUN':'BULL RUN','LA VILLE NE DORT JAMAIS':'THE CITY NEVER SLEEPS'}); // (2026-10-13) CRYPTOCITY — (2026-10-15) CRYPTO CITY, une map du tirage
Object.assign(I18N,{'PLUIE DE BILLETS':'CASH RAIN','AIMANT À PIÈCES':'COIN MAGNET','CAISSE EN FEU':'CAR ON FIRE'}); // (2026-09-30) les capacités moteur, dans le titre de la carte
function avPlusPop(t){const e=avE('avPlus');if(!e)return;e.textContent=t;e.classList.remove('on');void e.offsetWidth;e.classList.add('on');}
/* LE HUD DISCRET — la veille des plaques qui DURENT (voir hudDA §9, repris de Léo) : présente depuis plus de 3 s → `.discret` ; cachée →
   remise à zéro ; `hudReveil(id)` = un événement fort, elle se rallume et repart pour 3 s. Lecture de classes seulement (aucune mise en
   page forcée), à chaque image. */
const HUDD={DUREE:3000,L:[
  {id:'avCh',el:function(){return avE('avCh');},vu:function(e){return e.classList.contains('on');}},
  {id:'pwrChip',el:function(){return typeof pwrChip!=='undefined'?pwrChip:null;},vu:function(e){return e.style.display==='block';},
    fort:function(){return !!(loop._pwEl&&loop._pwEl.some(function(x){return x._f;}));}}, // la fin d'un pouvoir clignote EN PLEIN
  {id:'campChip',el:function(){return document.getElementById('campChip');},vu:function(e){return e.classList.contains('on');},
    fort:function(e){return e.classList.contains('alerte');}}]};
function hudDiscretTick(){const now=performance.now();
  for(const x of HUDD.L){const e=x.el();if(!e)continue;
    if(!x.vu(e)){if(x.t0){x.t0=0;e.classList.remove('discret');}continue;}
    if(!x.t0)x.t0=now;
    const d=now-x.t0>HUDD.DUREE&&!(x.fort&&x.fort(e));if(d!==e.classList.contains('discret'))e.classList.toggle('discret',d);}}
function hudReveil(id){for(const x of HUDD.L)if(x.id===id&&x.t0){x.t0=performance.now();const e=x.el();if(e)e.classList.remove('discret');}}
function chaineTick(dt){
  hudDiscretTick(); // (2026-09-30) LE HUD DISCRET (repris de Léo)
  engBigSuit();popSuit();
  // le COMPTEUR : il grimpe vers la vraie valeur (on voit l'aura TOMBER dedans), une écriture DOM seulement quand le chiffre change
  CHA.v+=(auraRun-CHA.v)*Math.min(1,dt*7);if(Math.abs(auraRun-CHA.v)<1)CHA.v=auraRun;
  const a9=Math.round(CHA.v);if(a9!==CHA.vAff){CHA.vAff=a9;const e9=avE('avVal');if(e9){const t9=fmtAura(a9);e9.textContent=t9;const n9=t9.length>=8?'l2':t9.length>=6?'l1':'';if(e9.dataset.l!==n9)e9.dataset.l=n9;}recMaj(a9);if(CHA.recB)recSurplus(a9);} // (2026-09-28) data-l : le compteur resserre son corps quand le nombre s'allonge (il passait à la ligne : « 1 » puis « 418 »)
  if(!CHA.recB&&CHA.rec>0&&auraRun>CHA.rec&&running&&!gameOver&&!TUTO.on)recBattu(); // (2026-09-29) pas de « RECORD BATTU » pendant la leçon
  if(!CHA.n)return;
  if(mode!=='fall'&&mode!=='boom')CHA.t-=dt; // en l'air, l'horloge est GELÉE
  CHA.age+=dt; // (2026-10-01) l'âge de la chaîne, lui, court partout
  if(CHA.t<=0||(CHA.age>=CHA_VIE&&mode==='drive')){chaineEncaisse();return;}
  const b9=avE('avBarF');if(b9){const s9='scaleX('+(mode==='fall'?1:Math.max(0,CHA.t/CHA_FEN)).toFixed(3)+')';if(b9._tf!==s9){b9._tf=s9;b9.style.transform=s9;}} // (2026-10-14, passe perf mobile) écrite seulement quand elle change (en l'air elle est figée à 1 : plus une écriture de style par image)
  const u9=mode!=='fall'&&CHA.t<1.1;if(u9!==CHA.urg){CHA.urg=u9;if(b9&&b9.parentNode)b9.parentNode.classList.toggle('urg',u9);} // la dernière seconde : la barre rougit et clignote
}
function chaineEncaisse(){
  const g=Math.round(CHA.pts*Math.max(1,CHA.x));
  if(g>0&&running&&!gameOver){
    auraRun+=g;livre('a:chaine',g);auraPop=Math.min(1,auraPop+g/90);
    // (HUD v4) la chaîne S'ENVOLE dans le compteur, ce qu'elle verse s'affiche à côté ; une grosse chaîne prend aussi le couloir
    avPlusPop('+'+fmtAura(g));{const c9=avE('avCh');if(c9){c9.classList.remove('vole','perdu');void c9.offsetWidth;c9.classList.add('vole');}}
    /* (2026-10-15, Sacha : « enlève les inscriptions qui se mettent au milieu de l'écran, comme + 2000 AURA, qui est écrit ailleurs de toute façon ») plus de
       « +X AURA » au centre : la chaîne s'envole dans le compteur et « +X » s'écrit à côté (avPlusPop) — le son, l'éclaboussure et le flash restent */
    const t9=document.querySelector('#auraV2 .avTot');if(t9){t9.classList.remove('pulse');void t9.offsetWidth;t9.classList.add('pulse');}
    if(g>=300)try{pixBurst(avE('avVal'),Math.min(14,4+Math.round(g/250)));}catch(e){} // (2026-09-26) la chaîne tombe DANS le compteur : il éclabousse
    if(g>=500)flashEcran('rgba(177,75,255,.5)');
    hap(CHA.x>=4?[12,30,24]:12);try{if(SONV2)sfx(g>=2000?'aura.encaisse3':g>=600?'aura.encaisse2':'aura.encaisse1',{vol:2});else{ /* (2026-10-14, session SON) +2 : l'encaissement (−30/−28/−26) était conçu 4 dB au-dessus de la pièce ; depuis son +4 le petit encaissement sonnait AU NIVEAU d'une pièce (−30) */chimeNote(noteP(Math.min(9,CHA.x+2),1),0,.18,.22);if(CHA.x>=4)sparkle(.1,.08);
      // (2026-09-26, audit son) une chaîne ×10 à 3 000 sonnait comme un +45 : l'accord s'étoffe avec la somme
      if(g>=600)chimeNote(noteP(Math.min(10,CHA.x+4),1),.07,.14,.26);
      if(g>=2000){chimeNote(noteP(Math.min(10,CHA.x+6),1),.14,.14,.34);sparkle(.14,.1);}}}catch(e){} /* (console) aura.encaisse1/2/3 */
  }
  chaReset();
}
function chainePerdue(parMort){ // exploser la chaîne ouverte : tout part avec la caisse · parMort : appelée par explode (l'explosion couvre tout)
  if(!CHA.n)return;const g=Math.round(CHA.pts*Math.max(1,CHA.x));
  if(SONV2&&!parMort)sfx('aura.perdue'); // (console de son)
  slam('CHAÎNE PERDUE','-'+fmtAura(g)+' AURA','#ff5e7a','#b0102a',24,2); // (HUD v4) elle se BRISE sous les yeux, et le couloir dit combien — (2026-09-29) 30 → 24
  {const c9=avE('avCh');if(c9){c9.classList.remove('vole','perdu');void c9.offsetWidth;c9.classList.add('perdu');}}chaReset();
}
function chaReset(){CHA.pts=0;CHA.x=0;CHA.fam={};CHA.n=0;CHA.t=0;CHA.age=0;CHA.liste.length=0;if(CHA.urg){CHA.urg=false;const b9=avE('avBarF');if(b9&&b9.parentNode)b9.parentNode.classList.remove('urg');}chaHud(true,false);}
function chaHud(fort,monte){
  const ch=avE('avCh');if(!ch)return;if(CHA.n>0)ch.classList.remove('vole','perdu');ch.classList.toggle('on',CHA.n>0);
  if(!fort||!CHA.n)return;
  avE('avPts').textContent=fmtAura(CHA.pts);
  const x9=avE('avX'),xv=Math.max(1,CHA.x);x9.textContent='×'+xv;if(document.documentElement.classList.contains('han'))x9.setAttribute('data-hx','×'+xv); /* (2026-10-24, passe perf PC) le texte des calques du × en feu (hud-maitrise.css, hanFeu) */x9.style.setProperty('--xc',X_COUL[Math.min(10,xv)]);x9.classList.toggle('feu',xv>=5);
  if(monte){x9.classList.remove('up');void x9.offsetWidth;x9.classList.add('up');hudReveil('avCh'); /* un × de plus : la plaque se RALLUME (HUD discret) */
    const pal={5:'EN FEU !!',8:'DEMENT !!!',10:'MAX !!!'}[xv]; // (vague 2, H4) plus de « ×3 CHAUD ! » au centre : le × du tableau de bord bat déjà — le couloir ne parle qu'à partir de ×5
    if(pal){if(SONV2)sfx('aura.x'+xv); /* (2026-10-15, Sacha : « écrit ailleurs de toute façon ») plus de « ×5 EN FEU / ×8 DÉMENT / ×10 MAX » au centre : le × de la chaîne bat déjà (.up, .feu) — le son, le flash et la main restent */flashEcran(xv>=8?'rgba(255,57,36,.55)':'rgba(255,94,200,.45)');hap(xv>=8?[14,40,24,40,30]:[12,30,20]);}}
  avE('avList').innerHTML=CHA.liste.map(function(l){return '<li>'+String(l).replace(/[<>&]/g,'')+'</li>';}).join('');
}
/* `dbgHud(k,n)` — (HUD v4) forcer un état du tableau de bord pour le juger sur capture : 'flow' n · 'idle' s · 'chaine' n ·
   'encaisse' · 'perdue' · 'record' v · 'pwr' · 'slam' txt. Sans argument : l'état lu. */
window.dbgHud=function(k,n){
  if(k==='flow'){flowAdd(n==null?30:n);return {v:FLOW.v,lv:FLOW.lv};}
  if(k==='idle'){FLOW.idle=n==null?2.5:n;return FLOW.idle;}
  if(k==='chaine'){const N=['VIRAGE SERRÉ','FRÔLÉ','RASE-BORD','SUPER TURBO','BIG AIR','PARFAIT'];
    for(let i=0;i<(n||3);i++)chaineAura(N[i%6],[45,20,40,100,50,70][i%6],N[i%6]);return {pts:CHA.pts,x:CHA.x};}
  if(k==='encaisse'){chaineEncaisse();return Math.round(auraRun);}
  if(k==='perdue'){chainePerdue();return 'ok';}
  if(k==='record'){CHA.rec=n||500;CHA.recB=false;CHA.recP=-1;const r=avE('avRec');if(r)r.className='';
    avE('avRecT').textContent=TR('RECORD')+' '+fmtAura(CHA.rec);return CHA.rec;}
  if(k==='pwr'){pwrNitroT=6;pwrSpdT=4.5;return 'ok';}
  if(k==='slam'){slam(n||'BOOST','','#ffd75e','#ff7a24',44,0);return 'ok';}
  // (vague 2) le texte sur la caisse · une carte d'astuce · la bannière de niveau · l'état de la FILE du couloir
  if(k==='pop'){popTexte(n||'DAUPHIN EN VOL +80','#ffd75e',0);return popTexte._w;}
  if(k==='mis'){misBanniere('ASTUCE',TR("En l'air : pouce en HAUT = plonge, en BAS = monte."),'','eclair');return 'ok';}
  if(k==='lvl'){lvlAnnonce();return 'ok';}
  if(k==='plonge'){engPlonge();return engBig.on;}
  if(k==='verdict'){ // (vague 3) un verdict de pose tel que tryLand l'écrit : 'm1' 'm2' 'm3' · 'tags' (+ bonus) · 'lourd'
    const V={m1:'MONSTRE',m2:'DOUBLE MONSTRE',m3:'TRIPLE MONSTRE',lourd:'MONSTRE'}[n]||'DOUBLE MONSTRE';
    if(n==='tags'){trickMsg('PILE AU CENTRE 🎯',false);trickMsg('FACE CACHÉE ×2',2);}
    trickMsg((n==='lourd'?'POSÉ LOURD — AÏE… ':n==='m1'?'PARFAIT ! ':'')+V+'  +'+fmtC(denom()*({m1:12,m2:60,m3:180}[n]||60)),3);return 'ok';}
  if(k==='file'){const c=HAUT.cur,t=performance.now();return {voix:c&&t<HAUT.fin?c.k+':'+c.p:null,attente:HAUT.q.map(function(q){return q.k+':'+q.p;}),moteur:engBig.on?(engBig.plonge?'plonge':'couloir'):null};}
  return {flow:{v:FLOW.v,lv:FLOW.lv,idle:FLOW.idle},cha:{pts:CHA.pts,x:CHA.x,n:CHA.n,t:CHA.t},rec:CHA.rec,recB:CHA.recB,aura:Math.round(auraRun)};
};
/* `dbgFren(k,n)` — (2026-09-28) LA FRÉNÉSIE au banc : 'v' n = pose le remplissage (le palier suit, zone rouge comprise ; 100 = y entrer
   par le vrai chemin) · 'nourrit' n = une goutte de style de n points · 'idle' s = s secondes sans style. Rend l'état : zone, emblème.
   (v3) rend aussi `nit` (le nitro gèle la jauge), `tenue` (s de la frénésie en cours), `record` (SAVE.d.frenRec), `partie` {fren, max}. */
window.dbgFren=function(k,n,t){
  if(k==='v'){FLOW.v=Math.max(0,Math.min(100,+n||0));FLOW.idle=0;
    if(FLOW.v>=100&&FLOW.lv<4){FLOW.v=99.9;flowAdd(1);}                      // la jauge pleine : par le vrai chemin (v4 : elle ARME — dbgFren('entre') déclenche)
    else if(FLOW.lv<4)FLOW.lv=Math.min(3,Math.floor(FLOW.v/25));              // les paliers ordinaires : posés sans annonce
    flowTick(0);}
  else if(k==='nourrit')flowAdd(n==null?3:n);
  else if(k==='risque'||k==='route'||k==='style')flowAdd(n==null?10:n,k,t);   // un geste d'une famille : dbgFren('risque',12) · (v5) signé d'un trait : dbgFren('risque',12,'m')
  else if(k==='faute')flowFaute(n||'n',6,.5); // (v5) une faute : dbgFren('faute','n')
  else if(k==='vit')FLOW.vitF=n==null?null:+n;                                 // forcer la vitesse du flow (null = la vraie)
  else if(k==='journal'){if(n===0){FLOW.jr=null;return 'journal fermé';}FLOW.jr=FLOW.jr||[];return FLOW.jr.slice();}
  else if(k==='idle'){FLOW.idle=n==null?2.5:n;flowTick(0);}
  else if(k==='trait'){if(n&&n.length===1)frenTrait(n,1);else if(n)FREN.tr[n[0]]=+n.slice(1)||0;} // (v4) dbgFren('trait','m') nourrit · dbgFren('trait','m0') le vide
  else if(k==='pose')flowCasse(!!n); // (v4) simule une pose ratée (n vrai = à contresens)
  else if(k==='entre'){if(FLOW.lv<4)frenDeclenche();}
  else if(k==='drift'){driftCd=0;driftC=1.5;driftLv=n==null?2:+n;driftTick(0,false);} // (loi 20) relâche un turbo de niveau n (2 SUPER · 3 ULTRA) : en ville, il fait partir la frénésie armée
  else if(k==='racc'){flowRaccourci(n==null?120:+n,true);if(FLOW2.decl.racc&&FREN.arme&&FLOW.lv<4)frenDeclenche();} // (loi 20) un raccourci de n m posé (comme tryLand) : en ville, il déclenche
  else if(k==='cash')frenCash(n==null?denom()*6:+n,carGroup.position); // (×3) le RETOUR d'un gain en frénésie (bande, « ×3 », butin) — le compte n'est pas touché // (v4) la frénésie tout de suite (comme une figure posée jauge pleine)
  const tr=frenEl();
  return {v:+FLOW.v.toFixed(2),lv:FLOW.lv,vit:+FLOW.vit.toFixed(2),revele:FLOW.revele,musique:FRENM.sw?'triade':FRENM.surm?'surmultipliee':'radio',seuil:FREN.seuil,zone:+Math.max(0,Math.min(1,(FLOW.v-FREN.seuil)/(100-FREN.seuil))).toFixed(3),
    idle:+FLOW.idle.toFixed(2),triade:tr?tr.className:null,hud:FLOW.el?FLOW.el.className:null,
    nit:FLOW.nit,tenue:+FREN.t.toFixed(1),triade:{n:+FREN.tr.n.toFixed(1),m:+FREN.tr.m.toFixed(1),p:+FREN.tr.p.toFixed(1),k:FREN.k},poseA:FLOW.poseA,arme:FREN.arme,lieu:FLOW2.lieu,decl:FLOW2.decl,record:SAVE.d.frenRec||0,partie:{fren:RUNX.fren|0,max:+(RUNX.frenMax||0).toFixed(1)},nitro:+nitroR.toFixed(2),mult:flowMult(),butin:Math.round(FREN.butin)}; // (v3) le gel du nitro, la tenue, le record
};
/* ---- LE TITRE DE LA FRÉNÉSIE : « TRIPLE MONSTER » (2026-09-28, Sacha : « quand on passe en frénésie, ça doit déclencher la voix et
   l'écriture TRIPLE MONSTER en rouge dégradé, avec une police un peu sataniste, et du sang qui coule du texte »).
   Les lettres sont GOTHIQUES, dessinées au pixel dans la grille du jeu (cornes en tête, fûts épais, pieds fendus en pointe : la gothique
   d'une pochette de métal), ombrées en bandes rouges (pâle en tête, sang au pied), cernées d'encre ; du SANG coule de leurs pieds — des
   filets qui s'allongent par crans, puis une goutte qui se détache. Il naît avec l'emblème DARK TRIAD : un observateur guette
   `#triade.on` (posé par la logique de la frénésie) — rien à appeler côté jeu. Pendant qu'il parle, la grande annonce et le verdict se
   taisent (`body.ftOn`). */
const FT_G={
  T:['.#.....#.','##.....##','#########','.#######.','...###...','...###...','...###...','...###...','...###...','...###...','...###...','..#####..','.##...##.','.#.....#.'],
  R:['#........','##.......','#######..','###..###.','###...##.','###..###.','######...','###.##...','###..##..','###..###.','###...##.','###...###','##.....##','#.......#'],
  I:['#...#','##.##','#####','.###.','.###.','.###.','.###.','.###.','.###.','.###.','.###.','#####','##.##','#...#'],
  P:['#........','##.......','#######..','###..###.','###...###','###..###.','#######..','###......','###......','###......','###......','####.....','##.......','#........'],
  L:['#........','##.......','###......','###......','###......','###......','###......','###......','###......','###......','###......','#######.#','##.....##','#.......#'],
  E:['#......#.','##....##.','########.','###......','###......','###..#...','######...','###..#...','###......','###......','###......','########.','##....##.','#......#.'],
  M:['#.........#','##.......##','###.#.#.###','###########','###.###.###','###..#..###','###.....###','###.....###','###.....###','###.....###','###.....###','###.....###','##.......##','#.........#'],
  O:['....#....','...###...','.#######.','###...###','###...###','###...###','###...###','###...###','###...###','###...###','###...###','.#######.','...###...','....#....'],
  N:['#.......#','##.....##','###...###','####..###','###.#.###','###..####','###...###','###...###','###...###','###...###','###...###','###...###','##.....##','#.......#'],
  S:['.......#.','.#######.','###...###','###....#.','###......','.######..','..######.','......###','......###','.#....###','###...###','.#######.','.#.......','#........']
};
// une ligne de lettres → { d : le chemin SVG (une rangée de cases fusionnée en rectangles), w : largeur en cases, pieds : colonnes où coule le sang }
function ftLigne(mot){let x=0,d='',pieds=[];
  for(const ch of mot){if(ch===' '){x+=4;continue;}const g=FT_G[ch];if(!g)continue;const w=g[0].length;
    for(let y=0;y<g.length;y++){const r=g[y];let a=-1;for(let i=0;i<=w;i++){const on=i<w&&r[i]==='#';if(on&&a<0)a=i;if(!on&&a>=0){d+='M'+(x+a)+' '+y+'h'+(i-a)+'v1h-'+(i-a)+'z';a=-1;}}}
    const bas=g[g.length-1];for(let i=0;i<w;i++)if(bas[i]==='#')pieds.push(x+i); // le sang coule des POINTES des pieds
    x+=w+1;}
  return {d:d,w:x-1,pieds:pieds};}
function frenTitreEl(){
  let el=document.getElementById('frenTitre');if(el)return el;
  el=document.createElement('div');el.id='frenTitre';el.setAttribute('aria-hidden','true');
  const grad='<defs><linearGradient id="ftGr" x1="0" y1="0" x2="0" y2="14" gradientUnits="userSpaceOnUse">'
    +'<stop offset=".143" stop-color="#ffe1e4"/><stop offset=".143" stop-color="#ff6a78"/><stop offset=".43" stop-color="#ff6a78"/><stop offset=".43" stop-color="#ff2a3d"/>'
    +'<stop offset=".71" stop-color="#ff2a3d"/><stop offset=".71" stop-color="#c4001f"/><stop offset=".857" stop-color="#c4001f"/><stop offset=".857" stop-color="#7a0012"/></linearGradient>'
    +'<linearGradient id="ftSang" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a0012"/><stop offset=".6" stop-color="#c4001f"/><stop offset="1" stop-color="#ff2a3d"/></linearGradient></defs>';
  const svg=function(mot,cls,nSang,graine,defs){const L=ftLigne(mot);let s='';
    // le SANG : quelques pieds tirés (graine fixe : le même dessin à chaque frénésie), un filet de 3 à 9 cases, sa goutte au bout
    const P=L.pieds.slice();let r=graine;const rnd=function(){r=(r*9301+49297)%233280;return r/233280;};
    for(let k=0;k<nSang&&P.length;k++){const i=Math.floor(rnd()*P.length),x=P.splice(i,1)[0],l=3+Math.floor(rnd()*7),dl=(.15+rnd()*.5).toFixed(2);
      s+='<rect class="ftFilet" x="'+x+'" y="14" width="1" height="'+l+'" style="--d:'+dl+'s"/><rect class="ftGoutte" x="'+(x-.15)+'" y="'+(14+l-.2)+'" width="1.3" height="1.3" style="--d:'+dl+'s"/>';}
    return '<svg class="'+cls+'" viewBox="-1 -1 '+(L.w+2)+' 27" preserveAspectRatio="xMidYMin meet" shape-rendering="crispEdges">'+(defs?grad:'')
      +'<path class="ftLettres" d="'+L.d+'" fill="url(#ftGr)"/>'+s+'</svg>';};
  el.innerHTML=svg('TRIPLE','ftL1',4,7,true)+svg('MONSTER','ftL2',8,11,false)+'<b class="ftSous">'+sansAcc(TR('FRÉNÉSIE'))+'</b>';
  document.body.appendChild(el);return el;}
function frenTitre(){ try{
  const el=frenTitreEl();{const sb9=el.querySelector('.ftSous');if(sb9)sb9.textContent=sansAcc(TR('FRÉNÉSIE'));} // (passe qualité) construit une fois : il gardait la 1re langue
  el.classList.remove('on');void el.offsetWidth;el.classList.add('on'); /* (débogage 29/09) cette ligne était COLLÉE derrière le // ci-dessus : le titre TRIPLE MONSTER ne s'allumait plus, mais body.ftOn taisait quand même annonces et verdicts 2,7 s */
  document.body.classList.add('ftOn');clearTimeout(frenTitre._t);
  frenTitre._t=setTimeout(function(){el.classList.remove('on');document.body.classList.remove('ftOn');},2700);
}catch(e){} }
(function(){const tr=document.getElementById('triade');if(!tr||!window.MutationObserver)return;let av=tr.classList.contains('on');
  new MutationObserver(function(){const on=tr.classList.contains('on');if(on&&!av)frenTitre();av=on;}).observe(tr,{attributes:true,attributeFilter:['class']});})();
/* ---- LA RÉCOLTE DE FRUITS EN RAFALE (2026-08-18) ---------------------------------------------
   Croquer un fruit isolé, c'est un « ploc ». En croquer cinq en rafale, ça doit être un CARNAGE :
   le jus gicle de plus en plus, le crunch monte dans les aigus, et l'aura tombe.
   ⚠ le CRUNCH est synthétisé, pas samplé : il doit changer de hauteur à chaque fruit (c'est
   l'escalade qui se lit à l'oreille), et un sample fixe rejoué cinq fois de suite sonne comme un
   bug. Du bruit filtré en bande étroite qui monte, plus un claquement sec — de la matière qui cède. */
let fruitRaf=0,fruitRafT=0;
const FRUIT_FENETRE=2.6;
/* ⚠ RENFORCÉ (2026-08-18) — « je n'ai pas tellement vu le crunch ». Il était noyé : trop court,
   trop doux, et dans la même bande de fréquences que la pluie de billets et les pièces, donc
   masqué par elles. Trois corrections, et la troisième est la vraie :
     · plus fort et plus long (.16 → .26 s), attaque plus franche ;
     · DEUX COUCHES — un CRAQUEMENT haut (la peau qui cède) et un IMPACT bas (la pulpe) : c'est
       l'écart entre les deux qui fait « morsure » plutôt que « bruit blanc » ;
     · ⚠ il DUCK le reste du mix (`duckT`) pendant 120 ms. C'est ça qui le rend audible : ne pas
       monter le volume par-dessus la bouillie, mais creuser un trou pour lui. */
function crunchSfx(rang){
  if(!sfxOk()||!MASTER)return;
  try{
    const t=AC.currentTime, dur=.26;
    // --- la peau qui CÈDE : bruit déchiré, bande étroite qui monte avec la rafale
    const n=AC.createBufferSource(),b=AC.createBuffer(1,(AC.sampleRate*dur)|0,AC.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<d.length;i++){const u=i/d.length;
      // le CRÉPITEMENT : des micro-ruptures, pas un souffle régulier — c'est ce qui fait « croquer »
      const gr=(Math.random()<.35+rang*.05)?1:.25;
      d[i]=(Math.random()*2-1)*gr*Math.pow(1-u,1.7)*(u<.03?u/.03:1);}
    n.buffer=b;
    const f=AC.createBiquadFilter();f.type='bandpass';
    f.frequency.setValueAtTime(1100+rang*340,t);
    f.frequency.exponentialRampToValueAtTime(340+rang*110,t+dur);
    f.Q.value=1.2; // (2026-09-28) 2.2 → 1.2 : une bande plus large croque sans siffler
    const g=AC.createGain();
    g.gain.setValueAtTime(.0001,t);
    /* (2026-09-28) RAMENÉ DANS LE RANG. À .46→.95 sur une bande 1,1-3,1 kHz (là où l'oreille est la plus sensible), plus un thump à .42,
       c'était le son ponctuel le plus fort du jeu — une vingtaine de dB au-dessus d'une pièce. Le trou creusé par `duckT` suffit à le
       faire entendre ; il n'a pas besoin de crier par-dessus. */
    g.gain.exponentialRampToValueAtTime(Math.min(.45,.24+rang*.04),t+.006);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    n.connect(f);f.connect(g);g.connect(MASTER);n.start(t);n.stop(t+dur);
    // --- la PULPE : un thump grave sous le craquement, pour que ça ait du corps
    const o=AC.createOscillator(),og=AC.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(190+rang*26,t);
    o.frequency.exponentialRampToValueAtTime(58,t+.13);
    og.gain.setValueAtTime(.0001,t);
    og.gain.exponentialRampToValueAtTime(.26,t+.008); // (2026-09-28) .42 → .26
    og.gain.exponentialRampToValueAtTime(.0001,t+.16);
    o.connect(og);og.connect(MASTER);o.start(t);o.stop(t+.17);
    duckT=Math.max(duckT,.12); // ON CREUSE LE MIX : c'est ça qui le sort de la bouillie
  }catch(e){}
}
