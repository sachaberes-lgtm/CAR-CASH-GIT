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
    case '$':return LANG==='fr'?m2Nb(v)+' / '+m2Nb(t)+' '+CUR():CUR()+m2Nb(v)+' / '+CUR()+m2Nb(t); /* (2026-11-07, finition) en anglais le symbole passe devant, comme fmtSolde partout ailleurs */case 'aura':return fmtAura(v)+' / '+fmtAura(t);case 'mn':return m2Mn(v)+' / '+m2Mn(t);
    case 'b':return v>=t?TR('FAIT'):TR('PAS ENCORE');}
  return m2Nb(v)+' / '+m2Nb(t);}
function m2RecNom(m){const r=m.r||{};if(r.cash)return '+'+fmtC(r.cash);if(r.car)return TR(r.car);
  if(r.cat){const d=(COSM[r.cat]||[]).find(function(x){return x.id===r.id;});return d?TR(d.n):'';}return TR('RÉCOMPENSE À VENIR');}
function m2NbPret(){const s=m2Etat();let n=0;for(const id of s.ok)if(s.pr.indexOf(id)<0&&m2Pret(id))n++;return n;}
function m2SecPal(){const o=(SAVE.d.shop&&SAVE.d.shop.own)||[];let g=[];try{g=m2Etat().c.pg||[];}catch(e){}return COSM.peinture.filter(function(d){return d.def&&g.indexOf(d.id)>=0&&o.indexOf('peinture:'+d.id)>=0;});} /* (2026-11-05, le nuancier v3) les peintures GAGNÉES par leur défi (m2.c.pg ; achetées, elles n'y sont pas) */ // les couleurs secrètes TROUVÉES (le pack n'en fait pas des missions… mais on ne sait pas d'où elles viennent : elles comptent)
function m2Compte(){const s=m2Etat(),p=m2SecPal().length;let vis=0,sec=0,ok=0;for(const m of M2){if(!m2Dispo(m))continue;const r=s.ok.indexOf(m.id)>=0;if(r)ok++;if(m.f!=='secret')vis++;else if(r)sec++;}
  return {ok:ok+p,tot:vis+sec+p};} // (2026-10-19) ok : les réussies qu'on VOIT (une cachée par m2Dispo ne compte ni en haut ni en bas)
/* les lignes, triées : 0 à récupérer · 1 suivies · 2 les autres, PAR FAMILLE (M2_ORDRE), la plus avancée d'abord · 9 terminées
   (2026-10-17, Sacha : « les exploits en haut, pas les COLLECTE ») — avant, le reste se triait à l'avancement seul : les COLLECTE (déjà à
   1 / 3 avec la caisse du départ) passaient au-dessus des exploits à 0, et un nouveau joueur ne voyait d'abord que des « COLLECTE ». */
const M2_ORDRE={exploit:0,aura:1,moteur:2,exploration:3,secret:4,argent:5,collection:6}; // ce qui se joue en course d'abord, ce qui s'accumule ensuite
function m2Lignes(){const s=m2Etat(),L=[],fo=function(x){const o=M2_ORDRE[x.m.f];return o==null?9:o;};
  for(const m of M2){const ok=s.ok.indexOf(m.id)>=0;if((m.f==='secret'&&!ok)||!m2Dispo(m)||(s.mq&&s.mq.indexOf(m.id)>=0))continue;let v=0;try{v=m2Val(m);}catch(e){}
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
    +'<div class="glTx"><b><i class="m2Sec">'+TR('PEINTURE')+'</i> '+sansAcc(TR(d.ind||'')).toUpperCase()+'</b><small>'+TR('RÉUSSIE')+'</small></div>'
    +'<div class="m2R voir">'+objFig({cat:'peinture',i:j})+'</div></div>';}
/* (2026-10-22, Sacha : « enlève le défi du jour, enlève toutes les catégories en haut, c'est trop compliqué : plus simple, plus beau, chaque bouton mieux placé »)
   Deux colonnes, rien d'autre. À GAUCHE (.glB) : la carte de la SÉRIE de sept jours (sous le titre et le compte, RETOUR en bas).
   À DROITE (.glA) : UNE liste, triée — À RÉCUPÉRER (elles brillent), SUIVIES (filet or, 3 au plus), puis les autres, les exploits d'abord —
   au-dessus de JOUER. Les titres de groupe n'apparaissent que s'il y a plusieurs groupes. Plus de défi du jour, plus de filtres de famille. */
Object.assign(I18N,{'SUIVIES':'TRACKED'});
const M2_GROUPES=[[0,'À RÉCUPÉRER','vert','cadeau'],[1,'SUIVIES','or','cible'],[2,'MISSIONS','','']];
/* ===== L'ÉCRAN MISSIONS — REFONTE (2026-11-03, Sacha, après la piste B : « horrible, refonte totale, mets-toi dans la peau d'un designer senior ») =====
   UNE page à elle, plein écran, au lieu d'un panneau posé sur le garage : le décor s'efface sous un voile d'encre, l'ancien en-tête cyan et le panneau bleu partent.
   La hiérarchie : 1. LE PORTAIL — la mission vedette, gros : un canon (graduations, rayures qui tournent lentement) dont l'anneau vert se remplit, la récompense au fond ;
   2. son intitulé, son avancement ; 3. ENSUITE — trois blocs dans le panneau du garage ; 4. le palier suivant, caviardé.
   (même jour, Sacha : « ça colle pas assez avec la DA du reste ») habillée avec les matières de l'INVENTAIRE (voir le CSS « DANS LA DA DU GARAGE ») et la police unique.
   (2026-11-06, Sacha : « pas de palier pour les missions, on doit voir toutes les missions dans l'écran mission en défilant ») PLUS DE PALIERS : la table M2_PAL, le palier courant,
   l'en-tête ENSUITE, le palier suivant caviardé et le tampon « NOUVEAU PALIER » sont retirés. L'onglet montre TOUTES les missions, qu'on défile : celles à récupérer d'abord, puis une
   section par FAMILLE (exploits · aura · moteur · exploration · argent · collection), la plus avancée d'abord ; les réussies restent repliées tout en bas. */
Object.assign(I18N,{'ENSUITE':'NEXT UP','MISSION':'MISSION','MISSIONS RÉUSSIES':'MISSIONS DONE','RÉCUPÉRER':'CLAIM','VOITURE':'CAR','TRAÎNÉE':'TRAIL',
  'PEINTURE':'PAINT','FIGURE':'TRICK','TOUTES LES MISSIONS SONT RÉUSSIES':'EVERY MISSION IS DONE','RÉCOMPENSE':'REWARD',
  'EXPLOITS':'FEATS','EXPLORATION':'EXPLORATION','ARGENT':'MONEY','COLLECTION':'COLLECTION'});
const M2_FAM_NOM={exploit:'EXPLOITS',aura:'AURA',moteur:'MOTEUR',exploration:'EXPLORATION',secret:'SECRÈTES',argent:'ARGENT',collection:'COLLECTION'};
const MC_CAT={aile:'AILES',trainee:'TRAÎNÉE',peinture:'PEINTURE',figure:'FIGURE'};
function mcRec(m){ // ce que rapporte la mission : {k : 'car'|'cash'|'hab'|'vide', c : la couleur, et (car) i · (cash) v · (hab) rar, cat}
  const r=m.r||{};
  if(r.car){const i=m2CarIdx(r.car);const ri=rarInfo(i>=0?carRar(i):'');return {k:'car',i:i,c:ri.c,rar:ri.n1};}
  if(r.cash)return {k:'cash',v:r.cash,c:''};
  if(r.cat){const d=(COSM[r.cat]||[]).find(function(x){return x.id===r.id;});const ri=rarInfo(d&&d.r);return {k:'hab',c:ri.c,rar:ri.n1,cat:MC_CAT[r.cat]||''};}
  return {k:'vide',c:''};}
function mcSil(i,rev,duo){const ph=i>=0&&PHOTO.cache[i],a=ph?' src="'+ph+'"':i>=0&&!carRetiree(i)?' data-ph="'+i+'"':''; /* duo : la photo en couleur DESSOUS, la silhouette noire dessus — RÉCUPÈRE la fait fondre (voir m2Clic) */
  return '<i class="mcSil'+(rev?' rev':'')+(duo?' duo':'')+'">'+(duo?'<img class="c" alt=""'+a+'>':'')+'<img class="n" alt=""'+a+'>'+(duo?'<s class="mcBal"></s>':'')+'</i>';}
function mcVu(x,s){const vu=s.vu[x.m.id];return [Math.min(x.p,vu!=null?vu:x.p),x.p];}
let MC_CANON='';
function mcCanon(){ // le dessin du canon (graduations, rayures) : calculé une fois
  if(MC_CANON)return MC_CANON;let tk='',rf='';const P=function(r,a){return (100+r*Math.cos(a)).toFixed(1)+' '+(100+r*Math.sin(a)).toFixed(1);};
  for(let i=0;i<60;i++){const a=i*Math.PI/30,l=i%5?94:90;tk+='M'+P(98,a)+'L'+P(l,a);}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;rf+='M'+P(79,a)+'Q'+P(62,a+.42)+' '+P(36,a+.95);}
  MC_CANON='<path class="tk" d="'+tk+'"/><circle class="fd" cx="100" cy="100" r="80"/><circle class="gl" cx="100" cy="100" r="80"/>'
    +'<g class="rf0"><g class="rf"><path d="'+rf+'"/><circle cx="100" cy="100" r="35"/></g></g>';
  return MC_CANON;}
