/* ============================================================================
   LE MENU — LE LOGO QU'ON CASSE (2026-08-18)
   ----------------------------------------------------------------------------
   ⚠ LE CLIC N'IMPORTE OÙ EST SUPPRIMÉ. C'était lui, le « jeu mobile » : tout l'écran était un
   bouton, donc rien n'était un bouton. Le menu a désormais UNE action primaire (Jouer) et le logo
   est libéré pour autre chose. Plus de sélecteur de niveau ici (2026-09-03) : la radio choisit
   elle-même son morceau au hasard, voir `musicStartRun`.
   ========================================================================== */
/* ---- LE LOGO SE CASSE ET LÂCHE QUELQUE CHOSE ------------------------------------------------
   Le wordmark n'est plus un bouton de démarrage : c'est un objet qu'on frappe. Chaque clic le
   secoue, en fait gicler des tessons, et lâche UN jeton tiré au sort.
   ⚠ LES RARETÉS SONT LA MÉCANIQUE, pas la décoration. Si tout tombait à égalité il n'y aurait
   aucune raison de recliquer : c'est de savoir que le trèfle à quatre feuilles existe — et qu'on
   ne l'a pas encore vu — qui fait retaper sur le logo. Le poids est donc décroissant, et le
   dernier est volontairement presque introuvable. */
/* ⚠ LES SYMBOLES DE L'INTRO, PAS DES EMOJI (2026-08-18). Un emoji est dessiné par le SYSTÈME : il
   arrive avec sa propre facture, ses propres couleurs, son propre style — sur un jeu à la direction
   artistique tenue, ça fait autocollant. Les glyphes typographiques ($ ♥ ♣ ☠ € ¥ ♦), eux, sont
   rendus dans NOTRE police et NOS couleurs : ils appartiennent au jeu. C'est exactement le
   vocabulaire de la fission de l'intro — le logo relâche ce dont il est fait. */
/* ⚠ LE SÉLECTEUR \uFE0E N'EST PAS DÉCORATIF. ♦ ♥ ♣ ☠ ont une PRÉSENTATION EMOJI par défaut sur
   macOS et iOS : sans lui, le système les remplace par ses pictos couleur — exactement le « cheap »
   qu'on voulait fuir. VS-15 force la présentation TEXTE, donc notre police et notre couleur. */
