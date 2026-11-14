/* ===== LE JUGE DU PROFIL DE L'iPHONE (2026-11-14, Sacha : « priorité fluidité, puis qualité max » — passation/qualite/PLAN.md, lot 4) =====
   Le PROFIL (`PRF`, rendu/soleil-planete.js) donne à chaque modèle une CLASSE d'office (1 = 12-13-14 … 4 = 17 et après) et, par le réglage, un NIVEAU d'image (N1-N4). Ici la COURSE vérifie
   que le téléphone tient ce niveau, et sinon pose un PLAFOND DE NIVEAU (`PRF.plaf`, le niveau maximal tenu par ce modèle : `prfApprend`, localStorage `cashcarProfil` v2), appliqué au
   LANCEMENT SUIVANT : rien ne change à chaud (l'échelle QL, la cadence et le gouverneur de chaleur protègent la course en cours). La CLASSE ne bouge plus (2026-11-14, pilote : « baisser la
   classe 4 en 3 ne changeait rien en HAUTE », la classe 3 en HAUTE étant déjà N4 à 60 i/s).
   · On ne juge qu'EN COURSE, hors pause, « au calme » (`pjgCalme`), après les 10 premières secondes, aux états thermiques NOMINAL et FAIR seulement (un téléphone chaud ne dit rien de sa
     puce), JAMAIS en économie d'énergie (iOS y bride aussi la puce, quel que soit le profil), et pour un profil à 60 i/s jamais pendant un calage décidé par la chaleur (`CAD.pq`, cadence.js).
   · La mesure, une fois par seconde : `QLR.p50` (la médiane des 60 dernières images, nettete-qualite.js) rendue à sa durée VRAIE (calé sur 30, l'échelle la lit ramenée à une image
     d'écran : on rajoute `CAD.per − CAD.ecran`), contre la période VISÉE `1000 / PRF.fps`. Lente si > période × 1,15 (× 1,3 en HAUTE : `PRF.T.jugeH`, « quelques accrocs acceptés ») ;
     tenue si < période × 1,05.
     Profil à 60 CALÉ PAR LA CADENCE RÉACTIVE, ou tenu à 30 réguliers non calé (`loop._r30`) : le juge ne réarme RIEN (2026-11-14, contrôle : une sonde réarmée fraîche > 13 ms retenait
     le calage sur 30 pour toute la course, cadence.js) ; il juge l'intervalle médian VRAI des images (le même calcul), contre la période VISÉE : un téléphone qui vise 60 et tourne à 30
     est une seconde lente. Seul un calage décidé par la CHALEUR ou la retenue n'est pas jugé.
   · Une course d'au moins 45 s jugées, lente pendant au moins 40 % d'entre elles = une course LENTE. Deux courses lentes DE SUITE (en moins de 48 h) → plafond = un CRAN sous la référence (`prfK` : N4 → N3 → N3 à 30 → N2 → N1) ;
     la référence = le cran le plus haut tenu pendant au moins la moitié des secondes jugées ; une course où le RÉGLAGE a changé n'est pas jugée. Toute baisse : jamais au-dessus de l'ancien plafond.
     Une course TENUE (au moins 60 s jugées, tenue pendant 80 %) efface le compteur. Les courses entre deux (trop courtes, ni l'un ni l'autre) ne changent rien.
   · Le MUR : le niveau quitté ne se retente qu'après 1, puis 2, 4, 8 jours (à chaque nouvel échec). Mur fini → PRF retente UN CRAN au-dessus DÈS CE LANCEMENT (`PRF.essai`) ; à ce retour UNE
     course lente au-dessus de l'ancien plafond suffit à le reposer ; une course tenue au-dessus monte le plafond d'un cran (et le cran suivant se retente au lancement d'après).
   · LA MÉMOIRE (référence = le statique `PRF.nMax` s'il est ≥ 3, sinon le niveau `PRF.n` ; à partir de N2 : une classe 1 en HAUTE aussi, pilote) : pendant la course, ET SEULEMENT hors pause, app au premier plan, un TÉMOIN EN VOL est posé dans `cashcarProfil` — c'est déjà
     le plafond d'un cran sous la référence, avec son mur, et l'enregistrement d'avant gardé dedans. Il est RETIRÉ (l'enregistrement d'avant revient) à la fin de la course, à la pause (bouton
     ou automatique), et dès que l'app quitte le premier plan : `pause` (Capacitor), `ccInactif` (Swift : appel entrant, sélecteur d'apps, centre de contrôle, verrouillage), `ccSortieSon`,
     `pagehide`, `visibilitychange` caché ; il n'est reposé qu'à la REPRISE effective de la course. Un joueur qui ferme l'app ou un appel entrant ne fait donc JAMAIS baisser ; iOS qui tue
     la page EN PLEINE COURSE (mémoire) laisse le témoin : le lancement suivant part d'un cran plus bas (PRF le lit comme un plafond appris), et ce morceau le note.
     Contexte 3D perdu : seulement EN COURSE, hors pause, au premier plan depuis plus de 5 s, et il en faut DEUX de moins de 2 min (`sessionStorage.ccPjgCtx`, leurs dates, qui survivent au
     rechargement qui suit ; remis à zéro après une baisse).
   · Jamais sous N1. Rien n'est écrit quand un paramètre d'ESSAI fausse la mesure (`?classe` `?prf…` `?cadfps` `?mob_…` `?gouv` `?fps` `?bloom` `?memoire` `?sonde` `?thermo`
     `?palier` `?chaleur` `?banc` `?img` …, voir `PJG.force` ; `?sans=…` n'en fait plus partie, `?perfrec` non plus : les builds de mesure de Sacha l'ont) : on mesure seulement ; `?appareil=iPhone17,1` (le modèle simulé) et les leviers du banc `?jugelent=` `?jugeech=` sont jugés comme un vrai.
   · Journal : une ligne `profil` dans la boîte noire (`window.__ccNote`) à chaque décision. `window.dbgJuge()` décrit, `dbgJuge('oubli')` efface ce que le juge a appris, `dbgJuge('fin')` finit la course (banc).
   · Banc : `?jugelent=N` ajoute N ms de travail à chaque image calculée en course (un téléphone lent simulé) ; `?jugeech=0.25` raccourcit les durées (10 / 45 / 60 s) ; outils/banc-juge/juge.cjs.
   `?sans=prfjuge` = pas de juge. L'ordinateur et tout appareil hors profil (`PRF.on` faux) : rien de ce morceau ne tourne. */
