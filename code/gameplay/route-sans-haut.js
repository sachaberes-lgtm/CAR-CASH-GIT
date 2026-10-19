/* ============================================================================
   LA ROUTE SANS HAUT NI BAS (2026-10-15, Sacha : « dans la map des nuages on ne doit plus avoir de haut ou de bas, il doit y avoir les
   nuages ou sinon le ciel partout, rien d'autre — pour faire ça il faut aussi changer la génération de la route pour qu'elle se torde, se
   plie et tout, qu'il n'y ait plus de haut et de bas »)
   ----------------------------------------------------------------------------
   La piste de genCtrl est dessinée « à plat » : ses virages tournent autour de la verticale, ses bosses autour de l'horizontale, et la dalle
   se redresse toujours vers le ciel (le rappel de buildTrack). Ici on la RÉ-ENROULE dans l'espace : on relève, pas à pas (6 m), ce que le
   pilote VIT — de combien la route tourne dans le plan de la dalle (le virage), de combien elle monte sous les roues (la bosse), de combien
   la dalle roule sur elle-même — puis on refait le chemin en ajoutant des VRILLES (quarts, demi-tours, tours complets). Un virage pris sur
   une dalle couchée à 90° devient une montée, sur une dalle retournée il part de l'autre côté : la route file dans toutes les directions,
   à l'endroit, sur la tranche, à l'envers. Ce qu'on sent au volant ne change pas — mêmes virages, mêmes rayons, mêmes bosses : sans vrille,
   on retombe sur la piste d'origine au centimètre (c'est le contrôle de `dbgHaut()`).
   · `hautOn()` : la map NUAGES (et son orage) en course seulement — le ciel du menu, l'auto-école, la campagne et le parc ne bougent pas.
   · les vrilles ont leur PROPRE flux de hasard (graine ^ 0x70D5E11A) : le reste de la piste est tiré comme avant.
   · départ et portail À L'ENDROIT (on tombe du ciel sur une route droite, on passe le portail debout) ; le reste, libre.
   · sur cette route la pente ne pousse ni ne retient plus (`hautPente`) : sans haut ni bas, pas de descente. En vol la gravité reste — (2026-10-18) celle de LA ROUTE survolée, plus celle du monde (`VOLR`, LE VOL QUI SUIT LA ROUTE).
   · les filets (« la route qui te rattrape ») ne se posent pas ici : leur route d'en dessous n'est plus en dessous.
   Crochet : `dbgHaut()` (roulis, normales, contrôle sans vrille).
   ========================================================================== */
/* EN GRAND (2026-10-15, Sacha, le jour même : « beaucoup trop tordu — je voulais ça mais sur des proportions beaucoup plus vastes, de grands
   virages où la route se tord, pas aussi tire-bouchonné »). Le tire-bouchon venait du roulis TROP RAPIDE sur des virages TROP SERRÉS : une
   vrille de demi-tour en 2-3 s sur des rayons de 100-300 m enroule la route en hélice. Deux leviers :
   · TORD_AMP, LE ZOOM : sur cette route genCtrl tire une zone TORD_AMP fois plus courte, puis l'agrandit TORD_AMP fois autour du départ —
     le même dessin, les mêmes pentes, mais chaque virage, chaque bosse, chaque épingle TORD_AMP fois plus ample (la zone garde sa longueur ;
     possible parce que les tremplins sont partis : aucune géométrie de saut calée sur la physique à ne pas agrandir) ;
   · les vrilles s'étirent : un quart de tour en ~4-6 s, un demi en ~6-9 s, le tour complet rare (~11 s), et de longues tenues entre deux ;
     le redressement avant le portail prend 3 s au lieu de 1,3 (et agit jusque dans les montées raides). */
/* LES VIRAGES DE COURSE (2026-10-18, Sacha : « trop peu de virages dans la map nuage, rajoute des virages et des modules cool à rider, ça reste
   un jeu de course »). MESURÉ (banc Node de genCtrl + pisteTord, 6 graines × 3 paliers, règle COURSE de passation/RACCOURCIS.md : un virage =
   un cap qui tourne de 20° ou plus à un rayon < 4 × le rayon que la caisse tient à fond) : 0,03 virage par km (la règle en veut 2,5), des
   « droites » de 100 s, un rayon médian de 640 m. Le zoom ×2,4 avait gonflé chaque virage au-delà du seuil où l'on tourne le volant. Quatre leviers,
   sur la route tordue seulement :
   · le ZOOM redescend (2,4 → TORD_AMP ci-dessous) — les VRILLES gardent leur lenteur (leur longueur se compte en secondes de croisière, pas au zoom) ;
   · les POIDS des motifs (`TORD_W`) : plus d'esses, de chicanes, d'épingles et de virages, moins de droites et de plongeons (sans haut ni bas,
     une pente ne pousse ni ne retient : un plongeon n'y est qu'une droite) ;
   · les MODULES DE COURSE (genCtrl, `modTord`) remplacent ceux de la gravité (filet, lacets, plongeon, chameau) : SLALOM, ÉPINGLE, DOUBLE CORDE,
     ESSES, MONTAGNES RUSSES — à leur VRAIE taille (ils échappent au zoom), dosés sur le rayon du palier ;
   · le DÉVERS (`TORD_DEVERS`, pisteTord) : la dalle se COUCHE dans le virage, vers l'intérieur, de l'angle d'un virage relevé à la croisière.
   */
