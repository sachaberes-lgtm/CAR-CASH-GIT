/* ===== AUJOURD'HUI — LA SÉRIE DE SEPT JOURS ET LE DÉFI DU JOUR (2026-10-20, Léo coche, séance « ce qu'on n'a jamais vraiment travaillé » :
   « une série de jours qui vaut le coup » · « le défi du jour, taillé pour toi ») =====
   Bâti SUR le retour du jour de Sacha (son/mute-cadeau.js, 14/10 : le ×2 de la 1re partie du jour, la série comptée par jourEtat/jourCommit) :
   rien de son horloge ne change, seule la PRIME de la série est remplacée.
   1. LA SÉRIE DE SEPT JOURS (`SERIE7`) — la prime de série valait 25 à 100 $ (une caisse coûte 1 500 $ à 2,5 M) : on ne la voyait pas, elle ne
      faisait revenir personne. Désormais un CALENDRIER de sept cases, en tête de l'écran MISSIONS : 150 $ · 250 $ · 1 JETON · 400 $ · 600 $ ·
      1 JETON · et au 7e jour UNE PEINTURE EXCLUSIVE (quatre, une par semaine : elles ne s'achètent pas, ni en boutique ni à la boutique du
      jour ; toutes à toi → 2 jetons). Le jour se gagne comme avant : la 1re partie COMPTÉE du jour (jourCommit, ≥ 15 s de course). Après le 7e,
      le calendrier repart au 1er jour (la série, elle, continue de se compter) ; un jour sauté le remet au 1er jour. Un jeton = un tirage de la
      machine FINAL SPIN (≈ 1 700 $ d'espérance, la seconde chance, le départ boosté, le jackpot) : c'est lui qui donne envie.
      Mesuré au modèle de Sacha (outils/jour-modele.cjs) : un joueur moyen gagne 350 à 700 $ par jour ; la semaine pleine verse 1 400 $ + 2 jetons
      + la peinture, contre 375 $ avant. `?serie=ancien` rend la prime de Sacha (0 · 25 · … · 100, JOUR.prime, que le modèle lit toujours).
   2. LE DÉFI DU JOUR (`DJ`, SAVE.d.dj) — UN défi par jour, tiré au 1er regard du jour, gardé jusqu'à minuit (heure de l'appareil) :
      · LA FAMILLE suit TON style : figures dans un saut, temps de vol posé, vitesse, survie, aura, poses parfaites d'affilée, frénésie (si tu l'as
        déjà atteinte) — chacune pèse 1 + ton record ÷ sa référence (plafonné à 3) : qui saute beaucoup reçoit plus de défis de figures. Jamais
        la même famille deux jours de suite. Le tirage vient de la date (même défi toute la journée, sur le même appareil).
      · LE SEUIL est calé sur TON meilleur (les records des missions, m2Etat().r) : égaler ton record pour les petits comptes (figures, poses),
        ~90 % pour le reste ; un plancher de débutant (2 figures, 3 s de vol, 45 s, 250 km/h, 1 500 d'aura, 2 poses, 8 s de frénésie).
      · Il se joue EN UNE PARTIE (les mesures de la course : m2ValCourse) ; réussi → +1 JETON tout de suite et la ligne du bas en course
        (« DÉFI DU JOUR RÉUSSI · +1 JETON ») — la machine FINAL SPIN s'ouvre à l'écran de fin. Rien en balade, bac à sable, parc ni auto-école.
   L'AFFICHAGE : un bloc AUJOURD'HUI en tête de la liste des missions (m2Render) — la ligne du défi (la même main que les missions : icône,
   consigne, jauge du meilleur essai du jour, « NOUVEAU DÉFI DANS 7 H ») et la rangée des sept cases (cochées, celle d'aujourd'hui qui bat,
   DEMAIN annoncé quand la case du jour est prise). L'écran de fin dit ce que la série a donné (jourFinTexte).
   Console : dbgSerie() · dbgSerie('jour',n) (pose la série à n jours, prise hier) · dbgDefiJour() · ('force','fig') · ('reussi') · ('demain'). */
const SERIE7={on:!/[?&]serie=ancien\b/.test(location.search),
  lots:[{cash:150},{cash:250},{jeton:1},{cash:400},{cash:600},{jeton:1},{exclu:1}],
  exclu:['srBraise','srAurore','srLagon','srEtoile'],plein:{jeton:2}};
