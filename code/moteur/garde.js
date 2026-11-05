/* ===== LA GARDE (2026-11-05, Fable : « HYG-03 : garde(zone, fn) qui exécute, attrape, journalise dans __ccNote (zone, message, compteur) et ne relance pas
   la même erreur plus d'une fois par minute ») =====
   92 % des 1 690 try/catch du jeu sont muets : une sauvegarde qui échoue, une chaîne d'aura perdue, une boutique figée, un graphe audio à moitié
   branché ne laissaient aucune trace. `garde(zone, fn, repli)` exécute fn ; si elle jette, la panne est COMPTÉE par (zone, message), écrite dans la
   boîte noire (`__ccNote('garde', …)`, visible dans VERSION › boîte noire) au plus une fois par minute pour la même signature, et `repli` est rendu.
   Elle ne remplace que les catch DANGEREUX (la liste du rapport hygiène) : les 1 670 autres restent tels quels. `dbgGarde()` : les compteurs. */
const GARDE={n:{},t:{},min:60000};
function gardeNote(zone,e){ /* compte la panne ; l'écrit (boîte noire + console) au plus une fois par minute par signature ; rend vrai si écrite */
  const msg=String((e&&e.message)||e||'?').slice(0,160),cle=zone+'|'+msg,t=Date.now();
  GARDE.n[cle]=(GARDE.n[cle]||0)+1;
  if(t-(GARDE.t[cle]||0)<GARDE.min)return false;
  GARDE.t[cle]=t;
  try{window.__ccNote('garde',zone+' · '+msg+(GARDE.n[cle]>1?' (×'+GARDE.n[cle]+')':''),(e&&e.stack?String(e.stack).split('\n').slice(1,3).join(' ¶ '):''));}catch(_){}
  try{console.warn('garde · '+zone,e);}catch(_){}
  return true;}
function garde(zone,fn,repli){try{return fn();}catch(e){gardeNote(zone,e);return repli;}}
window.dbgGarde=function(vider){if(vider){GARDE.n={};GARDE.t={};}return Object.assign({},GARDE.n);};
/* ===== LE CHIEN DE GARDE DE LA BOUCLE (2026-11-05, Fable : « GP-01 / HYG-05 : un try par tranche, un compteur d'erreurs consécutives ; 3 de suite dans la même
   tranche = explosion + endGame propre + note dans __ccNote ») =====
   loop() tient sa simulation dans cinq try (voir moteur/boucle-1.js) : départ · physique (conduite + physique) · effets · sons · hud. Chaque panne
   passe ici : notée dans la boîte noire avec sa tranche, dite UNE fois en console par signature, comptée par tranche — le compteur d'une tranche
   retombe dès qu'une image passe sans panne (bouclePasse, en fin de simulation). Trois images de suite en panne dans la même tranche = la caisse
   EXPLOSE (explode('panne') : l'écran de fin, la sauvegarde versée, REJOUER) ; si l'explosion elle-même échoue, endGame() de secours. Le filet NaN
   du 2026-11-03 (vitesse, côté, cap non finis → 0 ; position s non finie → fin de partie) reste, dans toutes les tranches.
   Banc : `dbgBoucle('physique')` fait jeter la tranche à la prochaine image (3 fois) ; `dbgBoucle()` décrit. */
const BTR={n:{},vu:{},img:1,max:3,test:null,dern:''};
function boucleTest(tr){if(BTR.test&&BTR.test.tr===tr){if(--BTR.test.n<=0)BTR.test=null;throw new Error('banc : panne forcée dans la tranche '+tr);}}
function bouclePanne(tr,err){
  const msg=String((err&&err.message)||err||'?'),pile=(err&&err.stack?String(err.stack):'').split('\n');
  window.__loopErr=tr+' · '+msg+' | '+pile.slice(0,3).join(' ¶ ');
  BTR.vu[tr]=BTR.img;BTR.n[tr]=(BTR.n[tr]||0)+1;
  try{window.__ccNote('boucle',tr+' · '+msg,pile.slice(1,3).join(' ¶ '));}catch(_){}
  {const cle=tr+'|'+msg;if(cle!==BTR.dern){BTR.dern=cle;console.error('boucle · tranche '+tr+' ('+BTR.n[tr]+')',err);}} /* une fois par signature, pas une fois pour toute la session */
  try{if(started&&running&&!gameOver){if(!Number.isFinite(vA))vA=0;if(!Number.isFinite(vL))vL=0;if(!Number.isFinite(lat))lat=0;if(!Number.isFinite(psi))psi=0;
    if(!Number.isFinite(s)){try{window.__ccNote('boucle','état non fini (s) : fin de partie');}catch(_){}endGame();}}}catch(e2){console.error('boucle · secours',e2);}
  if(BTR.n[tr]>=BTR.max&&started&&running&&!gameOver&&mode!=='boom'){
    try{window.__ccNote('boucle','tranche '+tr+' : '+BTR.n[tr]+' images en panne → explosion',msg);}catch(_){}
    BTR.n[tr]=0;
    try{explode('panne');}catch(e3){console.error('boucle · explosion de secours',e3);}
    if(!gameOver&&mode!=='boom'){try{endGame();}catch(e4){console.error('boucle · fin de secours',e4);}}}}
