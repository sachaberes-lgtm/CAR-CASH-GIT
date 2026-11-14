/* ===== LE JUGE DU PROFIL DE L'iPHONE (2026-11-14, Sacha : « priorité fluidité, puis qualité max » — passation/qualite/PLAN.md, lot 4) =====
   Le PROFIL (`PRF`, rendu/soleil-planete.js) donne à chaque modèle une CLASSE d'office (1 = 12-13-14 … 4 = 17 et après). Ici la COURSE vérifie que le téléphone la tient vraiment,
   et sinon fait baisser la classe EFFECTIVE d'un cran (`prfApprend`, localStorage `cashcarProfil`), appliquée au LANCEMENT SUIVANT : rien ne change à chaud (l'échelle QL, la cadence
   et le gouverneur de chaleur protègent la course en cours).
   · On ne juge qu'EN COURSE, hors pause, « au calme » (`pjgCalme`), après les 10 premières secondes, aux états thermiques NOMINAL et FAIR seulement (un téléphone chaud ne dit rien de sa
     puce), et pour un profil à 60 i/s jamais en économie d'énergie (l'écran est à 30) ni pendant un calage décidé par la chaleur (`CAD.pq`, cadence.js).
   · La mesure, une fois par seconde : `QLR.p50` (la médiane des 60 dernières images, nettete-qualite.js) rendue à sa durée VRAIE (calé sur 30, l'échelle la lit ramenée à une image
     d'écran : on rajoute `CAD.per − CAD.ecran`), contre la période VISÉE `1000 / PRF.fps`. Lente si > période × 1,15 ; tenue si < période × 1,05.
     Pour un profil à 60, une seconde calée sur 30 par la cadence RÉACTIVE (60 ne tenait pas) dure 33 ms : elle compte lente.
   · Une course d'au moins 45 s jugées, lente pendant au moins 40 % d'entre elles = une course LENTE. Deux courses lentes DE SUITE → la classe baisse d'un cran. Une course TENUE
     (au moins 60 s jugées, tenue pendant 80 %) efface le compteur. Les courses entre deux (trop courtes, ni l'un ni l'autre) ne changent rien.
   · Le MUR : la classe quittée ne se retente qu'après 1, puis 2, 4, 8 jours (à chaque nouvel échec). Mur fini → la classe du MODÈLE est réécrite (effet au lancement qui suit) ;
     à ce retour, UNE course lente suffit à redescendre ; une course tenue efface ce sursis.
   · LA MÉMOIRE (niveau statique `PRF.nMax` ≥ 3, l'image PC) : au départ de chaque course un TÉMOIN EN VOL est posé dans `cashcarProfil` — c'est déjà la classe d'un cran plus bas,
     avec son mur, et l'enregistrement d'avant gardé dedans. Fin propre de la course, page cachée ou quittée : l'enregistrement d'avant revient. iOS tue la page en pleine course
     (mémoire) : le témoin reste, et le lancement suivant part DIRECTEMENT un cran plus bas (PRF le lit comme une classe apprise) ; ce morceau en fait alors une classe apprise.
     Contexte 3D perdu au premier plan → la même baisse, tout de suite écrite.
   · Jamais au-dessus de la classe du modèle, jamais sous la classe 1 (`prfApprend` borne). Rien n'est écrit quand la classe, le niveau ou la cadence sont FORCÉS par l'URL
     (`?classe=` `?prfniv=` `?prffps=` `?prfdpr=` : on mesure seulement) ; `?appareil=iPhone17,1` (le modèle simulé) est jugé comme un vrai.
   · Journal : une ligne `profil` dans la boîte noire (`window.__ccNote`) à chaque décision. `window.dbgJuge()` décrit, `dbgJuge('oubli')` efface ce que le juge a appris, `dbgJuge('fin')` finit la course (banc).
   · Banc : `?jugelent=N` ajoute N ms de travail à chaque image calculée en course (un téléphone lent simulé) ; `?jugeech=0.25` raccourcit les durées (10 / 45 / 60 s).
   `?sans=prfjuge` = pas de juge. L'ordinateur et tout appareil hors profil (`PRF.on` faux) : rien de ce morceau ne tourne. */
const PJG=(function(){const q=location.search,ech=Math.max(.05,Math.min(1,+((/[?&]jugeech=([\d.]+)/.exec(q)||[])[1])||1));
  return {on:!!PRF.on&&!/[?&]sans=[^&]*prfjuge/.test(q),force:/[?&](classe|prfniv|prffps|prfdpr)=/.test(q),ech:ech,lent:Math.min(200,+((/[?&]jugelent=(\d+)/.exec(q)||[])[1])||0),
    T:{debut:10*ech,lente:45*ech,tenue:60*ech,kLent:1.15,kTenu:1.05,pLent:.4,pTenu:.8,murJ:[1,2,4,8]}, /* tout se règle ici (secondes jugées, parts, jours) */
    t:0,t0:0,crs:false,sec:0,lentS:0,bonS:0,chaud:0,eco:0,cale:0,pS:0,vol:false,volR:null,fait:false,suspendu:false,dern:null,dec:[]};})();
