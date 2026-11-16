/* ===== LES TOUCHES À L'ÉCRAN — LA VRAIE VERSION PC (2026-11-16, Sacha : « pour la version Vercel on laisse tomber l'affichage en mode iPhone ; le bouton NITRO et le joystick,
   il faut que ça devienne une vraie version PC ») =====
   Sur l'ordinateur (`PC_CLAVIER`, html.pcClavier), la course se joue au CLAVIER — le même objet `keys` que toujours (← → ou A D / Q D pour tourner, ↓ ou S pour le drift, ESPACE ou
   MAJ pour la NITRO, deux fois ESPACE pour une figure, P ou Échap pour la pause). Le pouce de feu et le volant au doigt s'effacent (css/pc-clavier.css) ; #pcTouches montre les
   touches, qui s'enfoncent avec le clavier, et la réserve de NITRO sur ESPACE (pleine, à sec, infinie). Rien ne change dans la physique ni dans le rendu.
   Console : `dbgPcTouches()` = l'état. */
const PCT={el:null,k:{},etat:'',iv:0};
function pckMonte(){
  if(PCT.el||!PC_CLAVIER||!TCTL.on)return;
  const e=document.createElement('div');e.id='pcTouches';e.setAttribute('aria-hidden','true');
  e.innerHTML='<div class="pckDir"><div class="pckRang"><b class="pckK" data-k="l">◄</b><b class="pckK" data-k="d">▼</b><b class="pckK" data-k="r">►</b></div><span class="pckL" data-fr="TOURNER · ▼ DRIFT">TOURNER · ▼ DRIFT</span></div>'
    +'<div class="pckNit"><span class="pckL" data-fr="NITRO">NITRO</span><b class="pckK pckEsp" data-k="n" data-fr="ESPACE">ESPACE</b></div>';
  document.body.appendChild(e);PCT.el=e;
  e.querySelectorAll('[data-k]').forEach(function(b){PCT.k[b.dataset.k]=b;});
  try{if(LANG!=='fr')e.querySelectorAll('[data-fr]').forEach(function(s){s.textContent=TR(s.dataset.fr);});}catch(x){}
  PCT.iv=setInterval(pckEtat,100);}
/* les touches enfoncées : lues dans `keys` (le clavier de la page ET celui relayé par la page-cadre) */
function pckTouches(){if(!PCT.el)return;
  const on={l:!!(keys.ArrowLeft||keys.KeyA||keys.KeyQ),r:!!(keys.ArrowRight||keys.KeyD),d:!!(keys.ArrowDown||keys.KeyS),n:!!(keys.Space||keys.ShiftLeft||keys.ShiftRight)};
  for(const k in on){const b=PCT.k[k];if(b&&b.classList.contains('on')!==on[k])b.classList.toggle('on',on[k]);}}
/* la réserve de NITRO, dix fois par seconde (une classe ne change que si l'état change) */
function pckEtat(){if(!PCT.el||!document.body.classList.contains('play'))return;
  let s='';try{const inf=pwrNitroT>0,res=(ENGINE_TIERS[engTier]||ENGINE_TIERS[0]).res||2,r=nitroR+nitroX;s=inf?'inf':r>=res-.01?'plein':r<.35?'sec':'';}catch(x){}
  if(s!==PCT.etat){PCT.el.classList.remove('inf','plein','sec');if(s)PCT.el.classList.add(s);PCT.etat=s;}
  pckTouches();}
/* (2026-11-16, Sacha : « enlève les touches en bas ») les touches ne s'affichent plus : le clavier pilote seul, l'écran reste nu ; `?touches=1` les remet */
if(PC_CLAVIER&&TCTL.on&&/[?&]touches=1(&|$)/.test(location.search)){
  pckMonte();
  addEventListener("keydown",function(){setTimeout(pckTouches,0);});addEventListener("keyup",function(){setTimeout(pckTouches,0);});addEventListener('blur',function(){setTimeout(pckTouches,0);});
}
if(PC_CLAVIER&&TCTL.on){
  Object.assign(I18N,{"TOURNER · ▼ DRIFT":"STEER · ▼ DRIFT","ESPACE":"SPACE","Maintiens ▼ en tournant : DRIFT !":"Hold ▼ while turning: DRIFT!","En vol, tape 2 fois ESPACE avec ▲, ▼ ou ◄► : chaque direction a sa figure.":"In the air, tap SPACE twice with ▲, ▼ or ◄►: each direction has its trick."});
}
window.dbgPcTouches=function(){return {pc:PC_CLAVIER,monte:!!PCT.el,etat:PCT.etat,on:Object.keys(PCT.k).filter(function(k){return PCT.k[k].classList.contains('on');}),
  vu:PCT.el?getComputedStyle(PCT.el).display:'-',pouce:(function(){const t=document.getElementById('tNitro');return t?getComputedStyle(t).visibility:'-';})()};};