const PJG=(function(){const q=location.search,ech=Math.max(.05,Math.min(1,+((/[?&]jugeech=([\d.]+)/.exec(q)||[])[1])||1));
  return {on:!!PRF.on&&!/[?&]sans=[^&]*prfjuge/.test(q),
    force:/[?&](classe|prf[a-z0-9_]*|cadfps|gouv|fps|bloom|memoire|sonde|thermo|chaleur|palier|banc|poste|img|imgsans|imgplus|sobre|tel|eco|cad30|cad_e30|ql|qldepart|dpr|mob_[a-z0-9_]+)(=|&|$)/i.test(q), /* (2026-11-14, D4) les paramètres d'ESSAI : on mesure, on n'écrit rien (la liste précise ; `sans=` et `perfrec` jugés comme un vrai) */
    ech:ech,lent:Math.min(200,+((/[?&]jugelent=(\d+)/.exec(q)||[])[1])||0),
    T:{debut:10*ech,lente:45*ech,tenue:60*ech,kLent:1.15,kTenu:1.05,pLent:.4,pTenu:.8,pRef:.5,murJ:[1,2,4,8],lH:48,grace:5000,ctxN:2,ctxAge:120000}, /* tout se règle ici (secondes jugées, parts, jours, heures, ms) ; HAUTE : PRF.T.jugeH */
    t:0,t0:0,crs:false,sec:0,lentS:0,bonS:0,chaud:0,eco:0,cale:0,pS:0,kS:[0,0,0,0,0,0],q0:'',chg:false,vol:false,volR:null,fait:false,dern:null,dec:[],inactif:false,retT:0,vuP:false};})();