function pjgEcrit(){return PJG.on&&!PJG.force&&PRF.c0>=1&&!!PRF.modele;} /* le juge peut-il écrire ? */
function pjgLit(){const a=prfLit();return a&&(!a.m||a.m===PRF.modele)?a:null;} /* l'enregistrement de CE modèle (une sauvegarde d'un autre iPhone ne compte pas) */
function pjgPose(plus){try{const a=Object.assign(pjgLit()||{v:1,c:PRF.c},plus,{v:1,m:PRF.modele});localStorage.setItem('cashcarProfil',JSON.stringify(a));return a;}catch(e){return null;}} /* sans changer la classe */
function pjgNote(m){PJG.dec.push({t:Math.round(performance.now()/1000),m:m});if(PJG.dec.length>12)PJG.dec.shift();try{window.__ccNote('profil','juge : '+m);}catch(e){}}
function pjgMur(n){const J=PJG.T.murJ,j=J[Math.max(0,Math.min(J.length,n)-1)];return {n:n,j:j,fin:Date.now()+j*864e5};}
function pjgBaisse(pq){ /* la classe effective d'un cran plus bas, au prochain lancement, avec son mur */
  if(!pjgEcrit()||PJG.fait)return;
  if(PRF.c<=1){pjgPose({l:0});pjgNote(pq+' · déjà à la classe 1 : rien de plus bas');PJG.fait=true;return;}
  const a=pjgLit(),m=pjgMur(((a&&a.mur&&a.mur.n)|0)+1);
  prfApprend(PRF.c-1,{mur:m,l:0,essai:0,vol:null});PJG.fait=true;
  pjgNote('classe '+PRF.c+' → '+(PRF.c-1)+' au prochain lancement : '+pq+' · la classe '+PRF.c0+' du modèle se retentera dans '+m.j+' j');}
function pjgVol(on){ /* LE TÉMOIN EN VOL (voir plus haut) : posé = la classe d'un cran plus bas, déjà écrite ; retiré = l'enregistrement d'avant rendu */
  if(on){if(PJG.vol||PJG.fait||PRF.nMax<3||PRF.c<=1||!pjgEcrit())return;let r=null;try{r=localStorage.getItem('cashcarProfil');}catch(e){}
    const a=pjgLit(),t=Date.now();PJG.volR=r;PJG.vol=true;
    try{localStorage.setItem('cashcarProfil',JSON.stringify({v:1,c:PRF.c-1,m:PRF.modele,t:t,mur:pjgMur(((a&&a.mur&&a.mur.n)|0)+1),l:0,essai:0,vol:{t:t,de:PRF.c,r:r}}));}catch(e){}return;}
  if(!PJG.vol)return;PJG.vol=false;try{if(PJG.volR==null)localStorage.removeItem('cashcarProfil');else localStorage.setItem('cashcarProfil',PJG.volR);}catch(e){}PJG.volR=null;}
function pjgDepart(){ /* au lancement : le témoin d'une page tuée, ou un mur fini */
  if(!pjgEcrit())return;const a=pjgLit();if(!a)return;
  if(a.vol){const de=a.vol.de|0,j=a.mur&&a.mur.j;a.vol=null;try{localStorage.setItem('cashcarProfil',JSON.stringify(a));}catch(e){}
    pjgNote('page tuée en pleine course (témoin retrouvé) : classe '+de+' → '+a.c+' dès ce lancement'+(j?' · la classe '+PRF.c0+' se retentera dans '+j+' j':''));return;}
  if(a.c<PRF.c0&&a.mur&&Date.now()>=a.mur.fin&&!a.essai){pjgPose({c:PRF.c0,essai:1,l:0});
    pjgNote('mur fini : la classe '+PRF.c0+' du modèle se retente au prochain lancement (une course lente suffira à redescendre)');}}
function pjgFin(){ /* la course vient de finir : son verdict */
  pjgVol(false);const S=PJG,T=S.T,sec=S.sec,lente=sec>=T.lente&&S.lentS>=sec*T.pLent,tenue=!lente&&sec>=T.tenue&&S.bonS>=sec*T.pTenu;
  S.dern={sec:sec,lente:S.lentS,tenue:S.bonS,chaud:S.chaud,eco:S.eco,cale:S.cale,p50:sec?+(S.pS/sec).toFixed(1):0,vise:PRF.fps,niveau:PRF.n,verdict:lente?'lente':tenue?'tenue':sec<T.lente?'trop courte':'entre deux'};
  if(!pjgEcrit()||S.fait||S.suspendu)return;
  const a=pjgLit()||{},l=a.l|0,essai=!!a.essai&&PRF.c===PRF.c0,txt=Math.round(100*S.lentS/Math.max(1,sec))+' % de '+sec+' s au-dessus de '+(1000/PRF.fps*T.kLent).toFixed(1).replace('.',',')+' ms (N'+PRF.n+', '+PRF.fps+' i/s)';
  if(lente){if(essai||l+1>=2)pjgBaisse((essai?'au retour, une course lente : ':'deux courses lentes de suite : ')+txt);
    else{pjgPose({l:l+1});pjgNote('course lente '+(l+1)+'/2 : '+txt);}return;}
  if(tenue&&(l>0||essai)){pjgPose(PRF.c===PRF.c0?{l:0,essai:0}:{l:0});pjgNote('course tenue ('+Math.round(100*S.bonS/Math.max(1,sec))+' % de '+sec+' s) : compteur effacé'+(essai?', la classe '+PRF.c+' est gardée':''));}}
