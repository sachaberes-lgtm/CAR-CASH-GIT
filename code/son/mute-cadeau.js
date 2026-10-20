// ---------- MUTE : deux interrupteurs persistants — SON (tout le WebAudio) et VOIX (annonceur) ----------
const SND={sfx:true,music:true,vib:true};
/* (2026-10-14, GAMEPLAY — Sacha : « la 1re partie du JOUR ×2, plus un bonus de SÉRIE de jours, sans toucher aux PRIX de Léo ; interrupteur ?jour=0 » · « un cadeau gratuit toutes les ~6 h, à ouvrir à l'accueil, façon Crossy Road ») LE RETOUR DU JOUR ET LE CADEAU — UN SEUL barème (le modèle : outils/jour-modele.cjs, dont les constantes sont LUES ici).
   LE PRINCIPE : une partie moyenne (R, ~175 $ avant le relèvement du début) sert d'étalon. Le QUOTIDIEN est le gros rendez-vous (~1 R par jour, plus la série : jusqu'à 0,6 R), le CADEAU le petit (~0,25 R, une ou deux fois par jour), ECOD reste le relèvement du début : rien ne le double.
   1. LE ×2 DU JOUR — le jour = la date LOCALE de l'appareil ('AAAA-MM-JJ'). La 1re partie COMPTÉE de ce jour paie ×2 sur l'argent de COURSE : même robinet que ECOD (denom() × ECOD.k), donc ECOD.k = MAX(relèvement du début, ×2) et JAMAIS leur produit
      (×1,5 × 2 = ×3 : mesuré, la peinture à 2 500 $ tombait à la 2e partie pour 29 % des joueurs). Compte : ni le bac à sable, ni le parc, ni la balade ; l'AUTO-ÉCOLE MARQUE le jour sans prendre le ×2 (le jour 1 est déjà aidé par le permis, les défis et ECOD) ; et au moins `tMin` secondes
      de course (sinon JOUER puis QUITTER brûlait le ×2).
   2. LA SÉRIE — des jours consécutifs avec une partie comptée ; un jour sauté la remet à 1. À la FIN de la 1re partie du jour, une prime en banque : prime[min(série, 7) - 1] = 0 · 25 · 40 · 55 · 70 · 85 · 100 (le plafond est au 7e jour ; la série, elle, continue de se compter).
      Versée dans commitExploits : elle entre dans « VERSÉS AU COMPTE ».
   3. LE CADEAU — toutes les 6 h (`periode`), à OUVRIR (cadeauOuvre) à l'accueil : max(25 $, 8 % du meilleur gain d'une partie) en banque. Il ne s'accumule pas (un seul en attente), il n'expire pas et le compte à rebours part de l'OUVERTURE (aucune fausse urgence) ; il ne s'allume qu'après l'auto-école.
   L'HORLOGE — jours : UTC pur sur les dates locales (ni fuseau ni heure d'été) ; hier → série +1, plus ancien → série 1, la même date → déjà pris ; UN jour de moins (voyage vers l'ouest) = déjà pris ; l'horloge reculée de 2 jours ou plus : pas de ×2 ce jour-là, la date est recalée au versement
      (jamais une série infinie, jamais un ×2 bloqué des mois). Cadeau : Date.now() ; un dernier cadeau « dans le futur » (horloge reculée) compte comme ouvert à l'instant (cadeauEtat le lit sans rien écrire ; cadeauRecale, à chaque départ de partie, et san(), au chargement, le rangent) — ni plantage, ni cadeaux à l'infini.
   Interrupteurs : ?jour=0 (ni ×2, ni série, ni prime : le jeu d'avant au dollar près) · ?cadeau=0. Sauvegarde : SAVE.d.jour={d,n} (dernier jour compté, série à cette date) · SAVE.d.cad={t} (dernier cadeau ouvert, en ms). Crochets : dbgJour(), dbgCadeau().
   Contrat avec l'accueil (INTERFACE), aussi sur window : cadeauEtat() → {pret, dansMs, jour} (PUR, appelable chaque seconde ; + actif · serie · valeur) · cadeauOuvre() → false si rien n'est prêt, sinon verse et rend une promesse du montant (événement document 'cc:cadeau', .valeur = le montant) · jourTexte() → la phrase du quotidien. C'est elle qui dessine la ligne : ce bloc ne pose AUCUN élément d'accueil. */
