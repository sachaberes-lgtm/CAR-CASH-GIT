/* ===== LES MISSIONS v2 — L'ÉCRAN (2026-10-16, Sacha : « un écran MISSIONS magnifique, bâti à partir de la vue garage qui existe déjà » ·
   « UNE SEULE LISTE, triée intelligemment » · « toucher une mission la SUIT, jusqu'à 3 » · « une mission réussie brille et propose
   RÉCUPÈRE ») =====
   Le décor reste : la caméra s'élève au-dessus de l'atelier (GMIS), la trame et le balayage de la vue caméra, le cadeau en tête.
   Le panneau (#gmListe.m2, placé par gmPlaceL : debout entre le titre et JOUER, couché dans la colonne de JOUER) porte UNE liste :
   À RÉCUPÉRER (elles brillent) → SUIVIES (filet or, 3 au plus) → presque finies (≥ 2/3) → en cours → pas commencées ; puis
   « TERMINÉES (n) », repliées, qu'on ouvre. Une ligne : l'icône de sa famille (la case qu'on coche : un coin d'or quand elle est suivie),
   le texte, la jauge et son chiffre, la vignette de la récompense (photo de la caisse, aperçu de l'habillage, montant en vert).
   Les SECRÈTES n'y sont pas, même en « ? ? ? » : trouvées, elles arrivent avec leur badge SECRÈTE (les dix couleurs secrètes de la
   palette aussi, dans les TERMINÉES). Les jauges se remplissent DEPUIS ce que l'écran a déjà montré (`SAVE.d.m2.vu`). */
const M2_FAM={exploit:{ic:'eclair'},aura:{ic:'etoile'},argent:{ic:'piece'},moteur:{ic:'flamme'},collection:{ic:'coffre'},exploration:{ic:'drapeau'},secret:{ic:'oeil'}};
const M2E={fin:false}; // les TERMINÉES dépliées (le temps de la session)
Object.assign(I18N,{'RÉCUPÈRE':'CLAIM','BIENTÔT':'SOON','RÉUSSIE':'DONE','SECRÈTE':'SECRET','TERMINÉES':'COMPLETED','MISSION SECRÈTE':'SECRET MISSION',
  'MISSION SECRÈTE TROUVÉE':'SECRET MISSION FOUND','FAIT':'DONE','PAS ENCORE':'NOT YET','TROIS MISSIONS SUIVIES AU PLUS':'3 TRACKED MISSIONS AT MOST',
  'TOUCHE UNE MISSION POUR LA SUIVRE · 3 AU PLUS':'TAP A MISSION TO TRACK IT · 3 MAX','RÉCOMPENSE À RÉCUPÉRER':'A REWARD IS WAITING',
  'TOUTES LES MISSIONS':'ALL MISSIONS','À RÉCUPÉRER':'TO CLAIM','BIENTÔT AU GARAGE':'COMING TO THE GARAGE SOON','RÉCOMPENSE À VENIR':'REWARD COMING SOON',
  'EST À TOI':'IS YOURS','SUIVIE':'TRACKED','VERSÉS AU COMPTE':'PAID INTO YOUR ACCOUNT','MISSIONS RÉUSSIES':'MISSIONS DONE'});
function m2Nb(x){return Math.max(0,Math.floor(x)).toLocaleString(LOC()).replace(/[  ]/g,' ');}
function m2Mn(x){x=Math.max(0,Math.floor(x));return Math.floor(x/60)+':'+String(x%60).padStart(2,'0');}
/* L'AVANCEMENT DE LA PARTIE (en course, l'écran de mort) : pour une mission « en une partie », ce que CETTE partie a fait — le record
   ne bouge pas tant qu'on ne le bat pas, la jauge de course doit bouger, elle ; le reste (à vie, collection) : m2Val */
function m2ValCourse(m){try{switch(m.k){case 'aura':return Math.round(auraRun)||0;case 'parf':return M2R.parf;case 'fig':return Math.max(M2R.figV,M2R.figMax);
  case 'vie':return M2R.vie;case 'frenT':return FLOW.lv===4?FREN.t:(RUNX.frenMax||0);case 'eng':return (engTier|0)+1;case 'kmh':return Math.round(runStats.vmax)||0;
  case 'tours':return M2R.tourV.length;case 'airP':return M2R.airPm;}}catch(e){}return m2Val(m);}
function m2Frac(m,v,t){return t>0?Math.max(0,Math.min(1,v/t)):0;}
function m2Prog(m,v,t){v=Math.min(v,t); // « 3 / 5 », « 42 000 / 100 000 $ », « 4,2 / 5 S », « 1:12 / 5:00 »
  switch(m.u){case 's':return decFr(Math.floor(v*10)/10,1)+' / '+t+' S';case 'kmh':return m2Nb(v)+' / '+m2Nb(t)+' KM/H';case 'km':return m2Nb(Math.floor(v))+' / '+m2Nb(t)+' KM';
    case '$':return m2Nb(v)+' / '+m2Nb(t)+' $';case 'aura':return fmtAura(v)+' / '+fmtAura(t);case 'mn':return m2Mn(v)+' / '+m2Mn(t);
    case 'b':return v>=t?TR('FAIT'):TR('PAS ENCORE');}
  return m2Nb(v)+' / '+m2Nb(t);}
function m2RecNom(m){const r=m.r||{};if(r.cash)return '+'+fmtC(r.cash);if(r.car)return TR(r.car);
  if(r.cat){const d=(COSM[r.cat]||[]).find(function(x){return x.id===r.id;});return d?TR(d.n):'';}return TR('RÉCOMPENSE À VENIR');}
