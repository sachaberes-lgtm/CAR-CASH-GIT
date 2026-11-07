/* ===== LE PASS DE MISSIONS — L'ÉCRAN « LE VISEUR » (2026-11-07, Léo : « on clique sur MISSIONS dans le garage, c'est autour de la voiture ; peu d'énergie ; simple » · DA premium futuriste, mix ciel + garage) =====
   ⚠ UNIQUEMENT SOUS ?pass=1 (PASS_ON, pass-table.js) : sans lui, gmRender rend la liste d'avant (m2Render) et rien de ce morceau ne tourne.
   LA FORME (cahier PASS-MISSIONS.md, points 15 et 16) : la caméra RESTE sur la caisse, qui tourne doucement toute seule (GMIS.mk reste à 0 : voir garage-rendu.js) ; TROIS cartes
   en verre arrondies, liseré dégradé cyan · magenta · or, un anneau de progression autour d'un chiffre ; la carte CADEAU (liseré or) en haut au centre, une carte de chaque côté ;
   des fils de visée cyan pointillés vers la caisse, tracés un à un à l'ouverture, puis immobiles ; un anneau de sol cyan sous la caisse ; en-tête : le nom du chapitre + « faites / total ».
   ÉNERGIE : aucune matière ni lumière nouvelle ; 3 éléments DOM + un SVG de quelques lignes ; une seule animation permanente (la pulsation du dernier tiers de la carte cadeau) ;
   tout est vidé hors de l'écran MISSIONS (le fondu GMIS.e reste à 0, les faisceaux 3D de l'ancien écran restent éteints).
   ⚠ LE MOTEUR DU TIRAGE (case 3) N'EXISTE PAS ENCORE : les trois cartes lisent les premières missions du réservoir (PASS_POOL) pas encore récupérées (pvChoix) ; la carte du milieu est la
   première mission « cadeau voiture » dont la caisse n'est pas à toi (sinon un habillage, sinon la première). Le jour où le moteur existe, seul pvChoix() change. */
