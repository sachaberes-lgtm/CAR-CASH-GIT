/* ===== LE BANC iPHONE AUTOMATIQUE (2026-11-07, passe 3 « au max », P7 : « l'app se joue toute seule, Sacha ne touche pas l'écran ») =====
   INERTE sans le drapeau : `localStorage.ccBancAuto` (posé par natif.js dans une app construite par `preparer-www.js --banc "<scénario>"`) ou `?banc=auto` sur le web.
   Sans drapeau, ce morceau lit une clé du localStorage et sort : aucun minuteur, aucun rAF, aucun écouteur. Jamais dans un build normal (natif.js EFFACE le drapeau
   quand l'app n'a pas été construite avec --banc : le localStorage survit aux mises à jour de l'app).
   Le scénario (une seule fonction async, des attentes sur l'état du jeu) :
     titre   : l'intro est lancée toute seule ; la boule est touchée dès qu'elle est prête (`window.__ccIntroAuto`, exposé par intro-161.js)
     menu    : « menu à t s », 5 s d'attente ; GARAGE → INVENTAIRE (défilement animé 3 s par scrollTop) → BOUTIQUE → retour à l'accueil
     partie 1: JOUER, le pilote auto de mesure (`dbgAuto`) conduit 5 min ; toutes les 20 s un pouvoir (`dbgPwr`) ou une figure (`dbgFig('lance')`, en l'air) ;
               à 5 min `dbgBoom()` (la mort) ; REJOUER
     partie 2: 5 min encore, le moteur monté jusqu'au palier 16 (`dbgMoteur()`, un palier à la fois) puis mort ; MAISON
     fin     : « fini t s » ; l'app reste à l'accueil, plus rien ne tourne.
   Tout s'écrit dans la boîte noire. ⚠ `cashcarErr` est plafonnée à 30 lignes (debut-corps.html) et les sondes `serpent`/`fluide`/`memoire` en ont besoin :
   le détail (une ligne par étape et toutes les 20 s de course) va dans `cashcarBanc` (même format, sans plafond serré : 400), et seules les lignes clés
   (début, menu, mort, fini, échecs) passent aussi par `__ccNote('banc',…)`. Chaque ligne donne la PIRE IMAGE depuis la ligne d'avant. `cashcarBancEtat` garde
   l'étape en cours : un lancement qui trouve une partie interrompue le dit (« ⚠ la session d'avant s'est arrêtée à … » = plantage ou rechargement).
   Lecture côté Mac : outils/banc-perf/iphone-auto.sh. Réglages : ccBancAuto = JSON {scenario,partie,menu,pouv,palier} ou « 1 » ; ?bancT=40 raccourcit les parties (essai web). */