const TORD_AMP=1.1;
/* MOINS TORDUE (2026-10-18 soir, Sacha : « la map nuage, la route est un peu trop tordue et en spirale — ça doit arriver, mais moins que ça »).
   MESURÉ (banc Node genCtrl + pisteTord, 12 graines) : la route n'était À L'ENDROIT que 32 % du temps (37 % sur la tranche, 31 % à l'envers), on
   restait jusqu'à 87 s d'affilée hors de l'endroit — les vrilles s'enchaînaient sans jamais revenir. `NV_CALME` : la route revient TOUJOURS à
   l'endroit après une vrille (par le plus court, parfois après 2-4 s de tenue là-haut), les tenues À L'ENDROIT sont longues (6-12 s), un quart de
   tour six fois sur dix, un demi-tour 35 %, le tonneau complet 5 %. Les vrilles restent lentes (mêmes durées). ⚠ Revenir au même angle ne suffit pas
   (sur la tranche, chaque virage fait tourner tout le repère) : pendant les tenues à l'endroit, la dalle est RAPPELÉE vers le ciel (penchée du
   dévers, au plus un demi-tour en 4 s) et sa pente revient doucement à celle de la piste d'origine — comme avant le portail. `?nuages=tordu` = avant. */
const NV_CALME=!/[?&]nuages=tordu\b/.test(location.search);
const TORD_W=[1,0,1.8,2,.5,1.8,.25,.2,2.2,.9,1,0,0]; // [loop,hélice,ÉPINGLE,ESSES,vague,VIRAGE,plongeon,droite,CHICANE,balayage,gap,tire-bouchon,entrelacs] — multiplie les poids de l'archétype
const TORD_DEVERS={max:50/57.3,k:.75,g:23,lis:.9,vmax:30/57.3,roulis:62/57.3}; // max : l'angle plafond · k : la part du virage relevé physique (atan v²/gR) · g : la gravité MONDE (FALL_G×SPD) · lis : le lissage (s de croisière) · vmax : le roulis du dévers seul au plus (rad/s) · roulis : le roulis TOTAL au plus, vrilles + dévers (rad/s)
const TORD={on:false,N:null,info:null};
/* LA DURÉE DES MAPS (2026-10-18, Léo : « trouve la longueur parfaite des maps — sur téléphone, ni trop courte pour être digérable, ni trop longue ;
   et plus la vitesse va vite, plus on doit avoir l'impression de traverser plein de dimensions ») — v644, essayée sur un lien à part puis validée.
   MESURÉ avant (banc, main v628) : une map du JOUER durait de 70 s (jade, forêt) à plus de 3 min (canyon), et elle S'ALLONGEAIT avec la
   vitesse (les générateurs grandissaient plus vite que le palier). Désormais une map du JOUER se compte en SECONDES : la longueur visée =
   la durée × la croisière du palier (vPalier) × l'allure propre de la map (DUREE_ALLURE : glace, vol, pentes). 45 s au moteur rouillé
   (le 1er portail arrive avant qu'un débutant meure), puis de moins en moins, 20 s du palier 25 au TROU NOIR. Chaque générateur garde sa
   pièce maîtresse et ne raccourcit que le remplissage. `?duree=ancien` = les longueurs d'avant · `?duree=40-18` = d'autres durées. */
const DUREE=(function(){const m=/[?&]duree=([^&]*)/.exec(location.search),v=m?decodeURIComponent(m[1]):'';
  if(v==='ancien'||v==='0')return null;const p=/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/.exec(v);
  return {d0:p?+p[1]:45,d1:p?+p[2]:20,t1:25};})();
/* LA VITESSE RÉELLE (mesurée au banc, pilote + nitro au sol) : au départ l'élan, la nitro et le FLOW poussent la caisse à ~1,8 × vPalier ;
   à fond elle ne fait plus que vPalier (DUREE_ELAN, du palier 0 au palier t1). Puis l'ALLURE de chaque map, relative à la ville : la glace
   du glacier, les virages de course des nuages, les boucles du volcan et du canyon la ralentissent. */
const DUREE_ELAN=[1.8,1];
const DUREE_ALLURE={nuages:.65,ville:1,crypto:1.15,vitree:.85,espace:1.2,jade:.85,foret:.93,banquise:.7,volcan:.9,canyon:.7,grotte:.85,dunes:.75}; // (volcan .9 : la balade et la spirale de vlcTrace3 roulent plus vite que les boucles d'avant — mesuré 34 s pour 45 à .7)
const DUREE_V={banquise:function(t){return 100+3*t;}}; // (m/s) les maps dont la vitesse ne suit PAS le moteur — sur la glace du glacier, MESURÉ : ~113 m/s au palier 0, 150-195 au palier 20-23 (l'adhérence et la pente la tiennent)
function dureeCible(){ // (s) la durée visée pour la map qu'on bâtit (LVL.cur : la map d'en face pendant le pré-bâti) — 0 hors du JOUER
  if(!DUREE||PARK.on||!LVL.cur||!LVL.cur.sansFin||!LVL.cur.carte)return 0;
  const k=Math.min(1,Math.max(0,engTier|0)/DUREE.t1);return DUREE.d0+(DUREE.d1-DUREE.d0)*k;}