/* LES QUATRE PEINTURES DE LA SÉRIE — `serie:1` : ni prix, ni mission ; shopOwned / m2HabAMoi ne les donnent qu'une fois gagnées ; hors des lots « toutes » des missions (m2HabReco) */
COSM.peinture.push(
  {id:'srBraise',n:'BRAISE FIDÈLE',serie:1,r:'epique',g:'o',grad:[0xb3141c,0xff5a1c,0xffc23a],d:'Ne s\'achète pas : le 7e jour de ta série. Sept jours d\'affilée sur l\'asphalte, la laque en garde la chaleur.'},
  {id:'srAurore',n:'AURORE BORÉALE',serie:1,r:'epique',g:'c',grad:[0x3cffc0,0x6fb8ff,0xc77dff],d:'Ne s\'achète pas : le 7e jour de ta série. Le ciel du Grand Nord, pour ceux qui reviennent chaque jour.'},
  {id:'srLagon',n:'LAGON INTERDIT',serie:1,r:'epique',g:'g',grad:[0x01404f,0x00b3c7,0x9ff7ff],d:'Ne s\'achète pas : le 7e jour de ta série. Une eau que personne n\'a le droit de voir. Toi si.'},
  {id:'srEtoile',n:'NUIT ÉTOILÉE',serie:1,r:'epique',g:'c',grad:[0x2a1f8f,0x8f5bff,0xff7ad9],d:'Ne s\'achète pas : le 7e jour de ta série. La nuit entière sur ta carrosserie, une semaine de plus.'});
function serieCase(n){return ((Math.max(1,n|0)-1)%7)+1;} /* le jour de série n → sa case du calendrier (1 … 7) */
function serieLot(c){const L=SERIE7.lots[c-1]||SERIE7.lots[0];if(!L.exclu)return L;const id=serieExclu();return id?{exclu:id}:SERIE7.plein;}
function serieExclu(){const o=(SAVE.d.shop&&SAVE.d.shop.own)||[];for(const id of SERIE7.exclu)if(o.indexOf('peinture:'+id)<0)return id;return '';} /* la prochaine peinture pas encore à toi */
function serieDonne(n){ /* appelée par jourCommit (la 1re partie comptée du jour) : verse le lot de la case du jour n, rend {c, cash, jeton, exclu} */
  const c=serieCase(n),L=serieLot(c),o={c:c,cash:0,jeton:0,exclu:''};
  if(L.cash){SAVE.d.bank=Math.min(1e30,bank()+L.cash);gagneAjoute(L.cash);bankMaxMaj();o.cash=L.cash;}
  if(L.jeton){SAVE.d.spinJ=Math.min(9,(SAVE.d.spinJ|0)+L.jeton);o.jeton=L.jeton;}
  if(L.exclu){const k='peinture:'+L.exclu;if(SAVE.d.shop.own.indexOf(k)<0)SAVE.d.shop.own.push(k);o.exclu=L.exclu;
    setTimeout(function(){try{toast(pxi('pinceau')+' '+serieLotTxt(L)+' — '+TR('EST À TOI'),true);}catch(e){}},1400);} /* le 7e jour : la peinture se dit, après l'entrée de l'écran de fin */
  SAVE.mark();return o;}
function serieLotTxt(L){ /* « +$ 150 » · « +1 JETON » · « BRAISE FIDÈLE » */
  if(L.cash)return '+'+fmtC(L.cash);if(L.jeton)return '+'+L.jeton+' '+TR(L.jeton>1?'JETONS':'JETON');
  const d=COSM.peinture.find(function(x){return x.id===(L.exclu||'');});return d?TR(d.n):'';}
function serieVue(){ /* l'état du calendrier pour l'affichage : {c : la case du jour (1-7) · pris : la case du jour est déjà gagnée · faits : cases cochées · n : la série vivante} */
  const a=jourAuj();if(!a||!JOUR.on)return null;const e=jourEtat(a);
  if(e.dispo)return {c:serieCase(e.suiv),pris:false,faits:serieCase(e.suiv)-1,n:e.n,casse:e.n>0&&e.suiv===1};
  return {c:serieCase(e.n),pris:true,faits:serieCase(e.n),n:e.n,casse:false};}