function mcVedette(x,s,arme){const m=x.m,pret=x.rg===0,R=mcRec(m),w=mcVu(x,s),C=2*Math.PI*88,pg=R.k==='hab'?R.c:'';if(arme)w[0]=0; /* arme : on arrive sur la page, l'anneau se charge depuis zéro */
  let fond;
  if(R.k==='car')fond=mcSil(R.i,false,pret&&m2Pret(m.id));
  else if(R.k==='cash')fond='<b class="mcSom"><small>€</small>'+m2Nb(R.v)+'</b>';
  else if(R.k==='hab')fond='<b class="mcRar">'+sansAcc(TR(R.rar))+'</b>';
  else fond='<b class="mcSom">?</b>';
  const lab=R.k==='car'?TR('VOITURE')+' · '+TR(R.rar):R.k==='hab'?TR(R.cat)+' · '+TR(R.rar):''; /* l'argent se lit tout seul au fond du portail */
  return '<div class="mcV'+(pret?' pret':'')+'" data-m2="'+m.id+'" role="button" tabindex="0"'+(pg?' style="--pg:'+pg+'"':'')+'>'
    +'<div class="mcPo"><svg viewBox="0 0 200 200" aria-hidden="true">'+mcCanon()
    +'<circle class="tr" cx="100" cy="100" r="88"/><circle class="pr" cx="100" cy="100" r="88" style="stroke-dasharray:'+C.toFixed(1)+';stroke-dashoffset:'+(C*(1-w[0])).toFixed(1)+'" data-o="'+(C*(1-w[1])).toFixed(1)+'"/>'
    +(w[1]>0&&!pret?'<g class="hd" style="transform:rotate('+(360*w[0]).toFixed(1)+'deg)" data-r="'+(360*w[1]).toFixed(1)+'"><circle cx="100" cy="12" r="5"/></g>':'')+'</svg>'
    +'<div class="mcFond mbR'+(m2CarVoir(m)&&!pret?' voir':'')+'" aria-label="'+sansAcc(m2RecNom(m)).replace(/"/g,'')+'">'+fond+'</div></div>'
    +'<div class="mcVt">'+(lab?'<small class="mcLab"'+(R.c?' style="color:'+R.c+'"':'')+'>'+sansAcc(lab)+'</small>':'')
    +'<b class="mcTit">'+(m.f==='secret'?sansAcc(TR('SECRÈTE'))+' · ':'')+sansAcc(m2Txt(m))+'</b>'
    +(pret?(m2Pret(m.id)?'<span class="m2Pr" aria-hidden="true"><span>'+pxi('cadeau')+' '+TR('RÉCUPÈRE')+'</span></span>':'<small class="mcAtt">'+sansAcc(TR('BIENTÔT AU GARAGE'))+'</small>')
      :'<span class="mcAv">'+sansAcc(m2Prog(m,x.v,x.t))+'</span>')+'</div></div>';}
function mcLigne(x,k,s){const m=x.m,pret=x.rg===0,ok=x.ok&&!pret,R=mcRec(m),w=mcVu(x,s),hab=R.k==='hab';
  let rec;
  if(R.k==='car')rec=mcSil(R.i,ok,pret&&m2Pret(m.id));
  else if(R.k==='cash')rec='<b class="mcCash">'+fmtC(R.v)+'</b>';
  else if(hab)rec='<b class="mcRarS">'+sansAcc(TR(R.rar))+'</b>';
  else rec='';
  let bas;
  if(pret)bas=m2Pret(m.id)?'<span class="m2Pr" aria-hidden="true"><span>'+pxi('cadeau')+' '+TR('RÉCUPÈRE')+'</span></span>':'<small class="mcAtt">'+sansAcc(TR('BIENTÔT AU GARAGE'))+'</small>';
  else if(ok)bas='<small class="mcFait">'+sansAcc(TR('RÉUSSIE'))+'</small>';
  else bas='<div class="mcJ"><u><i style="width:'+Math.round(100*w[0])+'%" data-w="'+Math.round(100*w[1])+'"></i></u><small>'+sansAcc(m2Prog(m,x.v,x.t))+'</small></div>';
  return '<div class="mcL'+(pret?' pret':'')+(ok?' ok':'')+(hab?' hab':'')+'" data-m2="'+m.id+'" role="button" tabindex="0" style="--i:'+Math.min(k,12)+(hab?';--rc:'+R.c:'')+'">'
    +'<div class="mcLt"><b>'+(m.f==='secret'?sansAcc(TR('SECRÈTE'))+' · ':'')+sansAcc(m2Txt(m))+'</b><span class="mbR'+(m2CarVoir(m)&&!pret?' voir':'')+'">'+rec+'</span></div>'+bas+'</div>';}
function mcLignePal(d){return '<div class="mcL ok" data-pal="'+d.id+'"><div class="mcLt"><b>'+sansAcc(TR(d.ind||'')).toUpperCase()+'</b><span class="mbR voir">'+objFig({cat:'peinture',i:COSM.peinture.indexOf(d)})+'</span></div><small class="mcFait">'+sansAcc(TR('SECRÈTE'))+' · '+sansAcc(TR('RÉUSSIE'))+'</small></div>';}
function mcEntete(ic,nom,cpt,cl){return '<div class="gModeT mcSec'+(cl?' '+cl:'')+'">'+pxi(ic)+'<span>'+sansAcc(TR(nom))+'</span><s></s><b>'+cpt+'</b></div>';}
function m2Vue(L,s,vu){ // → {ved : la vedette (l'écran de mort seulement, depuis le 2026-11-05) · listeTab : TOUTES les missions de l'onglet MISSIONS, en sections · n : missions à l'écran}
  const prets=L.filter(function(x){return x.rg===0;}),reste=L.filter(function(x){return x.rg===1||x.rg===2;});
  const fo=function(x){const o=M2_ORDRE[x.m.f];return o==null?9:o;};
  reste.sort(function(a,b){return fo(a)-fo(b)||b.p-a.p||M2.indexOf(a.m)-M2.indexOf(b.m);}); // par famille, la plus avancée d'abord
  /* la vedette (l'écran de mort) : une récompense à récupérer, sinon la caisse à gagner la plus avancée, sinon la mission la plus avancée */
  let ved=prets[0];
  if(!ved){let b=-1;for(const x of reste)if(x.m.r&&x.m.r.car&&x.p>b){b=x.p;ved=x;}}
  if(!ved)for(const x of reste)if(!ved||x.p>ved.p)ved=x;
  let listeTab='',k=0;
  if(prets.length){listeTab+=mcEntete('cadeau','À RÉCUPÉRER',prets.length,'mcRec9');for(const x of prets)listeTab+=mcLigne(x,k++,s);}
  let fam='';
  for(const x of reste){const f=x.m.f;
    if(f!==fam){fam=f;let tot=0,ok=0;for(const m of M2){if(m.f!==f||!m2Dispo(m))continue;tot++;if(s.ok.indexOf(m.id)>=0)ok++;}
      listeTab+=mcEntete((M2_FAM[f]||M2_FAM.exploit).ic,M2_FAM_NOM[f]||'MISSIONS',ok+' / '+tot);}
    listeTab+=mcLigne(x,k++,s);}
  return {ved:ved?mcVedette(ved,s,!vu):'<div class="mcVide">'+sansAcc(TR('TOUTES LES MISSIONS SONT RÉUSSIES'))+'</div>',listeTab:listeTab,n:prets.length+reste.length,vedM:ved?ved.m:null};}
function m2Render(vu){ /* (2026-11-03, refonte · 2026-11-05, plus de vedette : voir « L'ÉCRAN DES MISSIONS À LA MORT », aujourdhui.js) la page MISSIONS entière */
  if(PASS_ON&&typeof gEl!=='undefined'&&gEl&&gEl.classList.contains('missions'))return pvRender(vu); /* (2026-11-07) le pass : toute remise à jour de l'écran MISSIONS passe par LE VISEUR */
  const el=$('gmNoeuds'),sv=$('gmFils');if(!el)return;if(sv)sv.innerHTML='';
  const old=$('gmListe'),d0=old&&old.querySelector('.mcDef'),sc0=d0?d0.scrollTop:0,s0=old&&old.querySelector('.mcPan'),sc1=s0?s0.scrollTop:0;
  const s=m2Etat(),L=m2Lignes(),pal=m2SecPal(),V=m2Vue(L,s,vu);
  const fin=L.filter(function(x){return x.rg===9;}),nf=fin.length+pal.length;
  let fh='';
  if(nf){fh+='<div class="m2Fin mcFin'+(M2E.fin?' on':'')+'" role="button" tabindex="0" aria-expanded="'+M2E.fin+'"><span>'+sansAcc(TR('MISSIONS RÉUSSIES'))+'</span><b>'+nf+'</b>'+pxi(M2E.fin?'haut':'bas')+'</div>';
    if(M2E.fin){fh+='<div class="mcFinL">';fin.forEach(function(x,j){fh+=mcLigne(x,j,s);});pal.forEach(function(d){fh+=mcLignePal(d);});fh+='</div>';}}
  const gm=$('gMis');if(gm)gm.classList.add('mbOn');
  const c0=m2Compte();
  el.innerHTML='<div id="gmListe" class="m2 mcE'+(vu?' vu':'')+'"><div class="mcVoile"></div>'
    +'<div class="mcDef"><div class="mcTete"><b class="mcNom">'+sansAcc(TR('MISSIONS'))+'</b><small class="mcSous">'+c0.ok+' / '+c0.tot+' '+sansAcc(TR('MISSIONS RÉUSSIES'))+'</small></div>'
    +'<div class="mcPan" data-n="'+V.n+'">'+(V.n?V.listeTab:'<div class="mcVide">'+sansAcc(TR('TOUTES LES MISSIONS SONT RÉUSSIES'))+'</div>')+fh+'</div></div></div>';
  GMIS.cards=[];GMIS.pts=[];GMIS.paths=[];GMIS.last=null;GMIS.lw=0;
  const c=m2Compte(),sous=$('gmSous');if(sous)sous.textContent=c.ok+' / '+c.tot;
  try{gmPlaceL(VP.w,VP.h);}catch(e){}
  const nl=$('gmListe');if(nl){const d1=nl.querySelector('.mcDef'),s1=nl.querySelector('.mcPan');if(d1)d1.scrollTop=sc0;if(s1)s1.scrollTop=sc1;}
  if(typeof GAR!=='undefined'&&GAR.aMisId){const id9=GAR.aMisId;GAR.aMisId=null;setTimeout(function(){const r9=document.querySelector('#gmListe [data-m2="'+id9+'"]');if(r9){try{r9.scrollIntoView({block:'center'});}catch(e){}r9.classList.add('flash');}},REDUCED_MOTION?0:380);} // VOIR LA MISSION hors du garage
  {const ph=function(im){const i=+im.getAttribute('data-ph');photoFile(i,function(u){if(u&&im.isConnected)im.src=u;});}, ims=el.querySelectorAll('img[data-ph]'); /* (2026-11-06) toutes les missions à l'écran : les photos de caisses se prennent quand leur ligne apparaît */
   if(typeof IntersectionObserver==='function'){const io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);ph(e.target);}});},{root:el.querySelector('.mcPan'),rootMargin:'160px 0px'});ims.forEach(function(im){io.observe(im);});}
   else ims.forEach(ph);}
  const ems=el.querySelectorAll('.mcJ i[data-w]'),rgs=el.querySelectorAll('.mcPo .pr[data-o]'),hds=el.querySelectorAll('.mcPo .hd[data-r]'),go=function(){ems.forEach(function(e){e.style.width=e.getAttribute('data-w')+'%';});rgs.forEach(function(e){e.style.strokeDashoffset=e.getAttribute('data-o');});hds.forEach(function(e){e.style.transform='rotate('+e.getAttribute('data-r')+'deg)';});};
  if(REDUCED_MOTION||vu)go();else setTimeout(function(){requestAnimationFrame(go);},520);
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
/* ===== RÉCUPÉRER EN SPAMMANT (2026-11-06, Sacha : « quand on réussit une mission elle doit avoir une animation cool et se remplacer vite, genre on peut
   récupérer toutes les récompenses en spammant ») =====
   Avant : un toucher sur une ligne verte = le geste complet (pop, toast, 560 ms, PUIS toute la liste reconstruite) ; la ligne restait là et un 2e toucher
   donnait le son du refus ; la caisse en silhouette attendait même 1,4 s. Maintenant, dans l'écran MISSIONS (lignes .mcL) :
   · la récompense est versée AU TOUCHER (m2Prend), sans attente ;
   · la ligne FLASHE, un reflet la balaie, elle s'envole à droite et son hauteur se replie en ~0,35 s (.vite) — la suivante MONTE sous le doigt ;
   · le gain (« +1 500 € », le nom de la caisse) s'élève depuis la ligne ; l'éclat de pixels part de la ligne ; le compteur d'argent défile ;
   · une SÉRIE : chaque toucher en moins d'1,5 s allonge « ×N » (et son cumul d'euros) et monte la note d'un cran (gamme pentatonique) ;
   · un toucher sur une ligne qui s'envole encore prend la PROCHAINE ligne verte (aucun toucher n'est perdu) ;
   · la liste n'est reconstruite qu'une fois, 0,9 s après le dernier toucher (les réussies passent au pli « MISSIONS RÉUSSIES »).
   Une SECRÈTE à caisse garde sa révélation (le moment fort, jamais sautée par la série). `?recup=ancien` = l'ancien geste. */