function longueurCible(){const d=dureeCible();if(!d)return 0;const c=LVL.cur.carte,k=Math.min(1,Math.max(0,engTier|0)/DUREE.t1),l=DUREE_V[c]?d*DUREE_V[c](engTier|0):d*vPalier()*(DUREE_ELAN[0]+(DUREE_ELAN[1]-DUREE_ELAN[0])*k)*(DUREE_ALLURE[c]||1); // (m) 0 = la longueur d'avant
  DUREE_NOTE[runStats.zones|0]={carte:LVL.cur.carte,d:Math.round(d),Lc:Math.round(l),eng:engTier|0};return l;} // (pendant le pré-bâti, zones est déjà celle d'en face)
const DUREE_NOTE={};
window.dbgDuree=function(){const z=runStats.zones|0;return {on:!!DUREE,reglage:DUREE,zone:z,vise:DUREE_NOTE[z]||null,L:Math.round(L),s:Math.round(s),palier:engTier,suivante:DUREE_NOTE[z+1]||null};}; // (banc) la durée visée de la map en cours, sa longueur réelle
function hautOn(){const c=LVL.cur;return !PARK.on&&!!c&&(c.id==='nuages'||c.id==='orage')&&!c.sansNuages&&!c.piste&&(started||SF.pret);}
function hautPente(){return TORD.on?0:1;}
function pisteTord(ctrl,seed,sansVrille,essai){ // essai : (2026-10-18) le n° de tirage des vrilles — 0 = celui d'origine ; buildTrack en rejoue un autre quand la route se touche (voir tordContacts)
  const q=new THREE.Quaternion(),up=new THREE.Vector3(),c9=new THREE.Vector3();
  /* (2026-10-18) la courbe et le repère d'origine ne dépendent pas du tirage des vrilles : gardés d'un essai à l'autre (pisteTordPropre, qui les
     libère en sortant) — la mesure de la courbe coûtait ~30 ms à chaque essai */
  let c1=pisteTord._c1;
  if(!c1||c1.ctrl!==ctrl){
  const cv=new THREE.CatmullRomCurve3(ctrl,false,'centripetal');cv.arcLengthDivisions=Math.max(200,ctrl.length*16);
  const Lc=cv.getLength(),K=Math.max(16,Math.round(Lc/6)),P=cv.getSpacedPoints(K),n1=K+1,h=Lc/K;
  // 1) LE REPÈRE D'ORIGINE, recette de buildTrack (transport parallèle + rappel vers le ciel) : `om` = le roulis que le rappel ajoute à chaque pas
  const Tv=[],Nv=[],om=new Float32Array(n1);
  for(let i=0;i<n1;i++)Tv.push(new THREE.Vector3().subVectors(P[Math.min(i+1,K)],P[Math.max(i-1,0)]).normalize());
  const n=new THREE.Vector3(0,1,0);n.addScaledVector(Tv[0],-n.dot(Tv[0])).normalize();
  for(let i=0;i<n1;i++){Nv.push(n.clone());if(i>=K)break;
    q.setFromUnitVectors(Tv[i],Tv[i+1]);n.applyQuaternion(q);n.addScaledVector(Tv[i+1],-n.dot(Tv[i+1])).normalize();
    const t9=Tv[i+1],ty=Math.abs(t9.y);
    if(ty<.7&&n.y>0){up.set(-t9.x*t9.y,1-t9.y*t9.y,-t9.z*t9.y);if(up.lengthSq()>1e-8){up.normalize();
      const th=Math.atan2(c9.crossVectors(n,up).dot(t9),n.dot(up)),mx=.05*P[i+1].distanceTo(P[i])*(1-ty/.7),a=THREE.MathUtils.clamp(th,-mx,mx);
      om[i]=a;n.applyAxisAngle(t9,a);n.addScaledVector(t9,-n.dot(t9)).normalize();}}}
  c1={ctrl:ctrl,cv:cv,Lc:Lc,K:K,P:P,n1:n1,h:h,Tv:Tv,Nv:Nv,om:om};pisteTord._c1=c1;}
  const cv=c1.cv,Lc=c1.Lc,K=c1.K,P=c1.P,n1=c1.n1,h=c1.h,Tv=c1.Tv,Nv=c1.Nv,om=c1.om;
  // 2) LES VRILLES : le roulis voulu `rho(s)`, par segments lissés (smoothstep) — tenue, quart de tour, demi-tour, tour complet
  /* LES TRONÇONS DROITS — l'arrivée au portail — ne suivent pas le plan : la dalle s'y redresse vers le
     CIEL DU MONDE (le rappel de buildTrack, mais d'où qu'elle parte, même à l'envers). ⚠ Revenir au même angle de roulis ne suffit pas : après
     des virages pris sur la tranche, tout le repère a tourné — seul un rappel vers la verticale remet la route à l'endroit. Le DÉPART,
     lui, n'a rien à corriger : la route d'origine y est déjà droite, on la reprend telle quelle. */
  const rg=mulberry32((seed^0x70D5E11A^(essai?Math.imul(essai,0x9E3779B1):0))>>>0),vC=Math.max(70,70+(lvPiste()-1)*100),seg=[],TOUR=Math.PI*2;
  const s0=Math.max(500,3*vC),fin=Lc-Math.max(1200*lvPiste(),6*vC); // (EN GRAND) plus de vrille dans le geste de fin AGRANDI (un virage de fin fait ~1,1 km) : on se redresse AVANT lui, sinon il part à la verticale et le rappel n'y peut rien (mesuré : portail à 45-50°)
  let s=s0,rho=0;seg.push({s0:0,s1:s0,r0:0,r1:0});
  while(!sansVrille&&s<fin-120){
    const r=rg();let len,amt=0;
    if(NV_CALME){const w=Math.atan2(Math.sin(rho),Math.cos(rho)); // (MOINS TORDUE, voir NV_CALME) w : le roulis ramené entre −π et π (0 = à l'endroit)
      if(Math.abs(w)>.3){if(r<.35)len=Math.max(250,vC*(2+rg()*2)); // là-haut (couchée, retournée) : 2-4 s de tenue, une fois sur trois…
        else{amt=-w;len=Math.max(450,vC*(6+rg()*3)*Math.sqrt(Math.abs(amt)/Math.PI));}} // …puis on revient à l'endroit, par le plus court
      else if(r<.6){len=Math.max(450,vC*(6+rg()*6));const v9=len;len=Math.min(len,fin-s);if(len<60)break;seg.push({s0:s,s1:s+len,r0:rho,r1:rho,calme:1});s+=len;continue;} // à l'endroit : une longue tenue, 6-12 s — CALME : la dalle y est rappelée vers le ciel (voir plus bas)
      else{const k=rg(),sg=rg()<.5?-1:1;amt=sg*(k<.6?Math.PI/2:k<.95?Math.PI:TOUR);len=Math.max(450,vC*(6+rg()*3)*Math.sqrt(Math.abs(amt)/Math.PI));}}
    else if(r<.4)len=Math.max(400,vC*(4+rg()*5)); // une tenue : la dalle reste où elle est (couchée, retournée…) 4-9 s — de quoi respirer entre deux vrilles
    else{const k=rg(),sg=rg()<.5?-1:1;amt=sg*(k<.45?Math.PI/2:k<.9?Math.PI:TOUR);len=Math.max(450,vC*(6+rg()*3)*Math.sqrt(Math.abs(amt)/Math.PI));} // (EN GRAND) ~3× plus lentes qu'au premier jet, le tour complet rare
    const veut=len;len=Math.min(len,fin-s);if(len<60)break;
    if(amt&&len<veut*.7)amt=0; // pas la place de la vrille entière avant le portail : on tient, on ne la serre pas
    seg.push({s0:s,s1:s+len,r0:rho,r1:rho+amt});s+=len;rho+=amt;}
  const rhoAt=function(x){for(const g of seg)if(x<=g.s1){if(x<=g.s0)return g.r0;const u=(x-g.s0)/(g.s1-g.s0);return g.r0+(g.r1-g.r0)*u*u*(3-2*u);}return rho;};
  const droit=new Uint8Array(n1+1);
  if(!sansVrille){const mk=function(x0,x1){for(let i=Math.max(0,Math.floor(x0/h));i<=Math.min(n1,Math.ceil(x1/h));i++)droit[i]=1;};mk(fin,Lc+h);}
  const calme=new Uint8Array(n1+1);if(!sansVrille&&NV_CALME)for(const g of seg)if(g.calme)for(let i=Math.max(0,Math.ceil(g.s0/h));i<=Math.min(n1,Math.floor(g.s1/h));i++)calme[i]=1; // (MOINS TORDUE) les tenues à l'endroit
  /* 2 bis) LE DÉVERS (2026-10-18) : dans chaque virage la dalle se couche vers l'INTÉRIEUR, de l'angle qu'aurait un virage relevé pris
     à la croisière (atan v²/gR, plafonné) — l'épingle se prend presque sur la tranche, le grand balayage à peine penché. Le lacet est relevé dans le
     plan de la dalle d'origine (lissé sur ~30 m), la cible lissée sur ~1 s puis bornée en vitesse de roulis (deux passes, aller et retour : la
     dalle se couche AVANT le virage, se redresse en sortant). Rien dans les tronçons droits (portail) ; au volant, rien ne change. */
  const dev=new Float32Array(n1+1);let devMax=0;
  if(!sansVrille){const DV=TORD_DEVERS,a9=new THREE.Vector3(),yw=new Float32Array(n1),y2=new Float32Array(n1);
    for(let i=0;i<K;i++){a9.crossVectors(Tv[i],Tv[i+1]);const sn=a9.length();if(sn>1e-9)yw[i]=a9.dot(Nv[i])/sn*Math.atan2(sn,Tv[i].dot(Tv[i+1]))/h;}
    const flou=function(src,dst,r){let s=0,c=0;for(let i=-r;i<n1+r;i++){const ia=i+r,io=i-r-1;if(ia<n1){s+=src[ia];c++;}if(io>=0){s-=src[io];c--;}if(i>=0&&i<n1)dst[i]=s/Math.max(1,c);}};
    flou(yw,y2,Math.max(1,Math.round(15/h)));
    for(let i=0;i<n1;i++)yw[i]=droit[i]?0:-Math.sign(y2[i])*Math.min(DV.max,DV.k*Math.atan(vC*vC*Math.abs(y2[i])/DV.g)); // − : la normale penche vers le centre du virage (vers +B quand la route tourne vers +B)
    const r9=Math.max(1,Math.round(DV.lis*vC/h/2));flou(yw,y2,r9);flou(y2,yw,r9);
    for(let i=0;i<n1;i++)if(droit[i])yw[i]=0; // (le tronçon droit à 0 AVANT les bornes : la passe retour couche la dalle à plat en l'approchant — dedans, de toute façon, seul le rappel vers le ciel agit)
    const m9=DV.vmax/vC*h;for(let i=n1-2;i>=0;i--)yw[i]=THREE.MathUtils.clamp(yw[i],yw[i+1]-m9,yw[i+1]+m9);for(let i=1;i<n1;i++)yw[i]=THREE.MathUtils.clamp(yw[i],yw[i-1]-m9,yw[i-1]+m9);
    for(let i=0;i<n1;i++){dev[i]=yw[i];devMax=Math.max(devMax,Math.abs(dev[i]));}dev[n1]=dev[n1-1];}
  // 3) LE CHEMIN REFAIT : chaque pas d'origine (corde, rotation de la tangente, roulis) relu dans le repère d'origine, rejoué dans le nouveau
  const Y9=new THREE.Vector3(0,1,0),T2=Tv[0].clone(),N2=Nv[0].clone(),B2=new THREE.Vector3(),Bo=new THREE.Vector3(),d=new THREE.Vector3(),ax=new THREE.Vector3(),p=P[0].clone();
  const Q=[p.clone()],TT=[T2.clone()],NN=[N2.clone()];let rhoP=0,rMax=0;
  for(let i=0;i<K;i++){
    Bo.crossVectors(Nv[i],Tv[i]);B2.crossVectors(N2,T2);
    d.subVectors(P[i+1],P[i]);p.addScaledVector(T2,d.dot(Tv[i])).addScaledVector(N2,d.dot(Nv[i])).addScaledVector(B2,d.dot(Bo));Q.push(p.clone());
    ax.crossVectors(Tv[i],Tv[i+1]);const sn=ax.length(),cs=Tv[i].dot(Tv[i+1]);
    if(sn>1e-9){ax.multiplyScalar(1/sn);const an=ax.dot(Nv[i]),ab=ax.dot(Bo),at=ax.dot(Tv[i]);
      c9.set(0,0,0).addScaledVector(N2,an).addScaledVector(B2,ab).addScaledVector(T2,at).normalize();q.setFromAxisAngle(c9,Math.atan2(sn,cs));T2.applyQuaternion(q);N2.applyQuaternion(q);}
    T2.normalize();N2.addScaledVector(T2,-N2.dot(T2)).normalize();
    const rN=rhoAt((i+1)*h)+dev[i+1];let rl; // (2026-10-18) + le DÉVERS (2 bis)
    {const mR=TORD_DEVERS.roulis/vC*h,dR=THREE.MathUtils.clamp(rN-rhoP,-mR,mR);rl=om[i]+dR;rhoP+=dR;} // (2026-10-18) le roulis TOTAL borné (vrille + dévers qui s'ajoutent) : le retard se rattrape dans la tenue qui suit
    if(calme[i+1]&&!droit[i+1]){const ty=Math.abs(T2.y);if(ty<.95){up.set(-T2.x*T2.y,1-T2.y*T2.y,-T2.z*T2.y);if(up.lengthSq()>1e-8){up.normalize();up.applyAxisAngle(T2,dev[i+1]); // (MOINS TORDUE) le ciel, penché du dévers
      const th=Math.atan2(c9.crossVectors(N2,up).dot(T2),N2.dot(up)),mx=Math.min(.05,Math.PI/(4*vC))*h*Math.min(1,(.95-ty)/.25);rl=THREE.MathUtils.clamp(th,-mx,mx);rhoP=rN;}}} // au plus un demi-tour en 4 s de croisière : la route se REMET à l'endroit pendant la tenue
    if(droit[i+1]){rl=0;const ty=Math.abs(T2.y);if(ty<.95){up.set(-T2.x*T2.y,1-T2.y*T2.y,-T2.z*T2.y);if(up.lengthSq()>1e-8){up.normalize(); // le rappel vers le ciel, sans la condition « pas à l'envers » — (EN GRAND) et jusque dans les montées raides (.7 → .95) : un rappel plus doux doit pouvoir agir partout
      const th=Math.atan2(c9.crossVectors(N2,up).dot(T2),N2.dot(up)),mx=Math.min(.05,Math.PI/(3*vC))*h*Math.min(1,(.95-ty)/.25);rl=THREE.MathUtils.clamp(th,-mx,mx);}}} /* au plus un demi-tour en 3 s de croisière (EN GRAND ; c'était 1,3 s : un coup de vrille sec avant chaque trou) */
    rMax=Math.max(rMax,Math.abs(rl)/h);N2.applyAxisAngle(T2,rl);
    if(droit[i+1]||calme[i+1]){ax.crossVectors(T2,Y9);if(ax.lengthSq()>1e-6){ax.normalize(); /* (MOINS TORDUE : aussi dans les tenues calmes) (EN GRAND) LA PENTE AUSSI : sur cette route la pente dérive (mesuré : portail au bout d'un piqué de 50-60°, le roulis pourtant juste) —
      dans les tronçons droits elle revient DOUCEMENT à celle de la piste d'origine (≤ un quart de tour en 8 s de croisière : une bosse de ~400 m de rayon, pas un coude) */
      const pm=Math.PI/(16*vC)*h,a=THREE.MathUtils.clamp(Math.asin(THREE.MathUtils.clamp(Tv[i+1].y,-1,1))-Math.asin(THREE.MathUtils.clamp(T2.y,-1,1)),-pm,pm);T2.applyAxisAngle(ax,a).normalize();N2.applyAxisAngle(ax,a);}}
    N2.addScaledVector(T2,-N2.dot(T2)).normalize();TT.push(T2.clone());NN.push(N2.clone());}
  // 4) LES POINTS DE CONTRÔLE (un tous les ~18 m) et leur normale — buildTrack la reprend au lieu de transporter la sienne
  const pas=3,out=[],outN=[];for(let i=0;i<n1;i+=pas){out.push(Q[i]);outN.push(NN[i]);}
  if((n1-1)%pas){out.push(Q[n1-1]);outN.push(NN[n1-1]);}
  // 5) LES REPÈRES de genCtrl : les modules (index de contrôle) se recalculent ; plus de filet
  if(sansVrille)return {ctrl:out,N:outN,ecart:Q[n1-1].distanceTo(P[n1-1]),ecartMax:Q.reduce(function(m,v,i){return Math.max(m,v.distanceTo(P[i]));},0)}; // (dbgHaut : le contrôle ne touche pas aux repères)
  {const lg=cv.getLengths(),nC=Math.max(1,ctrl.length-1),dv=lg.length-1,ix=function(j){if(j>=nC)return out.length-1;const f=j/nC*dv,k=Math.min(dv-1,Math.floor(f));const sj=lg[k]+(lg[k+1]-lg[k])*(f-k);return Math.max(0,Math.min(out.length-1,Math.round(sj/h/pas)));};
   for(const m of MODMARK){m.i0=ix(m.i0);m.i1=ix(m.i1);}}
  FILETMARK.length=0;
  TORD.info={L:Math.round(Lc),vrilles:seg.filter(function(g){return g.r1!==g.r0;}).length,portailNy:+NN[n1-1].y.toFixed(2),tours:+(seg.reduce(function(a,g){return a+Math.abs(g.r1-g.r0);},0)/(Math.PI*2)).toFixed(2),rMaxDegM:+(rMax*57.3).toFixed(2),
    ecartFin:Math.round(Q[n1-1].distanceTo(P[n1-1])),deversMaxDeg:Math.round(devMax*57.3)};
  return {ctrl:out,N:outN};
}
/* LA ROUTE QUI NE SE TOUCHE PAS (2026-10-18, avec LES VIRAGES DE COURSE). Plus serrée, la piste enroulée dans l'espace repasse
   parfois près d'elle-même — MESURÉ (banc Node, 30 zones au palier 0) : 10 contacts, deux dalles qui se croisent à 2-23 m (la route d'avant,
   étalée par le zoom ×2,4 : aucun passage à moins de 60 m). Un pont propre reste permis (≥ 14 m de vide sous la dalle, la règle des ponts de
   passation/RACCOURCIS.md, avec marge) : on refuse seulement deux dalles qui se TOUCHENT. `tordContacts` les compte sur les points de contrôle
   (~18 m) ; `pisteTordPropre` rejoue alors les VRILLES avec un autre tirage (même graine de départ : tout le monde a la même route), jusqu'à
   5 fois, et garde la plus propre (mesuré, 180 zones : 3 sur 4 passent du premier coup, aucune ne reste en contact ; 15-26 ms la zone en médiane). Le tracé ressenti (virages, modules) ne bouge pas : seule la façon dont la route s'enroule change. */