const PV_TITRE='LE DÉBUT DE LA FIN';
Object.assign(I18N,{'LE DÉBUT DE LA FIN':'THE BEGINNING OF THE END'});
/* UNE SEULE MATIÈRE « HOLOGRAMME » : la grille fine. Sa couleur et son pas disent la récompense (or = voiture, rose = habillage, vert = argent, cyan = rien) ; le pas (px) est le même sur les cartes (CSS) et sur la caisse (mètres x PV_PAS) */
const PV_TEINTE={cyan:{css:'#5ff0ff',hex:0x5ff0ff,pas:.5},vert:{css:'#7DFF9B',hex:0x7dff9b,pas:.55},rose:{css:'#f24aa0',hex:0xf24aa0,pas:.4},or:{css:'#ffd75e',hex:0xffd75e,pas:.3}};
const PV_PAS=.5; /* le pas de la cage de la caisse (m) : fixe, la teinte de la récompense ne la resserre jamais */
/* la silhouette d'une caisse (profil), en or : la vraie est déjà au centre de l'écran */
const PV_SILHOUETTE='<svg viewBox="0 0 64 30" aria-hidden="true"><defs><linearGradient id="pvOr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset="1" stop-color="#e0a41c"/></linearGradient></defs><path d="M3 22V18Q3 15 8 14L15 13L21 6Q23 4 27 4H40Q44 4 47 7L52 13L58 15Q61 16 61 20V22Z" fill="url(#pvOr)" stroke="#fff3b0" stroke-width="1.5" stroke-linejoin="round"/><path d="M24 7H33V13H20ZM36 7H41Q43 7 45 9L48 13H36Z" fill="#07050F" opacity=".55"/><circle cx="16" cy="23" r="4.6" fill="#07050F" stroke="#ffd75e" stroke-width="2"/><circle cx="48" cy="23" r="4.6" fill="#07050F" stroke="#ffd75e" stroke-width="2"/></svg>';
const PV_CERCLE=100; /* l'anneau a pathLength 100 : le décalage du trait = 100 - le pourcentage */
/* ---- QUELLES TROIS MISSIONS (doublure du moteur de tirage) ---- */
function pvChoix(){ /* les trois emplacements du moteur (pass-moteur.js) : le cadeau au milieu s'il y en a un, les deux autres sur les côtés */
  if(GMIS.pvForce){const f=GMIS.pvForce.map(function(id){const m=m2Def(id);return m&&{m:m,d:passDef(id)};});if(f[0]&&f[0].m.r&&f[0].m.r.car)f[0].car=m2CarIdx(f[0].m.r.car);return {don:f[0],g:f[1],d:f[2]};} /* banc : dbgPassViseur('ids',[cadeau,gauche,droite]) */
  const L=passEnsure().filter(Boolean).map(function(id){return {m:m2Def(id),d:passDef(id)};}).filter(function(x){return x.m;});
  let k=L.findIndex(function(x){return x.d&&x.d.cadeau==='voiture';});if(k<0)k=L.findIndex(function(x){return x.d&&x.d.cadeau==='hab';});
  const don=L.splice(k>=0?k:0,1)[0]||null;if(don){don.cadeau=k>=0;const r=don.m.r||{};if(r.car){const ci=m2CarIdx(r.car);if(ci>=0&&garageListe().indexOf(ci)>=0)don.car=ci;}}
  return {don:don,g:L[0]||null,d:L[1]||null};
}
/* ---- LES CARTES : la FORME suit la mesure (4 familles, repli = l'anneau) et la RÉCOMPENSE se voit en grand ---- */
const PV_ANNEAU_CIBLE=['aura','fren','flag','prof','vol','lac','rejoue','airP','toutT','raresT']; /* tout-ou-rien ou exploit d'une partie : anneau + cible */
function pvFamille(m,t){ /* a) cumul long = jauge · b) petit compte = pastilles · c) vitesse ou durée = arc de cadran · d) exploit = anneau + cible ; repli = anneau */
  const u=m.u;
  if(u==='kmh'||u==='s'||u==='mn')return 'cadran';
  if(u==='$'||u==='km')return 'jauge';
  if(PV_ANNEAU_CIBLE.indexOf(m.k)>=0||u==='b'||t<2)return 'cible';
  if(t>=2&&t<=12&&t===Math.floor(t))return 'pips';
  if(t>12)return 'jauge';
  return 'anneau';
}
function pvCouleurHab(d){ /* la vraie couleur d'une peinture, en CSS */
  const h=function(n){return '#'+('000000'+(n>>>0).toString(16)).slice(-6);};
  if(d.grad)return 'linear-gradient(160deg,'+d.grad.map(h).join(',')+')';
  if(d.c!=null)return h(d.c);
  if(d.rgb)return 'rgb('+d.rgb.map(function(v){return Math.round(255*Math.min(1,v/1.2));}).join(',')+')';
  return '#ffd75e';
}
function pvVedette(m,gift){ /* la récompense, en vedette : silhouette de caisse dorée · pastille de couleur · icône à éclat · piles de pièces */
  const r=m.r||{};
  if(r.cash){const a=r.cash,n=a<2000?1:a<20000?2:3,h=Math.max(3,Math.min(9,Math.round(Math.log10(a)*1.6)));let p='';
    for(let i=0;i<n;i++){const k=Math.max(2,h-i);let c='';for(let j=0;j<k;j++)c+='<u></u>';p+='<span class="pvPile">'+c+'</span>';}
    return '<span class="pvVed cash"><span class="pvPiles">'+p+'</span><b>'+sansAcc(m2RecNom(m))+'</b></span>';}
  if(r.car)return '<span class="pvVed car"><i class="pvChip">'+PV_SILHOUETTE+'</i>'+(gift?'<b>'+sansAcc(TR(r.car))+'</b>':'')+'</span>';
  if(r.cat){const d=(COSM[r.cat]||[]).find(function(x){return x.id===r.id;})||{};
    if(r.cat==='peinture')return '<span class="pvVed hab"><i class="pvPast" style="background:'+pvCouleurHab(d)+'"></i><b>'+sansAcc(TR(d.n||''))+'</b></span>';
    return '<span class="pvVed hab"><i class="pvChip rose">'+pxi(r.cat==='aile'?'aile':r.cat==='trainee'?'trainee':'etoile')+'</i><b>'+sansAcc(TR(d.n||''))+'</b></span>';}
  return '';
}
function pvForme(m,v,t,ok,pret,p){ /* le dessin de l'avancement, dans .pvAn */
  const f=pvFamille(m,t),pc=Math.round(p*100);
  if(f==='jauge')return {c:'jg',h:'<span class="pvJg"><i data-h="'+pc+'" style="height:0"></i></span>'};
  if(f==='pips'){const N=Math.round(t),on=ok?N:Math.min(N,Math.floor(v));let h='';for(let i=0;i<N;i++)h+='<u'+(i<on?' class="on"':'')+'></u>';
    return {c:'pp'+(N>8?' pm':''),h:'<span class="pvPips" style="grid-template-columns:repeat('+(N<=5?N:Math.ceil(N/2))+',auto)">'+h+'</span>'};}
  const cad=f==='cadran',off=cad?75*(1-p):PV_CERCLE-pc;
  return {c:cad?'cad':'',h:'<svg viewBox="0 0 64 64" aria-hidden="true"><circle class="pvPiste" cx="32" cy="32" r="28"/><circle class="pvJauge" cx="32" cy="32" r="28" pathLength="'+PV_CERCLE+'" data-off="'+off+'" style="stroke-dashoffset:'+PV_CERCLE+'"/></svg>'
    +'<b class="pvN">'+(pret?pxi('coche'):f==='cible'?pxi('cible'):pc+'<small>%</small>')+'</b>'};
}
function pvCarte(x,cls){
  if(!x)return '';
  const m=x.m,s=m2Etat(),ok=s.ok.indexOf(m.id)>=0;let v=0;try{v=m2Val(m);}catch(e){}const t=m2Seuil(m),p=ok?1:m2Frac(m,v,t);
  const r=m.r||{},gc=r.cash?'vert':r.car?'or':r.cat?'rose':'cyan',gift=cls==='pvG'&&x.cadeau!==false;
  const pret=ok&&m2Pret(m.id),ic=(M2_FAM[m.f]||M2_FAM.exploit).ic,F=pvForme(m,v,t,ok,pret,p);
  return '<div class="pvC '+cls+(cls==='pvG'&&!gift?' nog':'')+(pret?' pret':'')+(GMIS.pvAv===m.id?' av':'')+(GMIS.pvSel===m.id?' sel av':'')+(gift&&p>=.667&&!ok&&p<1?' pulse':'')+'" role="button" tabindex="0" data-m2="'+m.id+'" data-gc="'+gc+'" style="--gc:'+PV_TEINTE[gc].css+'" aria-label="'+sansAcc(m2Txt(m))+'">'
    +(gift?pvVedette(m,true):'')+'<span class="pvAn '+F.c+'">'+F.h+'</span>'
    +'<span class="pvT">'+pxi(ic)+'<span>'+m2TxtH(m)+'</span></span>'+(gift?'':pvVedette(m,false))+'</div>';
}
function pvRender(vu){ /* vu : l'écran est déjà là (une carte vient d'être prise) — les fils ne se retracent pas */
  const el=$('gmNoeuds'),gm=$('gMis');if(!el||!gm)return;
  const c=pvChoix(),s=m2Etat();
  if(!vu){GMIS.pvAv=c.don?c.don.m.id:'';GMIS.pvSel='';} /* à l'ouverture : le cadeau est en avant, rien n'est choisi */
  if(!vu||GMIS.pvTpl==null){let k;do{k=Math.floor(Math.random()*PV_GAB.length);}while(k===GMIS.pvTpl);GMIS.pvTpl=k;GMIS.pvMir=!GMIS.pvMir;} /* un gabarit au hasard, jamais deux fois le même d'affilée */
  gm.classList.add('pv');gm.classList.toggle('m2land',VP.w>VP.h*1.25);GMIS.pvAnime=!vu;GMIS.pvCle='';
  el.innerHTML='<div id="pvEcran" class="pose">'+pvCarte(c.g,'pvS pvGa')+pvCarte(c.don,'pvG')+pvCarte(c.d,'pvS pvDr')+(vu||REDUCED_MOTION?'':'<i class="pvScan"></i>')+'</div>';
  let fait=0;for(const d of PASS_POOL)if(s.ok.indexOf(d.id)>=0)fait++;
  const hd=$('gmHead'),b=hd&&hd.querySelector('b'),sous=$('gmSous'),aide=$('gmAide');
  if(b)b.textContent=sansAcc(TR(PV_TITRE));if(sous)sous.textContent=fait+' / '+PASS_N;if(hd)hd.style.setProperty('--m2P',Math.round(100*fait/Math.max(1,PASS_N))+'%');if(aide)aide.textContent='';
  /* la caisse à gagner sur le plateau (celle du cadeau voiture) ; sinon la tienne */
  try{const cib=c.don&&c.don.car!=null?c.don.car:equippedCar();if(cib!==garageI&&!GAR.go)garageSaute(cib);}catch(e){console.warn('pass viseur',e);}
  pvPlace(VP.w,VP.h,true);pvTeinte('cyan');
  if(!vu&&!REDUCED_MOTION)try{if(SONV2)sfx('ui.on',{vol:-12});}catch(e){} /* un souffle discret à l'ouverture */
  requestAnimationFrame(function(){requestAnimationFrame(function(){const e=$('pvEcran');if(e)e.classList.remove('pose');});}); /* les cartes se posent sans glisser depuis le coin ; ensuite elles suivent la caméra */
  /* les anneaux se remplissent (une fois) */
  const go=function(){el.querySelectorAll('.pvJauge').forEach(function(j){j.style.strokeDashoffset=j.getAttribute('data-off');});el.querySelectorAll('.pvJg i').forEach(function(i){i.style.height=i.getAttribute('data-h')+'%';});};
  if(REDUCED_MOTION||vu)go();else setTimeout(function(){requestAnimationFrame(go);},380);
}
/* ---- LA PLACE : cartes, fils (recalculée seulement si l'écran ou la caisse change) ----
   Six GABARITS de disposition, tirés au hasard à chaque ouverture (jamais deux fois le même d'affilée) : [x (part de la largeur), bande (0 = au-dessus de la caisse, 1 = en dessous), y (part de la bande), inclinaison en degrés]
   pour la carte cadeau, puis les deux autres. Mêmes marges, calage sur une grille de 8 px, aucune carte dans la boîte de la caisse (elles vivent dans les bandes du haut et du bas). */
