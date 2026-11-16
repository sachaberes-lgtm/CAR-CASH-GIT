














(function(){
  'use strict';
  var C=window.Capacitor;
  if(!C||typeof C.isNativePlatform!=='function'||!C.isNativePlatform())return;
  var P=C.Plugins||{}, DEBUG=!!C.DEBUG, ICI=location.origin;
  var dit=function(){if(DEBUG)try{console.log.apply(console,['[natif]'].concat([].slice.call(arguments)));}catch(e){}};
  document.documentElement.classList.add('natif');


  var BANC=null; 
  try{if(BANC)localStorage.setItem('ccBancAuto',JSON.stringify(BANC));else localStorage.removeItem('ccBancAuto');}catch(e){}
 
  var QS=null; 




  try{if(window.__ccQSsup)QS=(QS||'')+String(window.__ccQSsup);}catch(e){}
  try{if(QS&&!location.search)history.replaceState(null,'',location.pathname+'?'+String(QS).replace(/^[?&]/,''));}catch(e){}
  var CHAL=null;try{CHAL=(/[?&]chaleur=(\w+)/.exec(location.search)||[])[1]||null;}catch(e){}
  if(CHAL==='vide'){try{if(P.SerpentNatif)P.SerpentNatif.retire();}catch(e){}
    try{document.write('<body style="margin:0;background:#000"><plaintext style="display:none">');}catch(e){} 
    setInterval(function(){try{if(P.SerpentNatif)P.SerpentNatif.retire();}catch(e){}},2000);return;}
  if(CHAL){window.__ccBancChaleur=1;
    if(!/[?&]chalson=1/.test(location.search)){try{var ACx=window.AudioContext||window.webkitAudioContext;if(ACx)ACx.prototype.resume=function(){return Promise.resolve();};}catch(e){}
      try{HTMLMediaElement.prototype.play=function(){return Promise.resolve();};}catch(e){}}
    var chT0=0,chP=0;
    setInterval(function(){try{
      if(typeof window.dbgState!=='function')return;
      var sp=document.getElementById('splash');if(sp)sp.remove();
      try{if(P.SerpentNatif)P.SerpentNatif.retire();}catch(e){}
 
      try{var mD=/[?&]chaldpr=([\d.]+)/.exec(location.search);if(mD&&typeof window.imgRegle==='function'&&Math.abs(curDPR-(+mD[1]))>.02)window.imgRegle({dpr:+mD[1]});}catch(e){}
      try{if(/[?&]chalrendu=0/.test(location.search)&&!window.__chR){window.__chR=1;try{renderer.render=function(){};}catch(e){}try{composer.render=function(){};}catch(e){}}}catch(e){}
      if(CHAL==='accueil')return;
      try{window.dbgTuto('permis');}catch(e){}
      try{window.dbgImmortel(true);}catch(e){}
      try{if(/[?&]chalpal=1/.test(location.search))TEST_PAL.on=true;}catch(e){}
      var st=window.dbgState();
      if(!st.started||st.gameOver){chT0=0;chP=0;window.dbgJouer();return;}
      if(!chT0)chT0=Date.now();
      if(CHAL==='pause'){if(!st.paused&&!chP&&Date.now()-chT0>25000){chP=1;window.__panBascule();}return;}
      if(/[?&]challent=1/.test(location.search))window.dbgAuto(true,0,{}); 
      else window.dbgAuto(true,0,{vol:true,nit:2});
    }catch(e){}},1500);}
 
  try{if(!QS||!/perfrec=/.test(String(QS))){localStorage.removeItem('ccPerfRecOn');var nBV=+(localStorage.getItem('ccBVn')||0);if(nBV){for(var kBV=Math.max(0,nBV-300);kBV<nBV;kBV++)localStorage.removeItem('ccBV'+kBV);localStorage.removeItem('ccBVn');}} }catch(e){}

 
  try{var st=document.createElement('style');st.id='natifCss';
    st.textContent='html,body{background:#000;overscroll-behavior:none;-webkit-text-size-adjust:100%;text-size-adjust:100%;'+
      '-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}'+
      'input,textarea,[contenteditable]{-webkit-user-select:text;user-select:text}';
    (document.head||document.documentElement).appendChild(st);}catch(e){}
  var barre=function(){try{if(P.StatusBar)P.StatusBar.hide();}catch(e){}};
  barre();
  document.addEventListener('visibilitychange',function(){if(!document.hidden)barre();});

 
  try{var sw=navigator.serviceWorker;
    if(sw){sw.register=function(){return Promise.reject(new Error('service worker coupé dans l’app'));};
      if(sw.getRegistrations)sw.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister();});}).catch(function(){});}
  }catch(e){}







  try{var fetch0=window.fetch;
    if(fetch0)window.fetch=function(u){
      var p=fetch0.apply(this,arguments),a=typeof u==='string'?u:String((u&&u.url)||'');
      if(/^[a-z][a-z0-9+.-]*:/i.test(a)&&a.indexOf(ICI)!==0)return p;
      return p.then(function(r){
        if(r&&r.status===0&&r.type!=='opaque'&&r.type!=='error'&&r.type!=='opaqueredirect'){
          try{return new Response(r.body,{status:200,statusText:'OK',headers:r.headers});}catch(e){}}
        return r;});};
  }catch(e){}

 
  var interne=function(u){try{return new URL(u,location.href).origin===ICI;}catch(e){return false;}};
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;
    var h=a.getAttribute('href')||'';if(h.charAt(0)==='#')return;
    if(a.target==='_blank'||!interne(a.href)){e.preventDefault();e.stopPropagation();dit('lien bloqué',a.href);}
  },true);
  document.addEventListener('submit',function(e){var f=e.target;
    if(f&&f.action&&!interne(f.action)){e.preventDefault();dit('formulaire bloqué',f.action);}},true);
  var wo=window.open;
  window.open=function(u){if(u&&!interne(String(u))){dit('window.open bloqué',u);return null;}return wo.apply(window,arguments);};






  var AC0=window.AudioContext||window.webkitAudioContext,CTX=[],baisseT=0;
  if(AC0)try{
    var AC=function(){var c=Reflect.construct(AC0,arguments,new.target||AC);CTX.push(c);return c;};
    AC.prototype=AC0.prototype;Object.setPrototypeOf(AC,AC0);
    var su=AC0.prototype.suspend,re=AC0.prototype.resume;
 
    AC0.prototype.suspend=function(){this.__ccVeille=true;var me=this,args=arguments,reste=baisseT?baisseT+100-Date.now():0;
      if(reste>0&&reste<=100)return new Promise(function(ok){setTimeout(function(){ok(me.__ccVeille&&me.state==='running'?su.apply(me,args):undefined);},reste);});
      return su.apply(this,arguments);};
    AC0.prototype.resume=function(){this.__ccVeille=false;return re.apply(this,arguments);};
    window.AudioContext=AC;if(window.webkitAudioContext)window.webkitAudioContext=AC;
  }catch(e){dit('déverrouillage audio indisponible',e&&e.message);}




  var autreParInterruption=function(){if(window.__ccAutreSon===2)return false; if(window.__ccAutreSon===1)return true;if(document.hidden)return false;
    for(var i=0;i<CTX.length;i++){var c=CTX[i];if(c&&c.state==='interrupted'){window.__ccAutreSon=1;window.__ccAutreSonJS=1;
      try{window.__ccNote&&window.__ccNote('son','contexte interrompu, page visible : une autre app a pris le son → jeu muet');}catch(e){}
      try{window.dispatchEvent(new CustomEvent('cc:autreson',{detail:{on:1}}));}catch(e){}return true;}}
    return false;};
  var reveil=function(){if(autreParInterruption())return; 
    for(var i=0;i<CTX.length;i++){var c=CTX[i];if(!c||c.state==='closed')continue;
      if(c.state!=='running'&&!c.__ccVeille){try{var p9=re.call(c);if(p9&&p9.catch)p9.catch(function(e){dit('son pas relancé',e&&e.message);});}catch(e){}} 
      if(!c.__ccAmorce&&c.state!=='closed'){try{var b=c.createBuffer(1,1,22050),s=c.createBufferSource();
        s.buffer=b;s.connect(c.destination);s.start(0);c.__ccAmorce=true;}catch(e){}}}
  };
  ['touchend','pointerup','click','keydown'].forEach(function(t){addEventListener(t,reveil,{capture:true,passive:true});});


  var reessais=function(){[0,250,800,2000].forEach(function(d){setTimeout(function(){if(!document.hidden)reveil();},d);});};
  document.addEventListener('visibilitychange',function(){if(!document.hidden)reessais();});
  addEventListener('ccActif',reessais);








  var FONDU=!/[?&]fondu=0\b/.test(location.search);try{if(localStorage.getItem('ccFondu0'))FONDU=false;}catch(e){}
  var AN=window.AudioNode,cn0=AN&&AN.prototype.connect,DN=window.AudioDestinationNode;
  var sortieDe=function(c){var g=c.__ccSortie;if(!g&&cn0){try{g=c.createGain();cn0.call(g,c.destination);c.__ccSortie=g;}catch(e){g=null;}}return g;};
  if(FONDU&&cn0&&DN)try{AN.prototype.connect=function(d){
    if(d instanceof DN&&d.context&&CTX.indexOf(d.context)>=0){var g=sortieDe(d.context);if(g&&g!==this)arguments[0]=g;}
    return cn0.apply(this,arguments);};}catch(e){dit('fondu de sortie indisponible',e&&e.message);}
  var rampe=function(c,v,tau,delai){var g=c.__ccSortie;if(!g||c.state==='closed')return;
    try{var P=g.gain,t=c.currentTime,t1=t+(delai||0);P.cancelScheduledValues(t);P.setValueAtTime(P.value,t);
      if(v===0)P.setTargetAtTime(0,t,tau);else{P.setTargetAtTime(1,t1,tau);P.setValueAtTime(1,t1+tau*6);}}catch(e){}};
  var baisse=function(){if(!FONDU||baisseT)return;baisseT=Date.now()||1;CTX.forEach(function(c){rampe(c,0,.03);});};
  var releve=function(delai){if(!baisseT)return;baisseT=0;CTX.forEach(function(c){rampe(c,1,.05,delai);});};
  addEventListener('ccInactif',baisse);
  addEventListener('ccActif',function(){releve(0);});
  document.addEventListener('pause',baisse);
  document.addEventListener('visibilitychange',function(){if(document.hidden)baisse();else releve(.15);},true);
  ['touchstart','pointerdown'].forEach(function(t){addEventListener(t,function(){releve(0);},{capture:true,passive:true});});







  var veilN=0,visT=Date.now();
  document.addEventListener('visibilitychange',function(){if(!document.hidden)visT=Date.now();},true);
  addEventListener('ccActif',function(){visT=Date.now();});
  setInterval(function(){try{
    for(var k9=CTX.length-1;k9>=0;k9--){if(!CTX[k9]||CTX[k9].state==='closed')CTX.splice(k9,1);} 
    if(document.hidden||Date.now()-visT<900)return; 
    var fait=[];
    if(autreParInterruption())return;
    if(baisseT&&Date.now()-baisseT>900){releve(0);fait.push('fondu relevé');}
    for(var i=0;i<CTX.length;i++){var c=CTX[i];if(!c||c.state==='closed')continue;
      var g=c.__ccSortie;if(g&&!baisseT&&c.state==='running'&&g.gain.value<.9){var v0=g.gain.value;rampe(c,1,.05,0);fait.push('gain de sortie '+v0.toFixed(2)+' → 1');}




      if(c.state==='running'&&!baisseT){var h9=c.currentTime;if(c.__ccH===h9&&Date.now()-(c.__ccCoup||0)>5000){c.__ccCoup=Date.now();
          (function(cx,ix){try{var q9=su.call(cx);var suite=function(){try{var r9=re.call(cx);if(r9&&r9.catch)r9.catch(function(){});}catch(e){}};if(q9&&q9.then)q9.then(suite,suite);else suite();}catch(e){}})(c,i);
          fait.push('contexte '+i+' running mais horloge arrêtée : endormi puis réveillé');}
        c.__ccH=h9;}else c.__ccH=-1;
      if(c.state!=='running'&&!c.__ccVeille&&window.__ccAutreSon!==1){try{var p9=re.call(c);if(p9&&p9.catch)p9.catch(function(){});}catch(e){}fait.push('contexte '+i+' '+c.state+' relancé');}}
    if(typeof window.__ccSonVeut==='function'&&window.__ccSonVeut()){try{window.__ccSonReveil();}catch(e){}fait.push('contexte du jeu endormi alors que le jeu veut du son : réveil');}
    if(fait.length&&veilN<6&&window.__ccNote){veilN++;window.__ccNote('son','veilleur : '+fait.join(' · ')+' · états '+CTX.map(function(c){return c?c.state+(c.__ccVeille?'(veille)':''):'-';}).join(','));}
  }catch(e){}},700); 




  var cache=function(){try{if(P.SplashScreen)P.SplashScreen.hide({fadeOutDuration:250});}catch(e){}};
  if(document.readyState!=='loading')setTimeout(cache,60);else document.addEventListener('DOMContentLoaded',function(){setTimeout(cache,60);});
  setTimeout(cache,30000);
 
  document.addEventListener('cc:revele',function(){try{if(P.SerpentNatif)P.SerpentNatif.retire();}catch(e){}});



  try{if(P.SerpentNatif&&P.SerpentNatif.montre){var pm=P.SerpentNatif.montre();if(pm&&pm.catch)pm.catch(function(){});}}catch(e){}







  var musSauve=null;
  var ctxDort=function(){
    if(!AC0||!su)return;
    for(var i=0;i<CTX.length;i++){var c=CTX[i];
      if(c&&c.state==='running'&&!c.__ccParti){try{c.__ccParti=true;var p9=su.call(c);if(p9&&p9.catch)p9.catch(function(){});}catch(e){}}}
  };
  var ctxReveil=function(){
    if(!AC0||!re)return;
    for(var i=0;i<CTX.length;i++){var c=CTX[i];
      if(c&&c.__ccParti){c.__ccParti=false;if(c.state!=='closed'&&!c.__ccVeille){try{var p9=re.call(c);if(p9&&p9.catch)p9.catch(function(){});}catch(e){}}}}
  };
  var musVide=function(){try{
    ctxDort();
    var el=document.getElementById('musique');if(!el||musSauve)return;
    var s=el.getAttribute('src');if(!s)return;
    musSauve={s:s,t:el.currentTime||0};
    el.pause();el.removeAttribute('src');el.load();
    if(navigator.audioSession)navigator.audioSession.type='ambient';
    if(navigator.mediaSession){navigator.mediaSession.metadata=null;navigator.mediaSession.playbackState='none';}
    dit('musique : source retirée (arrière-plan)');
  }catch(e){}};
  var musRend=function(){try{
    ctxReveil();
    var m=musSauve;musSauve=null;if(!m)return;
    var el=document.getElementById('musique');if(!el||el.getAttribute('src'))return;
    el.src=m.s;
    el.addEventListener('loadedmetadata',function r(){el.removeEventListener('loadedmetadata',r);try{if(m.t>0&&m.t<(el.duration||1e9))el.currentTime=m.t;}catch(e){}});
    dit('musique : source rendue');
  }catch(e){}};
 
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){var reste=baisseT?baisseT+100-Date.now():0;
      if(reste>0&&reste<=100)setTimeout(function(){if(document.hidden)musVide();},reste);else musVide();}
    else musRend();},true);
  addEventListener('pagehide',musVide);













  var MAJ='https://raw.githubusercontent.com/sachaberes-lgtm/CAR-CASH-GIT/app-maj/';
  var U=P.CapacitorUpdater;
  if(U){
    var vSup=function(a,b){a=String(a||'0').split('.');b=String(b||'0').split('.');
      for(var i=0;i<Math.max(a.length,b.length);i++){var x=+a[i]||0,y=+b[i]||0;if(x!==y)return x>y;}return true;};
    var lire=function(u){var H=P.CapacitorHttp;
      if(H&&H.get)return H.get({url:u,headers:{'Cache-Control':'no-cache'}}).then(function(r){
        if(r.status!==200)throw new Error('HTTP '+r.status);return typeof r.data==='string'?JSON.parse(r.data):r.data;});
      return fetch(u,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();});};





    var ls=function(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}return null;};
    var refus=function(){try{return JSON.parse(ls('ccMajRefus')||'[]');}catch(e){return [];}};
    var ici0=fetch('maj.json',{cache:'no-store'}).then(function(r){return r.json();}).catch(function(){return {};});
    var bilanEssai=function(){var essai=ls('ccMajEssai');if(!essai)return Promise.resolve();
      return ici0.then(function(ici){
        if(ici.version===essai){ls('ccMajEssai',null);dit('maj : la version '+essai+' a démarré');return;}
        return U.getNextBundle().then(function(n){if(n&&n.version===essai)return;
          var r=refus();if(r.indexOf(essai)<0)r.push(essai);ls('ccMajRefus',JSON.stringify(r.slice(-20)));ls('ccMajEssai',null);
          dit('maj : la version '+essai+' a échoué, elle ne sera plus retentée');}).catch(function(){});});};
    var majVerif=function(){
      if(navigator.onLine===false)return;
      var der;
      Promise.all([ici0,U.getBuiltinVersion().catch(function(){return {};}),lire(MAJ+'latest.json?t='+Date.now())])
      .then(function(t){var ici=t[0]||{},natif=(t[1]||{}).version;der=t[2]||{};
        if(!der.version||!der.manifest||der.version===ici.version){dit('maj : à jour',ici.version);return null;}




        if(der.date&&ici.date&&Date.parse(der.date)<=Date.parse(ici.date)){dit('maj : '+der.version+' est plus ancienne que cette app, ignorée');return null;}
        if(refus().indexOf(der.version)>=0){dit('maj : '+der.version+' a déjà échoué ici, ignorée');return null;}
        if(der.natifMin&&!vSup(natif,der.natifMin)){dit('maj : demande une app plus récente',der.natifMin,natif);return null;}
        return U.list().then(function(l){
          var deja=((l&&l.bundles)||[]).filter(function(b){return b.version===der.version&&b.status!=='error'&&b.status!=='deleted'&&b.status!=='deleting';})[0];
          if(deja)return deja;
          dit('maj : téléchargement',der.version);
          return U.download({url:MAJ+'latest.json',version:der.version,
            manifest:der.manifest.map(function(e){return {file_name:e.f,file_hash:e.h,download_url:MAJ+'f/'+e.h};})});});})
      .then(function(b){if(b&&b.id)return U.next({id:b.id}).then(function(){ls('ccMajEssai',der.version);dit('maj : prête pour le prochain lancement',der.version);});})
      .catch(function(e){dit('maj : rien',e&&e.message);});};
    var tours=0,guet=setInterval(function(){
      if(!window.__gameReady&&++tours<240)return;clearInterval(guet);
      if(!window.__gameReady)return;
      U.notifyAppReady().catch(function(){});
      setTimeout(function(){bilanEssai().then(majVerif);},4000);},500);

  }




  (function(){
    var t={dcl:null,pret:null},fini=false;
    var ms=function(x){return x==null?'?':Math.round(x);};
    var rapport=function(){
      if(fini)return;fini=true;
      var jeu='en ligne',tr='-',du='-',fi=null;
      try{var R=performance.getEntriesByType('resource');
        for(var i=0;i<R.length;i++)if(/\/jeu(\.[0-9a-f]+)?\.js(\?|$)/.test(R[i].name)){fi=R[i];break;}
        if(fi){tr=Math.round(fi.transferSize||0);du=ms(fi.duration);}}catch(e){}
 
      try{var sc=document.querySelector('script[src*="jeu."]');if(sc||fi)jeu='fichier';}catch(e){}
      var m='jeu '+jeu+' · origine→DCL '+ms(t.dcl)+' ms · origine→prêt '+ms(t.pret)+' ms · DCL→prêt '+ms(t.pret==null||t.dcl==null?null:t.pret-t.dcl)+' ms'+
        (fi?' · jeu.js transfert '+tr+' o, durée '+du+' ms (début '+ms(fi.startTime)+', fin '+ms(fi.responseEnd)+')':(jeu==='fichier'?' · jeu.js : aucune entrée resource':''));
      dit('CHARGEMENT '+m);
      try{if(window.__ccNote)window.__ccNote('chargement',m);}catch(e){}
    };
    var pret=function(){if(t.pret!=null)return;t.pret=performance.now();setTimeout(rapport,300);};
    document.addEventListener('DOMContentLoaded',function(){t.dcl=performance.now();});
    var v=window.__gameReady;
    if(v){pret();}
    else{try{Object.defineProperty(window,'__gameReady',{configurable:true,enumerable:true,get:function(){return v;},set:function(x){v=x;if(x)pret();}});}catch(e){}
      var n=0,g=setInterval(function(){if(window.__gameReady)pret();if(t.pret!=null||++n>400)clearInterval(g);},50);}
  })();





  (function(){
    var gardes=[];
    var efface=function(){try{var M=navigator.mediaSession;if(!M)return;M.metadata=null;M.playbackState='none';
      ['play','pause','stop','seekbackward','seekforward','seekto','previoustrack','nexttrack'].forEach(function(a){try{M.setActionHandler(a,null);}catch(e){}});}catch(e){}};
    var decharge=function(){
      if(gardes.length)return;
      try{var L=document.querySelectorAll('audio,video');
        for(var i=0;i<L.length;i++){var el=L[i],src=el.getAttribute('src');
          if(!src)continue;
          gardes.push({el:el,src:src,t:el.currentTime||0,jouait:!el.paused});
          try{el.pause();}catch(e){}
          el.removeAttribute('src');try{el.load();}catch(e){}}}catch(e){}
      efface();
      if(gardes.length)dit('vignette lecture : '+gardes.length+' média(s) déchargé(s)');
    };
    var recharge=function(){
      var G=gardes;gardes=[];
      G.forEach(function(g){try{
        if(g.el.getAttribute('src'))return;
        g.el.setAttribute('src',g.src);g.el.load();
        if(g.t>0)g.el.addEventListener('loadedmetadata',function f(){g.el.removeEventListener('loadedmetadata',f);try{g.el.currentTime=g.t;}catch(e){}});
      }catch(e){}});
      if(G.length)dit('vignette lecture : '+G.length+' média(s) rechargé(s)');
    };
    document.addEventListener('visibilitychange',function(){if(document.hidden)decharge();else recharge();});
    addEventListener('pagehide',decharge);
    addEventListener('pageshow',function(){if(!document.hidden)recharge();});
    document.addEventListener('freeze',decharge);
    window.__ccVignette={decharge:decharge,recharge:recharge};
  })();






  (function(){
    var K='ccVie',lsv=function(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;};
    var av=lsv(K),t0=+lsv(K+'T')||0,mm=null;try{mm=sessionStorage.getItem('ccVieS');}catch(e){}
    if(av==='avant')document.addEventListener('DOMContentLoaded',function(){try{
      window.__ccNote('contexte','page d’avant non fermée proprement ('+(mm?'même session : processus web tué':'nouvelle session : app tuée, redémarrée ou plantée')+') · dernier signe de vie il y a '+Math.round((Date.now()-t0)/1000)+' s');}catch(e){}});
    var pose=function(){lsv(K,document.hidden?'fond':'avant');lsv(K+'T',String(Date.now()));try{sessionStorage.setItem('ccVieS','1');}catch(e){}};
    pose();
    document.addEventListener('visibilitychange',pose);
    document.addEventListener('pause',function(){lsv(K,'fond');});
    document.addEventListener('resume',pose);
    addEventListener('pagehide',function(){lsv(K,'fond');});
    setInterval(function(){if(!document.hidden)lsv(K+'T',String(Date.now()));},15000);
  })();

 
  if(!DEBUG)return;
  var dehors={},nDehors=0,nIci=0;
  var note=function(u,via){if(!u)return;var s=String(u);
    if(/^(data|blob|about|javascript):/i.test(s))return;
    if(interne(s)){nIci++;return;}
    if(!dehors[s]){dehors[s]=1;nDehors++;console.warn('[natif] RÉSEAU HORS DE L’APP ('+via+') : '+s);}};
  try{var f0=window.fetch;if(f0)window.fetch=function(r){note(r&&r.url?r.url:r,'fetch');return f0.apply(this,arguments);};}catch(e){}
  try{var xo=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){note(u,'xhr');return xo.apply(this,arguments);};}catch(e){}
  try{if(navigator.sendBeacon){var sb=navigator.sendBeacon.bind(navigator);navigator.sendBeacon=function(u){note(u,'beacon');return sb.apply(null,arguments);};}}catch(e){}
  ['WebSocket','EventSource'].forEach(function(k){try{var K=window[k];if(!K)return;
    var W=function(u){note(u,k);return Reflect.construct(K,arguments,new.target||W);};W.prototype=K.prototype;Object.setPrototypeOf(W,K);window[k]=W;}catch(e){}});
  try{['HTMLImageElement','HTMLScriptElement','HTMLMediaElement','HTMLSourceElement','HTMLIFrameElement'].forEach(function(n){
    var K=window[n];if(!K)return;var d=Object.getOwnPropertyDescriptor(K.prototype,'src');if(!d||!d.set)return;
    Object.defineProperty(K.prototype,'src',{configurable:true,enumerable:d.enumerable,get:d.get,
      set:function(v){note(v,n.replace(/^HTML|Element$/g,''));return d.set.call(this,v);}});});}catch(e){}
  try{new PerformanceObserver(function(l){l.getEntries().forEach(function(en){note(en.name,'ressource');});}).observe({type:'resource',buffered:true});}catch(e){}
  addEventListener('error',function(e){console.error('[natif] ERREUR JS : '+(e.message||e)+' @ '+(e.filename||'')+':'+(e.lineno||0));});
  addEventListener('unhandledrejection',function(e){var r=e.reason;console.warn('[natif] promesse rejetée : '+(r&&r.message||r));});
  var bilan=function(t){console.log('[natif] BILAN RÉSEAU '+t+' : '+nDehors+' adresse(s) hors de l’app, '+nIci+' chargement(s) locaux'+
    ' · localStorage cashcarSave '+(function(){try{return localStorage.cashcarSave?'présent':'absent';}catch(e){return 'illisible';}})()+
    ' · langue de l’appareil vue par la page : '+navigator.language+' ['+(navigator.languages||[]).join(',')+'] → jeu en '+document.documentElement.lang);};
  setTimeout(function(){bilan('15 s');},15000);setTimeout(function(){bilan('60 s');},60000);

  var nIm=0;(function f(){nIm++;requestAnimationFrame(f);})();
  setInterval(function(){try{var e=document.elementFromPoint(innerWidth/2,innerHeight/2),d=window.dbgState?window.dbgState():null;
    console.log('[natif] POULS '+Math.round(nIm/4)+' i/s · centre '+(e?(e.id?'#'+e.id:e.tagName)+(e.className&&e.className.baseVal===undefined?'.'+String(e.className).split(' ').join('.'):''):'∅')+
      ' · son ['+CTX.map(function(c){return c.state+(c.__ccVeille?'(veille)':'');}).join(',')+']'+
      ' · erreur '+(window.__loopErr||'—')+' · état '+(d?JSON.stringify(d).slice(0,220):'—'));}catch(err){console.log('[natif] POULS ?',err.message);}nIm=0;},4000);
  window.ccNatif={bilan:bilan,dehors:dehors,ctx:CTX};
  dit('colle native prête',navigator.userAgent);
})();