(function(){
  var FL=null,WEB=false;
  try{FL=localStorage.getItem('ccBancAuto');}catch(e){}
  try{WEB=/[?&]banc=auto\b/.test(location.search);}catch(e){}
  if(!FL&&!WEB)return; /* le chemin normal : tout s'arrête ici */
  var CFG={scenario:'p7',partie:300,menu:5,defile:3,pouv:20,palier:16,max:1800,nit:0,saut:0}; /* (essai web : nit 1 + saut 9 = une mort toutes les 20-30 s, le moteur retombe au palier 0 ; sans les deux : 0 mort en 160 s, palier 16 atteint) */;
  try{var j=JSON.parse(FL);if(j&&typeof j==='object'){for(var k in j)CFG[k]=j[k];}else if(typeof j==='string')CFG.scenario=j;}catch(e){if(FL&&FL!=='1')CFG.scenario=String(FL);}
  try{var mT=/[?&]bancT=(\d+)/.exec(location.search);if(mT)CFG.partie=+mT[1];}catch(e){}
  try{var mN=/[?&]bancNit=(\d)/.exec(location.search),mS=/[?&]bancSaut=(\d+)/.exec(location.search);if(mN)CFG.nit=+mN[1];if(mS)CFG.saut=+mS[1];}catch(e){}
  if(CFG.scenario==='court'&&CFG.partie>60)CFG.partie=45;
  var CLE='cashcarBanc',CLE_ETAT='cashcarBancEtat';
  var T0=performance.now(),ST=null,L=[],RUN=1,etape='?',seau=null,fini=false;
  var sec=function(){return Math.round((performance.now()-T0)/100)/10;};
  var att=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  var V=function(){return typeof CC_VER==='string'?CC_VER:'?';};
  /* ---- le registre : cashcarBanc (détail) + cashcarBancEtat (où l'on en est) ---- */
  try{L=JSON.parse(localStorage.getItem(CLE)||'[]');if(!Array.isArray(L))L=[];}catch(e){L=[];}
  var ecritTimer=0,ecritLent=false; /* (2026-11-07, OPTI ULTIME : ne pas fausser la mesure) le journal ne s'écrit que sur une transition d'étape (0,4 s) ou toutes les 20 s au plus pour les lignes « vivant »/« attend », et au départ en arrière-plan */
  var lentes=function(m){return /^banc: (vivant|attend)/.test(m);};
  var ecrit=function(){clearTimeout(ecritTimer);ecritTimer=0;try{var i,k;while(L.length>150){i=-1;for(k=0;k<L.length;k++)if(lentes(L[k].m)){i=k;break;}L.splice(i<0?0:i,1);}localStorage.setItem(CLE,JSON.stringify(L));}catch(e){}};
  addEventListener('pagehide',function(){if(ecritTimer)ecrit();});document.addEventListener('visibilitychange',function(){if(document.hidden&&ecritTimer)ecrit();});
  var etatSauve=function(extra){try{localStorage.setItem(CLE_ETAT,JSON.stringify({run:RUN,etape:etape,t:sec(),ts:Date.now(),fini:fini?1:0,v:V(),x:extra||''}));}catch(e){}};
  var note=function(msg,cle){
    msg='banc: '+msg;
    try{L.push({k:'banc|'+L.length,g:'banc',m:msg.slice(0,400),o:'',n:1,t0:Date.now(),t:Date.now(),v:V(),d:1});var lente=lentes(msg);if(!ecritTimer||(ecritLent&&!lente)){clearTimeout(ecritTimer);ecritLent=lente;ecritTimer=setTimeout(ecrit,lente?20000:400);}}catch(e){}
    if(cle)try{window.__ccNote('banc',msg);}catch(e){}
    try{console.log('['+'banc]',msg);}catch(e){}
  };
  /* ---- le chronomètre d'images : la pire image depuis la ligne d'avant ---- */
  var nouveauSeau=function(){return{n:0,max:0,maxT:0,p100:0,p50c:0,h:[],fond:0};};
  var dernier=0,vivant=true;
  var rafs=function(t){
    if(!vivant)return;
    if(dernier&&seau){var d=t-dernier;
      if(document.hidden||d>20000){seau.fond++;}
      else{seau.n++;if(d>seau.max){seau.max=d;seau.maxT=sec();}if(d>100)seau.p100++;if(d>50)seau.p50c++;if(seau.h.length<40000)seau.h.push(d);}}
    dernier=t;requestAnimationFrame(rafs);};
  var ferme=function(){var s=seau;seau=nouveauSeau();if(!s||!s.n)return{txt:'0 image',max:0};
    var h=s.h.slice().sort(function(a,b){return a-b;}),p50=h[(h.length*.5)|0]||0,p90=h[(h.length*.9)|0]||0;
    return{max:s.max,txt:'pire '+Math.round(s.max)+' ms (à '+s.maxT+' s) · p50 '+(Math.round(p50*10)/10)+' · p90 '+(Math.round(p90*10)/10)+' ms · '+s.n+' images · >50 ms: '+s.p50c+' · >100 ms: '+s.p100+(s.fond?' · en fond: '+s.fond:'')};};
  /* ---- l'état du jeu, lu sans rien casser ---- */
  var etatJeu=function(){try{return window.dbgState()||{};}catch(e){return{};}};
  var palierMot=function(){try{return typeof engTier==='number'?engTier:-1;}catch(e){return -1;}};
  var memoire=function(){var o=[];try{var i=renderer.info;o.push('tex '+i.memory.textures,'géo '+i.memory.geometries,'prog '+(i.programs?i.programs.length:'?'));}catch(e){}
    try{if(performance.memory)o.push('tas '+Math.round(performance.memory.usedJSHeapSize/1048576)+' Mo');}catch(e){}return o.join(' · ');};
  var ligne=function(nom,extra,cle){
    etape=nom;var f=ferme();
    note(nom+' · t '+sec()+' s · '+f.txt+(extra?' · '+extra:''),cle);etatSauve();return f;};
  /* ---- les gestes ---- */
  var visible=function(e){if(!e||!e.isConnected)return false;var r=e.getBoundingClientRect();if(r.width<4||r.height<4)return false;
    var cs=getComputedStyle(e);return cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>.05;};
  var clic=function(sel){var Ls=document.querySelectorAll(sel);for(var i=0;i<Ls.length;i++)if(visible(Ls[i])){try{Ls[i].click();}catch(e){return null;}return Ls[i];}return null;};
  var jusque=function(cond,max,pas){return new Promise(function(res){var t0=performance.now();(function p(){var ok=false;try{ok=!!cond();}catch(e){}
    if(ok)return res(true);if(performance.now()-t0>max*1000)return res(false);setTimeout(p,pas||250);})();});};
  var modale=function(){try{var m=document.getElementById('modale');if(m&&m.classList.contains('on')){var b=m.querySelectorAll('.modB .pbtn');if(b.length){b[b.length-1].click();return true;}}}catch(e){}return false;};
  var enCourse=function(){var s=etatJeu();return !!(s.started&&s.running&&!s.gameOver);};
  var mort=function(){var s=etatJeu();return !!(s.started&&s.gameOver);};
  var echec=function(msg){note('ÉCHEC · '+msg+' · t '+sec()+' s',true);};
  var actions=0;
  /* ---- les écrans du menu ---- */
  var ecrans=async function(){
    var ok;
    clic('[data-m="garage"]');
    ok=await jusque(function(){return typeof garageOn!=='undefined'&&garageOn;},15);
    if(!ok){echec('le garage ne s\'ouvre pas');return;}
    await att(1500);ligne('garage ouvert',memoire());
    await att(2500);ligne('garage 2,5 s');
    /* l'inventaire : ouverture, puis défilement de la grille par scrollTop sur CFG.defile s, aller puis retour */
    try{window.dbgInv('ouvre');}catch(e){}
    ok=await jusque(function(){return typeof INV!=='undefined'&&INV&&INV.on;},8);
    if(!ok){echec('l\'inventaire ne s\'ouvre pas');}
    else{await att(800);ligne('inventaire ouvert');
      var g=document.getElementById('ivGrille'),m=g?g.scrollHeight-g.clientHeight:0;
      if(!g||m<20)note('inventaire : rien à défiler (grille '+(g?g.scrollHeight+'/'+g.clientHeight:'absente')+')');
      else{var D=CFG.defile*1000,a=performance.now();
        await new Promise(function(res){(function p(){var k=Math.min(1,(performance.now()-a)/D),q=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;g.scrollTop=m*q;if(k<1)requestAnimationFrame(p);else res();})();});
        await att(300);
        a=performance.now();await new Promise(function(res){(function p(){var k=Math.min(1,(performance.now()-a)/(D/2)),q=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;g.scrollTop=m*(1-q);if(k<1)requestAnimationFrame(p);else res();})();});}
      ligne('inventaire défilé',m>=20?'grille '+g.scrollHeight+' px':'');
      try{invFerme();}catch(e){}await att(900);}
    /* la boutique */
    var ot=performance.now();clic('#gShopBas');
    ok=await jusque(function(){var g=document.getElementById('garage');return g&&g.classList.contains('modeShop');},12);
    if(!ok)echec('la boutique ne s\'ouvre pas');
    else{note('boutique ouverte en '+Math.round(performance.now()-ot)+' ms');await att(2500);ligne('boutique ouverte 2,5 s');}
    /* le retour : HOME (la rangée du bas) ferme la boutique ; l'ACCUEIL, ici, c'est l'atelier en mode « menu » (garageOn reste vrai) avec JOUER par-dessus */
    var jouerVisible=function(){return visible(document.querySelector('#mHome [data-m="play"]'))||visible(document.querySelector('.mPlay'));};
    for(var i=0;i<3&&!jouerVisible();i++){
      modale();
      if(i===0)clic('#gHomeBas')||clic('#gClose')||clic('#gHomeMini');
      else if(i===1){try{if(typeof garageOn!=='undefined'&&garageOn&&!GAR.go)garMode('menu');}catch(e){}}
      else {try{window.__mGo&&window.__mGo('home');}catch(e){}}
      await jusque(jouerVisible,5);}
    await att(1500);
    ligne('retour accueil',jouerVisible()?'':'⚠ JOUER pas visible');
  };
  /* ---- une course : JOUER / REJOUER, le pilote, des actions toutes les CFG.pouv s, la mort forcée ---- */
  var armePilote=function(){try{window.dbgAuto(true,0,{vol:true,nit:CFG.nit,saut:CFG.saut});}catch(e){echec('dbgAuto : '+(e&&e.message));}};
  var demarre=async function(premier){
    var ok=false;
    for(var i=0;i<30&&!ok;i++){modale();
      if(premier&&i%4===0){clic('[data-m="play"].mPlay')||clic('#mHome [data-m="play"]')||clic('[data-m="play"]');}
      else if(!premier&&i%3===0){clic('[data-m="replay"]');}
      if(i===9||i===20){try{note('dbgJouer → '+JSON.stringify(window.dbgJouer()));}catch(e){}}
      ok=await jusque(enCourse,3.5);}
    return ok;};
  var cles=['n','a','v','m','x'],figI=0;
  var actionCourse=function(){ /* UNE action : une figure si la caisse est en l'air, sinon le pouvoir suivant */
    var s=etatJeu(),r='';actions++;
    try{
      if(s.mode==='fall'&&actions%2===0){var f=window.dbgFig('lance',figI++);r='figure '+(figI-1)+(f?' ok':' refusée');}
      else{var k=cles[actions%cles.length];window.dbgPwr(k,1);r='pouvoir '+k;}
    }catch(e){r='action en erreur '+(e&&e.message);}
    return r;};
  var course=async function(num,rampe){
    var dur=CFG.partie,t0=performance.now(),runT=performance.now(),morts=0,derAct=0,pTarget=CFG.palier,maxPal=palierMot(),vmax=0;
    var avant=ferme();
    armePilote();
    note('partie '+num+' : départ à t '+sec()+' s · '+memoire()+' · palier '+palierMot(),true);
    var derLigne=performance.now();
    while((performance.now()-t0)/1000<dur){
      await att(500);
      if(document.hidden){continue;}
      var s=etatJeu(),dt=(performance.now()-t0)/1000;
      if(s.gameOver&&s.started){ /* le pilote est mort avant l'heure : on le note, on rejoue, la partie continue jusqu'à sa durée */
        morts++;ligne('partie '+num+' · mort anticipée n°'+morts+' à '+Math.round(dt)+' s','palier '+palierMot()+' · v max '+Math.round(vmax)+' km/h',true);
        try{window.dbgAuto(false);}catch(e){}
        await att(3000);
        if(!await demarre(false)){echec('REJOUER après mort anticipée');return false;}
        runT=performance.now();armePilote();derLigne=performance.now();continue;}
      if(+s.vH>vmax)vmax=+s.vH;var pm=palierMot();if(pm>maxPal)maxPal=pm;
      if(rampe){ /* partie 2 : monter le moteur d'un palier à la fois pour atteindre CFG.palier aux 70 % de la durée (le palier naturel est trop lent) */
        var runDt=(runT-t0)/1000,den=Math.max(8,Math.min(dur*.7,(dur-runDt)*.8)),cible=Math.min(CFG.palier,Math.ceil(CFG.palier*((performance.now()-runT)/1000)/den)); /* après une mort anticipée la rampe se resserre : le palier cible reste atteignable avant la fin */
        if(pm>=0&&pm<cible&&performance.now()-derAct>2500){derAct=performance.now();try{window.dbgMoteur();}catch(e){}}}
      if((performance.now()-derLigne)/1000>=CFG.pouv){derLigne=performance.now();
        var a=actionCourse();ligne('partie '+num+' · '+Math.round(dt)+' s','palier '+palierMot()+' · '+Math.round(+s.vH||0)+' km/h · mode '+s.mode+' · '+a);}}
    /* l'heure : la mort forcée */
    try{window.dbgAuto(false);}catch(e){}
    ligne('partie '+num+' · fin de course','palier max '+maxPal+' (cible '+(rampe?CFG.palier:'—')+') · v max '+Math.round(vmax)+' km/h · '+morts+' mort(s) anticipée(s) · '+memoire(),true);
    var bt=performance.now();
    try{window.dbgBoom();}catch(e){echec('dbgBoom : '+(e&&e.message));}
    var ok=await jusque(mort,15);
    if(!ok)echec('la mort forcée n\'a pas eu lieu');
    await jusque(function(){return visible(document.querySelector('#mDead [data-m="replay"]'))||visible(document.querySelector('[data-m="replay"]'));},25);
    ligne('partie '+num+' · mort','écran de mort en '+Math.round(performance.now()-bt)+' ms · '+memoire(),true);
    if(rampe&&maxPal<CFG.palier)note('⚠ palier '+CFG.palier+' non atteint (max '+maxPal+')',true);
    return true;};
  /* ---- le titre : l'intro, la boule ---- */
  var titre=async function(){
    var ok=await jusque(function(){return window.__ccIntroAuto||(window.__gameReady&&!window.__intro);},60);
    var I=window.__ccIntroAuto;
    if(I){
      /* le film part tout seul ; s'il n'est pas lancé après 8 s, on le lance */
      await jusque(function(){return I.lance();},8);if(!I.lance())try{I.lancer(true);}catch(e){}
      ok=await jusque(function(){return I.pret()||I.fini();},90,200);
      if(!ok)echec('la boule n\'est jamais prête');
      else{note('boule prête à t '+sec()+' s');try{I.tapBoule();}catch(e){echec('tapBoule : '+(e&&e.message));}}}
    ok=await jusque(function(){return window.__gameReady&&!window.__intro&&document.getElementById('mHome')&&document.getElementById('mHome').classList.contains('on')&&visible(document.querySelector('[data-m="play"]'));},120,300);
    return ok;};
  var tout=async function(){
    var rep=null;try{rep=JSON.parse(localStorage.getItem(CLE_ETAT)||'null');}catch(e){}
    if(rep&&!rep.fini&&Date.now()-rep.ts<45*60000){RUN=(rep.run|0)+1;
      note('⚠ PLANTAGE OU RECHARGEMENT : la session d\'avant (run '+rep.run+', v '+rep.v+') s\'est arrêtée à « '+rep.etape+' » à t '+rep.t+' s ('+Math.round((Date.now()-rep.ts)/1000)+' s avant ce lancement)',true);
      if(RUN>3){note('banc : 3 sessions interrompues, on arrête',true);fini=true;etatSauve('abandon');vivant=false;return;}}
    else if(rep)RUN=(rep.run|0)+1;
    note('début · run '+RUN+' · scénario '+CFG.scenario+' · partie '+CFG.partie+' s · v '+V()+' · '+(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()?'app native':'web')+' · '+screen.width+'×'+screen.height+' @'+(window.devicePixelRatio||1)+' · wakeLock '+(navigator.wakeLock?'oui':'non'),true);
    try{if(navigator.wakeLock)navigator.wakeLock.request('screen').then(function(w){note('wakeLock obtenu');},function(e){note('wakeLock refusé : '+(e&&e.message));});}catch(e){}
    seau=nouveauSeau();requestAnimationFrame(rafs);
    etatSauve();
    if(!await titre()){echec('le menu n\'apparaît pas');ligne('titre');return;}
    ligne('titre → menu','',false);note('menu à '+sec()+' s',true);
    await att(CFG.menu*1000);ligne('menu '+CFG.menu+' s');
    await ecrans();
    if(!await demarre(true)){echec('JOUER ne lance pas la course');return;}
    await course(1,false);
    if(!await demarre(false)){echec('REJOUER ne lance pas la partie 2');return;}
    await course(2,true);
    /* retour à l'accueil (MAISON), puis plus rien */
    for(var i=0;i<6;i++){modale();clic('#mDead [data-m="menu"]')||clic('[data-m="menu"]');
      if(await jusque(function(){return !mort()||(document.getElementById('mHome')&&document.getElementById('mHome').classList.contains('on'));},4))break;}
    try{window.__mGo&&window.__mGo('home');}catch(e){}
    await att(2000);
    ligne('retour accueil final');
  };
  var lance=function(){
    tout().then(function(){fini=true;note('fini '+sec()+' s',true);vivant=false;etatSauve();ecrit();},
      function(e){fini=true;note('ÉCHEC du banc : '+(e&&e.stack||e),true);vivant=false;etatSauve();ecrit();});};
  /* départ : dès que le jeu a posé window.__gameReady (ou son chien de garde), mais sans attendre l'intro : titre() s'en charge */
  window.__ccBanc={cfg:CFG,note:note,etat:function(){return{run:RUN,etape:etape,fini:fini,t:sec()};},lignes:function(){return L.slice();}};
  setTimeout(lance,300);
})();