const M2VITE=!/[?&]recup=ancien\b/.test(location.search);
const M2V={n:0,t:0,cash:0,rend:0,cb:0,g:[0,2,4,7,9,12,14,16,19,21,24]};
/* (2026-11-07, chasse) la clé SÉRIE garde STREAK (mute-cadeau.js) : COMBO écrasait la série de jours de l'écran de fin */
function m2VitePret(row){ /* la ligne verte qui suit (sinon la première) : jamais une secrète à révélation, qui se touche exprès */
  const sec=m2RevFile(),L=[].slice.call(document.querySelectorAll('#gmListe .mcL.pret:not(.vite)')).filter(function(e){return sec.indexOf(e.getAttribute('data-m2'))<0;});
  if(!L.length)return null;
  const p=row&&L.find(function(e){return !!(row.compareDocumentPosition(e)&4);});
  return p||L[0];}
function m2ViteEnTete(){ /* l'en-tête « À RÉCUPÉRER n » : le compte baisse, il s'efface à zéro */
  const h=document.querySelector('#gmListe .mcRec9');if(!h)return;
  const n=document.querySelectorAll('#gmListe .mcL.pret:not(.vite)').length,b=h.querySelector('b');
  if(b)b.textContent=n;if(!n)h.classList.add('vide');}
function m2ViteGain(row,o){ /* le gain qui s'élève depuis la ligne */
  const r=row.getBoundingClientRect();let h,c='';
  if(o.car!=null)h=pxi('voiture')+' '+sansAcc(TR(CARS[o.car].name));
  else if(o.cat){const d=(COSM[o.cat]||[]).find(function(x){return x.id===o.hab;});h=pxi('coche')+' '+sansAcc(TR(d?d.n:'')) ;c=' hab';}
  else h='+'+fmtC(o.cash);
  const g=document.createElement('div');g.className='m2Gain'+(o.car!=null?' car':c);g.innerHTML=h;
  g.style.left=Math.round(r.left+r.width*.5)+'px';g.style.top=Math.round(r.top+r.height*.5)+'px';
  document.body.appendChild(g);setTimeout(function(){g.remove();},900);}
function m2ViteSerie(o){ /* la pastille ×N de la série */
  if(M2V.n<2)return;let e=document.getElementById('m2Combo');
  if(!e){e=document.createElement('div');e.id='m2Combo';e.setAttribute('aria-hidden','true');document.body.appendChild(e);}
  e.innerHTML='<small>'+sansAcc(TR('SÉRIE'))+'</small><b>×'+M2V.n+'</b>'+(M2V.cash?'<em>+'+fmtC(M2V.cash)+'</em>':'');
  e.classList.remove('pop');void e.offsetWidth;e.classList.add('on','pop');
  clearTimeout(M2V.cb);M2V.cb=setTimeout(function(){e.classList.remove('on');},1500);}
function m2RecupVite(id,row){
  if(!m2Pret(id)){m2Recupere(id,row);return;} /* « bientôt au garage » : le geste d'avant (secousse, toast) */
  const o=m2Prend(id);if(!o){uiClic('refus');return;}
  const now=performance.now();M2V.n=now-M2V.t<1500?M2V.n+1:1;M2V.t=now;M2V.cash=(M2V.n===1?0:M2V.cash)+(o.cash||0);
  const st=M2V.g[Math.min(M2V.n-1,M2V.g.length-1)];
  try{if(SONV2){sfx(o.cash?'ui.achat':'ui.debloque',{st:st});if(M2V.n===1&&!REDUCED_MOTION)sfx('ui.tampon',{t:.2,vol:-4});if(M2V.n%5===0)sfx('ui.mission');}else uiClic('ok');}catch(e){}
  hap(M2V.n>2?[10]:[12,30,18]);
  if(o.car!=null)try{carSnapshot();}catch(e){}
  try{gBankPaint();}catch(e){}try{m2Portes();}catch(e){}
  row.classList.add('vite');if(row.querySelector('.mcSil.duo'))row.classList.add('revele'); /* la caisse sort du noir pendant que la ligne part */
  if(REDUCED_MOTION){row.remove();m2ViteEnTete();}
  else{row.style.setProperty('--h',row.offsetHeight+'px');
    try{pixBurst(row.querySelector('.m2Pr')||row,12);pixBurst(row.querySelector('.mbR')||row,10);}catch(e){}
    m2ViteGain(row,o);m2ViteSerie(o);
    setTimeout(function(){row.remove();m2ViteEnTete();},360);
    m2ViteEnTete();}
  clearTimeout(M2V.rend);M2V.rend=setTimeout(function(){if(garageOn&&gEl&&gEl.classList.contains('missions')&&!document.querySelector('#gmListe .mcL.vite'))m2Render(true);else m2Portes();},900);}
function m2Clic(e){const t=e.target;if(!t||!t.closest)return;
  if(t.closest('.mcBack')){uiClic('retour');garMisRetour();return;} /* (2026-11-03, refonte) le ◀ de la page */
  const fin=t.closest('.m2Fin');if(fin){M2E.fin=!M2E.fin;uiClic(M2E.fin?'on':'off');hap(8);m2Render(true);
    if(M2E.fin){const f2=document.querySelector('#gmListe .m2Fin');if(f2&&f2.scrollIntoView)try{f2.scrollIntoView({block:'start',behavior:REDUCED_MOTION?'auto':'smooth'});}catch(x){}}return;}
  const pal=t.closest('[data-pal]');if(pal){const j=COSM.peinture.findIndex(function(d){return d.id===pal.getAttribute('data-pal');});if(j<0)return;uiClic('nav');
    ecranWipe(function(){garMode('boutique');shopTab('peinture');shopShow('peinture',j);});return;}
  let row=t.closest('.m2L,.mcL,.mcV');if(!row)return;
  if(row.classList.contains('vite')){row=m2VitePret(row);if(!row)return;} /* (2026-11-06) un toucher sur la ligne qui s'envole prend la suivante : aucun toucher perdu */
  const id=row.getAttribute('data-m2'),m=m2Def(id);if(!m)return;const s=m2Etat();
  if(row.classList.contains('pret')){if(m.f==='secret'&&m2Revele(id))return;
    if(row.classList.contains('revele'))return; /* (2026-11-03) la révélation est en cours */
    if(M2VITE&&row.classList.contains('mcL')){m2RecupVite(id,row);return;} /* (2026-11-06) la récupération en série, voir plus haut */
    if(row.querySelector('.mcSil.duo')&&m2Pret(id)){row.classList.add('revele');try{if(SONV2)sfx('ui.debloque');}catch(x){}hap([20,60,20,60,60]); /* la caisse sort du noir, PUIS elle est à toi */
      setTimeout(function(){if(row.isConnected)m2Recupere(id,row);},REDUCED_MOTION?0:1400);return;}
    m2Recupere(id,row);return;} // une SECRÈTE qui brille : sa révélation · (2026-10-31) AVANT la photo : sur une ligne prête, la photo récupère aussi (voir m2PrendIci)
  if(t.closest('.m2R.voir,.mbR.voir')&&!t.closest('.m2Pr')){m2Voir(m);return;}
  if(s.ok.indexOf(id)>=0){ /* (2026-11-01, Sacha : « quand on clique sur une mission achevée, elle se supprime automatiquement » ) */
    /* ===== RETIRER UNE MISSION SE CONFIRME (2026-11-05, Opus : jury INT-05) =====
       Un toucher par erreur effaçait la mission réussie pour toujours. Le 1er toucher ARME (la ligne se marque, « TOUCHE ENCORE POUR RETIRER »),
       un 2e toucher sur la MÊME ligne dans les 3 s la retire, comme avant. `?retire=ancien` : un seul toucher. */
    if(!/[?&]retire=ancien\b/.test(location.search)&&(M2E.arme!==id||performance.now()-(M2E.armeT||0)>3000)){
      M2E.arme=id;M2E.armeT=performance.now();document.querySelectorAll('#gmListe .m2L.m2Arme').forEach(function(e9){e9.classList.remove('m2Arme');});
      row.classList.add('m2Arme');try{toast(sansAcc(TR('TOUCHE ENCORE POUR RETIRER')));}catch(x){}uiClic('');hap(6);return;}
    M2E.arme=null;
    if(!s.mq)s.mq=[];if(s.mq.indexOf(id)<0)s.mq.push(id);SAVE.flush();uiClic('off');hap(10);m2Render(true);return;}
  /* (2026-11-05, Opus : jury INT-05) une mission EN COURS ne se suit plus, mais son toucher n'est pas une faute : plus le son du refus, un toucher neutre */
  uiClic('');hap(4);}