function pjgEcrit(){return PJG.on&&!PJG.force&&PRF.c0>=1&&!!PRF.modele;} /* le juge peut-il écrire ? */
function pjgLit(){const a=prfLit();return a&&a.m===PRF.modele?a:null;} /* l'enregistrement de CE modèle (une sauvegarde d'un autre iPhone ne compte pas) */
function pjgPose(plus){try{const a=Object.assign(pjgLit()||{v:2},plus,{v:2,m:PRF.modele,t:Date.now()});localStorage.setItem('cashcarProfil',JSON.stringify(a));return a;}catch(e){return null;}} /* sans changer le plafond (sauf `plaf` dans plus) */
function pjgNote(m){PJG.dec.push({t:Math.round(performance.now()/1000),m:m});if(PJG.dec.length>12)PJG.dec.shift();try{window.__ccNote('profil','juge : '+m);}catch(e){}}
function pjgMur(n){const J=PJG.T.murJ,j=J[Math.max(0,Math.min(J.length,n)-1)];return {n:n,j:j,fin:Date.now()+j*864e5};}
function pjgL(a){return a&&a.l>0&&a.lT&&Date.now()-a.lT<PJG.T.lH*36e5?a.l|0:0;} /* le compteur de courses lentes, s'il a moins de 48 h */
function pjgK(){return PRF.haute()?PRF.T.jugeH:PJG.T.kLent;} /* le seuil « lente » du réglage */
function pjgKTx(k){const d=prfDeK(k);return k>=5?'N4':'N'+d.plaf+(d.pf?' à '+d.pf:'');} /* un cran en clair */
function pjgNivRef(){return PRF.nMax>=3?PRF.nMax:PRF.n;} /* le NIVEAU de référence de la MÉMOIRE (témoin, contexte) : le statique s'il est PC, sinon le niveau courant (classe 1 en HAUTE : N2) */
function pjgKN(L){return prfKPlaf(L,0);} /* le cran d'un NIVEAU sans borne de cadence (N3 = le cran 4 : la cadence de la table) — la MÉMOIRE ne juge pas la cadence */
function pjgNouv(a,cible){return Math.min(a&&a.plaf?prfKPlaf(a.plaf,a.pf):5,cible);} /* (2026-11-14) le nouveau cran : JAMAIS au-dessus de l'ancien plafond (retentative) */
function pjgBaisse(pq,ref,cible){ /* le plafond au cran `cible` (défaut : un cran sous le CRAN `ref`, prfK), au prochain lancement, avec son mur ; vrai si écrit */
  if(!pjgEcrit()||PJG.fait)return false;if(cible==null)cible=ref-1;
  if(ref<=1){pjgPose({l:0,lT:0});pjgNote(pq+' · déjà au N1 : rien de plus bas');PJG.fait=true;return false;}
  const a=pjgLit(),m=pjgMur(((a&&a.mur&&a.mur.n)|0)+1),k=pjgNouv(a,cible),d=prfDeK(k);
  prfApprend(d.plaf,{pf:d.pf,mur:m,l:0,lT:0,vol:null});PJG.fait=true;
  pjgNote('plafond '+pjgKTx(ref)+' → '+pjgKTx(k)+' au prochain lancement : '+pq+' · le cran au-dessus se retentera dans '+m.j+' j');return true;}
function pjgVol(on){ /* LE TÉMOIN EN VOL (voir plus haut) : posé = le plafond d'un cran sous le statique, déjà écrit ; retiré = l'enregistrement d'avant rendu */
  if(on){const L=pjgNivRef(),ref=pjgKN(L);if(PJG.vol||PJG.fait||L<2||!pjgEcrit())return;let r=null;try{r=localStorage.getItem('cashcarProfil');}catch(e){}
    const a=pjgLit(),t=Date.now(),d=prfDeK(pjgNouv(a,pjgKN(L-1)));PJG.volR=r;PJG.vol=true;
    try{localStorage.setItem('cashcarProfil',JSON.stringify({v:2,m:PRF.modele,t:t,plaf:d.plaf,pf:d.pf,mur:pjgMur(((a&&a.mur&&a.mur.n)|0)+1),l:0,lT:0,vol:{t:t,de:ref,r:r}}));}catch(e){}return;}
  if(!PJG.vol)return;PJG.vol=false;try{if(PJG.volR==null)localStorage.removeItem('cashcarProfil');else localStorage.setItem('cashcarProfil',PJG.volR);}catch(e){}PJG.volR=null;}