/* ---- LE DÉFI DU JOUR ---- */
const DJ={on:/[?&]defijour=1\b/.test(location.search),t:0, /* (2026-10-22, Sacha : « enlève le bouton défi du jour, il sert à rien ») éteint : plus de ligne ni de réussite, ?defijour=1 le rallume pour le banc */
  fam:[{k:'fig',  u:'',    ref:4,    min:2,   K:1,   t:'FAIS {v} FIGURES DANS UN SEUL SAUT',en:'LAND {v} TRICKS IN A SINGLE JUMP'},
       {k:'airP', u:'s',   ref:5,    min:3,   K:.9,  t:'TIENS {v} S EN L\'AIR ET POSE-TOI PROPREMENT',en:'STAY {v} S IN THE AIR AND LAND CLEAN'},
       {k:'vie',  u:'mn',  ref:120,  min:45,  K:.9,  t:'SURVIS {v} EN UNE PARTIE',en:'SURVIVE {v} IN ONE RUN'},
       {k:'kmh',  u:'kmh', ref:500,  min:250, K:.95, t:'ATTEINS {v} KM/H',en:'HIT {v} KM/H'},
       {k:'aura', u:'aura',ref:15000,min:1500,K:.85, t:'FAIS {v} D\'AURA EN UNE PARTIE',en:'SCORE {v} AURA IN ONE RUN'},
       {k:'parf', u:'',    ref:3,    min:2,   K:1,   t:'ENCHAÎNE {v} POSES PARFAITES',en:'CHAIN {v} PERFECT LANDINGS'},
       {k:'frenT',u:'s',   ref:20,   min:8,   K:.8,  t:'TIENS LA FRÉNÉSIE {v} S',en:'HOLD FRENZY FOR {v} S'}]};
function djHache(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function djArrondi(f,x){if(f.u==='kmh'||f.u==='mn')return Math.round(x/10)*10;if(f.u==='aura'){const p=Math.pow(10,Math.max(0,Math.floor(Math.log10(Math.max(1,x)))-1));return Math.round(x/p)*p;}
  return Math.round(x);}
function djRecord(f){try{return +m2Val({k:f.k})||0;}catch(e){return 0;}} /* le record à vie (les missions le tiennent) */
function djTire(jour,hier){ /* le défi d'un jour : la famille (ton style, tirée sur la date), le seuil (ton meilleur) */
  const s=m2Etat(),R=[];let tot=0;
  for(const f of DJ.fam){if(f.k===hier)continue;if(f.k==='frenT'&&!(s.r&&s.r.frenN))continue;const w=1+Math.min(2,djRecord(f)/f.ref);R.push([f,w]);tot+=w;}
  let x=(djHache('dj:'+jour)%100000)/100000*tot,f=R[0][0];for(const q of R){x-=q[1];if(x<=0){f=q[0];break;}}
  const b=djRecord(f),v=Math.max(f.min,djArrondi(f,b*f.K));return {d:jour,k:f.k,v:v,b:0,ok:0,y:hier||''};}
function djFam(k){for(const f of DJ.fam)if(f.k===k)return f;return DJ.fam[0];}
function djEtat(){ /* le défi d'AUJOURD'HUI (tiré s'il le faut) ; null si l'horloge est illisible ou le défi éteint */
  if(!DJ.on)return null;const a=jourAuj();if(!a)return null;const S=SAVE.d.dj;
  if(S.d!==a){const n=djTire(a,S.d?S.k:'');SAVE.d.dj=n;SAVE.mark();return n;}return S;}
function djTxt(D){const f=djFam(D.k),v=D.v,x=f.u==='mn'?m2Mn(v):f.u==='aura'?fmtAura(v):m2Nb(v);return String(LANG==='fr'?f.t:f.en).replace('{v}',x);}
function djM(D){const f=djFam(D.k);return {id:'dj',k:f.k,u:f.u,v:D.v,t:f.t,en:f.en};} /* le défi habillé en mission (m2Txt, m2Prog le lisent) */
function djTick(dt){ /* m2Tick (chaque image de course, missions allumées) : le meilleur essai du jour, la réussite */
  if(!DJ.on||(DJ.t-=dt)>0)return;DJ.t=.25;
  const D=djEtat();if(!D||D.ok)return;let v=0;try{v=m2ValCourse(djM(D))||0;}catch(e){return;}
  if(v>D.b){D.b=Math.min(D.v,D.k==='airP'||D.k==='vie'||D.k==='frenT'?Math.floor(v*10)/10:Math.floor(v));SAVE.mark();}
  if(v>=D.v){D.ok=1;D.b=D.v;SAVE.d.spinJ=Math.min(9,(SAVE.d.spinJ|0)+1);SAVE.flush();
    try{if(m2EnC()){M2L.q.unshift({k:'dj',tx:sansAcc(TR('RÉUSSI')),p:'+1 '+TR('JETON')});if(!M2L.on)m2LigneSuit();} /* la ligne du bas, EN TÊTE de la file : jamais fondue dans « n MISSIONS RÉUSSIES » */
      else toast(pxi('coche')+' '+TR('DÉFI DU JOUR RÉUSSI')+' · +1 '+TR('JETON'),true);}catch(e){}
    try{hap([12,40,18]);}catch(e){}}}
function djReste(){const t=new Date(),m=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1);return Math.max(0,m-t);} /* ms jusqu'à minuit (l'appareil) */
function djResteTxt(){const mn=Math.max(1,Math.ceil(djReste()/6e4)),h=Math.floor(mn/60);return h?h+' H':mn+' MIN';}