const PV_GAB=[[[.5,0,.55,0],[.25,1,.3,-2],[.75,1,.3,2]],[[.27,0,.2,-3],[.76,0,.8,3],[.62,1,.35,-1.5]],[[.73,0,.25,3],[.24,0,.78,-3],[.38,1,.4,1.5]],
  [[.5,1,.55,0],[.27,0,.45,-2.5],[.74,0,.45,2.5]],[[.5,0,.15,0],[.2,1,.2,-3.5],[.8,1,.75,3.5]],[[.32,0,.4,-2],[.3,1,.7,2.5],[.78,1,.25,-3]]];
function pvPlace(W,H,force){
  const gm=$('gMis'),sv=$('gmFils'),E=$('pvEcran');if(!gm||!sv||!E)return;
  if(GAR.sw&&!force)return; /* la caisse change de plateau : on attend qu'elle soit posée */
  const o=gm.getBoundingClientRect();
  let sx0=W/2,sy0=H*.5; /* le sol : l'origine de la caisse projetée, pour savoir quand la caméra a fini de glisser */
  try{const v=GMIS.pvV||(GMIS.pvV=new THREE.Vector3());carGroup.getWorldPosition(v);v.project(camera);sx0=(v.x*.5+.5)*VP.w-o.left;sy0=(.5-v.y*.5)*VP.h-o.top;}catch(e){}
  const cle=W+'x'+H+'/'+garageI+'/'+Math.round(sx0/8)+'/'+Math.round(sy0/8);
  if(!force&&GMIS.pvCle===cle)return;
  GMIS.pvCle=cle;
  const land=W>H*1.25,hd=$('gmHead'),bs=$('gmBas'),rh=hd&&hd.getBoundingClientRect(),rb=bs&&bs.getBoundingClientRect();
  const hb=(rh&&rh.height?rh.bottom-o.top:70)+8,bt=(rb&&rb.height?rb.top-o.top:H-90)-8;
  let r=null;try{r=garCaisseRect();}catch(e){}
  const rc=r?{x0:r.x0-o.left,x1:r.x1-o.left,y0:r.y0-o.top,y1:r.y1-o.top}:{x0:W*.1,x1:W*.9,y0:H*.4,y1:H*.58};
  const cx=(rc.x0+rc.x1)/2,w=rc.x1-rc.x0,h=rc.y1-rc.y0; /* les fils visent le centre de la boîte écran de la caisse : les nœuds tombent sur la voiture */
  const cards=[E.querySelector('.pvG'),E.querySelector('.pvGa'),E.querySelector('.pvDr')],px=function(e,x,y,rot){e.style.left=Math.round(x)+'px';e.style.top=Math.round(y)+'px';e.style.rotate=rot?rot+'deg':'';};
  const wire=[],box=[];
  if(!land){
    const T=PV_GAB[GMIS.pvTpl|0]||PV_GAB[0],sn=function(v){return Math.round(v/8)*8;};
    const bandes=[[hb,rc.y0-8],[rc.y1+8,bt]];
    cards.forEach(function(c,i){if(!c)return;const g=T[i],cw=c.offsetWidth,ch=c.offsetHeight,B=bandes[g[1]],bh=Math.max(0,B[1]-B[0]-ch);
      let x=Math.max(10,Math.min(W-cw-10,g[0]*W-cw/2)),y=B[0]+g[2]*bh;
      x=sn(x);y=sn(y);if(y+ch>B[1]&&B[1]-ch>B[0])y=B[1]-ch;
      for(const q of box){if(x<q.x+q.w+8&&q.x<x+cw+8&&y<q.y+q.h+8&&q.y<y+ch+8){x=q.x+q.w+8+cw>W-10?Math.max(10,q.x-cw-8):q.x+q.w+8;}} /* deux cartes ne se touchent pas */
      box.push({x:x,y:y,w:cw,h:ch});px(c,x,y,g[3]);
      wire.push({a:[x+cw/2,g[1]?y:y+ch],cx:x+cw/2,c:c.getAttribute('data-gc')});});
    const ord=wire.slice().sort(function(a,b){return a.cx-b.cx;});
    ord.forEach(function(q,k){q.b=k===1?[cx,rc.y0+h*.30]:[cx+(k?1:-1)*w*.26,rc.y0+h*.58];});
  }else{ /* couché : la carte cadeau au-dessus, une carte de chaque côté (le côté change à chaque ouverture) */
    const G=cards[0],mi=GMIS.pvMir?-1:1;
    if(G){const gw=G.offsetWidth,gh=G.offsetHeight,gy=Math.max(hb,Math.min(rc.y0-gh-22,bt-gh-90)),gx=Math.max(gw/2+8,Math.min(W-gw/2-8,cx));px(G,gx-gw/2,gy,0);wire.push({a:[gx,gy+gh],b:[cx,rc.y0+h*.30],c:G.getAttribute('data-gc')});}
    [cards[1],cards[2]].forEach(function(S,i){if(!S)return;const sw=S.offsetWidth,sh=S.offsetHeight,sg=(i?1:-1)*mi;
      const sx=Math.max(sw/2+8,Math.min(W-sw/2-8,cx+sg*(w/2+sw/2+14))),sy=Math.max(hb,Math.min(bt-sh,(rc.y0+rc.y1)/2-sh/2));
      px(S,sx-sw/2,sy,0);wire.push({a:[sx-sg*sw/2,sy+sh/2],b:[cx+sg*w*.26,rc.y0+h*.58],c:S.getAttribute('data-gc')});});
  }
  const pa=function(q){return 'M'+q.a[0].toFixed(1)+' '+q.a[1].toFixed(1)+'L'+q.b[0].toFixed(1)+' '+q.b[1].toFixed(1);};
  const ex=sv.querySelectorAll('path.pvF');
  if(!force&&ex.length===wire.length&&GMIS.pvWH===W+'x'+H){ /* déjà tracé : les éléments se déplacent sur place (un tracé en cours n'est pas coupé) */
    wire.forEach(function(q,i){const p=pa(q),m=sv.querySelector('#pvM'+i+' path'),n=sv.querySelectorAll('circle.pvNd')[i];ex[i].setAttribute('d',p);if(m)m.setAttribute('d',p);if(n){n.setAttribute('cx',q.b[0].toFixed(1));n.setAttribute('cy',q.b[1].toFixed(1));}});
    return;}
  GMIS.pvWH=W+'x'+H;
  const an=GMIS.pvAnime&&!REDUCED_MOTION;let d='<defs>',f='';
  wire.forEach(function(q,i){const p=pa(q),dl=(i*.34).toFixed(2);
    d+='<mask id="pvM'+i+'" maskUnits="userSpaceOnUse" x="0" y="0" width="'+W+'" height="'+H+'"><path class="pvMk'+(an?'':' fait')+'" pathLength="1" d="'+p+'" style="transition-delay:'+dl+'s"/></mask>';
    const col=(PV_TEINTE[q.c]||PV_TEINTE.cyan).css;f+='<path class="pvF" style="stroke:'+col+'" d="'+p+'" mask="url(#pvM'+i+')"/><circle class="pvNd'+(an?'':' fait')+'" style="fill:'+col+'" cx="'+q.b[0].toFixed(1)+'" cy="'+q.b[1].toFixed(1)+'" r="3.5" style="transition-delay:'+(i*.34+.3).toFixed(2)+'s"/>';});
  sv.setAttribute('viewBox','0 0 '+W+' '+H);sv.innerHTML=d+'</defs>'+f;
  if(an){GMIS.pvAnime=false;const T=GMIS.pvT=(GMIS.pvT||0)+1;
    setTimeout(function(){if(GMIS.pvT!==T)return;sv.querySelectorAll('.pvMk,.pvNd').forEach(function(e){e.classList.add('fait');});},60);
    wire.forEach(function(q,i){setTimeout(function(){if(GMIS.pvT===T&&garageOn&&gEl.classList.contains('missions'))try{uiClic('nav');}catch(e){}},60+i*340+200);});}
}
/* ---- PRENDRE ET TOUCHER ---- */
function pvRecupere(id,card){
  if(!m2Pret(id)){uiClic('refus');try{gSecoue(card);}catch(e){}toast(pxi('horloge')+' '+TR('BIENTÔT AU GARAGE'));return;}
  const o=m2Prend(id);if(!o){uiClic('refus');return;}
  card.classList.add('pris');
  try{pixBurst(card.querySelector('.pvAn')||card,12);}catch(e){}
  try{if(SONV2){sfx(o.cash?'ui.achat':'ui.debloque');if(!REDUCED_MOTION)sfx('ui.tampon',{t:.27});}else uiClic('ok');}catch(e){}
  hap([12,40,18,40,30]);
  if(o.car!=null){try{carSnapshot();}catch(e){}toast(pxi('voiture')+' '+TR(CARS[o.car].name)+' — '+TR('EST À TOI'),true);}
  else if(o.cat){const d=(COSM[o.cat]||[]).find(function(x){return x.id===o.hab;});toast(pxi('coche')+' '+(d?TR(d.n):'')+' — '+TR('EST À TOI'),true);}
  else toast(pxi('piece')+' +'+fmtC(o.cash)+' '+TR('VERSÉS AU COMPTE'),true);
  try{gBankPaint();}catch(e){}try{m2Portes();}catch(e){}
  try{passApresPrise(id);}catch(e){console.warn('pass',e);} /* l'emplacement est tiré de nouveau, la jauge cachée monte */
  setTimeout(function(){if(garageOn&&gEl&&gEl.classList.contains('missions'))pvRender(true);else m2Portes();},REDUCED_MOTION?0:560);
}
function pvClic(e){
  const t=e.target,card=t&&t.closest&&t.closest('.pvC');if(!card||!garageOn||GAR.go)return;
  e.stopPropagation();uiPop(card);
  const id=card.getAttribute('data-m2');
  const E=$('pvEcran');
  if(!card.classList.contains('av')){ /* 1er toucher : elle s'avance, celle qui était en avant recule */
    E.querySelectorAll('.pvC.av').forEach(function(q){q.classList.remove('av');});card.classList.add('av');GMIS.pvAv=id;
    uiClic('nav');hap(8);pvTeinte(card.getAttribute('data-gc'),true);return;}
  /* 2e toucher sur celle qui est en avant : elle est CHOISIE (et récupérée si elle est prête) */
  E.querySelectorAll('.pvC.sel').forEach(function(q){q.classList.remove('sel');});card.classList.add('sel');GMIS.pvSel=id;
  if(card.classList.contains('pret')){pvRecupere(id,card);return;}
  uiClic('ok');hap([8,30,14]);pvTeinte(card.getAttribute('data-gc'),true);
}
if(PASS_ON){const nd=$('gmNoeuds');if(nd){nd.addEventListener('click',pvClic);
  nd.addEventListener('keydown',function(e){if((e.code==='Enter'||e.code==='Space')&&e.target.closest&&e.target.closest('.pvC')){e.preventDefault();e.stopPropagation();e.target.click();}});}}