function pjgQuitte(){PJG.inactif=true;pjgVol(false);} /* (D1) l'app quitte le premier plan (ou la sortie son disparaît) : plus de témoin jusqu'à la reprise de la course */
function pjgRevient(){PJG.inactif=false;PJG.retT=performance.now();} /* retour au premier plan : le témoin attend la reprise (hors pause) ; la grâce du contexte part d'ici */
function pjgDepart(){ /* au lancement : le témoin d'une page tuée, ou un mur fini */
  if(!pjgEcrit())return;const a=pjgLit();if(!a)return;
  if(a.vol){const de=a.vol.de|0,j=a.mur&&a.mur.j,k=prfKPlaf(a.plaf,a.pf);a.vol=null;try{localStorage.setItem('cashcarProfil',JSON.stringify(a));}catch(e){}
    pjgNote('page tuée en pleine course (témoin retrouvé) : plafond '+pjgKTx(de)+' → '+pjgKTx(k)+' dès ce lancement'+(j?' · le cran au-dessus se retentera dans '+j+' j':''));return;}
  if(PRF.essai){const k=prfKPlaf(a.plaf,a.pf);pjgNote('mur fini : plafond '+pjgKTx(k)+' → '+pjgKTx(k+1)+' retenté dès ce lancement (une course lente au-dessus suffira à le reposer)');}}
function pjgFin(){ /* la course vient de finir : son verdict */
  pjgVol(false);const S=PJG,T=S.T,sec=S.sec,k=pjgK();
  let ref=0;for(let r=5,c=0;r>=1;r--){c+=S.kS[r];if(sec&&c>=sec*T.pRef){ref=r;break;}} /* (2026-11-14) la référence : le cran le plus haut tenu pendant au moins la moitié des secondes jugées */
  const lente=!S.chg&&sec>=T.lente&&S.lentS>=sec*T.pLent,tenue=!S.chg&&!lente&&sec>=T.tenue&&S.bonS>=sec*T.pTenu;
  S.dern={sec:sec,lente:S.lentS,tenue:S.bonS,chaud:S.chaud,eco:S.eco,cale:S.cale,p50:sec?+(S.pS/sec).toFixed(1):0,vise:PRF.fps,seuil:+(1000/PRF.fps*k).toFixed(1),niveau:PRF.n,cran:ref,reglageChange:S.chg,
    verdict:S.chg?'réglage changé : pas jugée':lente?'lente':tenue?'tenue':sec<T.lente?'trop courte':'entre deux'};
  if(!pjgEcrit()||S.fait||S.chg||!ref)return;
  const a=pjgLit()||{},l=pjgL(a),k0=a.plaf?prfKPlaf(a.plaf,a.pf):5,essai=PRF.essai&&!!a.plaf&&ref>k0,txt=Math.round(100*S.lentS/Math.max(1,sec))+' % de '+sec+' s au-dessus de '+(1000/PRF.fps*k).toFixed(1).replace('.',',')+' ms ('+pjgKTx(ref)+', '+PRF.fps+' i/s visés'+(PRF.haute()?', HAUTE':'')+')';
  if(lente){if(essai||l+1>=2)pjgBaisse((essai?'au retour, une course lente : ':'deux courses lentes de suite : ')+txt,ref);
    else{pjgPose({l:l+1,lT:Date.now()});pjgNote('course lente '+(l+1)+'/2 : '+txt);}return;}
  if(tenue&&(l>0||essai)){const d=prfDeK(Math.min(5,k0+1)); /* au retour, tenue au-dessus : le plafond monte d'UN cran (aucun au-delà du N4) */
    pjgPose(essai?{l:0,lT:0,plaf:d.plaf>=4?null:d.plaf,pf:d.plaf>=4?0:d.pf}:{l:0,lT:0});if(essai)PRF.essai=false;
    pjgNote('course tenue ('+Math.round(100*S.bonS/Math.max(1,sec))+' % de '+sec+' s, '+pjgKTx(ref)+') : compteur effacé'+(essai?', plafond '+pjgKTx(k0)+' → '+(d.plaf>=4?'aucun':pjgKTx(k0+1)):''));}}