Object.assign(I18N,{'TOUCHE ENCORE POUR RETIRER':'TAP AGAIN TO REMOVE'});
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
Object.assign(I18N,{'AUCUNE MISSION AVANCÉE':'NO MISSION PROGRESS'});
/* d'où part la mission au début de cette partie : les missions « d'une partie » (aura, figures, vitesse…) partent de 0, le moteur de 1, les autres
   du cliché pris au départ (M2R.v0, defis-moteur.js) ; null = on ne sait pas (partie trop courte, cliché pas encore pris) */
function m2Avant(m){const k=m.k;if(k==='eng')return 1;if(/^(aura|parf|fig|vie|frenT|kmh|tours|airP)$/.test(k))return 0;const V=M2R.v0;return V&&(m.id in V)?V[m.id]:null;}
/* (2026-11-06, Sacha : « enlève les écrans à la mort qui annoncent qu'on a réussi une mission qui rapporte de l'argent, fait que pour les voitures ») à la mort,
   seule une mission qui donne une VOITURE s'annonce réussie (carte de mort, toast) ; celles qui rapportent de l'argent ou un habillage se récupèrent
   dans l'écran MISSIONS, sans rien dire. ?sans=annoncemort = l'ancien comportement. */
const M2MORT_TOUT=/[?&]sans=([^&]*,)?annoncemort(,|&|$)/.test(location.search);
function m2AnnonceMort(m){return M2MORT_TOUT||!!(m&&m.r&&m.r.car);}
function objRenderV2(el){const flot9=!/[?&]mort=ancien\b/.test(location.search); /* l'écran de mort v6 (MORT_FLOT vit dans la coque, hors de portée ici) */
  const s=m2Etat(),L=[];
  for(const id of M2R.run){const m=m2Def(id);if(m&&m2Dispo(m)&&m2AnnonceMort(m)&&L.length<2&&!L.some(function(x){return x.m===m;}))L.push({m:m,ok:1});}
  if(!flot9)for(const id of (PASS_ON?passOrdre():s.su)){const m=m2Def(id);if(!m||!m2Dispo(m)||L.length>=3||L.some(function(x){return x.m===m;}))continue;L.push({m:m,ok:s.ok.indexOf(id)>=0?1:0});}
  /* (2026-11-03, Sacha : « améliorer encore un peu », puis « mission il prend trop de place ») le panneau ne reste plus à moitié vide :
     il se complète avec les missions les plus proches du but (avec leur barre), jusqu'à 2 (couché, le ×2 prend sa place sous le panneau) */
  if(!flot9){const cible=2,C=[];
    if(L.length<cible)for(const m of M2){if(m.f==='secret'||m.f==='collection'||s.ok.indexOf(m.id)>=0||!m2Dispo(m)||L.some(function(x){return x.m===m;}))continue;
      let v=0;try{v=m2Val(m);}catch(x){}const p=m2Frac(m,v,m2Seuil(m));if(p<1)C.push({m:m,p:p});}
    C.sort(function(a,b){return b.p-a.p;});for(const c of C){if(L.length>=cible)break;L.push({m:c.m,ok:0});}}
  if(flot9){ /* (2026-11-05) SEULEMENT CE QUI A AVANCÉ : les réussies de la partie (déjà dans L), puis celles dont la valeur a monté, la plus grosse avance d'abord */
    const A=[];for(const m of M2){if(m.f==='secret'||m.f==='collection'||s.ok.indexOf(m.id)>=0||!m2Dispo(m)||L.some(function(x){return x.m===m;}))continue;
      const a=m2Avant(m);if(a==null)continue;let v=0;try{v=m2ValCourse(m);}catch(x){continue;}const t=m2Seuil(m);
      if(!(v>a+1e-9)||!(t>0))continue;const p1=m2Frac(m,v,t);if(p1>=1)continue;A.push({m:m,a:a,v:v,t:t,d:p1-m2Frac(m,a,t)});}
    A.sort(function(x,y){return y.d-x.d;});for(const c of A){if(L.length>=2)break;L.push({m:c.m,ok:0,a:c.a,v:c.v,t:c.t});}}
  const nP=m2NbPret(),c=m2Compte();
  el.className='mObj misPorte m2Ob';el.setAttribute('data-m','mis');el.style.removeProperty('--rc');
  let h='<div class="obHd"><span>'+pxi('cible')+' '+TR('MISSIONS')+(nP?' <i class="m2Pt in"></i>':'')+'</span><b class="m2Cpt">'+c.ok+' / '+c.tot+'<i class="obVoir">'+pxi('droite')+'</i></b></div>';
  const P9=[]; /* (v6) chaque mission en cours : de quoi faire monter son compte avec sa barre */
  for(const x of L){const m=x.m;
    if(m.f==='secret')h+='<div class="obM ok sec">'+pxi('oeil')+'<span>'+sansAcc(TR('MISSION SECRÈTE TROUVÉE'))+'</span></div>';
    else if(x.ok)h+='<div class="obM ok">'+pxi('coche')+'<span>'+sansAcc(m2Txt(m))+'</span><em>'+sansAcc(m2RecNom(m))+'</em></div>';
    else{let v=x.v!=null?x.v:0;if(x.v==null)try{v=m2ValCourse(m);}catch(q){}const t=x.t!=null?x.t:m2Seuil(m);
      const ic9=pxi((M2_FAM[m.f]||M2_FAM.exploit).ic),tx9='<span>'+sansAcc(m2Txt(m))+'</span>',br9='<div class="obBar"><i style="width:'+(flot9&&x.a!=null?(100*m2Frac(m,x.a,t)).toFixed(1):0)+'%" data-w0="'+(flot9&&x.a!=null?(100*m2Frac(m,x.a,t)).toFixed(1):0)+'" data-w="'+(100*m2Frac(m,v,t)).toFixed(1)+'"></i></div>',pg9='<b>'+m2Prog(m,v,t)+'</b>';
      /* écran de mort v6 : le texte sur toute la largeur (deux lignes au besoin), la barre dessous et le compte AU BOUT de sa barre */
      if(flot9)P9.push({m:m,a:x.a!=null?x.a:0,v:v,t:t});
      h+=flot9?'<div class="obM obM6">'+ic9+tx9+br9+pg9+'</div>':'<div class="obM">'+ic9+tx9+pg9+'</div>'+br9;}}
  if(flot9&&!L.length)h+='<div class="obM obVide"><span>'+sansAcc(TR('AUCUNE MISSION AVANCÉE'))+'</span></div>';
  h+='<div class="obFt"><span>'+((PASS_ON&&passPresque())?pxi('cadeau')+' ':'')+sansAcc(TR(nP?'À RÉCUPÉRER':'TOUTES LES MISSIONS'))+'</span><span>'+TR('VOIR')+' '+pxi('droite')+'</span></div>';
  el.innerHTML=h;
  const bars=el.querySelectorAll('.obBar i');
  if(flot9){ /* (2026-11-04/05, Sacha : « des animations pour les missions », « les barres qui avancent ») écran de mort v6 : chaque barre PART de où elle
       en était au début de la partie et monte à où elle en est, son compte (« 5 / 10 → 8 / 10 ») avec elle, image par image, quand sa ligne est
       entrée (1,45 s, puis 0,2 s de plus par ligne : la vague de gauche à droite finit ici) — une seule fois par mort ; au retour (garage, réglages)
       tout est posé. La révélation d'une secrète attend que l'écran ait fini de se jouer (3 s). */
    const go=!REDUCED_MOTION&&!!TCTL.mortT&&objRenderV2._a!==TCTL.mortT;if(TCTL.mortT)objRenderV2._a=TCTL.mortT;el.classList.toggle('m6Joue',go);
    el.querySelectorAll('.obM6').forEach(function(r,j){const q=P9[j],i=r.querySelector('.obBar i'),b=r.querySelector('b');if(!q||!i||!b)return;i.style.transition='none';
      const W0=+i.getAttribute('data-w0')||0,W1=+i.getAttribute('data-w')||0,iv=Number.isInteger(q.v)&&Number.isInteger(q.a),
        pose=function(k){const e=1-Math.pow(1-k,3);i.style.width=(W0+(W1-W0)*e).toFixed(2)+'%';const x=q.a+(q.v-q.a)*e;b.innerHTML=m2Prog(q.m,iv?Math.round(x):x,q.t);};
      if(!go){pose(1);return;}pose(0);
      setTimeout(function(){const t0=performance.now();(function f(){if(!i.isConnected)return;const k=Math.min(1,(performance.now()-t0)/1000);pose(k);if(k<1)requestAnimationFrame(f);else{i.classList.add('m6Fin');}})();},1450+j*200);});
    if(go&&el.querySelector('.obM6'))setTimeout(function(){try{if(started&&gameOver&&overlay.style.display!=='none'&&el.isConnected)sfx('ui.jauge');}catch(e){}},1450);
    m2RevAuto(3000);return;}
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
    +'<span class="m2DebB"><u><em style="width:'+Math.round(p*100)+'%"></em></u><b>'+(ok?sansAcc(TR('MISSION RÉUSSIE')):m2Prog(m,v,t))+'</b></span>'
    +(sansBouton?'':'<span class="m2DebV" role="button" tabindex="0" data-m2voir="'+m.id+'">'+(m2Pret(m.id)?pxi('cadeau')+' '+sansAcc(TR('RÉCUPÈRE')):sansAcc(TR('VOIR LA MISSION'))+' '+pxi('droite'))+'</span>')+'</span>';}