function bouclePasse(){ /* en fin de simulation : une tranche passée sans panne cette image repart de zéro */
  for(const k in BTR.n)if(BTR.vu[k]!==BTR.img)delete BTR.n[k];
  BTR.img++;}
window.dbgBoucle=function(tr,n){if(tr!==undefined)BTR.test=tr?{tr:tr,n:n==null?3:+n}:null;return {tranches:['départ','physique','effets','sons','hud'],pannes:Object.assign({},BTR.n),test:BTR.test,max:BTR.max,derniere:window.__loopErr||''};};
/* (banc, 2026-11-05) dbgJouer() : l'état des gardes du JOUER, puis le même départ que le bouton — pour le banc headless (outils/banc-jury) */
window.dbgJouer=function(){const et={pendingScore:pendingScore,started:started,gameOver:gameOver,garageOn:garageOn,go:!!GAR.go,chute:!!CHUTE.on,chuteGo:!!CHUTE.go,wipe:!!ecranWipe._on,tuto:!!SAVE.d.tuto,sf:sfPlayOk()};
  let r='';try{r=sfPlayOk()?String(classiqueJouer()):(playViaGarage(true),'playViaGarage');}catch(e){r='erreur '+(e&&e.message);}
  return Object.assign(et,{appel:r,goApres:!!GAR.go,chuteGoApres:!!CHUTE.go});};
/* (banc, 2026-11-05) dbgDepartEtat() : où en est la séquence du départ (lâcher, voile, pré-bâti) — pour le banc headless */
window.dbgDepartEtat=function(){const g=GAR.go;return {go:g?{t:+(g.t||0).toFixed(2),chute:!!g.chute,voile:!!g.voile,attend:!!g.attend,son:!!g.son}:null,sous:!!GAR.sous,chuteSous:!!CHUTE.sous,wipe:!!ecranWipe._on,preb:{on:!!PREB.on,W:!!PREB.W,fait:!!PREB.fait,pas:PREB.pas,echecs:PREB.echecs},started:started,running:running,paused:paused,garageOn:garageOn,depart:window.dbgDepart?dbgDepart():null,lier:window.dbgLier?dbgLier().demarrage:null,body:document.body.className.slice(0,100)};};
/* (banc, 2026-11-05, DIR-02) dbgTas() : la mémoire vue du jeu — tas JS, géométries/textures/programmes du moteur, enfants de scène, sons décodés */
window.dbgTas=function(){const m=renderer.info.memory,pm=performance.memory;let son=null;try{son=window.CCSON&&CCSON.etat();}catch(e){}
  return {tasMo:pm?Math.round(pm.usedJSHeapSize/1048576):null,geometries:m.geometries,textures:m.textures,programmes:(renderer.info.programs||[]).length,enfants:scene.children.length,sons:son?son.decodes:null,sonsMo:son?son.mo:null,paquets:son?son.paquets:null};};
/* (banc, 2026-11-05, GP-02) dbgMinuteurs() : les chronos et jauges qui s'égrènent sur l'horloge dtH — pour mesurer leur pente contre l'horloge murale */
window.dbgMinuteurs=function(){return {nitro:+pwrNitroT.toFixed(3),air:+pwrAirT.toFixed(3),vit:+pwrSpdT.toFixed(3),grace:+graceT.toFixed(3),boost:+startBoostT.toFixed(3),fever:+fever.toFixed(3),styleM:+styleM.toFixed(2),comboT:+comboT.toFixed(3),msgT:+msgT.toFixed(3),runxT:+(RUNX.t||0).toFixed(3),frenT:+(FREN.t||0).toFixed(3),fallTR:+fallTR.toFixed(3),inv:+CHANCE.inv.toFixed(3)};};
/* (banc, 2026-11-05) dbgSauvegardeBanc() : le code scellé (ECO-04), la musique remise une fois (SON-05), l'échec de flush qui se dit (HYG-15) — rend l'état, puis remet la vraie sauvegarde */
window.dbgSauvegardeBanc=function(){const R={};const d0=SAVE.export();
  R.codeTelQuel=SAVE.import(d0);R.sceauFaux=SAVE.import(d0.slice(0,-2)+'zz');R.sansSceau=SAVE.import(d0.slice(0,d0.lastIndexOf('.')));
  {const s=JSON.stringify({v:2,bank:1e30,best:1e20,ex:{floor:90},owned:[47,3]});const c=btoa(unescape(encodeURIComponent(s)))+'.'+SAVE.sceau(s);
   R.codeForce=SAVE.import(c);R.bank=SAVE.d.bank;R.best=SAVE.d.best;R.floor=SAVE.d.ex.floor;R.owned=SAVE.d.owned.slice();}
  SAVE.import(d0);
  SND.music=false;SAVE.d.mus=false;R.musRet1=dbgMusRetour(26).n;R.musApres1=SND.music;SND.music=false;SAVE.d.mus=false;R.musRet2=dbgMusRetour(26).n;R.musApres2=SND.music;R.musRetChamp=SAVE.d.musRet;
  SAVE.echec('banc',new Error('essai'));R.panne=SAVE.panne;R.panneDit=!!SAVE.panneDit;
  return R;};