function pjgCalme(now){ /* « au calme » comme CAD.calme (ni page cachée, ni reconstruction de zone, ni 30 Hz imposé) — sauf que CALÉ sur 30, des images régulières de 33 ms « ramenées »
   (`loop._r30`) ne sont pas un écran bridé (il donnerait 16,7) : c'est un téléphone tenu à 20 i/s, et ça se juge */
  return !document.hidden&&now-(loop._rebuildT||0)>(loop._rebuildD||2500)&&(!loop._r30||CAD.on);}
function prfJuge(now){ /* appelé par cadFin à chaque image calculée ; ne juge qu'une fois par seconde */
  if(PJG.lent>0&&started&&running&&!gameOver&&!paused&&!garageOn){const f=performance.now()+PJG.lent;while(performance.now()<f){}} /* (banc) le téléphone lent simulé */
  if(now-PJG.t<1000)return;PJG.t=now;
  const enCourse=started&&running&&!gameOver&&!garageOn;
  if(!enCourse){if(PJG.crs){PJG.crs=false;pjgFin();}return;}
  if(!PJG.crs){PJG.crs=true;PJG.t0=now;PJG.sec=PJG.lentS=PJG.bonS=PJG.chaud=PJG.eco=PJG.cale=PJG.pS=0;}
  if(!PJG.vol&&!document.hidden)pjgVol(true);
  if(paused||now-PJG.t0<PJG.T.debut*1000||!pjgCalme(now)||CAD.force)return;
  if((MOB_S.thermo|0)>=2){PJG.chaud++;return;}
  const f60=PRF.fps===60;
  if(f60&&mobEco()){PJG.eco++;return;}
  if(f60&&CAD.on&&(CAD.pq!=='reactif'||mobChaud())){PJG.cale++;return;} /* calé par la chaleur, l'économie ou la retenue : ne dit rien de la puce */
  const per=1000/PRF.fps,p=QLR.p50+((CAD.on||CAD.eco)?CAD.per-CAD.ecran:0);
  PJG.sec++;PJG.pS+=p;if(p>per*PJG.T.kLent)PJG.lentS++;else if(p<per*PJG.T.kTenu)PJG.bonS++;}
if(PJG.on){pjgDepart();
  {const a=pjgLit();PJG.suspendu=!!a&&a.c!==PRF.c;} /* un retour à la classe du modèle attend le lancement suivant : cette session-ci ne compte pas ses courses (le témoin et le contexte jouent toujours) */
  document.addEventListener('visibilitychange',function(){if(document.hidden)pjgVol(false);});
  window.addEventListener('pagehide',function(){pjgVol(false);});
  renderer.domElement.addEventListener('webglcontextlost',function(){if(document.hidden)return;pjgVol(false);if(PRF.nMax>=3)pjgBaisse('contexte 3D perdu au premier plan (N'+PRF.n+', statique N'+PRF.nMax+')');},false);}
window.dbgJuge=function(o){
  if(o==='fin'){try{if(started&&!gameOver)endGame();}catch(e){}return 'course finie (QUITTER)';} /* (banc) finir la course proprement */
  if(o==='oubli'){try{localStorage.removeItem('cashcarProfil');}catch(e){}PJG.volR=null;PJG.fait=false;PJG.suspendu=false;return 'oublié : le prochain lancement repart de la classe du modèle';}
  const S=PJG;return {on:S.on,ecrit:pjgEcrit(),force:S.force,suspendu:S.suspendu,classe:PRF.c,classeModele:PRF.c0,modele:PRF.modele,niveau:PRF.n,niveauMax:PRF.nMax,fps:PRF.fps,haute:PRF.q==='haute',
    T:S.T,lentBanc:S.lent,course:{en:S.crs,sec:S.sec,lente:S.lentS,tenue:S.bonS,chaud:S.chaud,eco:S.eco,cale:S.cale,p50:S.sec?+(S.pS/S.sec).toFixed(1):0},dernier:S.dern,decisions:S.dec.slice(),
    temoin:S.vol,fait:S.fait,memoire:(function(){try{return JSON.parse(localStorage.getItem('cashcarProfil')||'null');}catch(e){return null;}})(),
    cadence:{on:CAD.on,pq:CAD.pq||null,eco:!!CAD.eco,vise:prf60()?60:30,chaud:mobChaud()},thermo:MOB_S.thermo,capteur:MOB_S.capteur};};
