/* ===== L'INVENTAIRE EN GRAND (2026-11-07, Sacha : « refais les ailes, là on voit pas les voitures, c'est moche » · « l'inventaire est un peu petit, il pourrait être plus haut, l'espace du haut de l'iPhone n'est pas occupé » · « les voitures sont mal présentées, ça donne pas envie : mets-les 2 par 2 au lieu de 3 par 3 ») =====
   Dans l'atelier fermé (le bouton INVENTAIRE), les VOITURES et les AILES passent DEUX par rangée : chaque case est un petit studio (la
   lumière de sa rareté qui tombe d'en haut, un sol éclairé), la grande photo de la caisse — pour une aile, TA caisse qui la porte, la photo
   du rayon AILES de la boutique (bcAileFile) — et une plaque avec son nom ; la caisse ou l'aile équipée porte ÉQUIPÉE. Debout, le panneau
   monte jusque sous le nom (css/inventaire-grand.css). `ivDeux` est appelé par gStripModeVoitures et gStripHabits à chaque pose de la grille.
   `dbgInvGrand()` : la grille, ses cases, leurs noms et leurs photos (banc). */
function ivPlaque(nom,eq){ /* des <span>, jamais de <b> : « .gT b » (et « .gT.c-aile b », top 36 px) posent tout <b> d'une case en étiquette */
  return '<span class="ivPl"><span class="ivNom">'+nom+'</span></span>'+(eq?'<span class="ivEq">'+pxi('coche')+'<span>'+sansAcc(TR('ÉQUIPÉE'))+'</span></span>':'');}
function ivDeux(st,on){if(!st)return;st.classList.toggle('ivDeux',!!on);if(!on)return;
  requestAnimationFrame(function(){ivNoms(st);});
  if(!ivDeux._r){ivDeux._r=1;window.addEventListener('resize',function(){const s=document.getElementById('gStrip');if(s&&s.classList.contains('ivDeux'))requestAnimationFrame(function(){ivNoms(s);});},{passive:true});}}
/* le NOM tient sur sa plaque : le corps descend d'un cran, puis deux lignes équilibrées (jamais un mot coupé n'importe où) */
function ivNoms(st){st.querySelectorAll('.ivNom').forEach(function(b){const w=b.clientWidth;if(!w)return;const k=w+'|'+b.textContent;if(b._k===k)return;b._k=k;
  b.classList.remove('n7','deux');if(b.scrollWidth<=w+1)return;b.classList.add('n7');if(b.scrollWidth<=w+1)return;b.classList.add('deux');});}
window.dbgInvGrand=function(){const st=document.getElementById('gStrip'),g=document.getElementById('gBottom'),r=function(x){if(!x)return null;const b=x.getBoundingClientRect();return [Math.round(b.left),Math.round(b.top),Math.round(b.width),Math.round(b.height)];};
  return {deux:!!(st&&st.classList.contains('ivDeux')),bas:r(g),grille:r(st),nom:r(document.getElementById('gName')),cols:st&&getComputedStyle(st).gridTemplateColumns,
    cases:st?[...st.querySelectorAll('.gT')].slice(0,6).map(function(el){const n=el.querySelector('.ivNom');return {b:r(el),nom:n&&[n.textContent,n.className,n.scrollWidth,n.clientWidth],photo:!!el.querySelector('img'),eq:!!el.querySelector('.ivEq')};}):[]};};