const JOUR={on:!/[?&]jour=0\b/.test(location.search),x2:2,prime:[0,25,40,55,70,85,100],tMin:15,max:9999,k:1,e:1,cmp:false,dep:'',fin:null,dec:0}; // x2 · prime[] : par jour de série (sa longueur = le plafond) · tMin : secondes de course pour qu'une partie COMPTE · max : borne de la série · k : le multiplicateur de la partie en cours (e : celui d'ECOD seul) · cmp/dep : la partie compte, sa date de DÉPART · fin : ce que la dernière fin de partie a versé · dec : décalage des bancs, en jours
const CADO={on:/[?&]cadeau=1\b/.test(location.search), /* (2026-10-19, Sacha : « dans le bouton mission il y a un truc streak 3 days gift ready, enlève ça ») le cadeau est ÉTEINT : sa ligne ne se montre plus en tête de MISSIONS ; ?cadeau=1 le rallume (la série de jours et le ×2 du jour, eux, restent) */periode:216e5,min:25,pc:.08,max:2500,force:false}; // periode : 6 h en ms · min : le plancher en $ · pc : la part du meilleur gain d'une partie · force : le banc (dbgCadeau) passe outre l'auto-école
function jourAuj(){ // la date LOCALE de l'appareil, 'AAAA-MM-JJ' ; '' si l'horloge est illisible ou absurde (le jour est alors ignoré, rien ne plante)
  const t=new Date();if(JOUR.dec)t.setDate(t.getDate()+JOUR.dec);
  const y=t.getFullYear(),m=t.getMonth()+1,d=t.getDate();
  return (y>=2020&&y<=2100)?y+'-'+(m<10?'0':'')+m+'-'+(d<10?'0':'')+d:'';
}
function jourNum(s){ // les jours entiers depuis 1970 d'une date 'AAAA-MM-JJ' en UTC PUR (ni fuseau, ni heure d'été : deux dates se retranchent juste) ; NaN si illisible
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof s==='string'?s:'');if(!m)return NaN;
  const y=+m[1],mo=+m[2],d=+m[3];if(y<2020||y>2100||mo<1||mo>12||d<1||d>31)return NaN;
  const t=Date.UTC(y,mo-1,d);return new Date(t).getUTCDate()===d?Math.round(t/864e5):NaN; // un « 31 février » déborde sur mars : refusé
}
function jourEtat(a){ // pur : où en est le quotidien à la date `a` ? {ok : horloge lisible · dispo : le ×2 n'est pas encore pris · suiv : la série que fera une partie comptée · n : la série vivante · recale : l'horloge a reculé}
  const A=jourNum(a);if(A!==A)return {ok:false,dispo:false,suiv:1,n:0,recale:false};
  const S=(SAVE.d&&SAVE.d.jour)||{d:'',n:0},B=jourNum(S.d),n=Math.max(0,Math.min(JOUR.max,Math.round(+S.n)||0)),j=A-B;
  if(B!==B)return {ok:true,dispo:true,suiv:1,n:0,recale:false}; // jamais compté (ou date abîmée : on repart de zéro)
  if(j===0||j===-1)return {ok:true,dispo:false,suiv:n,n:n,recale:false}; // pris aujourd'hui · ou UN jour de moins (voyage vers l'ouest) : même chose
  if(j===1)return {ok:true,dispo:true,suiv:Math.min(JOUR.max,n+1),n:n,recale:false}; // hier : la série continue
  if(j>1)return {ok:true,dispo:true,suiv:1,n:0,recale:false}; // un jour sauté (ou plus) : la série est cassée
  return {ok:true,dispo:false,suiv:n,n:n,recale:true}; // l'horloge a reculé de 2 jours ou plus : pas de ×2 (on ne le rejoue pas en reculant la montre), la date est recalée au prochain versement
}
function jourPrime(suiv){return JOUR.prime[Math.min(suiv,JOUR.prime.length)-1]||0;}
function jourMaj(){ // UNE fois par partie, juste après ecoDebutMaj (runxReset) : cette partie prend-elle le ×2 ? ECOD.k = le MAX des deux, jamais le produit
  const J=JOUR;J.k=1;J.cmp=false;J.dep='';J.fin=null;J.e=ECOD.k;
  cadeauRecale(); /* l'horloge du cadeau, rangée une fois par partie (elle n'a rien à voir avec ?jour=0) */
  try{
    if(!J.on||BALADE||SANDBOX||PARK.on)return 1;
    const a=jourAuj();if(!a)return 1;const e=jourEtat(a);if(!e.ok)return 1;
    J.cmp=true;J.dep=a; // la partie COMPTE pour le jour (l'auto-école aussi : elle marque le jour, mais sans ×2)
    if(e.dispo&&!TUTO.on){J.k=J.x2;if(J.k>ECOD.k)ECOD.k=J.k;}
  }catch(x){}
  return J.k;
}
function jourCommit(){ // appelée par commitExploits : la partie compte → le jour est marqué, la série monte, la prime de série est versée en banque. Rend la prime.
  const J=JOUR;
  try{
    if(!J.on||!J.cmp||!J.dep||!(RUNX.t>=J.tMin))return 0;
    const e=jourEtat(J.dep),S=SAVE.d.jour;
    if(e.dispo){S.d=J.dep;S.n=e.suiv;
      if(typeof SERIE7==='object'&&SERIE7.on){const o=serieDonne(e.suiv);J.fin={n:e.suiv,p:o.cash,k:J.k,s:o};J.cmp=false;return o.cash;} /* (2026-10-20, Léo) LA SÉRIE DE SEPT JOURS (missions/aujourdhui.js) : la case du calendrier au lieu de la prime ; ?serie=ancien = la prime */
      const p=jourPrime(e.suiv);
      if(p>0){SAVE.d.bank=Math.min(1e30,bank()+p);gagneAjoute(p);bankMaxMaj();}
      J.fin={n:e.suiv,p:p,k:J.k};J.cmp=false; // une seule fois par partie
      return p;}
    if(e.recale){S.d=J.dep;J.cmp=false;} // l'horloge avait reculé : on recale la date, sans ×2 ni prime
  }catch(x){}
  return 0;
}
function jourFinTexte(){ // (écran de fin) ce que le quotidien a donné à CETTE partie, à ajouter à la ligne « COMPTE : $ N » : « · ×2 DU JOUR · SÉRIE 3 +$ 40 » ('' si rien) — en capitales JS (accents gardés : la ligne est en police système)
  const f=JOUR.fin;if(!f)return '';
  let s=f.k>1?TR('×2 du jour'):'';
  if(f.s){const L=f.s.cash?{cash:f.s.cash}:f.s.jeton?{jeton:f.s.jeton}:{exclu:f.s.exclu};s+=(s?' · ':'')+TR('Série {n}').replace('{n}',f.n)+' '+serieLotTxt(L);} /* (2026-10-20) la case de la série : argent, jeton ou peinture */
  else if(f.p>0)s+=(s?' · ':'')+TR('Série {n}').replace('{n}',f.n)+' +'+fmtC(f.p);
  return s?' · '+sansAcc(s.toUpperCase()):''; /* (2026-10-20) la ligne est en police PIXEL (pas de capitales accentuées : « SéRIE » s'affichait) */
}
function jourTexte(){ // la phrase du quotidien, déjà traduite ('' = rien à dire) : « Série 3 jours · ×2 sur ta 1re partie » / « Prochain ×2 demain ». Les mots sont en casse mixte (TR ne retire alors aucun accent) : la feuille met en capitales.
  try{
    if(!JOUR.on||BALADE||!SAVE.d.tuto)return '';
    const a=jourAuj();if(!a)return '';
    const e=jourEtat(a),se=e.n>=2?TR('Série {n} jours').replace('{n}',e.n):'';
    if(e.dispo)return se?se+' · '+TR('×2 sur ta 1re partie'):TR('×2 sur ta 1re partie du jour');
    return se?se+' · '+TR('Prochain ×2 demain'):TR('Prochain ×2 demain');
  }catch(x){return '';}
}
function cadeauValeur(){ // ce que le prochain cadeau donnera : la plus grande de deux choses, un plancher et une part de TON meilleur gain — il grandit avec le joueur, jamais plus qu'un dixième d'une bonne partie
  let b=0;try{b=SAVE.d.best||0;}catch(x){}
  return Math.min(CADO.max,Math.max(CADO.min,ecoRond(CADO.pc*b))); /* (2026-10-15, équilibrage) max : 2 500 $ (une très bonne partie à ~30 k donne déjà ~2 400) — un record de l'ANCIENNE échelle (8,6e16 dans la sauvegarde de Sacha) offrait 7e15 $ toutes les 6 h */
}
function cadeauHorlogeOk(nw){return nw>=1.6e12&&nw<4.2e12;} // 2020 → 2100 : une horloge absurde (NaN, 1970) ne donne ni ne bloque rien
function cadeauRecale(){ // la SEULE écriture de l'horloge du cadeau (cadeauEtat, lui, ne touche à rien) : un dernier cadeau « dans le futur » (montre reculée) repart de MAINTENANT ; appelée une fois par partie (jourMaj) — et san() fait pareil au chargement
  try{if(!CADO.on)return;const C=SAVE.d.cad,nw=Date.now();if(C&&C.t>nw&&cadeauHorlogeOk(nw)){C.t=nw;SAVE.mark();}}catch(x){}
}
function cadeauEtat(){ /* LE CONTRAT avec l'accueil, appelé chaque seconde — PUR : il lit, il n'écrit rien (ni sauvegarde, ni horloge, ni DOM). {pret : un cadeau à OUVRIR maintenant · dansMs : ms avant le prochain (0 si prêt) · jour : le ×2 du jour est à prendre} + trois champs de confort {actif : le cadeau existe (ni ?cadeau=0, ni leçon pas faite, ni horloge absurde) · serie : jours de série vivante · valeur : ce que le cadeau donnera}.
  Une horloge RECULÉE (dernier cadeau « dans le futur ») compte comme un cadeau ouvert à l'instant : jamais prêt, 6 h pleines — reculer la montre ne donne donc jamais de cadeau (le rangement est dans cadeauRecale). */
  let actif=false,pret=false,dans=0,jour=false,serie=0;
  try{
    const ok=!BALADE&&(SAVE.d.tuto||CADO.force);
    if(ok&&CADO.on){
      const nw=Date.now();
      if(cadeauHorlogeOk(nw)){
        actif=true;const t=Math.min(+SAVE.d.cad.t||0,nw); /* un dernier cadeau dans le futur = maintenant */
        const reste=t>0?CADO.periode-(nw-t):0;
        if(reste<=0)pret=true;else dans=Math.min(CADO.periode,reste);
      }
    }
    if(ok&&JOUR.on){const a=jourAuj();if(a){const e=jourEtat(a);jour=e.dispo;serie=e.n;}}
  }catch(x){}
  return {pret:pret,dansMs:dans,jour:jour,actif:actif,serie:serie,valeur:actif?cadeauValeur():0};
}
function cadeauOuvre(){ // LE CONTRAT : s'il y a un cadeau prêt, le verse (banque + flush, toast, son, vibration, événement 'cc:cadeau') et rend une promesse du montant ; sinon ne fait RIEN et rend false
  try{
    const e=cadeauEtat();if(!e.actif||!e.pret)return false;
    const v=e.valeur;
    SAVE.d.cad.t=Date.now();SAVE.d.bank=Math.min(1e30,bank()+v);gagneAjoute(v);bankMaxMaj();SAVE.flush();
    try{if(SONV2)sfx('ui.achat');else uiClic('');}catch(x){}
    hap([12,40,12,40,30]);
    try{toast(pxi('cadeau')+' '+TR('CADEAU')+' : +'+fmtC(v),true);}catch(x){}
    try{const ev=new Event('cc:cadeau');ev.valeur=v;document.dispatchEvent(ev);}catch(x){} // l'accueil se repeint (la banque a bougé) ; ev.valeur = le montant versé
    return Promise.resolve(v);
  }catch(x){return false;}
}
window.cadeauEtat=cadeauEtat;window.cadeauOuvre=cadeauOuvre;window.jourTexte=jourTexte; /* le contrat avec la session INTERFACE : mêmes noms au niveau de la fenêtre */
/* (2026-10-14, GAMEPLAY) LA LIGNE DU CADEAU sur l'accueil : lit cadeauEtat() chaque seconde (et seulement quand l'accueil est affiché), écrit le DOM
   seulement si le texte change ; toucher = cadeauOuvre(). Pas prêt : « PROCHAIN CADEAU DANS 3 H 12 » (et « ×2 SUR TA 1RE PARTIE » si le jour est là). */