function m2TxtH(m){return sansAcc(m2Txt(m)).replace(/\d[\d ]*\d/g,function(x){return '<span class="m2Nw">'+x+'</span>';});} // les nombres ne se coupent pas en fin de ligne (« 1 / 000 »)
function m2SecretHtml(){return '<span class="m2Deb sec"><span class="m2DebT">'+pxi('oeil')+' '+sansAcc(TR('MISSION SECRÈTE'))+'</span></span>';}
/* VOIR LA MISSION : l'écran MISSIONS, la mission SUIVIE (trois le sont déjà : la plus ancienne laisse sa place), sa ligne amenée en vue */
function m2VaMission(id){const m=m2Def(id);if(!m||m.f==='secret')return;
  if(m2Pret(id)){m2PrendIci(id);return;} /* (2026-10-31) réussie, pas encore prise : RÉCUPÈRE sur place (voir m2PrendIci) */
  uiClic('nav');hap(8);
  const va=function(){garMode('missions');setTimeout(function(){const r=document.querySelector('#gmListe .m2L[data-m2="'+id+'"]');if(r){try{r.scrollIntoView({block:'center'});}catch(e){}r.classList.add('flash');}},REDUCED_MOTION?0:380);};
  if(!garageOn){GAR.aMisId=id;garMissionsOuvre();return;}
  ecranWipe(function(){
    if(GBQ.on||GMODE.m==='shop')try{gGarageReplie();GBQ.on=GBQ.veut=false;GBQ.bascule=true;bqClasses(false);try{garBqAmbiance(false);bqSonCoupe(.4);}catch(e){}GBQ.lueur=0;GBQ.sec=null;SHOP.prev=null;buildCar(CARS[equippedCar()]);}catch(e){} // la boutique rangée d'un coup sous le voile (la recette de son ◀ depuis l'accueil)
    va();});}
/* ===== RÉCUPÉRER AU GARAGE (2026-10-31, Léo : « les récompenses voiture (par exemple ROUGE-GORGE) buggées, on peut pas gagner le truc, ça fait
   une loop qui renvoie du garage à la mission ») — la mission réussie, sa caisse au garage disait VOIR LA MISSION → l'écran MISSIONS ;
   là, la PHOTO de la caisse (le geste naturel) ramenait au garage (m2Voir) → VOIR LA MISSION → … sans fin, RÉCUPÈRE n'était que le petit
   bouton vert. Maintenant : au garage et à la boutique, le bouton dit RÉCUPÈRE et donne la récompense sur place ; dans MISSIONS, toute la
   ligne prête récupère, sa photo comprise. ===== */
function m2PrendIci(id){const o=m2Prend(id);if(!o){uiClic('refus');return false;}
  try{if(SONV2){sfx(o.cash?'ui.achat':'ui.debloque');if(!REDUCED_MOTION)sfx('ui.tampon',{t:.27});}else uiClic('ok');}catch(e){}
  hap([12,40,18,40,30]);
  if(o.car!=null){try{carSnapshot();}catch(e){}toast(pxi('voiture')+' '+TR(CARS[o.car].name)+' — '+TR('EST À TOI'),true);if(garageOn)try{GBQ.rk='';garageShow(o.car);}catch(e){}}
  else if(o.cat){const j=(COSM[o.cat]||[]).findIndex(function(x){return x.id===o.hab;}),d=COSM[o.cat][j];toast(pxi('coche')+' '+(d?TR(d.n):'')+' — '+TR('EST À TOI'),true);if(garageOn&&j>=0)try{GBQ.rk='';shopShow(o.cat,j);}catch(e){}}
  else toast(pxi('piece')+' +'+fmtC(o.cash)+' '+TR('VERSÉS AU COMPTE'),true);
  try{gBankPaint();}catch(e){}try{m2Portes();}catch(e){}return true;}
document.addEventListener('click',function(e){const t=e.target&&e.target.closest&&e.target.closest('[data-m2voir]');if(!t)return;e.stopPropagation();e.preventDefault();
  if(typeof GAR!=='undefined'&&(GAR.go||ecranWipe._on))return;try{uiPop(t);}catch(x){}m2VaMission(t.getAttribute('data-m2voir'));},true);
/* ===== LES MISSIONS v2 — LA RÉVÉLATION D'UNE SECRÈTE (2026-10-16, Sacha : « pour une SECRÈTE, une vraie scène de révélation : la silhouette
   noire se remplit de couleur, avec le nom de la voiture et l'intitulé de la mission enfin dévoilé. C'est le moment fort ») =====
   ===== L'AVANT-PREMIÈRE (2026-11-05, Sacha : « plus la voiture débloquée est rare, plus il doit y avoir une animation stylée ; les bandes à
   l'arrière en mode le cirque, c'est pas stylé ; beaucoup plus épique, beaucoup plus solennel ») =====
   Une avant-première dans le noir, en six temps ; plus la caisse est rare, plus la scène en joue (M2RV_PAL : commune 0 · rare 1 · épique 2 ·
   légendaire 3 · mythique 4 · infinie 5 ; M2RV_T dit ce que chaque palier ajoute). Les secrètes donnent aujourd'hui des RARES et des
   ÉPIQUES : ce sont elles qu'on voit le plus, elles ont déjà le noir, les bandes, la charge et les projecteurs ; au-dessus, ça monte :
   1. LE NOIR — l'encre tombe, « MISSION SECRÈTE » entre deux filets ; dès la rare, les bandes du cinéma se ferment (haut et bas).
   2. LA SILHOUETTE — un projecteur grésille et s'allume au-dessus de la caisse, encore NOIRE, cernée d'un liseré à la couleur de sa rareté ;
      de la poussière flotte dans le faisceau.
   3. LA CHARGE (rare et plus) — la caméra avance ; des battements de cœur (1 à 4) font flamber le liseré ; l'énergie converge vers la caisse ;
      mythique : la foudre frappe à chaque battement ; infinie : les étoiles tournent en spirale vers elle.
   4. L'ÉCLAT — commune : la couleur monte de bas en haut sous une ligne de lumière (la scène d'avant) ; au-dessus : le flash, les ondes, la
      gerbe d'étincelles, la secousse, les bandes qui se rouvrent, et derrière la caisse les PROJECTEURS d'une avant-première qui balaient
      le ciel (ils remplacent les rayons tournants « de cirque »).
   5. LE NOM — la rareté et son logo s'espacent, le NOM tombe et frappe, l'intitulé s'écrit lettre à lettre, RÉCUPÈRE.
   6. LA VIE — la caisse respire, un reflet passe sur la carrosserie ; braises (rare, plus denses à l'épique), pluie d'or et éclats
      (légendaire), cendres rouges
      et éclairs lointains (mythique), poussière d'étoiles et projecteurs arc-en-ciel (infinie).
   La lumière qui bouge vit dans UNE toile 2D (RVX, en `lighter`) ; le reste est en CSS (opacités, transformations). Toucher avant la fin =
   aller au bout ; Entrée / Espace / Échap aussi. « Réduire les animations » : tout est posé d'un coup, sans toile.
   VOIR CHAQUE RARETÉ sans rien gagner : `?revelation=legendaire` (commun · rare · epique · legendaire · mythique · infini, ou le nom d'une
   caisse) — ou dbgRevelation('mythique') à la console. RÉCUPÈRE n'y donne rien.
   LA FILE (m2RevFile) : les secrètes réussies dont la caisse n'est pas encore à toi, et déjà au garage (une retirée qui n'est pas encore
   revenue attend). Elle se joue sur l'écran de mort (1,4 s après lui), en ouvrant l'écran MISSIONS, en touchant une secrète qui brille,
   ou à la console (dbgMissions('gagne',id)). Une à la fois ; la suivante enchaîne. */
const M2REV={on:false,id:null,t:0,demo:false,tm:[],tx:'',n:0};
Object.assign(I18N,{'CONTINUER':'CONTINUE'});
const M2RV_PAL={commun:0,rare:1,exotique:1,epique:2,legendaire:3,mythique:4,infini:5};
/* par palier : ch = la charge (ms) · bat = ses battements (où, en part de la charge) · on = les ondes · ge = la gerbe · se = la secousse (px) · ph = les projecteurs */
const M2RV_T=[
  {ch:0,   bat:[],                 on:0,ge:0,  se:0, ph:0},
  {ch:1300,bat:[.4,.8],            on:1,ge:64, se:6, ph:2},
  {ch:1800,bat:[.28,.6,.86],       on:2,ge:96, se:9, ph:3},
  {ch:2200,bat:[.26,.58,.86],      on:2,ge:130,se:11,ph:4},
  {ch:2300,bat:[.24,.54,.82],      on:2,ge:150,se:14,ph:4},
  {ch:2700,bat:[.2,.43,.64,.86],   on:3,ge:170,se:14,ph:5}];
const M2RV_ARC=['#ff4d6d','#ffb03a','#ffe85e','#5ee37a','#5ec8ff','#b07dff','#ff8af0'];
function m2RevFile(){const s=m2Etat();return M2.filter(function(m){return m.f==='secret'&&!!(m.r&&m.r.car)&&s.ok.indexOf(m.id)>=0&&s.pr.indexOf(m.id)<0&&m2Pret(m.id);}).map(function(m){return m.id;});}
function m2RevAuto(delai){if(M2REV.on||!m2RevFile().length)return;clearTimeout(M2REV.t);
  M2REV.t=setTimeout(function(){if(M2REV.on||m2EnC()||m2RevVolet())return;if(m2RevAttend()){m2RevAuto(400);return;}const L=m2RevFile();if(L.length)m2Revele(L[0]);},delai||0);}
/* ===== LA RÉVÉLATION ATTEND SON TOUR (24/10, relecture : « une secrète réussie pendant la partie couvrait l'offre de seconde chance ») =====
   Ouverte 1,4 s après l'écran de fin, plein écran (z-index 95), elle passait PAR-DESSUS la plaque CONTINUER de la seconde chance, qui n'a que
   5,5 s : le joueur regardait la caisse se remplir de couleur pendant que l'offre filait. La machine FINAL SPIN attendait déjà l'offre
   (chanceAttend) ; la révélation l'attend aussi, et attend que la machine (z-index 250, par-dessus elle) soit refermée. Elle repasse toutes les 0,4 s. */
