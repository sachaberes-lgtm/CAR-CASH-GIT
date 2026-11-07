/* LE NUANCIER v3 EN VITRINE (2026-11-05) : D'ORIGINE, puis PEINT_CAT dans son ordre — la rareté (`r`), le prix (`eur`), le motif (`mot`, sa teinte de
   fond `c`), l'animation (`anim`), le défi (`def`, et `ind` : sa phrase, que l'écran des missions affiche pour une peinture gagnée) */
for(const e of PEINT_CAT){const o=Object.assign({id:e[0],n:e[1],r:e[2],d:e[4]},e[3]);
  if(o.mot){o.c=MOTIFS[o.mot].c;if(MOTIFS[o.mot].anim)o.anim=1;}
  o.eur=PEINT_EUR[o.r];if(e[5]){o.def=e[5];o.ind=e[5].t;delete o.eur;}COSM.peinture.push(o);} /* (2026-11-07, Sacha : « les couleurs qu'on gagne avec des missions ne peuvent pas s'acheter ») une peinture à défi n'a plus de prix : elle se gagne ; shopOwned la tient pour non possédée tant que le défi n'est pas rempli */
Object.assign(I18N,{"SANS AILES":"NO WINGS","Les ailes, c'est pour les pigeons. Dix buses à air comprimé planquées dans la carrosserie : elle crache des bouffées blanches, pivote sur elle-même et s'envole. Bon. Ça a marché.":"Wings are for pigeons. Ten compressed-air nozzles hidden in the bodywork: it spits white puffs, spins on the spot and takes off. Well. It worked."}); /* (l'aile SANS AILES : sa traduction vivait ici, avec les motifs) */
/* LES MISSIONS v2 — LES HABILLAGES QUI SE GAGNENT (2026-10-16, Sacha : « un objet donné par une mission ne s'achète plus : la boutique
   affiche à la place la mission qui le débloque ») : `mis2` = l'id de la mission ; plus de prix (ni dollars ni euros), plus de carnet.
   L'ARC-EN-CIEL (carnet 5) n'est plus la récompense d'aucune mission : « elle reste UNIQUEMENT dans le pack de la voiture chat » —
   `pack:'chat'` (shopOwned : à toi avec le CHAT POP-TART ; qui l'a déjà gagnée au carnet la garde, elle est dans `own`). */
{const H9={};for(const m of M2)if(m.r&&m.r.cat)H9[m.r.cat+':'+m.r.id]=m.id;
  for(const cat of ['peinture','aile','trainee'])for(const d of COSM[cat]){const id=H9[cat+':'+d.id];
    if(id){d.mis2=id;delete d.mis;delete d.p;delete d.eur;if(/relevant des défis/.test(d.d||''))d.d="Ne s'achète pas : elle se gagne par une mission.";}
    else if(d.mis){delete d.mis;if(d.id==='arcenciel'){d.pack='chat';d.d="Ne s'achète pas : elle vient avec le CHAT POP-TART.";}}}}
/* LE RANGEMENT DES PEINTURES (2026-11-05, le nuancier v3) : D'ORIGINE, puis l'ordre de PEINT_CAT — COMMUNES (le cercle chromatique, puis les pastels),
   RARES (feu, froid, néon, métal, ombre, pop), ÉPIQUES (les livrées, puis les pelages), LÉGENDAIRES. L'ordre des listes EST l'ordre à l'écran.
   Plus rien de caché : `peintCachee` reste (la bande du garage l'appelle) et répond toujours non. */