function pjgCalme(now){ /* « au calme » comme CAD.calme (ni page cachée, ni reconstruction de zone, ni 30 Hz imposé) — sauf que CALÉ sur 30, des images régulières de 33 ms « ramenées »
   (`loop._r30`) ne sont pas un écran bridé (il donnerait 16,7) : c'est un téléphone tenu à 20 i/s, et ça se juge ; un profil à 60 à 30 réguliers se juge contre sa période visée (prfJuge) */
  return !document.hidden&&now-(loop._rebuildT||0)>(loop._rebuildD||2500)&&(!loop._r30||CAD.on||PRF.fps===60);}
function prfJuge(now){ /* appelé par cadFin à chaque image calculée ; ne juge qu'une fois par seconde */
  if(PJG.lent>0&&started&&running&&!gameOver&&!paused&&!garageOn){const f=performance.now()+PJG.lent;while(performance.now()<f){}} /* (banc) le téléphone lent simulé */
  if(now-PJG.t<1000)return;PJG.t=now;
  const enCourse=started&&running&&!gameOver&&!garageOn;
  if(!enCourse){if(PJG.crs){PJG.crs=false;pjgFin();}return;}
  if(!PJG.crs){PJG.crs=true;PJG.t0=now;PJG.sec=PJG.lentS=PJG.bonS=PJG.chaud=PJG.eco=PJG.cale=PJG.pS=0;PJG.kS.fill(0);PJG.q0=PRF.q;PJG.chg=false;}
  if(PRF.q!==PJG.q0)PJG.chg=true; /* (2026-11-14) le réglage a changé pendant la course : elle ne sera pas jugée */
  if(paused){PJG.vuP=true;if(PJG.vol)pjgVol(false);return;} /* (D1) en pause : pas de témoin */
  if(PJG.vuP){PJG.vuP=false;PJG.inactif=false;} /* la course a REPRIS (un geste du joueur : l'app est au premier plan) */
  if(!PJG.vol&&!document.hidden&&!PJG.inactif)pjgVol(true);
  if(now-PJG.t0<PJG.T.debut*1000||!pjgCalme(now)||CAD.force)return;
  if((MOB_S.thermo|0)>=2){PJG.chaud++;return;}
  if(mobEco()){PJG.eco++;return;} /* (D3) l'économie d'énergie bride la puce : jamais jugée, quel que soit le profil */
  const per=1000/PRF.fps;
  if(PRF.fps===60&&CAD.on&&(CAD.pq!=='reactif'||mobChaud())){PJG.cale++;return;} /* calé par la chaleur ou la retenue : ne dit rien de la puce */
  const p=QLR.p50+((CAD.on||CAD.eco)?CAD.per-CAD.ecran:0); /* l'intervalle médian VRAI des 60 dernières images (la boucle le ramène à une image d'écran quand c'est calé) ; calé réactif ou 30 réguliers en visant 60 = lent (2026-11-14 : rien n'est réarmé) */
  PJG.sec++;PJG.pS+=p;PJG.kS[prfK(PRF.n,PRF.fps)]++;if(p>per*pjgK())PJG.lentS++;else if(p<per*PJG.T.kTenu)PJG.bonS++;}
