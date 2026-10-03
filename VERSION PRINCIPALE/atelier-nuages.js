/* L'ATELIER DES NUAGES — le panneau de réglages (2026-10-03, Léo : « Sacha et moi on va bosser sur les nuages : une copie du nouveau
   menu, sans jeu, pour peaufiner la scène et le réalisme des nuages »).
   Chargé SEULEMENT avec `?nuages=1` : par la page-cadre de l'ordi (le panneau à droite du téléphone) ou par le jeu lui-même quand il n'y a
   pas de cadre (un vrai téléphone : le panneau par-dessus l'image, derrière un bouton). Il ne touche à RIEN d'autre que ce que le jeu
   expose dans `window.ccNuages` (voir NUAGES_LAB dans index.html) : les MÊMES réglages que le jeu (CHUTE_P, N8_OPT, BIOMES.titre).
   Ce qui est trouvé ici se recopie tel quel dans le code : COPIER LES RÉGLAGES donne le texte à envoyer.
   Les réglages sont gardés dans CE navigateur (localStorage) ; TOUT REMETTRE rend ceux du menu. */
(function(){
'use strict';
var D=document,JEU=window.CC_LAB_JEU||function(){return window;},CLE='ccNuagesLab1';
function api(){try{var w=JEU();return w&&w.ccNuages||null;}catch(e){return null;}}

/* ---------- ce qu'on règle ----------
   src : P = CHUTE_P (la scène du titre) · titre = BIOMES.titre (le ciel, la lumière) · N8 = N8_OPT (la forme : il faut refaire les nuages)
   i : l'indice dans un tableau (K, R, mzA) */
var G=[
 {t:'LUMIERE DES NUAGES',a:'Comment le soleil et le ciel éclairent la ouate.',l:[
  {s:'P',k:'K',i:0,n:'Blancheur',mi:.5,ma:1.5,p:.01},
  {s:'P',k:'K',i:1,n:'Force du soleil sur les nuages',mi:.3,ma:2,p:.01},
  {s:'P',k:'K',i:2,n:'Liseré à contre-jour',mi:0,ma:3,p:.01},
  {s:'P',k:'K',i:3,n:'Bords en vapeur (transparence)',mi:0,ma:2,p:.01},
  {s:'P',k:'R',i:0,n:'Ombre : où elle commence',mi:-1,ma:.6,p:.01},
  {s:'P',k:'R',i:1,n:'Ombre : où elle finit (douceur)',mi:-.4,ma:1,p:.01},
  {s:'P',k:'R',i:2,n:'Clarté de l’ombre',mi:.2,ma:1.5,p:.01}]},
 {t:'FORME DES NUAGES',a:'Les nuages sont recalculés à chaque changement (1 à 3 s).',l:[
  {s:'N8',k:'K',n:'Bourgeons : netteté des creux',mi:2,ma:10,p:.1},
  {s:'N8',k:'det',n:'Chou-fleur : force',mi:0,ma:.8,p:.01},
  {s:'N8',k:'fq',n:'Chou-fleur : finesse',mi:.5,ma:2.5,p:.05},
  {s:'F',k:'fin',n:'Précision de la surface',ch:[[0,'comme le menu'],[26,'26'],[36,'36'],[48,'48 (lourd)'],[64,'64 (très lourd)']]},
  {s:'B',k:'nouveaux',n:'NOUVEAUX NUAGES'},{s:'B',k:'menu',n:'NUAGES DU MENU'}]},
 {t:'SOLEIL ET CIEL',a:'L’ambiance de l’écran titre.',l:[
  {s:'P',k:'az',n:'Position du soleil (autour du regard)',mi:-3.14,ma:3.14,p:.01},
  {s:'titre',k:'sunI',n:'Force du soleil',mi:.3,ma:3,p:.01},
  {s:'titre',k:'sunC',n:'Couleur du soleil',c:1},
  {s:'titre',k:'hemiI',n:'Lumière du ciel (les ombres)',mi:0,ma:1.6,p:.01},
  {s:'titre',k:'jZen',n:'Ciel : en haut',c:1},
  {s:'titre',k:'jMid',n:'Ciel : au milieu',c:1},
  {s:'titre',k:'jHor',n:'Ciel : à l’horizon',c:1},
  {s:'titre',k:'expo',n:'Exposition',mi:.5,ma:1.5,p:.01},
  {s:'titre',k:'sat',n:'Saturation',mi:.5,ma:1.8,p:.01},
  {s:'titre',k:'vigK',n:'Vignette',mi:0,ma:.6,p:.01}]},
 {t:'BRUME ET MER DE NUAGES',a:'La profondeur et le tapis sous la caisse.',l:[
  {s:'titre',k:'fog',n:'Couleur de la brume',c:1},
  {s:'titre',k:'fogN',n:'Brume : début (m)',mi:0,ma:3000,p:10},
  {s:'titre',k:'fogF',n:'Brume : fin (m)',mi:1000,ma:15000,p:50},
  {s:'P',k:'mzA',i:0,n:'Mer : taille des bosses (m)',mi:300,ma:4000,p:10},
  {s:'P',k:'mzA',i:1,n:'Mer : bosses gonflées',mi:0,ma:1,p:.01},
  {s:'P',k:'mzA',i:2,n:'Mer : lumière franche',mi:1,ma:20,p:.1},
  {s:'P',k:'mzA',i:3,n:'Mer : remous',mi:0,ma:.8,p:.01}]},
 {t:'LA SCENE',a:'Glisse sur l’image pour tourner autour de la caisse.',l:[
  {s:'P',k:'vit',n:'Montée des nuages (0 = figés)',mi:0,ma:40,p:.5},
  {s:'P',k:'caisse',n:'La voiture',x:1},
  {s:'P',k:'nuages',n:'Les cumulus du titre',x:1},
  {s:'U',k:'boutons',n:'Les boutons du menu',x:1},
  {s:'B',k:'vue',n:'REVENIR A LA VUE DU MENU'}]}];

/* ---------- l'état : ce qui a été changé (gardé dans ce navigateur) ---------- */
var S={P:{},titre:{},N8:{},F:{graine:0,fin:0},U:{boutons:0}};
try{var t0=JSON.parse(localStorage.getItem(CLE)||'null');if(t0&&typeof t0==='object')for(var k0 in S)if(t0[k0]&&typeof t0[k0]==='object')S[k0]=Object.assign(S[k0],t0[k0]);}catch(e){}
function garde(){try{localStorage.setItem(CLE,JSON.stringify(S));}catch(e){}}

function lit(it){var A=api();if(!A)return null; // la valeur EN COURS dans le jeu
  if(it.s==='P'){var v=A.P[it.k];return it.i!=null?(v&&v[it.i]):v;}
  if(it.s==='titre')return A.titre()[it.k];
  if(it.s==='N8')return A.N8[it.k];
  if(it.s==='F')return S.F[it.k];
  if(it.s==='U')return S.U[it.k];return null;}
var refaireT=0;
function refaire(){clearTimeout(refaireT);etat('nuages en calcul…');refaireT=setTimeout(function(){var A=api();if(!A)return;
  A.formes(Object.assign({graine:S.F.graine,fin:S.F.fin},S.N8));},350);}
function pose(it,v){var A=api();if(!A)return;var o={}; // la valeur va au jeu, et dans l'état gardé
  if(it.s==='P'){if(it.i!=null){var a=(A.P[it.k]||[]).slice();a[it.i]=v;v=a;}o[it.k]=v;A.regle(o);S.P[it.k]=v;}
  else if(it.s==='titre'){o[it.k]=v;A.amb(o);S.titre[it.k]=v;}
  else if(it.s==='N8'){S.N8[it.k]=v;refaire();}
  else if(it.s==='F'){S.F[it.k]=v;refaire();}
  else if(it.s==='U'){S.U[it.k]=v;if(it.k==='boutons')A.boutons(!!v);}
  garde();}

/* ---------- couleurs : [r,g,b] de 0 à 1 ⇄ #rrggbb ---------- */
function hex(c){c=c||[1,1,1];return '#'+c.slice(0,3).map(function(x){var n=Math.round(Math.max(0,Math.min(1,+x||0))*255);return (n<16?'0':'')+n.toString(16);}).join('');}
function rgb(h){return [1,3,5].map(function(i){return Math.round(parseInt(h.substr(i,2),16)/255*1000)/1000;});}
function fmt(v,p){if(v==null||!isFinite(v))return '–';var d=p>=1?0:p>=.1?1:2;return (+v).toFixed(d);}

/* ---------- le panneau ---------- ⚠ titres et boutons en police PIXEL : SANS accents (elle n'a pas de capitales accentuées) */
var DOCK=D.documentElement.classList.contains('colonne')&&innerWidth>=900;
var st=D.createElement('style');st.textContent=[
 '#labNu{position:fixed;top:0;right:0;bottom:0;z-index:95;width:var(--labPW,340px);box-sizing:border-box;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;',
 ' background:#0d0a1d;border-left:1px solid #2a2346;color:#ece6ff;font:12px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;padding:14px 16px 90px;user-select:none;-webkit-user-select:none}',
 '#labNu.flotte{width:min(360px,88vw);background:rgba(13,10,29,.92);transform:translateX(102%);transition:transform .25s}',
 '#labNu.flotte.ouvert{transform:none}',
 '#labNu.flotte .lnPied{padding-bottom:70px}', /* le bouton FERMER se pose sur le pied : on lui laisse sa place */
 '#labNu h1{font:10px/1.4 var(--pix,monospace);letter-spacing:1px;color:#ffd75e;margin:0 0 4px}',
 '#labNu .lnA{color:#9a90c8;margin:0 0 10px}',
 '#labNu h2{font:9px/1.4 var(--pix,monospace);letter-spacing:1px;color:#5ee6ff;margin:18px 0 2px;padding-top:12px;border-top:1px solid #241d3e}',
 '#labNu .lnS{color:#8f84bd;margin:0 0 8px;font-size:11px}',
 '#labNu label{display:block;margin:7px 0}',
 '#labNu .lnL{display:flex;justify-content:space-between;gap:8px;color:#d9d0f5}',
 '#labNu .lnL b{font-weight:600;color:#fff7ee;font-variant-numeric:tabular-nums}',
 '#labNu .lnL b.change{color:#ffd75e}',
 '#labNu input[type=range]{width:100%;margin:3px 0 0;accent-color:#ff3ec8;height:22px}',
 '#labNu input[type=color]{width:46px;height:24px;border:1px solid #3a3160;background:none;padding:0;border-radius:4px}',
 '#labNu .lnC{display:flex;align-items:center;justify-content:space-between}',
 '#labNu input[type=checkbox]{width:18px;height:18px;accent-color:#7dff9b}',
 '#labNu select{width:100%;margin-top:3px;background:#1a1530;color:#fff;border:1px solid #3a3160;border-radius:4px;padding:4px}',
 '#labNu button{display:block;width:100%;margin:8px 0 0;padding:9px 10px;border:0;border-radius:6px;cursor:pointer;font:9px/1.3 var(--pix,monospace);letter-spacing:1px;color:#fff;background:#2a2252;box-shadow:inset 0 0 0 1px #3d3374}',
 '#labNu button:hover{background:#352b68}',
 '#labNu button.or{background:linear-gradient(#ffd75e,#e7a92e);color:#2a1500;box-shadow:none}',
 '#labNu .lnPied{position:sticky;bottom:-90px;margin:20px -16px -90px;padding:12px 16px 16px;background:#0d0a1d;border-top:1px solid #2a2346}',
 '#labNu .lnEtat{color:#8f84bd;font-size:11px;margin-top:8px;min-height:1.3em}',
 '#labNu textarea{width:100%;height:110px;margin-top:8px;background:#05030d;color:#bfe4ff;border:1px solid #3a3160;font:10px/1.3 ui-monospace,monospace;display:none}',
 '#labNuBtn{position:fixed;right:calc(12px + var(--sR,0px));bottom:calc(12px + var(--sB,0px));z-index:96;padding:10px 12px;border:0;border-radius:8px;font:9px/1 var(--pix,monospace);letter-spacing:1px;color:#2a1500;',
 ' background:linear-gradient(#ffd75e,#e7a92e);box-shadow:0 4px 0 #8a5a10,0 8px 18px rgba(0,0,0,.4)}'].join('\n');
D.head.appendChild(st);
var P=D.createElement('div');P.id='labNu';if(!DOCK)P.className='flotte';
['pointerdown','touchstart','touchmove','wheel','keydown'].forEach(function(e){P.addEventListener(e,function(ev){ev.stopPropagation();},{passive:true});}); // le panneau n'est pas l'image : pas d'orbite, pas de touche du jeu
var html='<h1>ATELIER DES NUAGES</h1><p class="lnA">L’écran titre de la nouvelle version, sans le jeu. Chaque réglage agit tout de suite ; '
 +'ce qui a changé est écrit en jaune. Tes réglages restent dans ce navigateur.</p>';
G.forEach(function(g,gi){html+='<h2>'+g.t+'</h2><p class="lnS">'+g.a+'</p>';
 g.l.forEach(function(it,ii){var id='ln'+gi+'_'+ii;
  if(it.s==='B')html+='<button type="button" data-b="'+it.k+'"'+(it.k==='nouveaux'?' class="or"':'')+'>'+it.n+'</button>';
  else if(it.ch)html+='<label>'+'<span class="lnL">'+it.n+'</span><select id="'+id+'">'+it.ch.map(function(c){return '<option value="'+c[0]+'">'+c[1]+'</option>';}).join('')+'</select></label>';
  else if(it.x)html+='<label class="lnC"><span>'+it.n+'</span><input type="checkbox" id="'+id+'"></label>';
  else if(it.c)html+='<label class="lnC"><span class="lnL" style="flex:1"><span>'+it.n+'</span><b id="'+id+'v"></b></span>&nbsp;<input type="color" id="'+id+'"></label>';
  else html+='<label><span class="lnL"><span>'+it.n+'</span><b id="'+id+'v"></b></span><input type="range" id="'+id+'" min="'+it.mi+'" max="'+it.ma+'" step="'+it.p+'"></label>';});});
html+='<div class="lnPied"><button type="button" class="or" data-b="photo">PHOTO</button><button type="button" data-b="copier">COPIER LES REGLAGES</button>'
 +'<button type="button" data-b="remettre">TOUT REMETTRE COMME LE MENU</button><textarea readonly></textarea><div class="lnEtat"></div></div>';
P.innerHTML=html;D.body.appendChild(P);
var BTN=null;
if(!DOCK){BTN=D.createElement('button');BTN.id='labNuBtn';BTN.type='button';BTN.textContent='REGLAGES';D.body.appendChild(BTN);
  BTN.addEventListener('click',function(e){e.stopPropagation();P.classList.toggle('ouvert');BTN.textContent=P.classList.contains('ouvert')?'FERMER':'REGLAGES';});
  BTN.addEventListener('pointerdown',function(e){e.stopPropagation();});}
var ETAT=P.querySelector('.lnEtat'),TXT=P.querySelector('textarea');
function etat(m){ETAT.textContent=m||'';}

function defaut(it){var A=api();if(!A)return null;var d=A.defauts;
  if(it.s==='P'){var v=d.P[it.k];return it.i!=null?(v&&v[it.i]):v;}
  if(it.s==='titre')return d.titre[it.k];if(it.s==='N8')return d.N8[it.k];if(it.s==='F')return 0;if(it.s==='U')return 0;return null;}
function change(it,v){var d=defaut(it);if(it.c)return hex(v)!==hex(d);if(it.x)return !!v!==!!(d==null?1:d);return Math.abs((+v||0)-(+d||0))>1e-6;}
function rafraichit(){ // les contrôles reprennent les valeurs EN COURS du jeu
  G.forEach(function(g,gi){g.l.forEach(function(it,ii){if(it.s==='B')return;var e=D.getElementById('ln'+gi+'_'+ii),vb=D.getElementById('ln'+gi+'_'+ii+'v'),v=lit(it);if(!e)return;
    if(it.x)e.checked=(v==null?1:v)!==0&&v!==false;else if(it.c)e.value=hex(v);else e.value=v;
    if(vb){vb.textContent=it.c?'':fmt(v,it.p);vb.classList.toggle('change',change(it,v));}});});}
G.forEach(function(g,gi){g.l.forEach(function(it,ii){if(it.s==='B')return;var e=D.getElementById('ln'+gi+'_'+ii),vb=D.getElementById('ln'+gi+'_'+ii+'v');if(!e)return;
  var ev=(it.s==='N8')?'change':'input'; // la forme se recalcule au LÂCHER du curseur (1 à 3 s de calcul)
  e.addEventListener(ev,function(){var v=it.x?(e.checked?1:0):it.c?rgb(e.value):it.ch?+e.value:+e.value;pose(it,v);
    if(vb){vb.textContent=it.c?'':fmt(v,it.p);vb.classList.toggle('change',change(it,v));}});
  if(it.s==='N8')e.addEventListener('input',function(){if(vb)vb.textContent=fmt(+e.value,it.p);});});});

P.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button[data-b]');if(!b)return;var A=api();if(!A)return;var k=b.getAttribute('data-b');
  if(k==='nouveaux'){S.F.graine=(Math.random()*4294967295)>>>0||1;garde();refaire();}
  else if(k==='menu'){S.F.graine=0;garde();refaire();}
  else if(k==='vue'){A.vue(0,0);}
  else if(k==='photo'){etat('photo…');A.photo().then(function(u){if(!u){etat('photo impossible');return;}var a=D.createElement('a');a.href=u;
    a.download='nuages-'+new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')+'.png';D.body.appendChild(a);a.click();a.remove();etat('photo enregistrée');});}
  else if(k==='copier'){var t=texte();TXT.style.display='block';TXT.value=t;TXT.select();
    var fini=function(ok){etat(ok?'copié : envoie ce texte à Claude (ou à Sacha)':'sélectionne le texte ci-dessus et copie-le');};
    try{navigator.clipboard.writeText(t).then(function(){fini(true);},function(){fini(D.execCommand&&D.execCommand('copy'));});}catch(_){fini(false);}}
  else if(k==='remettre'){var d=A.defauts,o={};G.forEach(function(g){g.l.forEach(function(it){if(it.s==='P')o[it.k]=JSON.parse(JSON.stringify(d.P[it.k]));});});
    A.regle(o);var ta={};G.forEach(function(g){g.l.forEach(function(it){if(it.s==='titre')ta[it.k]=JSON.parse(JSON.stringify(d.titre[it.k]));});});A.amb(ta);
    S={P:{},titre:{},N8:{},F:{graine:0,fin:0},U:{boutons:0}};A.boutons(false);A.formes(Object.assign({graine:0,fin:0},d.N8));garde();rafraichit();TXT.style.display='none';etat('tout est revenu comme au menu');}});

function texte(){ // ce qui a changé, dans les noms du code — prêt à recopier dans index.html
  var A=api(),L=['ATELIER DES NUAGES — réglages (à recopier dans VERSION PRINCIPALE/index.html)'];
  var p=Object.keys(S.P).filter(function(k){return k!=='caisse';});
  if(p.length)L.push('CHUTE_P : '+JSON.stringify(p.reduce(function(o,k){o[k]=S.P[k];return o;},{})));
  if(Object.keys(S.titre).length)L.push('BIOMES.titre : '+JSON.stringify(S.titre));
  if(Object.keys(S.N8).length)L.push('N8_OPT : '+JSON.stringify(S.N8));
  if(S.F.graine||S.F.fin)L.push('formes du titre : '+JSON.stringify({graine:S.F.graine||'0xC4A5 (le menu)',fin:S.F.fin||'celle du menu'}));
  if(L.length===1)L.push('(rien de changé : c’est le menu tel quel)');
  try{var e=A.etat();L.push('— '+e.nuages+' cumulus à l’image, '+Math.round(e.tris/1000)+' k triangles');}catch(_){}
  return L.join('\n');}

/* ---------- le démarrage : on attend que le jeu ait posé son écran titre ---------- */
etat('le ciel se prépare…');
var essais=0;(function attend(){var A=api();
  if(!A||!A.pret()){if(++essais<400)setTimeout(attend,300);else etat('le jeu ne répond pas : recharge la page');return;}
  // les réglages gardés reviennent
  if(Object.keys(S.P).length)A.regle(JSON.parse(JSON.stringify(S.P)));
  if(Object.keys(S.titre).length)A.amb(JSON.parse(JSON.stringify(S.titre)));
  if(S.U.boutons)A.boutons(true);
  if(S.F.graine||S.F.fin||Object.keys(S.N8).length)A.formes(Object.assign({graine:S.F.graine,fin:S.F.fin},S.N8));
  rafraichit();etat('prêt');
  setInterval(function(){var A2=api();if(!A2||!ETAT||/photo|copi|revenu/.test(ETAT.textContent))return;try{var e=A2.etat();etat(e.nuages+' cumulus à l’image · '+Math.round(e.tris/1000)+' k triangles');}catch(_){}},1500);
})();
})();