const PEINT_RANG={};PEINT_CAT.forEach(function(e,k){PEINT_RANG[e[0]]=k;});
function peintClef(j){const d=COSM.peinture[j];if(!d||d.id==='usine')return -1;const k=PEINT_RANG[d.id];return k!=null?k:900+j;}
function peintCachee(d){return false;}
function peintOrdre(){return COSM.peinture.map(function(d,j){return j;}).sort(function(a,b){return peintClef(a)-peintClef(b);});}
function peintVoisine(i,pas){const O=peintOrdre(),k=O.indexOf(i);return O[((k<0?0:k)+pas+O.length)%O.length];} /* ◀ ▶ en boutique : la voisine DANS L'ORDRE DE LA VITRINE */
/* acheter un habillage EN EUROS (une peinture) : la porte de StoreKit, comme une caisse — rien n'est donné tant qu'Apple n'a pas encaissé */
function habDonne(cat,id){const o=SAVE.d.shop.own,k=cat+':'+id;if(o.indexOf(k)<0)o.push(k);SAVE.d.shop.eq[cat]=id;SAVE.flush();}
function habPaye(cat,i,bt){const d=COSM[cat]&&COSM[cat][i];if(!d||!d.eur||shopOwned(cat,d.id)||habPaye.on)return false;habPaye.on=1;uiClic('');hap(12);
  shopPaye(cat+':'+d.id).then(function(){habPaye.on=0;habDonne(cat,d.id);garEquipeHabit(cat,i);shopShow(cat,i);hap([10,30,20,30,40]);try{pixBurst($('gCard'),26);gTampon(TR('À TOI !'));}catch(e){}
    try{if(SONV2){sfx('ui.achat');if(!REDUCED_MOTION)sfx('ui.tampon',{t:.266});}}catch(e){}try{GBQ.rk='';gShopJour();}catch(e){}},
    function(){habPaye.on=0;if(bt)try{gSecoue(bt);}catch(e){}uiClic('refus');hap([10,40,10]);toast(pxi('panier')+' '+TR("L'achat est indisponible pour le moment."));});return true;}
/* (2026-11-05, jury HYG-12) palDonne : fonction jamais appelée, retirée */
/* ===== « OU GAGNE-LA » — LES DÉFIS DES PEINTURES (2026-11-05, le nuancier v3) =====
   Une peinture à `def` s'achète, ou se gagne : sa valeur se lit à tout moment (peintDefVal, les records de la partie en cours compris) ; elle tombe
   dès qu'elle passe le seuil (peintDefisVerifie, appelée par m2Verifie : en course quatre fois par seconde, et aux menus), ou par secGagne pour un
   exploit d'un coup (`k:'b'`, les détections de defis-moteur.js). Gagnée : dans `own`, et son id dans `m2.c.pg` (l'écran des missions la raconte).
   En course : la ligne du bas (PEINTURE GAGNÉE) ; aux menus : le toast. Rien en balade ni au bac à sable. */
function peintDefSeuil(f){return f.v==='prof'?M2K.prof:+f.v||1;}
function peintDefVal(f){if(!f||f.k==='b'||f.k==='serie')return -1;let s;try{s=m2Etat();}catch(e){return 0;}const c=s.c||{},r=s.r||{},ex=SAVE.d.ex||{};
  if(f.k.indexOf('sc:')===0)return (c.sc&&+c.sc[f.k.slice(3)])||0;
  switch(f.k){case 'gagne':return c.gagne||0;case 'jours':return c.jours|0;case 'kmh':return Math.max(ex.kmh|0,r.kmh|0);case 'frenT':return Math.max(SAVE.d.frenRec||0,r.frenT||0);
    case 'tours':return r.tours|0;case 'fig':return r.fig|0;case 'parf':return r.parf|0;case 'prof':return r.prof||0;case 'eng':case 'aura':try{return m2Val({k:f.k});}catch(e){return 0;}}
  return 0;}
function peintDefFrac(d){const f=d&&d.def,v=peintDefVal(f);return v<0?-1:Math.max(0,Math.min(1,v/peintDefSeuil(f)));}
function peintDefNb(f,v){const S=peintDefSeuil(f),nb=function(x){return Math.floor(x).toLocaleString(typeof LOC==='function'?LOC():'fr').replace(/[  ]/g,' ');};
  if(f.k==='prof')return Math.min(100,Math.floor(100*v/S))+' %';if(f.k==='gagne')return fmtSolde(Math.min(v,S))+' / '+fmtSolde(S);
  return nb(Math.min(v,S))+' / '+nb(S)+(f.u==='km'?' KM':f.u==='s'?' S':f.u==='kmh'?' KM/H':'');}