function pjgCtxLit(){let a=[];try{a=JSON.parse(sessionStorage.ccPjgCtx||'[]');}catch(e){}const t=Date.now();return Array.isArray(a)?a.filter(function(x){return x>0&&t-x<PJG.T.ctxAge;}):[];} /* les pertes de moins de 2 min */
function pjgCtx(){ /* (D2) le contexte 3D est perdu : une perte qui compte = en course, hors pause, au premier plan depuis plus de 5 s ; deux de moins de 2 min → un cran sous la référence */
  pjgVol(false);if(!pjgEcrit()||PJG.fait)return;
  const now=performance.now(),enC=started&&running&&!gameOver&&!garageOn&&!paused;
  if(document.hidden||PJG.inactif||!enC||now-PJG.retT<PJG.T.grace){pjgNote('contexte 3D perdu '+(!enC?'hors course':'juste après un retour au premier plan')+' : ne compte pas');return;}
  const L=pjgCtxLit();L.push(Date.now());const n=L.length;try{sessionStorage.ccPjgCtx=JSON.stringify(L);}catch(e){}
  if(n<PJG.T.ctxN){pjgNote('contexte 3D perdu en course (N'+PRF.n+', statique N'+PRF.nMax+') : '+n+'/'+PJG.T.ctxN+' en 2 min');return;}
  const nr=pjgNivRef();
  if(nr>=2){if(pjgBaisse(n+' pertes du contexte 3D en course en 2 min (N'+PRF.n+', statique N'+PRF.nMax+')',pjgKN(nr),pjgKN(nr-1)))try{sessionStorage.removeItem('ccPjgCtx');}catch(e){}} /* remis à zéro après une baisse */
  else pjgNote('contexte 3D perdu '+n+' fois en course, N'+PRF.n+' : rien à baisser');}
if(PJG.on){pjgDepart();
  document.addEventListener('visibilitychange',function(){if(document.hidden)pjgQuitte();else pjgRevient();});
  window.addEventListener('pagehide',pjgQuitte);document.addEventListener('pause',pjgQuitte);window.addEventListener('ccInactif',pjgQuitte);window.addEventListener('ccSortieSon',pjgQuitte);
  window.addEventListener('ccActif',pjgRevient);document.addEventListener('resume',pjgRevient);
  renderer.domElement.addEventListener('webglcontextlost',pjgCtx,false);}
window.dbgJuge=function(o){
  if(o==='fin'){try{if(started&&!gameOver)endGame();}catch(e){}return 'course finie (QUITTER)';} /* (banc) finir la course proprement */
  if(o==='oubli'){try{localStorage.removeItem('cashcarProfil');sessionStorage.removeItem('ccPjgCtx');}catch(e){}PJG.volR=null;PJG.vol=false;PJG.fait=false;return 'oublié : le prochain lancement repart sans plafond';}
  const S=PJG,ctx=pjgCtxLit().length;
  return {on:S.on,ecrit:pjgEcrit(),force:S.force,classe:PRF.c,classeModele:PRF.c0,modele:PRF.modele,niveau:PRF.n,niveauMax:PRF.nMax,plafond:PRF.plaf,plafFps:PRF.plafFps,essai:PRF.essai,fps:PRF.fps,haute:PRF.q==='haute',
    seuil:+(1000/PRF.fps*pjgK()).toFixed(1),T:S.T,lentBanc:S.lent,course:{en:S.crs,sec:S.sec,lente:S.lentS,tenue:S.bonS,chaud:S.chaud,eco:S.eco,cale:S.cale,crans:S.kS.slice(1),reglageChange:S.chg,p50:S.sec?+(S.pS/S.sec).toFixed(1):0},
    dernier:S.dern,decisions:S.dec.slice(),temoin:S.vol,inactif:S.inactif,retour:S.retT?Math.round(performance.now()-S.retT):null,ctxSeance:ctx,fait:S.fait,
    memoire:(function(){try{return JSON.parse(localStorage.getItem('cashcarProfil')||'null');}catch(e){return null;}})(),
    cadence:{on:CAD.on,pq:CAD.pq||null,eco:!!CAD.eco,vise:prf60()?60:30,chaud:mobChaud()},thermo:MOB_S.thermo,capteur:MOB_S.capteur};};
