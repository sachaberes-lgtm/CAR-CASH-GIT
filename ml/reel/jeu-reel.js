/* ===== LE VRAI JEU, SANS ECRAN (2026-10-20, Sacha : « JE VEUX DES BOTS FONCTIONNEL SUR LA VERSION ACTUELLE DU JEU ») =====
   ml/train/train.html est une copie du jeu de juillet : les bots y apprenaient une physique qui n'existe plus. Ici on charge
   VERSION PRINCIPALE/index.html — le jeu publie, tel quel — dans un faux navigateur (sim-env-reel.js), et on le pilote avec
   les memes TOUCHES que le clavier d'un joueur (les gestionnaires keydown/keyup du jeu, pas un raccourci dans la physique).
   Rien du jeu n'est modifie : sim-env-reel.js ajoute seulement, a la fin de son script, une porte de lecture (window.__EV, __S).
   Horloge virtuelle : une image = 1/60 s exactement, quel que soit le temps que prend l'ordinateur. */
const {loadGame}=require('./sim-env-reel');

function creer(opts){
  opts=opts||{};
  const g=loadGame('?sim=1&fps=0'+(opts.query||''));
  const d0=g.sandbox.document, gi=d0.getElementById.bind(d0);
  d0.getElementById=id=>id==='splash'?null:gi(id);          /* start() refuse de partir tant qu'un #splash existe */
  const ce=g.sandbox.console.error;
  g.sandbox.console.error=function(...a){ const m=String(a[0]); if(m.indexOf('flatShading')>=0)return; if(opts.silence&&m==='loop error')return; return ce.apply(this,a); };
  const ev=g.ev;
  ev('CAD.ok=false');
  const loop=ev('loop'), keys=ev('keys');
  const J={g:g, ev:ev, keys:keys, partie:0};
  J.etat=function(){ return g.sandbox.__S(); };
  J.image=function(){ g.clk.t+=1000/60; loop(g.clk.t); };
  J.touche=function(code,bas){ g.fire(bas?'keydown':'keyup',{code:code}); };
  J.lacher=function(){ for(const k of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','ShiftLeft']) if(keys[k]) g.fire('keyup',{code:k}); };
  /* UNE PARTIE NEUVE : la 1re via start(), les suivantes via resetGame() (ce que fait le bouton REJOUER) */
  J.lancer=function(graine){
    if(graine!=null) g.seed(graine);
    J.lacher();
    if(J.partie===0) ev('(start(),1)'); else ev('(resetGame(),1)');
    J.partie++;
    ev('last=performance.now()');
    return J.etat();
  };
  return J;
}
module.exports={creer:creer};