const VS='\uFE0E';
const JETONS=[
  {g:'$',        c:'#ffd75e',n:'DOLLAR',       p:26},
  {g:'€',        c:'#9ad8ff',n:'EURO',         p:20},
  {g:'♦'+VS,     c:'#ff9d2e',n:'CARREAU',      p:15},
  {g:'♥'+VS,     c:'#ff5e8a',n:'CŒUR',         p:13},
  {g:'♣'+VS,     c:'#54e07a',n:'TRÈFLE',       p:11},
  {g:'¥',        c:'#ffc46b',n:'YEN',          p:8},
  {g:'☠'+VS,     c:'#e8e8f0',n:'TÊTE DE MORT', p:5},
  {g:'1.61',     c:'#fff2be',n:'LE NOMBRE D\'OR',p:2}   // ~1 clic sur 50 : la signature du studio
];
let butinVus={},logoCd=0;
function jetonTire(){
  let tot=0;for(const j of JETONS)tot+=j.p;
  let r=Math.random()*tot;
  for(const j of JETONS){r-=j.p;if(r<=0)return j;}
  return JETONS[0];
}
function logoCasse(ev){
  const h1=overlay.querySelector('h1');if(!h1)return;
  const now=performance.now();
  if(now-logoCd<260)return;               // anti-matraquage : sans ça le clic répété fait un stroboscope
  logoCd=now;
  const r=h1.getBoundingClientRect();
  const cx=(ev&&ev.clientX)||r.left+r.width/2, cy=(ev&&ev.clientY)||r.top+r.height/2;
  try{noiseBurst(.46,.10,2600);subBoom(.62);}catch(e){}  // le CHOC : un craquement sec + un coup sourd
  /* ⚠ REDUCED_MOTION : ni secousse, ni onde, ni éclats, ni gerbe — que du FONDU. Le jeton tiré apparaît
     sur place et s'efface (une dissolution, pas un mouvement) ; le butin et le carillon restent : le
     jouet garde sa mécanique de rareté, il perd seulement son explosion. (La règle CSS
     `#overlay h1{animation:none}` ne suffisait pas : `#overlay h1.casse` est plus spécifique.) */
  if(REDUCED_MOTION){
    const j=jetonTire();
    const el=document.createElement('div');el.className='jeton';
    el.textContent=j.g;el.style.color=j.c;
    el.style.left=cx+'px';el.style.top=cy+'px';el.style.transform='translate(-50%,-50%)';
    document.body.appendChild(el);
    el.animate([{opacity:0},{opacity:1,offset:.2},{opacity:1,offset:.7},{opacity:0}],{duration:1400}).onfinish=()=>el.remove();
    logoButin(j);
    return;
  }
  h1.classList.remove('casse');void h1.offsetWidth;h1.classList.add('casse'); // relance l'animation
  /* --- L'ONDE : elle part du point frappé et s'ouvre. C'est elle qui donne l'ÉCHELLE au choc —
     sans onde, une gerbe de particules ressemble à un feu d'artifice de fête foraine. */
  const on=document.createElement('div');on.className='casseOnde';
  on.style.left=cx+'px';on.style.top=cy+'px';document.body.appendChild(on);
  on.animate([{transform:'translate(-50%,-50%) scale(.15)',opacity:.85,borderWidth:'6px'},
              {transform:'translate(-50%,-50%) scale(3.2)',opacity:0,borderWidth:'1px'}],
    {duration:640,easing:'cubic-bezier(.12,.75,.3,1)'}).onfinish=()=>on.remove();
  /* --- LES ÉCLATS : RADIAL, PAS UNIDIRECTIONNEL.
     ⚠ l'ancienne version ajoutait `+70` au Y de tous les éclats : ils partaient donc tous VERS LE
     BAS quel que soit leur angle, et la casse « tombait d'un seul sens ». La gravité arrive
     maintenant APRÈS, dans une 3e image-clé — l'explosion s'ouvre d'abord en étoile, PUIS retombe.
     C'est la différence entre une gerbe et une chute. */
  for(let i=0;i<26;i++){
    const t=document.createElement('div');t.className='tesson';
    const a=Math.random()*6.2832, d=80+Math.random()*260, spin=Math.random()*900-450;
    t.style.left=cx+'px';t.style.top=cy+'px';
    t.style.height=(7+Math.random()*16)+'px';
    t.style.opacity=.5+Math.random()*.5;
    document.body.appendChild(t);
    const ex=Math.cos(a)*d, ey=Math.sin(a)*d;
    t.animate([
      {transform:'translate(-50%,-50%) rotate('+(a*57)+'deg) scale(1)',opacity:1},
      {transform:'translate('+(ex*.62-.5)+'px,'+(ey*.62)+'px) rotate('+(a*57+spin*.5)+'deg) scale(.9)',opacity:.95,offset:.34},
      {transform:'translate('+ex+'px,'+(ey+150+Math.random()*90)+'px) rotate('+(a*57+spin)+'deg) scale(.4)',opacity:0}],
      {duration:780+Math.random()*420,easing:'cubic-bezier(.10,.62,.35,1)'}).onfinish=()=>t.remove();
  }
  /* --- LA GERBE DE SYMBOLES : plusieurs jaillissent, dans TOUTES les directions. Le jeton TIRÉ est
     le plus gros et part vers le haut (c'est lui qu'on doit lire) ; les autres sont du décor pris
     dans la même explosion, et c'est eux qui rendent le geste généreux. */
  const j=jetonTire();
  const gerbe=5+((Math.random()*4)|0);
  for(let i=0;i<gerbe;i++){
    const k=JETONS[(Math.random()*JETONS.length)|0];
    const el=document.createElement('div');el.className='jeton petit';
    el.textContent=k.g;el.style.color=k.c;
    el.style.left=cx+'px';el.style.top=cy+'px';
    document.body.appendChild(el);
    const a=Math.random()*6.2832, d=90+Math.random()*230;
    el.animate([
      {transform:'translate(-50%,-50%) scale(.3) rotate(0deg)',opacity:0},
      {transform:'translate('+(Math.cos(a)*d*.7)+'px,'+(Math.sin(a)*d*.7-40)+'px) scale(1) rotate('+(Math.random()*90-45)+'deg)',opacity:1,offset:.30},
      {transform:'translate('+Math.cos(a)*d+'px,'+(Math.sin(a)*d+230)+'px) scale(.55) rotate('+(Math.random()*260-130)+'deg)',opacity:0}],
      {duration:1000+Math.random()*500,easing:'cubic-bezier(.16,.6,.35,1)'}).onfinish=()=>el.remove();
  }
  // LE JETON TIRÉ : plus gros, plein axe, il monte et retombe — impossible de le confondre avec le décor
  const el=document.createElement('div');el.className='jeton';
  el.textContent=j.g;el.style.color=j.c;
  el.style.left=cx+'px';el.style.top=cy+'px';
  document.body.appendChild(el);
  const dx=(Math.random()-.5)*90;
  el.animate([{transform:'translate(-50%,-50%) scale(.35) rotate(0deg)',opacity:0},
              {transform:'translate(calc(-50% + '+dx*.4+'px),-160px) scale(1.5) rotate(9deg)',opacity:1,offset:.34},
              {transform:'translate(calc(-50% + '+dx+'px),-118px) scale(1.28) rotate(-4deg)',opacity:1,offset:.64},
              {transform:'translate(calc(-50% + '+dx*1.3+'px),180px) scale(.9) rotate(16deg)',opacity:0}],
    {duration:1500,easing:'cubic-bezier(.25,.5,.4,1)'}).onfinish=()=>el.remove();
  logoButin(j);
}
function logoButin(j){ // le compte du butin + le carillon (commun à la casse et à sa version sans mouvement)
  butinVus[j.n]=(butinVus[j.n]||0)+1;
  const bu=$('butin');
  const rare=j.p<=5;
  if(bu){
    bu.textContent=TR(j.n)+(butinVus[j.n]>1?'  ×'+butinVus[j.n]:'')+(rare?'  ·  RARE':'');
    bu.style.color=rare?j.c:'#6f6690';
  }
  try{chimeNote(rare?1568:880,0,.14,rare?.30:.16);}catch(e){}
  if(j.p<=2){try{fanfare();}catch(e){}}   // le nombre d'or mérite la fanfare
}
overlay.addEventListener('click',function(e){
  if(pendingScore!=null)return;
  const h1=overlay.querySelector('h1');
  if(h1&&h1.contains(e.target)){logoCasse(e);return;}  // LE LOGO EST UN JOUET, plus un bouton de départ
});
$('playBtn').addEventListener('click',function(e){
  e.stopPropagation();
  playViaGarage(); // « on ne peut jouer que depuis le garage » (2026-09-05) — voir playViaGarage()
});
$('resetBtn').addEventListener('click',()=>{if(started){resetGame();}});
// ---- sauvegarde : exporter / restaurer par code (le clic ne doit PAS relancer la partie) ----
const expBtn=$('saveExp'),impBtn=$('saveImp');
function btnFlash(b,txt){const o=b.innerHTML;b.innerHTML=txt;setTimeout(()=>{b.innerHTML=o;},1600);}
expBtn.addEventListener('click',e=>{e.stopPropagation();
  const code=SAVE.export();
  if(navigator.clipboard&&navigator.clipboard.writeText)
    navigator.clipboard.writeText(code).then(()=>btnFlash(expBtn,pxi('coche')+' '+TR('COPIE !')),()=>prompt(TR('Copie ce code :'),code));
  else prompt(TR('Copie ce code :'),code); // vieux navigateurs : la boîte fait le travail
});
impBtn.addEventListener('click',e=>{e.stopPropagation();
  const c=prompt(TR('Colle ton code de sauvegarde :'));
  if(c==null)return; // annulé
  if(SAVE.import(c)){btnFlash(impBtn,pxi('coche')+' '+TR('RESTAURE — RECHARGE…'));setTimeout(()=>location.reload(),900);}
  else btnFlash(impBtn,pxi('croix')+' '+TR('CODE INVALIDE'));
});
// ---------- MODE SURVIVANT v2 : 7 VRAIES voitures de police sur la piste — la POURSUITE ----------
// Chaque IA est incarnée : elle roule, dépasse, défend, se rate, revient. Le classement = la DISTANCE
// parcourue (survPTot() pour le joueur — SURV.pBase+s, la dalle survolée en vol : les écarts survivent aux portails, téléportation invisible).
// Couperet toutes les 60 s : le DERNIER explose. LOD partout : sim 1D permanente, mesh+gyros seulement
// à portée de vue, 2 vraies lumières (pool) pour les plus proches, sirène unique dosée à la distance.
const SURV={armed:false,on:false,t:0,over:false,_r:0,pBase:0,ph:0,last:false};
SURV.bots=[];
// (2026-09-30) OÙ EN EST LE JOUEUR DANS LA COURSE — UNE seule formule pour le classement, la plaque, la sirène, le LOD et le couperet.
// En VOL, `s` reste figé au DÉCOLLAGE : le Survivant classique te jugeait là (bip « dernier » en plein saut, et une minute tombée en
// l'air t'abattait quand la pose t'aurait remis devant) ; la poursuite et la plaque du niveau 14 lisaient déjà la dalle survolée.
function survPTot(){return SURV.pBase+(mode==='fall'?lastNearS:s);}
// …et ce que le PORTAIL verse au compteur : franchi EN VOL, `s` vaut encore le décollage (des centaines de mètres de classement perdus
// d'un coup, la meute passait devant) — on compte au moins l'entrée de l'ovule, L−80, la référence du raccourci (portailPasse).
function survPortS(){return mode==='fall'?Math.max(s,L-80):s;}
// personnalités : plus PERSONNE n'a de bonus de vitesse — tout le monde a TA caisse et TES lois.
// La différence se joue au CERVEAU : agro = dépasse/bloque · err = fréquence des fautes ·
// rea = délai de réaction (s, comme un humain) · line = propreté de trajectoire et des points de corde
const SURV_PILOTS=[
 {n:'RICO',agro:.92,err:.20,rea:.13,line:.60}, // le chien fou : réflexes de chat, trajectoires de poivrot
 {n:'JADE',agro:.30,err:.03,rea:.16,line:.97}, // la métronome : propre, implacable — la référence à battre
 {n:'MOMO',agro:.62,err:.11,rea:.14,line:.78}, // l'opportuniste : surgit sur les erreurs
 {n:'ZAZA',agro:.80,err:.28,rea:.10,line:.86}, // la fusée fautive : réagit au quart de tour, se rate en grand
 {n:'LULU',agro:.42,err:.07,rea:.26,line:.82}, // la prudente : longue à la détente, mais sûre
 {n:'KIKI',agro:.72,err:.14,rea:.17,line:.72}, // la teigneuse : défend chaque mètre
 {n:'BOB', agro:.52,err:.10,rea:.21,line:.76}, // le régulier : jamais brillant, jamais loin
];
// ---------- APPRENTISSAGE : les IA t'observent et adoptent ton style (façon Drivatar) ----------
// Deux mémoires. (1) Un PROFIL persistant (localStorage via SAVE) qui agrège TA manière de jouer sur
// toutes tes parties — appétit de saut, usage nitro, prudence en virage, niveau, agressivité. Il biaise
// tous les bots au départ : run après run, ils prennent ta patte. (2) Des ZONES DE SAUT enregistrées
// EN DIRECT sur la piste courante : là où TU décolles, un bot qui repasse au même endroit décolle aussi.
const AIP={
  air:.5,boost:.35,caution:.5,skill:.86,aggr:.55,airDur:1.1,runs:0, // profil courant
  _drv:0,_jumps:0,_airT:0,_boost:0,_spd:0,_spdN:0,_lat:0,_latN:0,_committed:false,_pm:'', // accus de la run
  load(){const a=SAVE.d.ai;if(a){this.air=a.air;this.boost=a.boost;this.caution=a.caution;this.skill=a.skill;this.aggr=a.aggr;this.airDur=a.airDur;this.runs=a.runs;}},
  resetRun(){this._drv=0;this._jumps=0;this._airT=0;this._boost=0;this._spd=0;this._spdN=0;this._lat=0;this._latN=0;this._committed=false;this._pm=mode;},
  tick(dt){ // appelé chaque frame de jeu : on t'observe même hors mode Survivant
    if(SANDBOX||PARK.on||TUTO.on)return; // (2026-09-30) le bac à sable, le parc et l'auto-école ne sont pas TA conduite : la meute n'apprend pas des chutes d'une leçon
    if(mode==='drive'){this._drv+=dt;
      const mx=vmaxShow();if(mx>0){this._spd+=(Math.abs(vA)*3.6*SPD)/mx;this._spdN++;} // part de TA vitesse atteignable, pas de la fiche de carrosserie
      this._lat+=Math.abs(lat)/ROAD_HALF;this._latN++;
      if(nitroOn)this._boost+=dt;
    }else if(mode==='fall')this._airT+=dt;
    if(mode==='fall'&&this._pm!=='fall')this._jumps++; // un décollage de plus
    this._pm=mode;
  },
  commit(){ // fin de run : on fond les mesures dans le profil (adoption totale la 1re fois, EMA ensuite)
    if(this._committed||this._drv<3)return;this._committed=true;
    const cl=THREE.MathUtils.clamp;
    const air=cl(this._jumps/Math.max(6,this._drv)*7,0,1);          // ~1 saut / 7 s → plein appétit
    const boost=cl(this._boost/Math.max(6,this._drv)*3,0,1);
    const skill=this._spdN?cl(this._spd/this._spdN,.5,1.08):this.skill;
    const line=this._latN?this._lat/this._latN:.4;
    const caution=cl(1-line,.15,.95);                                // collé au centre = prudent
    const airDur=this._jumps?cl(this._airT/this._jumps,.4,4):this.airDur;
    const aggr=cl(air*.55+line*.55,.15,1);
    const w=this.runs<1?1:.35,mix=(o,n)=>o+(n-o)*w;                   // 1re run : on adopte tout ; ensuite EMA douce
    this.air=mix(this.air,air);this.boost=mix(this.boost,boost);this.skill=mix(this.skill,skill);
    this.caution=mix(this.caution,caution);this.airDur=mix(this.airDur,airDur);this.aggr=mix(this.aggr,aggr);
    this.runs++;
    SAVE.d.ai={air:this.air,boost:this.boost,caution:this.caution,skill:this.skill,aggr:this.aggr,airDur:this.airDur,runs:this.runs};
    SAVE.flush();
  }
};
AIP.load();
const survHudEl=$('survHud'),survBtnEl=$('survBtn'),lastAlertEl=$('lastAlert');
let svClkCtx=null,svRowsEl=null,svSecsEl=null;
// ---- carrosserie police : géométries/matériaux PARTAGÉS, 3 livrées pour casser les clones ----
const pcGlassM=new THREE.MeshPhongMaterial({color:0x0d1620,shininess:280,specular:0xffffff});
const pcBarM=new THREE.MeshPhongMaterial({color:0x101018,shininess:60,specular:0x444444});
const pcLiv=[ // [carrosserie, capot/accents]
  [new THREE.MeshPhongMaterial({color:0xf2f4f8,shininess:130,specular:0xdde6ff}),new THREE.MeshPhongMaterial({color:0x14161d,shininess:90,specular:0x8899aa})],
  [new THREE.MeshPhongMaterial({color:0x191b22,shininess:110,specular:0x99a6bb}),new THREE.MeshPhongMaterial({color:0xe8ecf2,shininess:120,specular:0xffffff})],
  [new THREE.MeshPhongMaterial({color:0x1c2a4a,shininess:110,specular:0x99aadd}),new THREE.MeshPhongMaterial({color:0xe8ecf2,shininess:120,specular:0xffffff})]];