function tordContacts(Q,NQ){
  const n=Q.length,C=70,g=new Map(),key=function(x,y,z){return ((x&2047)*2048+(y&2047))*2048+(z&2047);};let s=0;const sA=new Float32Array(n); // (clé NUMÉRIQUE : une clé texte coûtait 10 ms par essai)
  for(let i=0;i<n;i++){if(i)s+=Q[i].distanceTo(Q[i-1]);sA[i]=s;const k=key(Math.floor(Q[i].x/C),Math.floor(Q[i].y/C),Math.floor(Q[i].z/C));let l=g.get(k);if(!l){l=[];g.set(k,l);}l.push(i);}
  const T9=new THREE.Vector3(),B9=new THREE.Vector3(),d9=new THREE.Vector3();let nC=0,vu=-1e9;
  for(let i=1;i<n-1;i++){const p=Q[i],cx=Math.floor(p.x/C),cy=Math.floor(p.y/C),cz=Math.floor(p.z/C);let tc=false;
    T9.subVectors(Q[i+1],Q[i-1]).normalize();B9.crossVectors(T9,NQ[i]);
    for(let a=-1;a<=1&&!tc;a++)for(let b=-1;b<=1&&!tc;b++)for(let c=-1;c<=1&&!tc;c++){const l=g.get(key(cx+a,cy+b,cz+c));if(!l)continue;
      for(const j of l){if(sA[j]-sA[i]<250)continue;d9.subVectors(Q[j],p);if(d9.lengthSq()>75*75)continue;
        if(Math.abs(d9.dot(NQ[i]))<16&&Math.abs(d9.dot(B9))<62){tc=true;break;}}}
    if(tc&&sA[i]-vu>300){nC++;vu=sA[i];}}
  return nC;}