/* ---- LE BLOC AUJOURD'HUI, en tête de la liste des missions ---- */
function aujHtml(){
  let h='';
  const D=djEtat();
  if(D){const m=djM(D),ok=!!D.ok,w=Math.round(100*Math.max(0,Math.min(1,D.b/D.v)));try{spinSprites();}catch(e){}
    h+='<div class="m2L m2F-exploit m2Dj'+(ok?' ok':'')+'" data-aj="dj" role="button" tabindex="0">'
      +'<span class="m2Ic">'+pxi(ok?'coche':'cible')+'</span>'
      +'<div class="glTx"><b><i class="m2Tag">'+sansAcc(TR('DÉFI DU JOUR'))+'</i> '+sansAcc(djTxt(D))+'</b>'
      +(ok?'':'<u><em style="width:'+w+'%"></em></u>')
      +'<small>'+(ok?sansAcc(TR('RÉUSSI')+' · +1 '+TR('JETON')+' · '+TR('NOUVEAU DANS')+' '+djResteTxt()):m2Prog(m,D.b,D.v)+' · '+sansAcc(TR('NOUVEAU DANS'))+' '+djResteTxt())+'</small></div>'
      +'<div class="m2R m2Jt">'+(typeof spinIco==='function'?spinIco(5):'')+'<b>+1</b></div></div>';}
  const S=SERIE7.on?serieVue():null;
  if(S){let cs='';
    for(let c=1;c<=7;c++){const L=serieLot(c),fait=c<=S.faits,auj=c===S.c,dem=S.pris&&c===serieCase(S.c+1)&&c!==S.c;
      let ico;if(L.cash)ico='<b class="m2Cash">'+m2Nb(L.cash)+'</b>'; /* le chiffre seul : le vert dit déjà l'argent du jeu (« $ 150 » ne tenait pas dans la case) */else if(L.jeton)ico=(typeof spinIco==='function'?spinIco(5):'')+(L.jeton>1?'<b>×'+L.jeton+'</b>':'');
      else{const d=COSM.peinture.find(function(x){return x.id===L.exclu;}),hx=function(c){return '#'+((c>>>0)&0xffffff).toString(16).padStart(6,'0');};
        ico=d?'<b class="srSw" style="background:'+(d.grad?'linear-gradient(160deg,'+d.grad.map(hx).join(',')+')':hx(d.c||0))+'"></b>':pxi('etoile');}
      cs+='<i class="srC'+(fait?' fait':'')+(auj&&!S.pris?' auj':'')+(dem?' dem':'')+(L.exclu?' ex':'')+'" style="--i:'+c+'"><em>'+(LANG==='en'?'D':'J')+c+'</em>'+ico+(fait?'<s>'+pxi('coche')+'</s>':'')+'</i>';}
    const tit=S.pris?TR('SÉRIE')+' '+S.n+' '+TR(S.n>1?'JOURS':'JOUR')+' · '+TR('DEMAIN')+' : '+serieLotTxt(serieLot(serieCase(S.c+1))):S.casse?TR('SÉRIE PERDUE · ON REPART AU 1ER JOUR'):
      (S.n?TR('SÉRIE')+' '+S.n+' '+TR(S.n>1?'JOURS':'JOUR')+' · ':'')+TR('JOUE UNE PARTIE POUR LA CASE DU JOUR');
    h+='<div class="m2Serie" data-aj="serie" role="button" tabindex="0"><b>'+pxi('flamme')+' '+sansAcc(tit)+'</b><div class="srL">'+cs+'</div></div>';}
  return h?'<div class="m2Auj"><h4>'+sansAcc(TR('AUJOURD\'HUI'))+'</h4>'+h+'</div>':'';}
function aujClic(t){const a=t.closest&&t.closest('[data-aj]');if(!a)return false;
  const k=a.getAttribute('data-aj');try{uiClic('nav');}catch(e){}try{hap(8);}catch(e){}
  if(k==='dj'){const D=djEtat();if(D)try{toast(pxi('cible')+' '+(D.ok?TR('DÉFI DU JOUR RÉUSSI')+' · '+TR('NOUVEAU DÉFI DANS')+' '+djResteTxt():TR('UNE PARTIE POUR LE RÉUSSIR')+' · +1 '+TR('JETON')+' FINAL SPIN'));}catch(e){}}
  else{const S=serieVue();if(S)try{const L=serieLot(S.pris?serieCase(S.c+1):S.c);toast(pxi('flamme')+' '+(S.pris?TR('DEMAIN')+' : ':TR('AUJOURD\'HUI')+' : ')+serieLotTxt(L));}catch(e){}}
  return true;}