function peintGagne(d){if(!d||shopOwned('peinture',d.id))return false;SAVE.d.shop.own.push('peinture:'+d.id);
  try{const c=m2Etat().c;(c.pg||(c.pg=[])).push(d.id);}catch(e){}SAVE.flush();
  if(!m2LigneDit('col',sansAcc(TR(d.n)),''))toast(pxi('pinceau')+' '+TR('PEINTURE GAGNÉE')+' · '+TR(d.n),true);
  try{hap([20,40,20,40,60]);}catch(e){}try{if(typeof SONV2!=='undefined'&&SONV2)sfx('victoire');}catch(e){}try{GBQ.rk='';}catch(e){}return true;}
function secDonne(id){ /* GAMEPLAY : un exploit réussi (secGagne, m2Cpt) → sa peinture. Rien en balade ni au bac à sable ; rien si elle est déjà à toi */
  if((typeof BALADE!=='undefined'&&BALADE)||(typeof SANDBOX!=='undefined'&&SANDBOX))return false;
  const d=COSM.peinture.find(function(x){return x.id===id&&x.def;});return d?peintGagne(d):false;}
const PEINT_EX_SEC=['minuit','chrome','ogre','gotham','envers','guerrier','bolide','emeute','taxi','azur','royal','fuchsia','prisme','orrose','eclair','orage','jadeimperial','lunaire'];
function peintDefisVerifie(enC){if(enC&&!m2Ok())return 0;let s;try{s=m2Etat();}catch(e){return 0;}const c=s.c;
  if(!c.pgv){c.pgv=1;const o=SAVE.d.shop.own,L=c.pg||(c.pg=[]);for(const id of PEINT_EX_SEC){const id2=PEINT_FUSION[id]||id;if(o.indexOf('peinture:'+id2)>=0&&L.indexOf(id2)<0)L.push(id2);}SAVE.mark();} /* les secrètes d'avant, déjà gagnées : l'écran des missions les garde */
  let n=0;for(const d of COSM.peinture){const f=d.def;if(!f||f.k==='b'||f.k==='serie'||shopOwned('peinture',d.id))continue;if(peintDefVal(f)>=peintDefSeuil(f)&&peintGagne(d))n++;}return n;}