function pisteTordPropre(ctrl,seed){
  const m0=MODMARK.map(function(m){return {i0:m.i0,i1:m.i1};}),f0=FILETMARK.slice();
  let best=null,bC=1e9,bI=null,bM=null;
  for(let e=0;e<6;e++){
    if(e){MODMARK.forEach(function(m,k){m.i0=m0[k].i0;m.i1=m0[k].i1;});FILETMARK.length=0;for(const f of f0)FILETMARK.push(f);}
    const r=pisteTord(ctrl,seed,false,e),c=tordContacts(r.ctrl,r.N);
    if(c<bC){best=r;bC=c;bI=Object.assign({},TORD.info,{essai:e,contacts:c});bM=MODMARK.map(function(m){return {i0:m.i0,i1:m.i1};});}
    if(!c)break;}
  MODMARK.forEach(function(m,k){m.i0=bM[k].i0;m.i1=bM[k].i1;});TORD.info=bI;pisteTord._c1=null;
  return best;}
window.dbgHaut=function(k){ // (2026-10-15) LA ROUTE SANS HAUT NI BAS : son relevé · dbgHaut('controle') = la piste refaite SANS vrille doit retomber sur l'originale
  if(k==='controle'){if(!TORD.ctrl0)return 'pas de piste tordue en cours';const r=pisteTord(TORD.ctrl0,TORD.seed,true);return {ecartFin:+r.ecart.toFixed(3),ecartMax:+r.ecartMax.toFixed(3)};}
  let dos=0,tranche=0,yMin=1e9,yMax=-1e9;for(let i=0;i<NP;i++){const y=Nn[i].y;if(y<-.2)dos++;else if(y<.5)tranche++;yMin=Math.min(yMin,pts[i].y);yMax=Math.max(yMax,pts[i].y);}
  return {on:TORD.on,sym:+skyU.uSym.value.toFixed(2),info:TORD.info,aLEnvers:+(dos/NP).toFixed(3),surLaTranche:+(tranche/NP).toFixed(3),denivele:Math.round(yMax-yMin)};};