function m2NbPret(){const s=m2Etat();let n=0;for(const id of s.ok)if(s.pr.indexOf(id)<0&&m2Pret(id))n++;return n;}
function m2SecPal(){const o=(SAVE.d.shop&&SAVE.d.shop.own)||[];return COSM.peinture.filter(function(d){return d.sec&&o.indexOf('peinture:'+d.id)>=0;});} // les couleurs secrètes TROUVÉES (le pack n'en fait pas des missions… mais on ne sait pas d'où elles viennent : elles comptent)
function m2Compte(){const s=m2Etat(),p=m2SecPal().length;let vis=0,sec=0,ok=0;for(const m of M2){if(!m2Dispo(m))continue;const r=s.ok.indexOf(m.id)>=0;if(r)ok++;if(m.f!=='secret')vis++;else if(r)sec++;}
  return {ok:ok+p,tot:vis+sec+p};} // (2026-10-19) ok : les réussies qu'on VOIT (une cachée par m2Dispo ne compte ni en haut ni en bas)
/* les lignes, triées : 0 à récupérer · 1 suivies · 2 les autres, PAR FAMILLE (M2_ORDRE), la plus avancée d'abord · 9 terminées
   (2026-10-17, Sacha : « les exploits en haut, pas les COLLECTE ») — avant, le reste se triait à l'avancement seul : les COLLECTE (déjà à
   1 / 3 avec la caisse du départ) passaient au-dessus des exploits à 0, et un nouveau joueur ne voyait d'abord que des « COLLECTE ». */
const M2_ORDRE={exploit:0,aura:1,moteur:2,exploration:3,secret:4,argent:5,collection:6}; // ce qui se joue en course d'abord, ce qui s'accumule ensuite
function m2Lignes(){const s=m2Etat(),L=[],fo=function(x){const o=M2_ORDRE[x.m.f];return o==null?9:o;};
  for(const m of M2){const ok=s.ok.indexOf(m.id)>=0;if((m.f==='secret'&&!ok)||!m2Dispo(m))continue;let v=0;try{v=m2Val(m);}catch(e){}
    const t=m2Seuil(m),p=ok?1:m2Frac(m,v,t),pr=s.pr.indexOf(m.id)>=0,su=s.su.indexOf(m.id),vide=!!(m.r&&m.r.vide);
    const rg=ok?(!pr&&!vide?0:9):su>=0?1:2;L.push({m:m,v:v,t:t,p:p,ok:ok,pr:pr,su:su,rg:rg});}
  L.sort(function(a,b){return a.rg-b.rg||(a.rg===1?a.su-b.su:a.rg===2?fo(a)-fo(b):0)||b.p-a.p||M2.indexOf(a.m)-M2.indexOf(b.m);});return L;}
function m2CarVoir(m){const r=m.r||{};if(r.car){const i=m2CarIdx(r.car);return i>=0&&!carRetiree(i)?{car:i}:null;}
  if(r.cat){const j=(COSM[r.cat]||[]).findIndex(function(x){return x.id===r.id;});return j>=0?{cat:r.cat,i:j}:null;}return null;}
/* LA VIGNETTE : la caisse en photo (photoFile, une par image, au garage), l'aile en photo sur ta caisse (aileFile), la peinture en pastille
   et la traînée en ruban (objFig, ceux de l'écran de mort), l'argent en vert, « ? » pour la récompense encore à définir */
function m2Vign(m){const r=m.r||{};
  if(r.cash)return '<b class="m2Cash">+'+fmtC(r.cash)+'</b>';
  if(r.vide)return '<i class="m2Vide">?</i>';
  if(r.car){const i=m2CarIdx(r.car);const ph=i>=0&&PHOTO.cache[i];return '<i class="m2Ph">'+pxi('voiture')+'<img alt=""'+(ph?' src="'+ph+'"':i>=0&&!carRetiree(i)?' data-ph="'+i+'"':'')+'></i>';}
  if(r.cat==='aile')return '<i class="m2Ph">'+pxi('aile')+'<img alt="" data-ai="'+r.id+'"></i>';
  if(r.cat){const j=(COSM[r.cat]||[]).findIndex(function(x){return x.id===r.id;});return j>=0?objFig({cat:r.cat,i:j}):'<i class="m2Vide">'+pxi(r.cat==='trainee'?'trainee':'pinceau')+'</i>';}
  return '';}