function m2RevVolet(){try{return !!(typeof ecranWipe==='function'&&ecranWipe._on);}catch(e){return false;}} /* (2026-11-03, audit) LE VOLET EST BAISSÉ = une course se prépare dessous (REJOUER → rejoueAttend, jusqu'à 12 s, pendant lesquelles started&&gameOver tient encore) : une révélation qui s'ouvrait là restait PAR-DESSUS la course lancée (plein écran, elle prend les taps — la caisse roulait sans personne). On ne révèle jamais sous le volet ; la secrète reste dans m2RevFile et se montre à la fin de partie suivante. */
function m2RevAttend(){try{return !!((typeof chanceAttend==='function'&&chanceAttend())||(typeof SPIN!=='undefined'&&SPIN.ouvert)||(typeof serieWAttend==='function'&&serieWAttend()));}catch(e){return false;}} /* (2026-11-03, Sacha) la révélation attend aussi l'écran de série (et depuis le 05/11, celui des missions) */
function m2Revele(id){const m=m2Def(id);if(!m||M2REV.on||m2EnC()||m2RevVolet())return false;const i=m2CarIdx((m.r||{}).car);if(i<0||carRetiree(i))return false;
  M2REV.demo=false;return m2RevScene(i,sansAcc(m2Txt(m)),id);}
function m2RevSon(n,o){try{if(SONV2)sfx(n,o);}catch(e){}}
function m2RevStop(){for(const t of M2REV.tm)clearTimeout(t);M2REV.tm.length=0;}
function m2RevScene(i,texte,id,rf){ /* rf : une rareté imposée (l'essai d'un palier qui n'a pas encore de caisse) */
  M2REV.on=true;M2REV.id=id;M2REV.tx=texte;m2RevStop();
  let el=document.getElementById('m2Rev');if(!el){el=document.createElement('div');el.id='m2Rev';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.appendChild(el);}
  const r=rf||carRar(i),ri=rarInfo(r),n=M2RV_PAL[r]!=null?M2RV_PAL[r]:1,P=M2RV_T[n];M2REV.n=n;
  el.style.setProperty('--rc',ri.c);el.style.setProperty('--ch',(P.ch||900)+'ms');el.setAttribute('aria-label',sansAcc(TR('MISSION SECRÈTE')));
  let ph='';for(let k=0;k<P.ph;k++)ph+='<i class="m2RvPhare" style="--k:'+k+';--pc:'+(n===5?M2RV_ARC[(k*3)%7]:'var(--rc)')+'"></i>';
  el.innerHTML='<div class="m2RvFond"></div>'
    +'<div class="m2RvCadre"><div class="m2RvBloc"><div class="m2RvHd"><span>'+pxi('oeil')+' '+sansAcc(TR('MISSION SECRÈTE'))+'</span></div>'
    +'<div class="m2RvScene"><div class="m2RvPhares">'+ph+'</div><i class="m2RvHalo"></i><i class="m2RvFaisceau"></i><i class="m2RvSol"></i>'
    +'<div class="m2RvPh"><img class="g" alt=""><img class="c" alt=""><img class="n" alt=""><i class="m2RvReflet"></i><i class="m2RvLigne"></i></div></div>'
    +'<div class="m2RvRar">'+pxi(RAR_LOGO[r]||'etoile')+'<span>'+sansAcc(TR(ri.n1))+'</span></div><div class="m2RvNom">'+sansAcc(TR(CARS[i].name))+'</div>'
    +'<div class="m2RvTx"><span></span></div>'
    +'<div class="pbtn pb-gold m2RvBt" role="button" tabindex="0"><span>'+pxi('cadeau')+' '+sansAcc(TR('RÉCUPÈRE'))+'</span></div></div>'
    +'<canvas class="m2RvCv" aria-hidden="true"></canvas></div>'
    +'<div class="m2RvBandes"></div><div class="m2RvFlash"></div>';
  el.className='p'+n;void el.offsetWidth;el.classList.add('on');
  try{const cd=el.querySelector('.m2RvCadre').getBoundingClientRect(),sc=el.querySelector('.m2RvScene').getBoundingClientRect(); /* la caisse au MILIEU de l'écran tant que son nom n'est pas là (le bloc remonte avec la rareté) */
    el.style.setProperty('--dy',Math.max(0,Math.round(cd.top+cd.height/2-(sc.top+sc.height/2)))+'px');}catch(e){}
  m2RevSon('ui.volet');hap(10);
  const imC=el.querySelector('img.c'),imN=el.querySelector('img.n'),imG=el.querySelector('img.g'),ref=el.querySelector('.m2RvReflet');
  const go=function(url){if(!M2REV.on||M2REV.id!==id)return;
    if(url){imC.src=url;imN.src=url;imG.src=url;ref.style.webkitMaskImage=ref.style.maskImage='url("'+url+'")';m2RevBoite(url,function(b){if(M2REV.on&&M2REV.id===id)joue(b);});}
    else{el.querySelector('.m2RvPh').classList.add('vide');joue(null);}};
  const joue=function(b){
    RVX.bx=b||{x0:.08,x1:.92,y0:.2,y1:.78};m2RevCadre(el);
    if(REDUCED_MOTION){el.classList.add('bout','scene','plein','eclat','rar','nom','tx','bt','vit');el.querySelector('.m2RvTx span').textContent=texte;m2RevSon(n>=3?'caisse.debloquee':'ui.debloque');return;}
    rvxDemarre(el,n);
    const T=function(f,ms){M2REV.tm.push(setTimeout(function(){if(M2REV.on&&M2REV.id===id)f();},REDUCED_MOTION?0:ms));};
    T(function(){el.classList.add('scene');RVX.pou=true;rvxMesure();},450);                                   /* le projecteur, la silhouette */
    let t=1250;
    if(n>0){
      T(function(){el.classList.add('charge');RVX.ch=P.ch/1000;RVX.chT=0;m2RevSon('triade.revele',{vol:n>=3?2:n>=2?0:-3});},t);  /* la charge */
      P.bat.forEach(function(f,k){T(function(){m2RevBat(el,k,n);},t+P.ch*f);});
      t+=P.ch;T(function(){m2RevEclat(el,n,P);},t);                                                            /* l'éclat */
      T(function(){el.classList.add('rar');},t+500);
      T(function(){m2RevNom(el,n);},t+950);
      T(function(){el.classList.add('tx');m2RevTape(el.querySelector('.m2RvTx span'),texte,id);},t+1450);
      T(function(){el.classList.add('bt','vit');},t+2150);
    }else{
      T(function(){el.classList.add('plein');m2RevSon('ui.debloque');hap([20,60,20,60,60]);},t);              /* la couleur monte */
      T(function(){el.classList.add('rar');RVX.vie=true;},t+1250);
      T(function(){m2RevNom(el,n);},t+1600);
      T(function(){el.classList.add('tx');m2RevTape(el.querySelector('.m2RvTx span'),texte,id);},t+2050);
      T(function(){el.classList.add('bt','vit');},t+2700);
    }};
  try{carPhoto(i,go);}catch(e){go(null);} /* la photo de studio (asynchrone) : la scène part quand elle est prête */
  return true;}
/* LA CAISSE DANS SA PHOTO : sa boîte (les pixels presque opaques ; le reflet du sol verni, translucide, n'y entre pas), pour poser le
   sol, le projecteur, les phares et la toile sur ELLE et pas sur le cadre — une caisse longue et basse n'a pas ses roues où en a un camion */
function m2RevBoite(url,cb){const im=new Image();let fait=false;const fin=function(b){if(!fait){fait=true;cb(b);}};
  im.onload=function(){let b=null;try{const W=144,H=88,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0,W,H);
    const d=g.getImageData(0,0,W,H).data;let x0=W,x1=-1,y0=H,y1=-1;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>200){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
    if(x1-x0>8&&y1-y0>4)b={x0:x0/W,x1:(x1+1)/W,y0:y0/H,y1:(y1+1)/H};}catch(e){}fin(b);};
  im.onerror=function(){fin(null);};setTimeout(function(){fin(null);},700);im.src=url;}
function m2RevCadre(el){const b=RVX.bx,pc=function(v){return (v*100).toFixed(1)+'%';};
  el.style.setProperty('--cx',pc((b.x0+b.x1)/2));el.style.setProperty('--cy',pc((b.y0+b.y1)/2));el.style.setProperty('--sol',pc(b.y1));el.style.setProperty('--cw',pc(b.x1-b.x0));
  try{const s=el.querySelector('.m2RvScene').getBoundingClientRect();el.style.setProperty('--fa',(Math.atan(.62*(b.x1-b.x0)*s.width/Math.max(200,innerHeight))*57.3).toFixed(1)+'deg');}catch(e){}}
function m2RevBat(el,k,n){ /* un battement de cœur : le liseré flambe, la caisse bat, la caméra frémit */
  el.classList.remove('bat');void el.offsetWidth;el.classList.add('bat');
  m2RevSon('fig.battement',{var:0,st:k*2,vol:2+k});hap(28+k*12);
  RVX.se=Math.max(RVX.se,2+k*1.5);rvxOnde(0,.55,2,.5);
  if(n===4){rvxFoudre(1+(k>0?1:0));m2RevSon('foudre.eclair',{vol:-6+k*2});el.classList.remove('eclair');void el.offsetWidth;el.classList.add('eclair');}}
function m2RevEclat(el,n,P){
  el.classList.remove('charge','bat','eclair');el.classList.add('eclat','plein');
  RVX.ch=0;rvxEclat(n,P);
  if(n===1){m2RevSon('depart.logo');m2RevSon('ui.debloque',{t:.12});}
  else if(n===2){m2RevSon('combo.sceau',{var:1});m2RevSon('caisse.debloquee',{t:.3});}
  else if(n===3){m2RevSon('depart.logo');m2RevSon('pose.divin',{t:.06});}
  else if(n===4){m2RevSon('combo.sceau',{var:2});m2RevSon('pose.divin',{t:.12});m2RevSon('foudre.eclair',{vol:-2});}
  else{m2RevSon('frenesie.entre');m2RevSon('pose.divin',{t:.3});}
  hap(n>=3?[60,40,90,50,140]:[40,40,80]);}
function m2RevNom(el,n){el.classList.add('nom');m2RevSon('ui.tampon',{vol:n>=3?3:0});hap(n>=2?40:20);
  setTimeout(function(){if(!M2REV.on)return;RVX.se=Math.max(RVX.se,n>=2?3+n:0);rvxPoussiere(el.querySelector('.m2RvNom'));},REDUCED_MOTION?0:230);}
function m2RevTape(sp,t,id){if(!sp)return;if(REDUCED_MOTION){sp.textContent=t;return;}let k=0;
  const pas=function(){if(!M2REV.on||M2REV.id!==id)return;k++;sp.textContent=t.slice(0,k);if(k%3===1)m2RevSon('ui.lettre',{vol:-8});if(k<t.length)setTimeout(pas,26);};pas();}