function cadeauLigne(){const el=document.getElementById('mCadeau'),h=document.getElementById('garage');if(!el||!h)return; /* (14/10 ~21 h, Sacha : « enlève cadeau, touche et mission » de l'accueil) le cadeau vit EN TÊTE de l'écran MISSIONS : il ne se montre que MISSIONS ouvert */
  if(!(h.classList.contains('on')&&h.classList.contains('missions'))||typeof cadeauEtat!=='function'){if(!el.hidden)el.hidden=true;return;}
  let e;try{e=cadeauEtat();}catch(x){return;}if(!e||!e.actif){if(!el.hidden)el.hidden=true;return;} /* (2026-10-17, Sacha) pas encore de cadeau (la leçon pas faite, ?cadeau=0, horloge absurde) : la ligne se tait — elle disait « PROCHAIN CADEAU DANS 0 MIN » sans fin */
  let t;if(e.pret)t=TR('CADEAU PRÊT · TOUCHE');else{const m=Math.max(1,Math.ceil((+e.dansMs||0)/60000)),hh=Math.floor(m/60),mm=m%60;
    t=TR('PROCHAIN CADEAU DANS')+' '+(hh?hh+' H '+String(mm).padStart(2,'0'):mm+' MIN');if(e.jour)t=TR('×2 SUR TA 1RE PARTIE')+' · '+t;}
  if((e.serie|0)>1)t=TR('SÉRIE')+' '+(e.serie|0)+' '+TR('JOURS')+' · '+t; /* la SÉRIE de jours (Sacha : « ce qui fait revenir le lendemain ») */
  t=sansAcc(t);const sp=el.querySelector('span');if(sp&&sp.textContent!==t)sp.textContent=t;
  el.classList.toggle('attend',!e.pret);el.setAttribute('aria-disabled',e.pret?'false':'true');if(el.hidden)el.hidden=false;}