Object.assign(I18N,{'DÉFI DU JOUR':'DAILY CHALLENGE','DÉFI DU JOUR RÉUSSI':'DAILY CHALLENGE DONE','JETON':'TOKEN','JETONS':'TOKENS','RÉUSSI':'DONE','MEILLEUR ESSAI':'BEST TRY',
  'NOUVEAU DÉFI DANS':'NEW CHALLENGE IN','NOUVEAU DANS':'NEW IN','AUJOURD\'HUI':'TODAY','DEMAIN':'TOMORROW','REVIENS DEMAIN':'COME BACK TOMORROW','JOUR':'DAY',
  'SÉRIE PERDUE · ON REPART AU 1ER JOUR':'STREAK LOST · BACK TO DAY 1','JOUE UNE PARTIE POUR LA CASE DU JOUR':'PLAY A RUN FOR TODAY\'S BOX','UNE PARTIE POUR LE RÉUSSIR':'ONE RUN TO DO IT',
  'FAIS {v} FIGURES DANS UN SEUL SAUT':'LAND {v} TRICKS IN A SINGLE JUMP','BRAISE FIDÈLE':'FAITHFUL EMBER','AURORE BORÉALE':'NORTHERN LIGHTS','LAGON INTERDIT':'FORBIDDEN LAGOON','NUIT ÉTOILÉE':'STARRY NIGHT',
  'Ne s\'achète pas : le 7e jour de ta série. Sept jours d\'affilée sur l\'asphalte, la laque en garde la chaleur.':'Not for sale: day 7 of your streak. Seven days in a row on the asphalt, and the paint keeps the heat.',
  'Ne s\'achète pas : le 7e jour de ta série. Le ciel du Grand Nord, pour ceux qui reviennent chaque jour.':'Not for sale: day 7 of your streak. The sky of the far north, for those who come back every day.',
  'Ne s\'achète pas : le 7e jour de ta série. Une eau que personne n\'a le droit de voir. Toi si.':'Not for sale: day 7 of your streak. Water nobody is allowed to see. Except you.',
  'Ne s\'achète pas : le 7e jour de ta série. La nuit entière sur ta carrosserie, une semaine de plus.':'Not for sale: day 7 of your streak. The whole night on your body panels, one more week.'});
window.dbgSerie=function(a,n){ /* (banc) l'état du calendrier · ('jour',n) : la série à n jours, prise HIER (la case suivante est à jouer) · ('pris',n) : prise aujourd'hui */
  if(a==='jour'||a==='pris'){const t=new Date();if(a==='jour')t.setDate(t.getDate()-1);const y=t.getFullYear(),m=t.getMonth()+1,d=t.getDate();
    SAVE.d.jour={d:y+'-'+(m<10?'0':'')+m+'-'+(d<10?'0':'')+d,n:Math.max(0,n|0)};SAVE.flush();}
  const S=serieVue();return {actif:SERIE7.on,vue:S,lotDuJour:S?serieLot(S.c):null,demain:S?serieLot(serieCase(S.c+1)):null,exclusive:serieExclu(),jetons:SAVE.d.spinJ|0};};
window.dbgDefiJour=function(a,k){ /* (banc) le défi d'aujourd'hui · ('force','fig') : cette famille · ('reussi') · ('demain') : retirer le défi (le prochain regard en tire un neuf) */
  if(a==='force'){const f=djFam(k),b=djRecord(f);SAVE.d.dj={d:jourAuj(),k:f.k,v:Math.max(f.min,djArrondi(f,b*f.K)),b:0,ok:0,y:''};SAVE.flush();}
  else if(a==='reussi'){const D=djEtat();if(D&&!D.ok){D.ok=1;D.b=D.v;SAVE.d.spinJ=Math.min(9,(SAVE.d.spinJ|0)+1);SAVE.flush();}}
  else if(a==='demain'){SAVE.d.dj.d='';SAVE.flush();}
  const D=djEtat();if(!D)return 'éteint';const m=djM(D);
  return {jour:D.d,famille:D.k,texte:djTxt(D),seuil:D.v,meilleurDuJour:D.b,reussi:!!D.ok,record:djRecord(djFam(D.k)),hier:D.y,poids:DJ.fam.map(function(f){return f.k+' '+(1+Math.min(2,djRecord(f)/f.ref)).toFixed(2);}),jetons:SAVE.d.spinJ|0};};