function m2RevBout(el){ /* toucher avant la fin : tout est posé, sans flash ni battement en retard */
  m2RevStop();el.classList.remove('charge','bat','eclair');el.classList.add('bout','scene','plein','eclat','rar','nom','tx','bt','vit');
  const sp=el.querySelector('.m2RvTx span');if(sp)sp.textContent=M2REV.tx;
  RVX.ch=0;RVX.pou=true;RVX.vie=true;RVX.P=RVX.P.filter(function(p){return p.k!=='imp'&&p.k!=='eto';});RVX.F.length=0;rvxMesure();}
function m2RevFerme(){const el=document.getElementById('m2Rev'),id=M2REV.id;if(!M2REV.on||!el)return;
  if(!el.classList.contains('bt')){m2RevBout(el);return;} /* pas fini : au bout */
  const demo=M2REV.demo;
  if(!demo){m2Prend(id);try{carSnapshot();}catch(e){}}
  try{pixBurst(el.querySelector('.m2RvBt'),12);}catch(e){}try{if(SONV2){sfx('ui.achat');if(!REDUCED_MOTION)sfx('ui.tampon',{t:.2});}else uiClic('ok');}catch(e){}hap([12,40,30]);
  m2RevStop();el.classList.add('fin');M2REV.on=false;M2REV.id=null;M2REV.demo=false;
  setTimeout(function(){if(M2REV.on)return;el.className='';el.innerHTML='';
    if(demo)return;
    try{if(garageOn&&gEl.classList.contains('missions'))m2Render(true);}catch(e){}try{m2Portes();}catch(e){}
    try{const ob=document.querySelector('.mObj.misPorte');if(ob&&started&&gameOver)objRenderV2(ob);}catch(e){}
    m2RevAuto(500);},REDUCED_MOTION?0:520);}
document.addEventListener('click',function(e){const el=document.getElementById('m2Rev');if(!el||!M2REV.on||!el.contains(e.target))return;e.stopPropagation();e.preventDefault();m2RevFerme();},true);
document.addEventListener('keydown',function(e){if(!M2REV.on)return;if(e.code==='Enter'||e.code==='Space'||e.code==='Escape'){e.preventDefault();e.stopPropagation();m2RevFerme();}},true);
/* LA TOILE DE LUMIÈRE (RVX) : une toile plein écran dans le cadre (elle tremble avec lui), en `lighter`. Ses habitants (P) : pou = la poussière
   du faisceau · imp = l'énergie qui converge (la charge) · eti = la gerbe d'étincelles · bra = les braises qui montent · or = la pluie d'or
   (légendaire ; arc-en-ciel pour l'infinie) · eto = les étoiles (infinie). O = les ondes · F = la foudre · G = les éclats sur la carrosserie.
   Le téléphone (ALLEGE) en fait moins et dessine la toile à 1,5 px par point au plus. Elle s'arrête d'elle-même quand #m2Rev se vide. */
const RVX={bx:{x0:.08,x1:.92,y0:.2,y1:.78},cv:null,cx:null,raf:0,P:[],O:[],F:[],G:[],W:0,H:0,dpr:1,x:0,y:0,w:0,h:0,n:0,t:0,ch:0,chT:0,se:0,last:0,cadre:null,ph:null,pou:false,vie:false,gT:0,fT:0,col:['#fff']};
function rvxAl(){try{return !!ALLEGE;}catch(e){return false;}}
function rvxDemarre(el,n){const R=RVX;R.P.length=0;R.O.length=0;R.F.length=0;R.G.length=0;R.n=n;R.t=0;R.ch=0;R.se=0;R.pou=false;R.vie=false;R.gT=1;R.fT=3;R.last=0;
  R.cv=el.querySelector('.m2RvCv');R.cadre=el.querySelector('.m2RvCadre');R.ph=el.querySelector('.m2RvPh');if(!R.cv||REDUCED_MOTION){R.cv=null;return;}
  R.cx=R.cv.getContext('2d');const rc=getComputedStyle(el).getPropertyValue('--rc').trim()||'#fff';
  R.col=n===5?M2RV_ARC:n===4?[rc,'#ff8a3d','#ffd0a0']:n===3?[rc,'#fff3c4','#ffb81f']:[rc,'#ffffff'];
  rvxMesure();if(n===5)rvxEtoiles();if(!R.raf)R.raf=requestAnimationFrame(rvxBoucle);}
function rvxMesure(){const R=RVX;if(!R.cv)return;const W=innerWidth,H=innerHeight,d=Math.min(window.devicePixelRatio||1,rvxAl()?1.5:2);
  if(W!==R.W||H!==R.H||d!==R.dpr){R.W=W;R.H=H;R.dpr=d;R.cv.width=Math.round(W*d);R.cv.height=Math.round(H*d);}
  const a=R.ph.getBoundingClientRect(),b=R.cadre.getBoundingClientRect(),x=R.bx;
  R.w=a.width*(x.x1-x.x0);R.h=a.height*(x.y1-x.y0);R.x=a.left-b.left+a.width*(x.x0+x.x1)/2;R.y=a.top-b.top+a.height*(x.y0+x.y1)/2;}
addEventListener('resize',function(){if(M2REV.on)rvxMesure();});
function rvxNe(o){const R=RVX;if(R.P.length<(rvxAl()?320:520))R.P.push(o);}
function rvxCoul(){const c=RVX.col;return c[(Math.random()*c.length)|0];}
function rvxOnde(retard,duree,ep,al){const R=RVX;R.O.push({t:-(retard||0),d:duree||.8,r0:R.w*.12,r1:Math.max(R.W,R.H)*(duree<.6?.32:.8),ep:ep||6,al:al||1});}
function rvxFoudre(nb){const R=RVX;for(let q=0;q<(nb||1);q++){const pts=[],x0=R.x+(Math.random()*2-1)*R.W*.3,y1=R.y-R.h*.12,N=12;
  for(let k=0;k<=N;k++){const f=k/N;pts.push([x0+(R.x-x0)*f+(k&&k<N?(Math.random()*2-1)*28:0),-12+(y1+12)*f]);}
  R.F.push({t:0,d:.26,pts:pts});}}
function rvxEclat(n,P){const R=RVX;if(!R.cv)return;rvxMesure();
  R.P=R.P.filter(function(p){return p.k!=='imp';});
  const k9=Math.min(R.W,R.H)/420,N=rvxAl()?Math.round(P.ge*.7):P.ge;
  for(let q=0;q<N;q++){const a=Math.random()*6.2832,v=(220+Math.random()*760)*k9;
    rvxNe({k:'eti',x:R.x+Math.cos(a)*R.w*.08,y:R.y+Math.sin(a)*R.h*.08,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.8-90*k9,v:.7+Math.random()*.9,V:1.6,s:2+Math.random()*2.2,c:q%4?rvxCoul():'#fff'});}
  for(let q=0;q<P.on;q++)rvxOnde(q*.14,.75+q*.2,5-q*1.2,.85-q*.2);
  for(const p of R.P)if(p.k==='eto'){const a=Math.atan2(p.y-R.y,p.x-R.x),v=(500+Math.random()*900)*k9;p.vx=Math.cos(a)*v;p.vy=Math.sin(a)*v;p.lib=1;p.v=Math.min(p.v,1.4);}
  if(n===3||n===5){const nb=rvxAl()?44:80;for(let q=0;q<nb;q++)rvxNe({k:'or',x:Math.random()*R.W,y:-10-Math.random()*R.H*.7,vx:(Math.random()*2-1)*14,vy:(70+Math.random()*80)*k9,v:9,V:9,
    s:3+Math.random()*3,a:Math.random()*6.3,w:4+Math.random()*7,c:n===5?M2RV_ARC[q%7]:(q%3?'#ffd75e':q%2?'#fff3c4':'#ffb81f')});}
  R.se=P.se;R.vie=true;R.gT=.6;}
function rvxEtoiles(){const R=RVX,N=rvxAl()?70:120,M=Math.hypot(R.W,R.H)*.55;
  for(let q=0;q<N;q++)R.P.push({k:'eto',r:R.w*.5+Math.random()*M,a:Math.random()*6.2832,om:(.25+Math.random()*.3)*(q%5?1:-1),v:99,V:99,s:1+Math.random()*2,c:M2RV_ARC[q%7],x:0,y:0,vx:0,vy:0});}
function rvxPoussiere(nom){const R=RVX;if(!R.cv||!nom)return;const a=nom.getBoundingClientRect(),b=R.cadre.getBoundingClientRect(),y=a.bottom-b.top-4;
  for(let q=0;q<(R.n>=2?22:12);q++){const s=Math.random()<.5?-1:1;rvxNe({k:'eti',x:a.left-b.left+Math.random()*a.width,y:y,vx:s*(40+Math.random()*160),vy:-(20+Math.random()*70),v:.4+Math.random()*.4,V:.8,s:2,c:q%3?'#ffffff':rvxCoul(),g:.3});}}