const gyroRedOn=new THREE.MeshBasicMaterial({color:0xff3030}),gyroRedOff=new THREE.MeshBasicMaterial({color:0x4a0808});
const gyroBluOn=new THREE.MeshBasicMaterial({color:0x3f7dff}),gyroBluOff=new THREE.MeshBasicMaterial({color:0x081a4a});
const pcBodyG=new THREE.BoxGeometry(1.9,.58,4.3),pcCabG=new THREE.BoxGeometry(1.62,.52,2.0),
      pcHoodG=new THREE.BoxGeometry(1.7,.1,1.2),pcBaseG=new THREE.BoxGeometry(1.15,.09,.4),pcLampG=new THREE.BoxGeometry(.42,.17,.34);
const gloCv=document.createElement('canvas');gloCv.width=gloCv.height=64;
(()=>{const gc=gloCv.getContext('2d'),gr=gc.createRadialGradient(32,32,2,32,32,30);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');
  gc.fillStyle=gr;gc.fillRect(0,0,64,64);})();
const gloTex=new THREE.CanvasTexture(gloCv);
const sprRedM=new THREE.SpriteMaterial({map:gloTex,color:0xff3030,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
const sprBluM=new THREE.SpriteMaterial({map:gloTex,color:0x3f7dff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
const sprJetM=new THREE.SpriteMaterial({map:gloTex,color:0xff9a2a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}); // flamme réacteur (partagée)
// ROUES : la meute réutilisait la géométrie/le matériau des épaves — feature épave retirée ailleurs,
// donc la police porte désormais SES propres roues (mêmes valeurs, plus de dépendance fantôme wkWhG/wkWheelM).
const wkWhG=new THREE.CylinderGeometry(.34,.34,.24,10);
const wkWheelM=new THREE.MeshPhongMaterial({color:0x14161c,shininess:8});