try{const el=document.getElementById('mCadeau');if(el)el.addEventListener('click',function(ev){ev.stopPropagation();let e;try{e=cadeauEtat();}catch(x){return;}
  if(!e||!e.pret)return;try{uiClic('');}catch(x){}try{hap([10,30,10]);}catch(x){}try{Promise.resolve(cadeauOuvre()).then(cadeauLigne,cadeauLigne);}catch(x){}});
  setInterval(cadeauLigne,1000);}catch(e){}
;(function(){const c=document.getElementById('mCadeau'),hd=document.getElementById('gmHead');if(c&&hd)hd.appendChild(c);})(); /* le cadeau en tête de MISSIONS (le clic de GAMEPLAY suit le nœud) */
try{Object.assign(I18N,{'CADEAU PRÊT · TOUCHE':'GIFT READY · TAP','PROCHAIN CADEAU DANS':'NEXT GIFT IN','×2 SUR TA 1RE PARTIE':'×2 ON YOUR 1ST RUN','SÉRIE':'STREAK','JOURS':'DAYS'});}catch(e){}
Object.assign(I18N,{'CADEAU':'GIFT','Série {n} jours':'{n}-day streak','×2 sur ta 1re partie du jour':'×2 on your 1st run of the day','×2 sur ta 1re partie':'×2 on your 1st run','Prochain ×2 demain':'Next ×2 tomorrow','×2 du jour':'×2 of the day','Série {n}':'Streak {n}'});
window.dbgJour=function(a){ // (banc) l'état du quotidien. 'demain' = le jour d'après · 'saute' = un jour sauté (+2) · 'hier' = −1 (fuseau) · 'recule' = l'horloge recule de 2 jours · 'auj' = décalage remis à 0 · 'raz' = jour et série effacés · 'compte' = la partie en cours a tenu tMin secondes
  if(a==='demain')JOUR.dec+=1;else if(a==='saute')JOUR.dec+=2;else if(a==='hier')JOUR.dec-=1;else if(a==='recule')JOUR.dec-=2;else if(a==='auj')JOUR.dec=0;
  else if(a==='raz'){SAVE.d.jour={d:'',n:0};SAVE.flush();}else if(a==='compte')RUNX.t=Math.max(RUNX.t,JOUR.tMin);
  const au=jourAuj(),e=jourEtat(au);
  return {actif:JOUR.on,auj:au,decalage:JOUR.dec,sauvegarde:{d:SAVE.d.jour.d,n:SAVE.d.jour.n},dispo:e.dispo,serie:e.n,serieSuivante:e.suiv,recale:e.recale,primeSuivante:e.dispo?jourPrime(e.suiv):0,
    partie:{k:JOUR.k,ecod:JOUR.e,appliquee:ECOD.k,comptee:JOUR.cmp,depart:JOUR.dep,versee:JOUR.fin},ligne:jourTexte(),cadeau:cadeauEtat()};
}
;
window.dbgCadeau=function(a){ // (banc) l'état du cadeau. 'pret' = il est prêt (même avant la fin de l'auto-école) · 'attente' = on vient de l'ouvrir · 'recule' = le dernier cadeau est dans le futur (horloge reculée) · 'ouvre' = l'ouvrir
  if(a==='pret'){SAVE.d.cad.t=0;CADO.force=true;}else if(a==='attente')SAVE.d.cad.t=Date.now();else if(a==='recule')SAVE.d.cad.t=Date.now()+864e5;
  if(a==='ouvre')return cadeauOuvre();
  const e=cadeauEtat(),h=Math.floor(e.dansMs/36e5),m=Math.floor(e.dansMs%36e5/6e4);
  return {actif:e.actif,pret:e.pret,dansMs:e.dansMs,dans:h+' h '+(m<10?'0':'')+m,jour:e.jour,serie:e.serie,valeur:e.valeur,dernier:SAVE.d.cad.t,force:CADO.force,banque:bank()};
};