function rvxNaissances(dt){const R=RVX,al=rvxAl();
  if(R.pou){let nb=0;for(const p of R.P)if(p.k==='pou')nb++;
    if(nb<(al?16:28)&&Math.random()<dt*14)rvxNe({k:'pou',x:R.x+(Math.random()*2-1)*R.w*.42,y:R.y-R.h*(.2+Math.random()*1.3),vx:(Math.random()*2-1)*7,vy:3+Math.random()*7,v:3+Math.random()*3,V:6,s:1.5+Math.random(),c:'#ffffff',a:.25+Math.random()*.3});}
  if(R.ch>0){R.chT+=dt;const f=Math.min(1,R.chT/R.ch),taux=(20+R.n*12)*(1+f*3)*(al?.6:1);
    let q=taux*dt;while(q>0){if(Math.random()<q){const a=Math.random()*6.2832,d=Math.max(R.W,R.H)*(.32+Math.random()*.3);
      rvxNe({k:'imp',x:R.x+Math.cos(a)*d,y:R.y+Math.sin(a)*d*.75,v:1.6,V:1.6,s:1.5+Math.random()*1.5,c:Math.random()<.35?'#fff':rvxCoul(),sp:120+Math.random()*120});}q-=1;}}
  if(R.vie){
    if(R.n>=1){let nb=0;for(const p of R.P)if(p.k==='bra')nb++;const cible=al?[0,6,10,12,18,14][R.n]:[0,10,16,20,30,24][R.n];
      if(nb<cible&&Math.random()<dt*9)rvxNe({k:'bra',x:R.x+(Math.random()*2-1)*Math.min(R.W*.48,R.w*1.1),y:R.y+R.h*(.25+Math.random()*.4),vx:0,vy:-(18+Math.random()*44),v:2.6+Math.random()*2.8,V:5,s:2+Math.random()*1.6,c:rvxCoul(),ph:Math.random()*6.3});}
    if(R.n>=3){R.gT-=dt;if(R.gT<=0){R.gT=.7+Math.random()*1.1;R.G.push({t:0,d:.55,x:R.x+(Math.random()*2-1)*R.w*.3,y:R.y+(Math.random()*.5-.32)*R.h,s:7+Math.random()*9});}}
    if(R.n===4){R.fT-=dt;if(R.fT<=0){R.fT=2.6+Math.random()*3;const x0=Math.random()<.5?R.W*(.04+Math.random()*.2):R.W*(.76+Math.random()*.2),pts=[];
      for(let k=0;k<=9;k++)pts.push([x0+(Math.random()*2-1)*(k?24:0),-10+k*R.H*.06]);R.F.push({t:0,d:.2,pts:pts,loin:1});}}
    if(R.n===5){let nb=0;for(const p of R.P)if(p.k==='eto')nb++;if(nb<(al?40:70)&&Math.random()<dt*12)R.P.push({k:'eto',x:Math.random()*R.W,y:Math.random()*R.H,fixe:1,v:2+Math.random()*3,V:5,s:1+Math.random()*1.5,c:M2RV_ARC[(Math.random()*7)|0],vx:0,vy:0});}}}
function rvxBoucle(ts){const R=RVX;
  if(!R.cv||!R.cv.isConnected){R.raf=0;R.P.length=0;R.O.length=0;R.F.length=0;R.G.length=0;R.cv=null;return;}
  const dt=Math.min(.05,R.last?(ts-R.last)/1000:.016);R.last=ts;R.t+=dt;
  const c=R.cx,k9=Math.min(R.W,R.H)/420;c.setTransform(R.dpr,0,0,R.dpr,0,0);c.clearRect(0,0,R.W,R.H);c.globalCompositeOperation='lighter';
  if(M2REV.on){rvxMesure();rvxNaissances(dt);} /* le bloc remonte, la caméra avance : la toile suit la caisse */
  const ff=R.ch>0?Math.min(1,R.chT/R.ch):0;
  for(let q=R.P.length-1;q>=0;q--){const p=R.P[q];p.v-=dt;if(p.v<=0||(p.k==='eto'&&p.lib&&(p.x<-20||p.x>R.W+20||p.y<-20||p.y>R.H+20))){R.P[q]=R.P[R.P.length-1];R.P.pop();continue;}
    let al=1;
    if(p.k==='pou'){p.x+=p.vx*dt;p.y+=p.vy*dt;al=p.a*Math.min(1,(p.V-p.v)/.8,p.v/.8);c.globalAlpha=al;c.fillStyle=p.c;c.fillRect(p.x,p.y,p.s,p.s);continue;}
    if(p.k==='imp'){const dx=R.x-p.x,dy=R.y-p.y,d=Math.hypot(dx,dy);if(d<R.w*.1){R.P[q]=R.P[R.P.length-1];R.P.pop();continue;}
      p.sp+=(500+ff*900)*k9*dt;const ux=dx/d,uy=dy/d,l=Math.min(d,6+p.sp*.05);p.x+=ux*p.sp*dt;p.y+=uy*p.sp*dt;
      c.globalAlpha=Math.min(1,(p.V-p.v)/.25)*.85;c.strokeStyle=p.c;c.lineWidth=p.s;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-ux*l,p.y-uy*l);c.stroke();continue;}
    if(p.k==='eti'){const dr=Math.exp(-dt*2.6);p.vx*=dr;p.vy=p.vy*dr+(p.g!=null?p.g:1)*320*k9*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;al=Math.min(1,p.v/(p.V*.5));
      c.globalAlpha=al;c.strokeStyle=p.c;c.lineWidth=p.s;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-p.vx*.025,p.y-p.vy*.025);c.stroke();continue;}
    if(p.k==='bra'){p.ph+=dt*2.2;p.x+=Math.sin(p.ph)*16*dt;p.y+=p.vy*dt;al=Math.min(1,(p.V-p.v)/.6,p.v/1.2)*(.55+.45*Math.sin(p.ph*3.1));
      c.globalAlpha=Math.max(0,al);c.fillStyle=p.c;c.fillRect(p.x,p.y,p.s,p.s);continue;}
    if(p.k==='or'){p.a+=dt*p.w;p.x+=(p.vx+Math.sin(p.a*.7)*22)*dt;p.y+=p.vy*dt;if(p.y>R.H+12)p.v=0;
      c.globalCompositeOperation='source-over';c.globalAlpha=Math.min(1,p.v/1.5);c.fillStyle=p.c;const lw=Math.max(1,Math.abs(Math.cos(p.a))*p.s*1.6);c.fillRect(p.x-lw/2,p.y,lw,p.s);c.globalCompositeOperation='lighter';continue;}
    if(p.k==='eto'){if(p.fixe){al=Math.sin(Math.PI*(1-p.v/p.V))*.9;}
      else if(p.lib){p.x+=p.vx*dt;p.y+=p.vy*dt;al=1;}
      else{p.a+=p.om*(1+ff*7)*dt;if(R.ch>0)p.r*=Math.exp(-dt*ff*1.4);p.x=R.x+Math.cos(p.a)*p.r;p.y=R.y+Math.sin(p.a)*p.r*.8;al=Math.min(1,R.t*.8)*(.5+.5*Math.sin(R.t*3+p.r));}
      c.globalAlpha=Math.max(0,al);c.fillStyle=p.c;c.fillRect(p.x,p.y,p.s,p.s);if(p.lib){c.strokeStyle=p.c;c.lineWidth=p.s;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-p.vx*.03,p.y-p.vy*.03);c.stroke();}}}
  for(let q=R.O.length-1;q>=0;q--){const o=R.O[q];o.t+=dt;if(o.t<0)continue;const f=o.t/o.d;if(f>=1){R.O.splice(q,1);continue;}
    const e=1-Math.pow(1-f,3),rr=o.r0+(o.r1-o.r0)*e;c.globalAlpha=(1-f)*o.al;c.strokeStyle=R.col[0];c.lineWidth=o.ep*(1-f)+1;c.beginPath();c.ellipse(R.x,R.y+R.h*.18,rr,rr*.42,0,0,6.2832);c.stroke();
    c.globalAlpha=(1-f)*o.al*.7;c.strokeStyle='#fff';c.lineWidth=Math.max(1,o.ep*.35*(1-f));c.stroke();}
  for(let q=R.F.length-1;q>=0;q--){const b=R.F[q];b.t+=dt;if(b.t>=b.d){R.F.splice(q,1);continue;}if(((b.t*40)|0)%3===1)continue;
    const al=(1-b.t/b.d)*(b.loin?.45:1);c.beginPath();c.moveTo(b.pts[0][0],b.pts[0][1]);for(const pt of b.pts)c.lineTo(pt[0],pt[1]);
    c.globalAlpha=al*.45;c.strokeStyle=R.col[0];c.lineWidth=b.loin?5:11;c.stroke();c.globalAlpha=al;c.strokeStyle='#fff';c.lineWidth=b.loin?1.5:3;c.stroke();}
  for(let q=R.G.length-1;q>=0;q--){const g=R.G[q];g.t+=dt;if(g.t>=g.d){R.G.splice(q,1);continue;}const s=Math.sin(Math.PI*g.t/g.d),l=g.s*s;
    c.globalAlpha=s;c.fillStyle='#fff';c.fillRect(g.x-l,g.y-1,l*2,2);c.fillRect(g.x-1,g.y-l,2,l*2);c.fillRect(g.x-2,g.y-2,4,4);}
  c.globalAlpha=1;c.globalCompositeOperation='source-over';
  if(R.se>.25&&R.cadre){R.se*=Math.exp(-dt*6.5);R.cadre.style.transform='translate('+((Math.random()*2-1)*R.se).toFixed(1)+'px,'+((Math.random()*2-1)*R.se).toFixed(1)+'px)';}
  else if(R.se&&R.cadre){R.se=0;R.cadre.style.transform='';}
  R.raf=requestAnimationFrame(rvxBoucle);}
/* VOIR UNE RARETÉ SANS RIEN GAGNER : dbgRevelation('legendaire' | nom de caisse | index) — et `?revelation=…` la joue sur l'accueil */
window.dbgRevelation=function(q){if(M2REV.on)return 'déjà ouverte';let i=-1,rf=null;
  if(typeof q==='number')i=q;else{const k=String(q||'legendaire').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/s$/,'');
    const r=k==='commune'?'commun':k==='infinie'?'infini':k;
    if(M2RV_PAL[r]!=null){let L=rarListe(r);if(!L.length){rf=r;for(const r2 of ['legendaire','epique','rare','commun']){L=rarListe(r2);if(L.length)break;}} /* pas encore de caisse de ce palier : la plus belle qu'on ait, jouée à ce palier */
      i=L.length?L[L.length-1]:-1;}
    else i=CARS.findIndex(function(c){return c&&String(c.name).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')===k;});}
  if(i<0||!CARS[i])return 'aucune caisse pour : '+q;
  const sec=M2.filter(function(m){return m.f==='secret'&&m.r&&m.r.car;}),m=sec.find(function(x){return x.r.car===CARS[i].name;})||sec[(Math.random()*sec.length)|0];
  M2REV.demo=true;m2RevScene(i,m?sansAcc(m2Txt(m)):'','demo',rf);return CARS[i].name+' — '+(rf||carRar(i))+(rf?' (palier essayé avec '+carRar(i)+')':'');};
(function(){let q='';try{q=new URLSearchParams(location.search).get('revelation')||'';}catch(e){}if(!q)return;let n=0;
  const iv=setInterval(function(){n++;if(n>600){clearInterval(iv);return;}let ok=false;try{ok=bienvPret();}catch(e){}if(!ok)return;clearInterval(iv);
    setTimeout(function(){try{console.log('révélation :',window.dbgRevelation(q));}catch(e){console.warn(e);}},600);},500);})();
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