function m2Ligne(x,k,s){const m=x.m,F=M2_FAM[m.f]||M2_FAM.exploit,pret=x.rg===0,suiv=x.su>=0&&!x.ok,vu=s.vu[m.id],voir=!!m2CarVoir(m);
  const w0=Math.round(100*Math.min(x.p,vu!=null?vu:x.p)),w1=Math.round(100*x.p);
  let bas;
  if(pret)bas=m2Pret(m.id)?'<span class="m2Pr" aria-hidden="true"><span>'+pxi('cadeau')+' '+TR('RÉCUPÈRE')+'</span></span>':'<small class="m2Bt">'+TR('BIENTÔT AU GARAGE')+'</small>';
  else bas='<small>'+(x.ok?TR('RÉUSSIE'):(suiv?TR('SUIVIE')+' · ':'')+m2Prog(m,x.v,x.t))+'</small>';
  return '<div class="m2L m2F-'+m.f+(suiv?' f':'')+(x.ok?' ok':'')+(pret?' pret':'')+'" data-m2="'+m.id+'" role="button" tabindex="0" aria-pressed="'+suiv+'" style="--i:'+Math.min(k,12)+'">'
    +'<span class="m2Ic">'+pxi(x.ok&&!pret?'coche':F.ic)+(suiv?'<i class="m2Ck"></i>':'')+'</span>'
    +'<div class="glTx"><b>'+(m.f==='secret'?'<i class="m2Sec">'+TR('SECRÈTE')+'</i> ':'')+m2TxtH(m)+'</b>'
    +(x.ok?'':'<u><em style="width:'+w0+'%" data-w="'+w1+'"></em></u>')+bas+'</div>'
    +'<div class="m2R'+(voir?' voir':'')+'" aria-label="'+sansAcc(m2RecNom(m)).replace(/"/g,'')+'">'+m2Vign(m)+'</div></div>';}
function m2LignePal(d){ // une couleur secrète de la palette, trouvée : son indice devient sa mission
  const j=COSM.peinture.indexOf(d);return '<div class="m2L m2F-secret ok" data-pal="'+d.id+'"><span class="m2Ic">'+pxi('coche')+'</span>'
    +'<div class="glTx"><b><i class="m2Sec">'+TR('SECRÈTE')+'</i> '+sansAcc(TR(d.ind||'')).toUpperCase()+'</b><small>'+TR('RÉUSSIE')+'</small></div>'
    +'<div class="m2R voir">'+objFig({cat:'peinture',i:j})+'</div></div>';}
function m2Render(vu){
  const el=$('gmNoeuds'),sv=$('gmFils');if(!el)return;if(sv)sv.innerHTML='';
  const old=$('gmListe'),sc0=old?old.scrollTop:0,a0=old&&old.querySelector('.glA'),sc1=a0?a0.scrollTop:0;
  const s=m2Etat(),L=m2Lignes(),pal=m2SecPal();let h='<div class="glA m2A">',k=0;
  try{h+=aujHtml();}catch(e){console.warn('aujHtml',e);} /* (2026-10-20, Léo) AUJOURD'HUI : le défi du jour et la série de sept jours (missions/aujourdhui.js) */
  for(const x of L)if(x.rg<9)h+=m2Ligne(x,k++,s);
  const fin=L.filter(function(x){return x.rg===9;}),nf=fin.length+pal.length;
  if(nf){h+='<div class="m2Fin'+(M2E.fin?' on':'')+'" role="button" tabindex="0" aria-expanded="'+M2E.fin+'">'+pxi('coche')+'<span>'+sansAcc(TR('TERMINÉES'))+' ('+nf+')</span>'+pxi(M2E.fin?'haut':'bas')+'</div>';
    if(M2E.fin){h+='<div class="m2FinL">';fin.forEach(function(x,j){h+=m2Ligne(x,j,s);});pal.forEach(function(d){h+=m2LignePal(d);});h+='</div>';}}
  if(!k&&!nf)h+='<div class="m2Rien">'+TR('TOUTES LES MISSIONS')+'</div>';
  h+='</div>';
  el.innerHTML='<div id="gmListe" class="m2'+(vu?' vu':'')+'">'+h+'</div>';
  GMIS.cards=[];GMIS.pts=[];GMIS.paths=[];GMIS.last=null;GMIS.lw=0;
  const c=m2Compte(),sous=$('gmSous');if(sous)sous.textContent=c.ok+' / '+c.tot;
  const aide=$('gmAide');if(aide)aide.textContent=s.su.length?'':sansAcc(TR('TOUCHE UNE MISSION POUR LA SUIVRE · 3 AU PLUS'));
  try{gmPlaceL(VP.w,VP.h);}catch(e){}
  const nl=$('gmListe');if(nl){nl.scrollTop=sc0;const a1=nl.querySelector('.glA');if(a1)a1.scrollTop=sc1;}
  if(typeof GAR!=='undefined'&&GAR.aMisId){const id9=GAR.aMisId;GAR.aMisId=null;setTimeout(function(){const r9=document.querySelector('#gmListe .m2L[data-m2="'+id9+'"]');if(r9){try{r9.scrollIntoView({block:'center'});}catch(e){}r9.classList.add('flash');}},REDUCED_MOTION?0:380);} // VOIR LA MISSION hors du garage
  /* les photos : une à la fois (photoFile tourne au garage), posées si la ligne est encore là */
  el.querySelectorAll('img[data-ph]').forEach(function(im){const i=+im.getAttribute('data-ph');photoFile(i,function(u){if(u&&im.isConnected)im.src=u;});});
  el.querySelectorAll('img[data-ai]').forEach(function(im){try{aileFile(im.getAttribute('data-ai'),function(u){if(u&&im.isConnected)im.src=u;});}catch(e){}});
  /* les jauges se remplissent depuis ce que l'écran avait montré (après une partie : on voit ce qu'elle a fait) */
  const ems=el.querySelectorAll('.m2L u em[data-w]'),go=function(){ems.forEach(function(e){e.style.width=e.getAttribute('data-w')+'%';});};
  if(REDUCED_MOTION||vu)go();else setTimeout(function(){requestAnimationFrame(go);},420);
  let ch=false;for(const x of L){const p=Math.round(x.p*1000)/1000;if(s.vu[x.m.id]!==p){s.vu[x.m.id]=p;ch=true;}}if(ch)SAVE.mark();
  m2Portes();m2RevAuto(700);}
function m2Voir(m){const o=m2CarVoir(m);if(!o){uiClic('refus');return;}uiClic('nav');
  ecranWipe(function(){garMode('boutique');if(o.car!=null){shopTab('voiture');garageShow(o.car);}else{shopTab(o.cat);shopShow(o.cat,o.i);}});}
function m2Recupere(id,row){
  if(!m2Pret(id)){uiClic('refus');try{gSecoue(row);}catch(e){}toast(pxi('horloge')+' '+TR('BIENTÔT AU GARAGE'));return;}
  const o=m2Prend(id);if(!o){uiClic('refus');return;}
  row.classList.add('pris');const vg=row.querySelector('.m2R');
  try{pixBurst(row.querySelector('.m2Pr')||row,12);if(vg)pixBurst(vg,10);}catch(e){}
  try{if(SONV2){sfx(o.cash?'ui.achat':'ui.debloque');if(!REDUCED_MOTION)sfx('ui.tampon',{t:.27});}else uiClic('ok');}catch(e){}
  hap([12,40,18,40,30]);
  if(o.car!=null){try{carSnapshot();}catch(e){}toast(pxi('voiture')+' '+TR(CARS[o.car].name)+' — '+TR('EST À TOI'),true);}
  else if(o.cat){const d=(COSM[o.cat]||[]).find(function(x){return x.id===o.hab;});toast(pxi('coche')+' '+(d?TR(d.n):'')+' — '+TR('EST À TOI'),true);}
  else toast(pxi('piece')+' +'+fmtC(o.cash)+' '+TR('VERSÉS AU COMPTE'),true);
  try{gBankPaint();}catch(e){}try{m2Portes();}catch(e){}
  setTimeout(function(){if(garageOn&&gEl&&gEl.classList.contains('missions'))m2Render(true);else m2Portes();},REDUCED_MOTION?0:560);}
function m2Clic(e){const t=e.target;if(!t||!t.closest)return;
  if(t.closest('.m2Auj')){aujClic(t);return;} /* (2026-10-20) le bloc AUJOURD'HUI dit ce qu'il donne */
  const fin=t.closest('.m2Fin');if(fin){M2E.fin=!M2E.fin;uiClic(M2E.fin?'on':'off');hap(8);m2Render(true);
    if(M2E.fin){const f2=document.querySelector('#gmListe .m2Fin');if(f2&&f2.scrollIntoView)try{f2.scrollIntoView({block:'start',behavior:REDUCED_MOTION?'auto':'smooth'});}catch(x){}}return;}
  const pal=t.closest('[data-pal]');if(pal){const j=COSM.peinture.findIndex(function(d){return d.id===pal.getAttribute('data-pal');});if(j<0)return;uiClic('nav');
    ecranWipe(function(){garMode('boutique');shopTab('peinture');shopShow('peinture',j);});return;}
  const row=t.closest('.m2L');if(!row)return;const id=row.getAttribute('data-m2'),m=m2Def(id);if(!m)return;const s=m2Etat();
  if(t.closest('.m2R.voir')&&!t.closest('.m2Pr')){m2Voir(m);return;}
  if(row.classList.contains('pret')){if(m.f==='secret'&&m2Revele(id))return;m2Recupere(id,row);return;} // une SECRÈTE qui brille : sa révélation
  if(s.ok.indexOf(id)>=0){uiClic('refus');return;}
  const k=s.su.indexOf(id);
  if(k>=0)s.su.splice(k,1);
  else{if(s.su.length>=3){uiClic('refus');try{gSecoue(row);}catch(x){}toast(pxi('cible')+' '+TR('TROIS MISSIONS SUIVIES AU PLUS'));return;}s.su.push(id);}
  SAVE.flush();uiClic(k>=0?'off':'on');hap(10);m2Render(true);
  const r2=document.querySelector('#gmListe .m2L[data-m2="'+id+'"]');if(r2){r2.classList.add('flash');if(k<0&&r2.scrollIntoView)try{r2.scrollIntoView({block:'nearest'});}catch(x){}}}
/* LE POINT VERT DES PORTES (à la place des trois pastilles du carnet) : une récompense attend d'être récupérée */
function m2Portes(){const n=m2NbPret();
  document.querySelectorAll('#gvMis,.ghT[data-h="mis"],#mHome [data-m="mis"]').forEach(function(d){let p=d.querySelector(':scope>.m2Pt');
    if(!p){if(!n)return;p=document.createElement('i');p.className='m2Pt';p.setAttribute('aria-hidden','true');try{if(getComputedStyle(d).position==='static')d.style.position='relative';}catch(e){}d.appendChild(p);}
    p.hidden=!n;});}
/* LES MISSIONS SUIVIES, EN COURSE (#m2Focus, à la place de #misFocus) : trois lignes au plus, discrètes — consigne · avancement · jauge
   fine ; verte quand elle tombe. Le DOM n'est écrit que si un texte ou une jauge change (4 fois par seconde au plus, m2Tick). */
const MIS_FOCUS_OFF=true; // (2026-10-20, Sacha : « enlève ce truc de mission ») plus aucune mission suivie affichée en course ; false = on la rallume
function m2FocusMaj(){let e=document.getElementById('m2Focus');const on=!MIS_FOCUS_OFF&&misOn()&&!TUTO.on;
  const s=on?m2Etat():null,L=on?s.su.filter(function(id){return m2Dispo(m2Def(id))&&!!m2Def(id);}):[];
  if(!L.length){if(e&&e._on){e.classList.remove('on');e._on=0;}return;}
  if(!e){e=document.createElement('div');e.id='m2Focus';e.setAttribute('aria-hidden','true');(document.getElementById('hud')||document.body).appendChild(e);e._k='';e.r=[];}
  const k9=L.join(',');
  if(e._k!==k9){e._k=k9;e.innerHTML=L.map(function(){return '<div class="m2FR"><i></i><span></span><b></b><u><em></em></u></div>';}).join('');
    e.r=[].map.call(e.children,function(r){return {el:r,i:r.children[0],sp:r.children[1],b:r.children[2],em:r.children[3].firstChild,t:'',p:'',w:'',ic:'',ok:null};});}
  L.forEach(function(id,j){const m=m2Def(id),R=e.r[j],ok=s.ok.indexOf(id)>=0;let v=0;try{v=m2ValCourse(m);}catch(x){}const t=m2Seuil(m);
    const tx=sansAcc(m2Txt(m)),pg=ok?TR('RÉUSSIE'):m2Prog(m,v,t),w=Math.round(100*(ok?1:m2Frac(m,v,t)))+'%',ic=ok?'coche':(M2_FAM[m.f]||M2_FAM.exploit).ic;
    if(R.t!==tx){R.t=tx;R.sp.textContent=tx;}if(R.p!==pg){R.p=pg;R.b.textContent=pg;}if(R.w!==w){R.w=w;R.em.style.width=w;}
    if(R.ic!==ic){R.ic=ic;R.i.innerHTML=pxi(ic);}if(R.ok!==ok){R.ok=ok;R.el.classList.toggle('ok',ok);}});
  if(!e._on){e.classList.add('on');e._on=1;}}
/* LA CARTE MISSIONS DE L'ÉCRAN DE MORT : les missions réussies pendant la partie, puis l'avancement des suivies (la jauge se remplit
   sous les yeux) ; à défaut, celle qui est la plus proche de tomber. Une SECRÈTE trouvée ne dit pas son nom (sa révélation est à venir).
   Le point vert : une récompense attend. Touchée : l'écran MISSIONS. */
function objRenderV2(el){const s=m2Etat(),L=[];
  for(const id of M2R.run){const m=m2Def(id);if(m&&m2Dispo(m)&&L.length<2&&!L.some(function(x){return x.m===m;}))L.push({m:m,ok:1});}
  for(const id of s.su){const m=m2Def(id);if(!m||!m2Dispo(m)||L.length>=3||L.some(function(x){return x.m===m;}))continue;L.push({m:m,ok:s.ok.indexOf(id)>=0?1:0});}
  if(!L.length){let b=null,bp=-1;for(const m of M2){if(m.f==='secret'||m.f==='collection'||s.ok.indexOf(m.id)>=0||!m2Dispo(m))continue;let v=0;try{v=m2Val(m);}catch(x){}
    const p=m2Frac(m,v,m2Seuil(m));if(p<1&&p>bp){bp=p;b=m;}}if(b)L.push({m:b,ok:0});}
  const nP=m2NbPret(),c=m2Compte();
  el.className='mObj misPorte m2Ob';el.setAttribute('data-m','mis');el.style.removeProperty('--rc');
  let h='<div class="obHd"><span>'+pxi('cible')+' '+TR('MISSIONS')+(nP?' <i class="m2Pt in"></i>':'')+'</span><b class="m2Cpt">'+c.ok+' / '+c.tot+'</b></div>';
  for(const x of L){const m=x.m;
    if(m.f==='secret')h+='<div class="obM ok sec">'+pxi('oeil')+'<span>'+sansAcc(TR('MISSION SECRÈTE TROUVÉE'))+'</span></div>';
    else if(x.ok)h+='<div class="obM ok">'+pxi('coche')+'<span>'+sansAcc(m2Txt(m))+'</span><em>'+sansAcc(m2RecNom(m))+'</em></div>';
    else{let v=0;try{v=m2ValCourse(m);}catch(q){}const t=m2Seuil(m);
      h+='<div class="obM">'+pxi((M2_FAM[m.f]||M2_FAM.exploit).ic)+'<span>'+sansAcc(m2Txt(m))+'</span><b>'+m2Prog(m,v,t)+'</b></div><div class="obBar"><i style="width:0%" data-w="'+(100*m2Frac(m,v,t)).toFixed(1)+'"></i></div>';}}
  h+='<div class="obFt"><span>'+sansAcc(TR(nP?'À RÉCUPÉRER':'TOUTES LES MISSIONS'))+'</span><span>'+TR('VOIR')+' '+pxi('droite')+'</span></div>';
  el.innerHTML=h;
  const bars=el.querySelectorAll('.obBar i');
  if(bars.length&&!REDUCED_MOTION&&TCTL.mortT&&objRenderV2._k!==TCTL.mortT){objRenderV2._k=TCTL.mortT;setTimeout(function(){try{if(started&&gameOver&&overlay.style.display!=='none'&&el.isConnected)sfx('ui.jauge');}catch(e){}},520);}
  setTimeout(function(){requestAnimationFrame(function(){bars.forEach(function(i){i.style.width=i.getAttribute('data-w')+'%';});});},REDUCED_MOTION?0:520);
  m2RevAuto(1400);} // une SECRÈTE trouvée pendant la partie : sa révélation, par-dessus l'écran de mort
/* ===== LES MISSIONS v2 — LA BOUTIQUE ET LE GARAGE (2026-10-16, Sacha : « une voiture ou un habillage qui se gagne par mission affiche, à
   la place du prix, SE DÉBLOQUE : texte de la mission, avec sa barre d'avancement, plus un bouton qui mène directement à la mission dans
   l'écran MISSIONS (et la suit) » · « voitures secrètes : dans la boutique, elles n'apparaissent qu'en silhouette noircie, avec écrit
   MISSION SECRÈTE. Aucun indice, aucune barre. Elles ne s'affichent ni en 3D ni en couleur tant qu'elles ne sont pas gagnées ») =====
   · rayon VOITURES (bqPieces) : les caisses à pièces, puis celles des missions, puis les secrètes (silhouettes : `.m2sec`, nom « ? ? ? »,
     rareté « MISSION SECRÈTE », pastille SECRÈTE) ;
   · une SECRÈTE touchée n'est jamais construite : le plateau se vide (`GBQ.sec`, la ligne de garageRender qui montre la caisse la tait),
     l'étiquette dit MISSION SECRÈTE, le bouton est éteint ;
   · une caisse ou un habillage de mission : l'étiquette au-dessus de l'objet porte SE DÉBLOQUE + la jauge (m2DebloqueHtml), le bouton dit
     VOIR LA MISSION (bqEtat 'mis' → m2VaMission : la mission SUIVIE, l'écran MISSIONS, la ligne amenée en vue) ; la fiche de la console
     (#gDesc) aussi, avec son bouton (`data-m2voir`). */
function m2DeCaisse(i){const u=CAR_UNLOCK[i];return u&&u.k==='mis'?m2Def(u.id):null;}
function m2DeHab(cat,d){return d&&d.mis2?m2Def(d.mis2):null;}
function m2Secrete(i){const m=m2DeCaisse(i);return !!(m&&m.f==='secret'&&!carUnlockedVrai(i));}
Object.assign(I18N,{'SE DÉBLOQUE':'UNLOCKS','VOIR LA MISSION':'SEE THE MISSION','RÉCUPÈRE DANS MISSIONS':'CLAIM IT IN MISSIONS',
  "Ne s'achète pas : elle se gagne par une mission.":'Not for sale: it is earned through a mission.',
  "Ne s'achète pas : elle vient avec le CHAT POP-TART.":'Not for sale: it comes with the POP-TART CAT.',
  'PACK CHAT':'CAT PACK','AVEC LE CHAT':'WITH THE CAT','+ ARC-EN-CIEL':'+ RAINBOW','+ TRAÎNÉE ARC-EN-CIEL':'+ RAINBOW TRAIL','+ TRAÎNÉE ARC-EN-CIEL INCLUSE':'+ RAINBOW TRAIL INCLUDED'}); // (2026-10-18 soir) le pack du chat (voir chatPackI) ; (2026-10-20) la pastille de la vitrine (voir shArcHtml)
function m2DebloqueHtml(m,sansBouton){if(!m)return '';const s=m2Etat(),ok=s.ok.indexOf(m.id)>=0;let v=0;try{v=m2Val(m);}catch(e){}const t=m2Seuil(m),p=ok?1:m2Frac(m,v,t);
  return '<span class="m2Deb"><span class="m2DebT">'+pxi('cible')+' '+sansAcc(TR('SE DÉBLOQUE'))+' : '+m2TxtH(m)+'</span>'
    +'<span class="m2DebB"><u><em style="width:'+Math.round(p*100)+'%"></em></u><b>'+(ok?sansAcc(TR('RÉCUPÈRE DANS MISSIONS')):m2Prog(m,v,t))+'</b></span>'
    +(sansBouton?'':'<span class="m2DebV" role="button" tabindex="0" data-m2voir="'+m.id+'">'+sansAcc(TR('VOIR LA MISSION'))+' '+pxi('droite')+'</span>')+'</span>';}
function m2TxtH(m){return sansAcc(m2Txt(m)).replace(/\d[\d ]*\d/g,function(x){return '<span class="m2Nw">'+x+'</span>';});} // les nombres ne se coupent pas en fin de ligne (« 1 / 000 »)
function m2SecretHtml(){return '<span class="m2Deb sec"><span class="m2DebT">'+pxi('oeil')+' '+sansAcc(TR('MISSION SECRÈTE'))+'</span></span>';}
/* VOIR LA MISSION : l'écran MISSIONS, la mission SUIVIE (trois le sont déjà : la plus ancienne laisse sa place), sa ligne amenée en vue */
function m2VaMission(id){const m=m2Def(id);if(!m||m.f==='secret')return;const s=m2Etat();
  if(s.ok.indexOf(id)<0&&s.su.indexOf(id)<0){if(s.su.length>=3)s.su.shift();s.su.push(id);SAVE.flush();}
  uiClic('nav');hap(8);
  const va=function(){garMode('missions');setTimeout(function(){const r=document.querySelector('#gmListe .m2L[data-m2="'+id+'"]');if(r){try{r.scrollIntoView({block:'center'});}catch(e){}r.classList.add('flash');}},REDUCED_MOTION?0:380);};
  if(!garageOn){GAR.aMisId=id;garMissionsOuvre();return;}
  ecranWipe(function(){
    if(GBQ.on||GMODE.m==='shop')try{gGarageReplie();GBQ.on=GBQ.veut=false;GBQ.bascule=true;bqClasses(false);try{garBqAmbiance(false);bqSonCoupe(.4);}catch(e){}GBQ.lueur=0;GBQ.sec=null;SHOP.prev=null;buildCar(CARS[equippedCar()]);}catch(e){} // la boutique rangée d'un coup sous le voile (la recette de son ◀ depuis l'accueil)
    va();});}
document.addEventListener('click',function(e){const t=e.target&&e.target.closest&&e.target.closest('[data-m2voir]');if(!t)return;e.stopPropagation();e.preventDefault();
  if(typeof GAR!=='undefined'&&(GAR.go||ecranWipe._on))return;try{uiPop(t);}catch(x){}m2VaMission(t.getAttribute('data-m2voir'));},true);
/* ===== LES MISSIONS v2 — LA RÉVÉLATION D'UNE SECRÈTE (2026-10-16, Sacha : « pour une SECRÈTE, une vraie scène de révélation : la silhouette
   noire se remplit de couleur, avec le nom de la voiture et l'intitulé de la mission enfin dévoilé. C'est le moment fort ») =====
   #m2Rev, par-dessus tout : la nuit et ses rayons ; MISSION SECRÈTE ; la caisse en SILHOUETTE NOIRE (sa photo de studio, `carPhoto`) ;
   0,7 s plus tard la couleur la remplit de bas en haut sous une ligne de lumière à la couleur de sa rareté (1,4 s, `ui.debloque`) ; son
   NOM tombe (gerbe de pixels) ; l'INTITULÉ de la mission s'écrit lettre à lettre (`ui.lettre`) ; RÉCUPÈRE — la caisse est à toi (`m2Prend`,
   `ui.achat` + `ui.tampon`). Toucher avant la fin = aller au bout ; Entrée / Espace / Échap aussi.
   LA FILE (m2RevFile) : les secrètes réussies dont la caisse n'est pas encore à toi, et déjà au garage (une retirée qui n'est pas encore
   revenue attend). Elle se joue sur l'écran de mort (1,4 s après lui), en ouvrant l'écran MISSIONS, en touchant une secrète qui brille,
   ou à la console (dbgMissions('gagne',id)). Une à la fois ; la suivante enchaîne. « Réduire les animations » : tout est posé d'un coup. */
const M2REV={on:false,id:null,t:0};
Object.assign(I18N,{'CONTINUER':'CONTINUE'});
function m2RevFile(){const s=m2Etat();return M2.filter(function(m){return m.f==='secret'&&!!(m.r&&m.r.car)&&s.ok.indexOf(m.id)>=0&&s.pr.indexOf(m.id)<0&&m2Pret(m.id);}).map(function(m){return m.id;});}
function m2RevAuto(delai){if(M2REV.on||!m2RevFile().length)return;clearTimeout(M2REV.t);
  M2REV.t=setTimeout(function(){if(M2REV.on||m2EnC())return;const L=m2RevFile();if(L.length)m2Revele(L[0]);},delai||0);}
function m2Revele(id){const m=m2Def(id);if(!m||M2REV.on||m2EnC())return false;const i=m2CarIdx((m.r||{}).car);if(i<0||carRetiree(i))return false;
  M2REV.on=true;M2REV.id=id;
  let el=document.getElementById('m2Rev');if(!el){el=document.createElement('div');el.id='m2Rev';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.appendChild(el);}
  const ri=rarInfo(carRar(i));el.style.setProperty('--rc',ri.c);el.setAttribute('aria-label',sansAcc(TR('MISSION SECRÈTE')));
  el.innerHTML='<div class="m2RvFond"></div><div class="m2RvRayons"></div>'
    +'<div class="m2RvBloc"><div class="m2RvHd">'+pxi('oeil')+' '+sansAcc(TR('MISSION SECRÈTE'))+'</div>'
    +'<div class="m2RvPh"><img class="c" alt=""><img class="n" alt=""><i class="m2RvLigne"></i></div>'
    +'<div class="m2RvRar">'+sansAcc(TR(ri.n1))+'</div><div class="m2RvNom">'+sansAcc(TR(CARS[i].name))+'</div>'
    +'<div class="m2RvTx"><span></span></div>'
    +'<div class="pbtn pb-gold m2RvBt" role="button" tabindex="0"><span>'+pxi('cadeau')+' '+sansAcc(TR('RÉCUPÈRE'))+'</span></div></div>';
  el.className='';void el.offsetWidth;el.classList.add('on');
  try{if(SONV2)sfx('ui.volet');}catch(e){}hap(10);
  const imC=el.querySelector('img.c'),imN=el.querySelector('img.n');
  const go=function(url){if(!M2REV.on||M2REV.id!==id)return;if(url){imC.src=url;imN.src=url;}else el.querySelector('.m2RvPh').classList.add('vide');
    const T=function(f,ms){setTimeout(function(){if(M2REV.on&&M2REV.id===id)f();},REDUCED_MOTION?0:ms);};
    T(function(){el.classList.add('plein');try{if(SONV2)sfx('ui.debloque');}catch(e){}hap([20,60,20,60,60]);},700);        // la silhouette se remplit de couleur
    T(function(){el.classList.add('nom');try{pixBurst(el.querySelector('.m2RvNom'),12);}catch(e){}},2000);                      // le nom tombe
    T(function(){el.classList.add('tx');m2RevTape(el.querySelector('.m2RvTx span'),sansAcc(m2Txt(m)),id);},2500);             // l'intitulé, enfin dévoilé
    T(function(){el.classList.add('bt');},3300);};
  try{carPhoto(i,go);}catch(e){go(null);} // la photo de studio (asynchrone) : la scène part quand elle est prête
  return true;}
function m2RevTape(sp,t,id){if(!sp)return;if(REDUCED_MOTION){sp.textContent=t;return;}let k=0;
  const pas=function(){if(!M2REV.on||M2REV.id!==id)return;k++;sp.textContent=t.slice(0,k);if(k%3===1)try{if(SONV2)sfx('ui.lettre',{vol:-8});}catch(e){}if(k<t.length)setTimeout(pas,28);};pas();}
function m2RevFerme(){const el=document.getElementById('m2Rev'),id=M2REV.id,m=m2Def(id);if(!M2REV.on||!el)return;
  if(!el.classList.contains('bt')){el.classList.add('plein','nom','tx','bt');const sp=el.querySelector('.m2RvTx span');if(sp&&m)sp.textContent=sansAcc(m2Txt(m));return;} // pas fini : au bout
  m2Prend(id);try{carSnapshot();}catch(e){}
  try{pixBurst(el.querySelector('.m2RvBt'),12);}catch(e){}try{if(SONV2){sfx('ui.achat');if(!REDUCED_MOTION)sfx('ui.tampon',{t:.2});}else uiClic('ok');}catch(e){}hap([12,40,30]);
  el.classList.add('fin');M2REV.on=false;M2REV.id=null;
  setTimeout(function(){el.className='';el.innerHTML='';
    try{if(garageOn&&gEl.classList.contains('missions'))m2Render(true);}catch(e){}try{m2Portes();}catch(e){}
    try{const ob=document.querySelector('.mObj.misPorte');if(ob&&started&&gameOver)objRenderV2(ob);}catch(e){}
    m2RevAuto(500);},REDUCED_MOTION?0:420);}
document.addEventListener('click',function(e){const el=document.getElementById('m2Rev');if(!el||!M2REV.on||!el.contains(e.target))return;e.stopPropagation();e.preventDefault();m2RevFerme();},true);
document.addEventListener('keydown',function(e){if(!M2REV.on)return;if(e.code==='Enter'||e.code==='Space'||e.code==='Escape'){e.preventDefault();e.stopPropagation();m2RevFerme();}},true);
// rampCd empêche de re-déclencher un bec de glace en reposant dessus ; fallStartSide mémorise la FACE de décollage (la bascule du bord).
let rampCd=0,fallStartSide=1;
let bounceN=0,airFlash=0; // BUMPS : rebonds sur la tranche de la dalle pendant CE vol
let runStats={tricks:0,bumps:0,zones:0,vmax:0,chainMax:0,gaps:0,surv:0}; // bilan de la run (écran de fin) + les exploits versés aux compteurs À VIE qui débloquent les caisses
let hopY=0,hopV=0,POSE_F=null; // petit saut de dos d'âne — (2026-10-01) POSE_F : le contact d'une pose déclarée en l'air (voir « LA POSE SANS SAUT »)
let nitroR=2,nitroX=0,nitroOn=false,nitroBlue=false,nitroHeldT=0;
/* ---------- LA NITRO v3 — « LE COUP » (2026-09-27, vague 3) ----------
   Sacha : « Les effets de nitro sont un peu faiblards, travaille-les correctement comme dans Asphalt. »
   MESURÉ avant d'écrire : à l'allumage AU SOL il ne se passait RIEN d'un coup — le champ glissait en 0,2 s de lissage, la plume passait
   de 1,1 à 2,3 m (vue à 45° par la caméra de poursuite : un cornet de 60 px), le seul son était le sifflet du turbo. Asphalt tient en
   TROIS TEMPS, rejoués ici sans une lumière, un programme ni une passe de plus (tout vit dans des objets créés à l'init, des uniforms
   de l'ACES et des réserves de particules qui partagent le programme `pt2E`) :
   · L'ALLUMAGE (`nitroAllume`, le front montant) : une ONDE qui part des tuyères (`NFX.ring`, même programme que la plume), la caméra
     TIRÉE en arrière puis le champ qui s'ouvre d'un coup, les bords de l'image qui prennent la couleur de la nitro (`uNit`/`uNitF`
     dans l'ACES), une gerbe de filés, le nez qui se lève, et un WHOOMP (souffle brun qui s'ouvre + coup de poitrine + ruée d'air).
     Rejoué en plus petit au passage en RÉSERVE BLEUE : c'est un deuxième étage, il doit se sentir.
   · LA TENUE : plume longue aux diamants de choc, stries de vent 3D qui filent près de l'objectif (`ventN`), frisson continu, bords
     teintés — et AUCUNE flaque ronde au sol (verdict du 25/09).
   · L'EXTINCTION (`nitroEteint`) : dernière bouffée aux pots + pétarade, et le champ qui RETOMBE en douceur au lieu de claquer.
   Couleurs de la bible « L'encre et l'or » : feu #ff7a24, réserve #5b7dff, pad turbo or #ffd75e.
   ⚠ la POUSSÉE et la CONSOMMATION ne bougent pas d'un iota : ici on ne travaille que le RESSENTI. */
/* (2026-10-14, passe graphismes · neon-residuel) LA COULEUR DE LA POUSSÉE sur l'image (bords, onde) : blanc-or chaud ; la réserve bleue reste un bleu froid
   DÉSATURÉ (#aebfd8, teinte 215°) ; la nitro infinie (violet #9d4dff avant) y devient un blanc-or plus clair : son violet reste dans la plume et le HUD. */
const NFX_C={n:0xffcf8a,b:0xaebfd8,i:0xffe3bd,p:0xffd98a};
const NFX={ign:0,ignK:1,air:false,off:0,t0:-9,sT:-9,len:0,edge:0,col:new THREE.Color(0xff7a24),cT:new THREE.Color(),blanc:new THREE.Color(0xffffff),ringT:9,ringK:1,
  vAcc:0,s:0x2f6b1a3,v:new THREE.Vector3(),d:new THREE.Vector3(),cR:new THREE.Vector3(),cU:new THREE.Vector3(),ring:null};
{ // L'ONDE D'ALLUMAGE : un anneau de choc peint (liseré franc + lueur intérieure), posé à la tuyère DANS le plan perpendiculaire à la
  // caisse — il s'ouvre et recule en 0,4 s. ⚠ MÊMES paramètres de programme que la plume (`jetShellM` : carte, sans brouillard, double
  // face) : three r128 réutilise son programme, il n'en compile AUCUN de plus (vérifié au grand tour).
  const s=128,cv=document.createElement('canvas');cv.width=cv.height=s;const c=cv.getContext('2d');
  const g=c.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.05)');g.addColorStop(.78,'rgba(255,255,255,.32)');
  g.addColorStop(.9,'rgba(255,255,255,1)');g.addColorStop(.95,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=g;c.fillRect(0,0,s,s);
  NFX.ring=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),color:0xff7a24,transparent:true,
    opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,side:THREE.DoubleSide,fog:false})); // (2026-09-28) sans test de profondeur : la route coupait l'onde en FER À CHEVAL
  NFX.ring.visible=false;NFX.ring.frustumCulled=false;NFX.ring.renderOrder=3;scene.add(NFX.ring);
}