/* ---- LA PISTE D'APPRENTISSAGE (2026-09-24, niveau 1 de la carrière) : dessinée à la MAIN, pas tirée ----
   « une route beaucoup plus simple où le joueur apprend à jouer et à utiliser sa nitro : des virages simples et
   grisants, un looping, des tout-droits qui laissent booster ». Chaque ligne droite est une INVITATION à la
   nitro ; les virages ont de grands rayons (on les prend à fond) ; le looping arrive après une longue ligne
   droite, pour qu'on l'aborde avec de la vitesse. Mêmes briques que genCtrl (droite, arc, loop). */
const TUTO_DOUX=true; // (2026-10-14, gameplay) le départ de l'auto-école : longue droite puis 1er virage large (voir genTuto)
function genTuto(){
  const ctrl=[];
  let P=new THREE.Vector3(0,0,0),phi=0;
  const dir=()=>new THREE.Vector3(Math.sin(phi),0,Math.cos(phi));
  const push=()=>ctrl.push(P.clone());
  const straight=(l,dy=0,n=2)=>{for(let k=0;k<n;k++){P.addScaledVector(dir(),l/n);P.y+=dy/n;push();}};
  const arc=(aDeg,R,n,dy=0)=>{const a=aDeg*Math.PI/180,st=a/n,ch=2*R*Math.sin(Math.abs(st)/2);
    for(let k=0;k<n;k++){phi+=st/2;P.addScaledVector(dir(),ch);P.y+=dy/n;phi+=st/2;push();}};
  push();
  /* (2026-10-14, gameplay — relevé du banc, BACKLOG P3) LA LEÇON « TOURNE » TOMBAIT DANS LE VIRAGE : la carte paraît 1,9 s après le départ
     (fin du logo), à ~256 km/h, ~100 m avant la fin des 300 m de droite ; le 1er virage (R 190) sortait de la route ~3 s plus tard sans un
     geste (« SORTI ! SUIS LA ROUTE »), avant qu'un débutant ait trouvé le volant. Le DÉBUT seulement : 520 m de droite (≈ 6 s de calme
     après la carte pour glisser le pouce à gauche, à droite) puis le même virage de 70° deux fois plus large (R 380 : sans un geste on en
     sort ~2 s après son entrée, au lieu de 1,4) — il donne encore un SENS au volant. Le reste du tracé est le même, déplacé d'un bloc
     (même cap) : aucun croisement (banc outils/tuto-trace.cjs : 275 m d'écart mini, comme avant). TUTO_DOUX=false = l'ancien départ. */
  if(TUTO_DOUX){straight(520,0,4);arc(70,380,8);}
  else{
  straight(300,0,3);            // le départ : on sent le gaz auto
  arc(70,190,6);                // 1er virage : large, on le prend à fond
  }
  straight(360,-24,3);          // 1re ligne droite en légère descente : « appuie sur NITRO »
  arc(-90,210,7);               // le grand virage grisant
  straight(420,0,4);            // on reprend de la vitesse…
  straight(240,-80,4);          // …LE GRAND PLONGEON (18°)
  straight(380,0,3);            // la ligne droite de récompense : nitro à fond
  arc(55,170,5);arc(-55,170,5); // les esses, douces
  straight(300,20,3);
  arc(120,230,9);               // le dernier grand virage
  straight(420,0,4);            // la ligne droite finale vers le portail
  return ctrl;
}
/* LA DESCENTE DE LA VILLE (2026-09-27, vague 3, user : « dans le niveau de la ville la descente doit être un peu moins abrupte »).
   MESURÉ au banc (genCtrl + Catmull-Rom du jeu, 6 graines × 2 vitesses, pente lissée sur 20 m) : la piste de la ville plongeait à
   28-31° de médiane, 45° au P95, 47,8° au pire (grand virage et esses : jusqu'à 1,1 m de chute par mètre), et 32-46° dès les 400
   premiers mètres. Aux NUAGES la même pente passe inaperçue ; entre les tours, chaque façade la MESURE : les immeubles basculent en
   éventail, on pique dans le vide. On COMPRIME donc les pentes de la ville, segment par segment : sous `seuil` (tan ≈ 16,7°) rien ne
   bouge — les liaisons, les vagues, les petites bosses gardent leur relief — au-delà, seule la part `garde` (35 %) de l'excès passe :
   48° → 30°, la plongée d'entrée 32,5° → 22,7°. Le TRACÉ EN PLAN est intact (x, z, virages, longueurs de motifs), AUCUN tirage `rnd`
   n'est ajouté ni retiré : seule l'altitude des points change, et la ville se rebâtit autour (`tourLibre`). NUAGES et ORBITE n'y
   passent jamais. Banc après : max 30,2°, P95 28,5°, entrée ≤ 29° ; la ville tombe de ~5,5 km au lieu de ~8,5 (même tracé en plan, ruban
   8 % plus court), les étages de la spirale gardent ≥ 143 m d'écart. Revenir à l'ancienne ville : `garde:1`. */