/* LES PASTILLES (2026-11-05) : une seule fabrique pour la boutique ; `cosmSwCl` donne la finition (et l'animation d'une légendaire) à toutes les listes */
function peintFond(d,c0){const hx=function(c9){return '#'+((c9>>>0)&0xffffff).toString(16).padStart(6,'0');};return d.mot?motFond(d).replace('center/200% auto','center/100% auto'):d.grad?'linear-gradient(150deg,'+d.grad.map(hx).join(',')+')':hx(d.c!=null?d.c:(c0!=null?c0:0xff7a3a));}
function peintPastille(d,cl,c0){return '<i class="'+cl+cosmSwCl(d)+'" style="background:'+peintFond(d,c0)+'"></i>';}
/* la grande pastille d'une carte de la boutique : la tôle vernie, et pour une peinture à défi pas encore à toi, la cible et sa jauge */
function peintCarte(d){let c0=null;if(d.id==='usine')try{c0=CARS[garageI].color;}catch(e){}let h=peintPastille(d,'bqSw pSw sp5',c0); /* (2026-11-06, Léo : « pour chacune des couleurs la forme et la taille sont différentes ») (v1228, Léo : « une seule forme aléatoire, la même pour toutes les couleurs ») le MÊME splash (sp5) pour toutes : voir css/boites-blister.css */
  if(d.def&&!shopOwned('peinture',d.id)){const p=peintDefFrac(d);h+='<span class="pDef" title="'+sansAcc(TR(d.def.t)).replace(/"/g,'')+'">'+pxi('cible')+(p>=0?'<u><em style="width:'+Math.round(p*100)+'%"></em></u>':'')+'</span>';}
  return h;}
/* « OU GAGNE-LA » sous le nom de la peinture regardée (#gBqNom) : la phrase du défi, sa jauge (un exploit d'un coup n'en a pas) */
function peintDefHtml(d){const f=d&&d.def;if(!f||shopOwned('peinture',d.id))return '';const v=peintDefVal(f),p=v<0?0:Math.min(1,v/peintDefSeuil(f));
  return '<span class="m2Deb pDeb"><span class="m2DebT">'+pxi('cible')+' '+sansAcc(TR('À GAGNER'))+' : '+sansAcc(TR(f.t)).toUpperCase()+'</span>'
    +(v<0?'':'<span class="m2DebB"><u><em style="width:'+Math.round(p*100)+'%"></em></u><b>'+peintDefNb(f,v)+'</b></span>')+'</span>';}
window.dbgDefisPeint=function(){return COSM.peinture.filter(function(d){return d.def;}).map(function(d){const v=peintDefVal(d.def);return {id:d.id,r:d.r,defi:d.def.t,val:v,seuil:d.def.k==='b'||d.def.k==='serie'?null:peintDefSeuil(d.def),a:shopOwned('peinture',d.id)};});};
/* ===== LES TRAÎNÉES EN VITRINE (2026-11-05, Sacha : « retravaille la présentation des traînées dans le même esprit » que le nuancier v3) =====
   UNE TABLE, dans l'ordre de la vitrine (TRAINEE_CAT) : la rareté suit le SPECTACLE, le prix monte avec elle (les prix en $ ne bougent pas).
   · COMMUNES    — les RUBANS : un sillage de couleur (NITRO, offerte ; ROSE NÉON) ;
   · RARES       — les PARTICULES : ce qu'on sème (SAKURA, MATRICE, POUDRE D'OR, ANNEAUX D'OR) ;
   · ÉPIQUES     — les EFFETS : un numéro à part entière (WOW, GLOUTON, HYPERESPACE, LA GRILLE) ;
   · LÉGENDAIRES — le SPECTACLE : celles qui ne s'achètent pas comme les autres (FAIS PLEUVOIR, FOUDRE DIVINE par mission, ARC-EN-CIEL avec le chat).
   Ce qui change : POUDRE D'OR épique → rare, WOW légendaire → épique, GLOUTON rare → épique, ARC-EN-CIEL (qui se lisait COMMUNE) → légendaire.
   La carte de la boutique (traineeCarte) montre la traînée EN MOUVEMENT sur une route de nuit : le ruban qui coule hors de la tuyère, ses
   particules qui s'envolent (css/peintures.css, « LES TRAÎNÉES ») — sur le plateau, la caisse ne boost pas : la carte est la seule à la montrer. */
const TRAINEE_CAT=[['nitro','commun'],['rose','commun'],['sakura','rare'],['matrice','rare'],['or','rare'],['anneaux','rare'],
  ['wow','epique'],['glouton','epique'],['hyper','epique'],['grille','epique'],['billets','legendaire'],['foudre','legendaire'],['arcenciel','legendaire']];
Object.assign(I18N,{'RUBANS':'RIBBONS','PARTICULES':'PARTICLES','EFFETS':'EFFECTS','SPECTACLE':'SHOWSTOPPERS'});
const TRAINEE_RANG={};TRAINEE_CAT.forEach(function(e,k){TRAINEE_RANG[e[0]]=k;const d=COSM.trainee.find(function(x){return x.id===e[0];});if(d)d.r=e[1];});
function traineeOrdre(){return COSM.trainee.map(function(d,j){return j;}).sort(function(a,b){const ra=TRAINEE_RANG[COSM.trainee[a].id],rb=TRAINEE_RANG[COSM.trainee[b].id];return (ra!=null?ra:900+a)-(rb!=null?rb:900+b);});}
function traineeCoul(d){if(d.rainbow)return '#ff5ad0';if(d.col)return d.col;if(d.rgb)return 'rgb('+d.rgb.map(function(v){return Math.round(Math.min(1,v/1.45)*255);}).join(',')+')';return '#ff7a1a';}
/* la plaque d'une carte : la nuit, des lignes de vitesse, la tuyère à droite, le ruban qui en coule (aucun pour celles dont l'effet EST la traînée :
   GLOUTON, LA GRILLE), et trois fois son pictogramme qui s'envole */
function traineeCarte(d){let I=null;try{I=illuTr(d);}catch(e){}const ic=I?illuPx(I,'tPx'):'';
  return '<i class="tSw'+(d.rubOff?' sansRuban':'')+(d.rainbow?' arc':'')+'" style="--tc:'+traineeCoul(d)+'"><b class="tRu"></b><b class="tBuse"></b>'+(ic?'<span class="tPa">'+ic+ic+ic+'</span>':'')+'</i>';}
function cosmSwCl(d){return (d.g==='c'?' chrome':d.g==='o'?' or':d.g==='s'?' mat':d.g==='k'?' metal':d.g==='n'?' nacre':'')+(d.anim?' pL pL-'+d.id:'');} /* la classe de finition d'une pastille (une seule table pour toutes les listes) — (2026-11-05) une légendaire : son animation (css/peintures.css) */
/* (2026-10-14) LES FIGURES dans la console du garage : COSM.figure est la VUE du catalogue figures.js (même id, nom, prix) — la console
   (onglet, bande, fiche, ACHETER) la traite comme un habillage. Possédées : SAVE.d.figs (figPossede), achetées par shopBuy → figAchat ;
   « équipée » ne veut rien dire pour une figure : toutes celles qu'on a JOUENT (le double-tap tire au hasard parmi elles). */
function figDesc(f,lg){const en=lg==='en'||lg==='zh'; // (2026-10-14, textes) BILINGUE : la fiche des figures restait en français en anglais (aucune clé possible : la phrase est composée)
  const Q=en?{p:'off-axis spin',x:'flip',y:'flat spin',z:'barrel roll'}:{p:'vrille penchée',x:'salto',y:'toupie',z:'tonneau'};
  const tx=function(m,i){const n=['x','y','z'].filter(function(c,j){return Math.abs(m.a[j])>.1;}),q=Q[n.length>1?'p':n[0]],T=Math.abs(m.t);
    if(en)return m.t!=null?(T>1?T+' '+q+'s':(i?'one ':'One ')+q):(i?'a ':'A ')+q+' wobble';
    return m.t!=null?(T>1?T+' tours en '+q:(i?'un':'Un')+' tour en '+q):(i?'un':'Un')+' balancement en '+q;};
  const D=window.FIG&&FIG.dirs?FIG.dirs(f):['cote']; // (2026-10-15, les directions) la fiche dit le GESTE (le hasard parmi tes figures n'existe plus depuis le 15/10)
  if(D.indexOf('cote')>=0)return f.m.map(tx).join(' + ')+(en?'. Thumb to a SIDE + double-tap NITRO: it goes that way.':'. Pouce sur un CÔTÉ + double-tape NITRO : elle part de ce côté.');
  const av=D.indexOf('avant')>=0,ar=D.indexOf('arriere')>=0;
  return f.m.map(tx).join(' + ')+(en?'. Thumb '+(av&&ar?'FORWARD or BACK':av?'FORWARD':'BACK')+' + double-tap NITRO'+(av&&ar?': the flip goes that way.':'.')
                                    :'. Pouce '+(av&&ar?'en AVANT ou en ARRIÈRE':av?'en AVANT':'en ARRIÈRE')+' + double-tape NITRO'+(av&&ar?' : le salto part dans ce sens.':'.'));}
COSM.figure=(window.FIG?FIG.liste:[]).map(function(f){return {id:f.id,n:f.n,p:f.p,d:figDesc(f,'fr'),fig:1};});
const SHOP_CATS=['voiture','peinture','aile','trainee','figure'];
const SHOP={tab:'voiture',i:{peinture:0,aile:0,trainee:0},prev:null}; // prev : l'article ESSAYÉ (pas forcément à toi)
function shopOwned(cat,id){if(cat==='figure')return figPossede(id);if(cousin()){const c9=COSM[cat].find(x=>x.id===id);if(c9&&((!c9.eur&&!c9.def&&(!c9.pack||c9.sec))||cousinTout()))return true;} /* (2026-10-14) LE CODE COUSIN : tous les habillages — (2026-10-24) SAUF ce qui se paie en EUROS (peintures en €, packs PALETTE et CHAT), la règle de Sacha du 14/10 (carEuros) ; les secrètes, gagnables par leur défi, restent offertes ; le reste suit la possession réelle */
const d=COSM[cat].find(x=>x.id===id);if(!d)return false;
  if(d.pack==='chat'&&m2Chat())return true; /* (2026-10-16, missions v2) l'ARC-EN-CIEL vient avec le chat */if(!d.p&&!d.mis&&!d.mis2&&!d.pack&&!d.sec&&!d.eur&&!d.def&&!d.serie)return true;return SAVE.d.shop.own.indexOf(cat+':'+id)>=0;} // (2026-10-14, palette) pack et secrètes : possédées seulement une fois données
function shopEqD(cat){const id=SAVE.d.shop.eq[cat],d=COSM[cat].find(x=>x.id===id);return (d&&shopOwned(cat,d.id))?d:COSM[cat][0];}
/* ===== LES PHOTOS DES CAISSES EN TEINTE D'ORIGINE (2026-11-02, Léo : « quand on va dans les paint des boutiques, ça met toutes les voitures dans ta peinture et on ne peut à peine les distinguer. Enlève-moi ce truc ») =====
   Pendant que le studio photographie une caisse (carPhoto : vignettes de la boutique, de l'inventaire, vue de la fenêtre d'achat), PHOTO_USINE
   est vrai : la caisse porte D'ORIGINE, ni la peinture équipée ni celle qu'on essaie. La caisse qu'on conduit et l'essai en 3D gardent la peinture. */
let PHOTO_USINE=false;
function cosm(cat){if(PHOTO_USINE&&cat==='peinture')return COSM.peinture[0];return (SHOP.prev&&SHOP.prev.cat===cat)?COSM[cat][SHOP.prev.i]:shopEqD(cat);} // ce que la caisse PORTE (essai compris)
// ⚠ le TOUT PREMIER `buildCar` tourne à l'init, AVANT que `SAVE`/`SHOP` ne soient déclarés (zone morte) : on rend alors l'origine
function cosmSur(cat){try{return cosm(cat);}catch(e){return null;}}
function shopBuy(cat,i){ // ⚠ débit et possession dans la MÊME fonction, comme `carBuy` : jamais l'un sans l'autre
  if(cat==='figure')return figAchat(i); // (2026-10-14) une FIGURE : SAVE.d.figs
  const d=COSM[cat][i];if(!d||!d.p)return {ok:false,raison:'pas-a-vendre'};
  if(shopOwned(cat,d.id))return {ok:false,raison:'deja-possedee'};
  if(bank()<d.p)return {ok:false,raison:'fonds-insuffisants',manque:d.p-bank()};
  SAVE.d.bank=bank()-d.p;SAVE.d.shop.own.push(cat+':'+d.id);SAVE.d.shop.eq[cat]=d.id;SAVE.flush();
  return {ok:true,paye:d.p};
}
function shopEquip(cat,i){const d=COSM[cat][i];if(!d||!shopOwned(cat,d.id))return false;SAVE.d.shop.eq[cat]=d.id;SAVE.flush();return true;}
window.dbgPeintures=function(v){if(v==='voitures')return CARS.map(function(c,i){return {i:i,n:c.name,retire:!!c.retire};});const O=peintOrdre();return COSM.peinture.map(function(d,j){return {j:j,o:O.indexOf(j),id:d.id,n:d.n,r:d.r,eur:d.eur||0,sec:!!d.sec,mot:!!d.mot,grad:!!d.grad,g:d.g||'',c:d.c};});}; // (2026-10-30, banc) la liste des peintures pour la planche
window.dbgHab=function(cat,id){if(!COSM[cat])return null;const i=COSM[cat].findIndex(function(d){return d.id===id;});if(i<0)return 'inconnu'; // (2026-10-14, bancs) PORTER un habillage à l'essai, à toi ou non
  SHOP.prev={cat:cat,i:i};if(garageOn&&cat!=='peinture')SHOP.tab=cat;buildCar(CARS[garageOn?garageI:level]||CARS[0]);
  return {hab:cat+':'+id,rar:cosmRar(cat,COSM[cat][i]),ailes:carWingL?carWingL.children.length:0,anim:BLING.anim.length,fx:FX_EFF?{pop:FX_EFF.pop||null,rubOff:!!FX_EFF.rubOff}:null};};
/* LA PEINTURE entre par la PALETTE : la clé 'p' (la laque, par convention de tous les gabarits du kit) est
   remplacée avant que l'atelier ne coule les facettes. Un dégradé (`grad`) se calcule PAR SOMMET, sur la
   hauteur : du bas de caisse au toit. */
function peintPal(pal){
  const d=cosmSur('peinture');if(!d||d.id==='usine'||!pal||!pal.p)return pal;
  const o=Object.assign({},pal);o.p=d.mot?{g:'pm:'+d.mot,c:MOTIFS[d.mot].mel?pal.p.c:0xffffff,grad:null}:{g:d.g||'p',c:d.c!=null?d.c:d.grad[1],grad:d.grad||null}; // (2026-10-16) un MOTIF : la tôle blanche dans son propre tampon, le motif la colore (voir MOTIFS)
  if(pal.p.f===0)o.p.f=0;return o;
}
const LPG_A=new THREE.Color(),LPG_B=new THREE.Color();
function lpGrad(g,y,col){const u=LPU.cl((y-.35)/1.35,0,1);
  if(u<.5){LPG_A.setHex(g[0]);LPG_B.setHex(g[1]);col.copy(LPG_A).lerp(LPG_B,u*2);}
  else{LPG_A.setHex(g[1]);LPG_B.setHex(g[2]);col.copy(LPG_A).lerp(LPG_B,(u-.5)*2);}}
/* LES TRAÎNÉES TOUJOURS LÀ (2026-10-15 soir, Sacha : « retravaille toutes les traînées, il faut qu'elles soient toutes désirables ») — VU au banc
   (les 17 traînées portées tour à tour, nitro tenue, mer de nuages) : derrière la caisse on ne voyait presque que le FEU DE PIXELS du nitro — les
   pétales, le code, les anneaux, les billets… n'apparaissaient pas. La règle du 7 au 14/10 les ÉTEIGNAIT en réserve bleue et en nitro infinie (« deux
   messages ») ; or tenir la nitro vide la jauge et passe en réserve en ~2 s : la traînée achetée disparaissait justement quand on boostait. La réserve
   reste dite par le feu de pixels et la jauge ; la traînée de la boutique (`FX_EFF`), elle, joue à toute nitro. Les caisses à signature (le chat,
   sans traînée achetée) gardent la règle. `?trainee=signal` = avant. */
const TRAINEE_SIGNAL=/[?&]trainee=signal\b/.test(location.search);
let FX_EFF=null; // la signature de traînée EFFECTIVE (caisse + boutique), recalculée à chaque `buildCar`