/* ---- LA MATIÈRE HOLOGRAMME EN 3D : l'anneau de sol (compact, centré sous la caisse, derrière elle par la profondeur) + la CAGE en grille fine autour de la caisse ----
   Matières simples additives (MeshBasic pour les anneaux, LineBasicMaterial pour la grille), aucune lumière. Groupe caché hors de l'écran MISSIONS : rien n'est dessiné ni animé. */
function pvSolBuild(g){
  const G=new THREE.Group(),R=new THREE.Group(),mat=function(o){return new THREE.MeshBasicMaterial({color:0x7fe9ff,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});};
  const un=function(geo,o){const m=new THREE.Mesh(geo,mat(o));m.rotation.x=-Math.PI/2;return m;};
  R.add(un(new THREE.RingGeometry(3.05,3.13,72),.85),un(new THREE.RingGeometry(2.45,2.48,72),.4)); /* l'anneau fin et l'intérieur */
  const piv=new THREE.Object3D();piv.add(un(new THREE.RingGeometry(2.5,3.1,40,1,0,1.1),.32));R.add(piv); /* l'arc du radar */
  const gm=new THREE.LineBasicMaterial({color:0x5ff0ff,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
  const cage=new THREE.LineSegments(new THREE.BufferGeometry(),gm);cage.frustumCulled=false;
  /* LA SALLE EN GRILLE : sol + quatre murs (pas de 1 m) jusqu'aux bords de la vue, mêmes lignes fines, la perspective les ouvre vers l'extérieur ; fixe (ne tourne pas avec la caisse), profondeur testée : la caisse la cache */
  const E=6,Hh=4.6,P=[],L=function(a,b,c,d,e,f){P.push(a,b,c,d,e,f);};
  for(let i=-E;i<=E;i++){L(i,0,-E,i,0,E);L(-E,0,i,E,0,i);L(i,0,-E,i,Hh,-E);L(i,0,E,i,Hh,E);L(-E,0,i,-E,Hh,i);L(E,0,i,E,Hh,i);}
  for(let i=-E;i<=E;i++){L(i,Hh,-E,i,Hh,E);L(-E,Hh,i,E,Hh,i);} /* le plafond : la grille couvre aussi le haut de l'écran, à l'intérieur de l'atelier (la profondeur reste testée) */
  for(let y=1;y<=Hh;y++){L(-E,y,-E,E,y,-E);L(-E,y,E,E,y,E);L(-E,y,-E,-E,y,E);L(E,y,-E,E,y,E);}
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
  const rm=new THREE.LineBasicMaterial({color:0x5ff0ff,transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}),room=new THREE.LineSegments(rg,rm);room.frustumCulled=false;
  const GR=new THREE.Group();GR.add(room);GR.visible=false;g.add(GR);
  G.add(R,cage);G.visible=false;g.add(G);
  GMIS.sol={g:G,gr:GR,rm:rm,r:R,piv:piv,cage:cage,gm:gm,a:0,k:-1,pas:0,cible:'cyan',p:0,c:new THREE.Color(0x5ff0ff),mn:new THREE.Vector3(),mx:new THREE.Vector3(),off:new THREE.Vector3(),cc:new THREE.Color()};
}
function pvTeinte(gc,pouls){ /* la grille de la caisse prend la couleur (et le pas) de la récompense, avec une petite pulsation */
  const S=GMIS.sol;if(!S||!PV_TEINTE[gc])return;S.cible=gc;if(pouls&&!REDUCED_MOTION)S.p=1;
}
function pvCageGeo(S,pas){ /* les lignes de la grille sur les six faces de la boîte de la caisse (au repère de la caisse) */
  const a=S.mn,b=S.mx,P=[],nx=Math.max(2,Math.round((b.x-a.x)/pas)),ny=Math.max(2,Math.round((b.y-a.y)/pas)),nz=Math.max(2,Math.round((b.z-a.z)/pas));
  const L=function(x0,y0,z0,x1,y1,z1){P.push(x0,y0,z0,x1,y1,z1);};
  for(const z of [a.z,b.z]){for(let i=0;i<=nx;i++){const x=a.x+(b.x-a.x)*i/nx;L(x,a.y,z,x,b.y,z);}for(let j=0;j<=ny;j++){const y=a.y+(b.y-a.y)*j/ny;L(a.x,y,z,b.x,y,z);}}
  for(const x of [a.x,b.x]){for(let k=1;k<nz;k++){const z=a.z+(b.z-a.z)*k/nz;L(x,a.y,z,x,b.y,z);}for(let j=0;j<=ny;j++){const y=a.y+(b.y-a.y)*j/ny;L(x,y,a.z,x,y,b.z);}}
  for(const y of [a.y,b.y]){for(let i=1;i<nx;i++){const x=a.x+(b.x-a.x)*i/nx;L(x,y,a.z,x,y,b.z);}for(let k=1;k<nz;k++){const z=a.z+(b.z-a.z)*k/nz;L(a.x,y,z,b.x,y,z);}}
  const geo=S.cage.geometry;geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.computeBoundingSphere();
}
function pvSolMesure(S){ /* une fois par caisse : sa boîte locale (tournée à zéro), son centre et sa longueur */
  const ry=carGroup.rotation.y,bx=GAR._pvB||(GAR._pvB=new THREE.Box3());
  carGroup.rotation.y=0;carGroup.updateMatrixWorld(true);bx.setFromObject(carBody||carGroup);carGroup.rotation.y=ry;carGroup.updateMatrixWorld(true);
  if(bx.isEmpty())return false;
  S.mn.copy(bx.min).sub(carGroup.position).addScalar(-.1);S.mx.copy(bx.max).sub(carGroup.position).addScalar(.1);
  S.off.set((S.mn.x+S.mx.x)/2,0,(S.mn.z+S.mx.z)/2);
  const r=.6*Math.max(S.mx.x-S.mn.x,S.mx.z-S.mn.z),k=r/3.05;S.r.scale.set(k,1,k);S.k=garageI;S.pas=0;return true;
}
function pvSolTick(dt){
  const S=GMIS.sol,on=PASS_ON&&garageOn&&gEl&&gEl.classList.contains('missions')&&!GAR.go&&(GMIS.e||0)<.01;
  if(S.g.visible!==on){S.g.visible=on;S.gr.visible=on;}if(!on)return;
  if(carGroup.parent&&S.g.parent!==carGroup.parent){carGroup.parent.add(S.g);carGroup.parent.add(S.gr);} /* même repère que la caisse */
  if(S.k!==garageI&&!GAR.sw&&!pvSolMesure(S))return;
  const T=PV_TEINTE[S.cible];
  if(S.pas!==PV_PAS){S.pas=PV_PAS;pvCageGeo(S,PV_PAS);}
  S.g.position.copy(carGroup.position);S.gr.position.set(0,carGroup.position.y+.02,0);S.g.quaternion.copy(carGroup.quaternion);
  S.r.position.set(S.off.x,.03,S.off.z);S.r.quaternion.copy(S.g.quaternion).invert(); /* l'anneau reste à plat, centré sous la boîte de la caisse */
  S.c.lerp(S.cc.setHex(T.hex),Math.min(1,dt*6));S.gm.color.copy(S.c);S.rm.color.copy(S.c);
  S.p=Math.max(0,S.p-dt*1.6);S.gm.opacity=.26+.5*S.p;S.rm.opacity=.2+.4*S.p;
  if(!REDUCED_MOTION)S.piv.rotation.y=(S.a+=dt*1.1);
}
window.dbgPassViseur=function(a,b){if(a==='ids'){GMIS.pvForce=b;pvRender(false);return b;}const S=GMIS.sol;return S?{vis:S.g.visible,pos:S.g.position.toArray(),n:S.cage.geometry.attributes.position?S.cage.geometry.attributes.position.count/2:0,cible:S.cible,k:S.k}:null;}; /* banc : l'anneau et la grille du viseur */
/* ---- TOUCHER L'ÉCRAN : une onde sous le doigt (couleur de la teinte courante) et un éclat de toute la grille ; la teinte seule reste en REDUCED_MOTION ---- */
function pvOnde(e){
  if(!garageOn||!gEl||GAR.go||REDUCED_MOTION||!gEl.classList.contains('missions'))return;
  const t=e.target;if(t&&t.closest&&t.closest('.pvC,.pbtn,#gmBas,#gmHead'))return;
  const E=$('pvEcran');if(!E)return;
  const o=E.getBoundingClientRect(),i=document.createElement('i');i.className='pvOnde';i.style.left=Math.round(e.clientX-o.left)+'px';i.style.top=Math.round(e.clientY-o.top)+'px';
  i.style.setProperty('--gc',PV_TEINTE[(GMIS.sol&&GMIS.sol.cible)||'cyan'].css);E.appendChild(i);setTimeout(function(){i.remove();},900);
  if(GMIS.sol)GMIS.sol.p=Math.max(GMIS.sol.p,.7);
}
if(PASS_ON)document.addEventListener('pointerdown',pvOnde,true);