const VILLE_PENTE={seuil:.30,garde:.35};
/* L'AUTOROUTE ORBITALE (2026-09-30, session SON — Sacha : « vu qu'on va très vite, adapte le terrain dans le niveau espace »).
   MESURÉ (`dbgTerrain`, banc terrain-banc.js, 12 pistes par palier moteur) : le VOLANT n'était pas le problème — à la croisière, 0 % de
   la piste hors d'atteinte, partout. Ce qui distinguait l'espace, c'était le RELIEF : l'espace sortait du même générateur que les nuages
   (mêmes motifs, mêmes pentes) mais avec la gravité ÷2 — 10 à 24 % de sa longueur en crêtes qu'une caisse à cette vitesse ne tiendrait
   pas (v²·κ > g·gK), contre 2 à 13 % aux nuages ; et des épingles, chicanes, vagues et plongeons taillés pour 300 km/h qu'on avale à 700.
   En ESPACE (ORBITE, PLUIE DE SATELLITES, et tout niveau `espace` tiré par genCtrl — jamais les pistes dessinées de la campagne) :
   · la piste est dessinée pour 30 % de vitesse EN PLUS (`lv`) : rayons, droites, liaisons et zone s'allongent d'autant — la NITROOO et
     les paliers gagnés pendant la zone y tiennent ;
   · les poids de la VILLE (grands virages, grands balayages) tempérés (`w`) : épingles ×0,35, vagues, plongeons, chicanes ×0,5, lignes de
     momentum ×1,2 — une route qui se prend à fond, avec les rayons larges de la ville ;
   · le RELIEF en houle : pentes au-delà de ~10° comprimées (`pente`), crêtes et creux arrondis 2,5× plus (`cretes`, voir adoucirCretes). */
/* (2026-10-18, LES MODULES DE CHAQUE MAP) `wm` : les poids de l'orbite quand elle a ses modules — moins de grands balayages (×0,35), de lignes de momentum (×0,25) et de plongeons, plus d'épingles, d'esses et de chicanes (×1 · ×1,6 · ×1,6) : « trop de tout droit », deux fois */
const ESP_ROUTE={lv:1.3,w:[1,1,.35,1,.5,1,.5,1.2,.5,1,1,1,1],wm:[1,1,1,1.6,.4,1,.4,.25,1.6,.35,.2,1,1],pente:{seuil:.14,garde:.4},cretes:.35};
