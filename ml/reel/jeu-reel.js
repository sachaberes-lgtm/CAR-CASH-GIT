/* ===== LE VRAI JEU, SANS ECRAN (2026-10-20, Sacha : « JE VEUX DES BOTS FONCTIONNEL SUR LA VERSION ACTUELLE DU JEU ») =====
   ml/train/train.html est une copie du jeu de juillet : les bots y apprenaient une physique qui n'existe plus. Ici on charge
   VERSION PRINCIPALE/index.html — le jeu publie, tel quel — dans un faux navigateur (sim-env-reel.js), et on le pilote avec
   les memes TOUCHES que le clavier d'un joueur (les gestionnaires keydown/keyup du jeu, pas un raccourci dans la physique).
   Rien du jeu n'est modifie : sim-env-reel.js ajoute seulement, a la fin de son script, une porte de lecture (window.__EV, __S).
   Horloge virtuelle : une image = 1/60 s exactement, quel que soit le temps que prend l'ordinateur. */
const {loadGame}=require('./sim-env-reel');
const fs=require('fs'),path=require('path');

/* LES NOMS DE HAUT NIVEAU DU JEU : chaque `let` / `var` / `const` en debut de ligne des morceaux de code/ (ORDRE.txt), noms separes
   par les virgules de 1er niveau. Tout le JS du jeu est une seule fonction : ces noms se lisent et s'ecrivent par __EV. */
function nomsHautNiveau(){
  const CODE=path.join(__dirname,'..','..','code');
  const ordre=fs.readFileSync(path.join(CODE,'ORDRE.txt'),'utf8').split(/\r?\n/).map(l=>l.split('#')[0].trim()).filter(l=>/\.js$/.test(l));
  const noms=new Set();
  for(const f of ordre){ let t; try{ t=fs.readFileSync(path.join(CODE,f),'utf8'); }catch(e){ continue; }
    for(const ligne of t.split(/\r?\n/)){ const fn=/^(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(/.exec(ligne); if(fn){ noms.add(fn[1]); continue; } /* (les fonctions : leurs proprietes, ex. loop._ms) */
      const m=/^(?:let|var|const)\s+(.*)$/.exec(ligne); if(!m) continue;
      const s=m[1]; let d=0,q=null,cur='',attend=true;
      for(let i=0;i<s.length;i++){ const ch=s[i];
        if(q){ if(ch==='\\'){i++;continue;} if(ch===q) q=null; continue; }
        if(ch==='"'||ch==="'"||ch==='`'){ q=ch; continue; }
        if(ch==='/'&&s[i+1]==='*'){ const j=s.indexOf('*/',i+2); i=j<0?s.length:j+1; continue; }
        if(ch==='/'&&s[i+1]==='/') break;
        if('([{'.includes(ch)) d++; else if(')]}'.includes(ch)) d--;
        if(d===0&&attend){ if(/[\w$]/.test(ch)) cur+=ch; else if(ch==='='||ch===','||ch===';'){ if(cur) noms.add(cur); cur=''; attend=ch===','; } }
        else if(d===0&&ch===','){ attend=true; cur=''; }
        else if(d===0&&ch===';') break; }
      if(attend&&cur) noms.add(cur); } }
  /* jamais remis : l'horloge de la boucle, le clavier, la sauvegarde (remise a part), les traductions */
  for(const n of ['last','keys','SAVE','I18N']) noms.delete(n);
  return [...noms].filter(n=>/^[A-Za-z_$][\w$]*$/.test(n));
}
/* LA PHOTO ET LA REMISE, cote jeu (evaluees dans sa fonction : elles voient ses variables). On photographie les DONNEES : nombres, booleens,
   textes, tableaux types, et les champs de donnees de chaque objet. Ce qui n'est pas une donnee — maillage, matiere, geometrie, texture,
   element du DOM, fonction, Map, Set, Promise, tableau d'objets — n'est jamais photographie ni touche : l'objet qui en tient est remis PARTIELLEMENT
   (ses champs de donnees seulement, rien n'y est efface). Un objet deja vu (cycle, ou partage) n'est photographie qu'une fois. */
const PROPRE_CODE=`window.__propre=(function(){
  const PAS={}, PART=Symbol('partiel'), PROTO9=Object.getPrototypeOf({}); /* PROTO9 : le prototype des litteraux DU JEU (dans le bac, Object est celui de Node) */
  const exclu=function(x){ return x.isObject3D||x.isMaterial||x.isBufferGeometry||x.isBufferAttribute||x.isTexture||x.isWebGLRenderTarget||x.nodeType||x.style||
    x instanceof Map||x instanceof Set||x instanceof WeakMap||x instanceof WeakSet||(typeof Promise!=='undefined'&&x instanceof Promise)||x===window; };
  let vus=null;
  const donnee=function(x,prof){
    if(x===null||typeof x!=='object') return typeof x==='function'||typeof x==='symbol'?PAS:x;
    if(prof>10||vus.has(x)) return PAS; vus.add(x);
    try{ if(exclu(x)) return PAS; }catch(e){ return PAS; }
    if(ArrayBuffer.isView(x)) return x.length>500000||!x.slice?PAS:{__ta:x.slice()};
    /* un TABLEAU n'est photographie que s'il ne tient que des valeurs : une liste d'objets (nuages, pieces, particules...) est un morceau du
       monde, rebâti avec la piste — la remettre dans l'etat de la chauffe cassait newTrack (MESURE : CLOUDS) */
    if(Array.isArray(x)){ let obj=false; for(let i=0;i<x.length;i++){ const e=x[i]; if(typeof e==='function') return PAS; if(e!==null&&typeof e==='object') obj=true; }
      if(!obj) return x.slice();
      /* UNE RESERVE (particules, flammes, etincelles...) : les MEMES objets reutilises. Remise element par element, seulement si la liste tient
         encore exactement les memes objets, dans le meme ordre — sinon (liste rebâtie, comme les nuages) on n'y touche pas. */
      if(x.length>5000) return PAS;
      const d9=x.map(function(e){ if(e===null||typeof e!=='object') return e; let v; try{ v=donnee(e,prof+1); }catch(er){ v=PAS; } return v; });
      /* une liste d'objets qui ne sont QUE des donnees (les morts de la session, un historique...) : remise en entier, comme une valeur */
      /* (des objets LITTERAUX seulement : une liste de Color ou de Vector3 garde ses instances — MESURE : uPal.value[i].set) */
      if(x.every(function(e){ if(e===null||typeof e!=='object') return true; const pr=Object.getPrototypeOf(e); return pr===PROTO9||pr===null; })&&
         d9.every(function(v){ return v!==PAS&&!(v&&typeof v==='object'&&(v[PART]||v.__pool||v.__plat)); })) return {__plat:true, d:d9};
      return {__pool:true, els:x.slice(), d:d9}; }
    const o={}; let part=false;
    for(const k of Object.keys(x)){ let v; try{ v=donnee(x[k],prof+1); }catch(e){ v=PAS; } if(v===PAS){ part=true; continue; } o[k]=v; }
    if(part) o[PART]=true;
    return o;};
  const clone=function(p){ if(p===null||typeof p!=='object') return p; if(p.__ta) return p.__ta.slice(); if(p.__pool) return p.els.slice(); if(p.__plat) return p.d.map(clone); const o=Array.isArray(p)?[]:{}; for(const k of Object.keys(p)) o[k]=clone(p[k]); return o; };
  const remet=function(cur,p){
    if(p===null||typeof p!=='object') return p;
    if(p.__ta){ if(cur&&ArrayBuffer.isView(cur)&&cur.length===p.__ta.length){ cur.set(p.__ta); return cur; } return p.__ta.slice(); }
    if(p.__plat){ const L9=p.d.map(clone); if(!Array.isArray(cur)) return L9; cur.length=0; for(const v of L9) cur.push(v); return cur; }
    if(p.__pool){ if(!Array.isArray(cur)||cur.length!==p.els.length) return cur; for(let i=0;i<cur.length;i++) if(cur[i]!==p.els[i]) return cur;
      for(let i=0;i<cur.length;i++){ const d=p.d[i]; if(d===PAS) continue; if(d!==null&&typeof d==='object') remet(cur[i],d); else cur[i]=d; } return cur; }
    if(cur===null||(typeof cur!=='object'&&typeof cur!=='function')||Array.isArray(cur)!==Array.isArray(p)) return p[PART]?cur:clone(p);
    if(!p[PART]){ if(Array.isArray(cur)) cur.length=p.length; else for(const k of Object.keys(cur)) if(!(k in p)) delete cur[k]; }
    for(const k of Object.keys(p)){ try{ const n9=remet(cur[k],p[k]); if(cur[k]!==n9) cur[k]=n9; }catch(e){} }
    return cur;};
  let photo=null, poses=null;
  /* LA POSE DES OBJETS 3D DE HAUT NIVEAU (la caisse, la camera...) : position, orientation, echelle. MESURE : apres une mort, la caisse
     repartait de l'endroit de l'explosion et la 1re image de physique la lisait (ecart 1e-14 des l'image 1). */
  const poseDe=function(o){ return {p:o.position.clone(),q:o.quaternion.clone(),s:o.scale.clone(),v:o.visible}; };
  return {
    noms:function(){ return photo?Object.keys(photo):[]; },
    partiels:function(){ return photo?Object.keys(photo).filter(function(n){ return photo[n]&&photo[n][PART]; }):[]; },
    photo:function(){ photo={}; poses=new Map(); vus=new Set(); let n=0; for(const nom of window.__NOMS){ let v; try{ v=eval(nom); }catch(e){ continue; }
        if(v&&v.isObject3D){ try{ poses.set(v,poseDe(v)); }catch(e){} continue; }
        /* une FONCTION du jeu porte parfois son etat (loop._ms, loop._r30T, loop._nOn, loop._nAir...) : ses proprietes de donnees, en partiel */
        if(typeof v==='function'){ const ks=Object.keys(v); if(!ks.length) continue; const o={}; o[PART]=true; let k9=0;
          for(const k of ks){ let d; try{ d=donnee(v[k],1); }catch(e){ d=PAS; } if(d!==PAS){ o[k]=d; k9++; } } if(k9){ photo[nom]=o; n++; } continue; }
        let d; try{ d=donnee(v,0); }catch(e){ continue; } if(d===PAS) continue; photo[nom]=d; n++; } vus=null; return n; },
    nPoses:function(){ return poses?poses.size:0; },
    remet:function(){ let n=0; for(const nom in photo){ const p=photo[nom]; try{ const v=eval(nom);
        /* (eval direct : il voit nouv9, et la variable du jeu ; une const leve une erreur, et se garde) */
        const nouv9=(p!==null&&typeof p==='object')?remet(v,p):p;
        if(nouv9!==v) eval(nom+'=nouv9'); n++; }catch(e){} }
      for(const [o,ps] of poses){ try{ o.position.copy(ps.p); o.quaternion.copy(ps.q); o.scale.copy(ps.s); o.visible=ps.v; o.updateMatrix(); o.updateMatrixWorld(true); }catch(e){} }
      return n; }
  };
})()`;

const REQUETE='?sim=1&fps=0&intro=ancien&prebati=0&grotteworker=0';
function creer(opts){
  opts=opts||{};
  /* (2026-11-22, etape 0 BOTS-ML) `intro=ancien` : l'intro du studio (moteur/intro-161.js) partait a la 1re touche du bot et posait
     window.__introCouvre=true -> loop() ne calculait plus rien (son film avance par requestAnimationFrame, qui ne bat jamais ici).
     L'ancienne intro (init.js) s'efface d'elle-meme sans #splash (voir sim-env-reel.js). */
  /* (2026-11-23, etape 1 BOTS-ML) `grotteworker=0` : au PORTAIL, la grotte se creuse dans un Worker ; celui d'ici ne repond jamais (sim-env-reel.js) et la
     construction attendait sans fin, la caisse tenue au portail (MESURE : 3e course d'une serie, 2e portail). L'interrupteur du jeu la creuse sur place. */
  /* (2026-11-24, etape 1 bis BOTS-ML) `opts.charge` : un autre chargeur que le faux navigateur — la salle de projection (ml/labo/projection.js) y met
     le jeu charge dans un VRAI navigateur, avec l'image ; tout ce qui suit (chauffe, photo, remise, graine) reste le meme code. */
  const g=(opts.charge||loadGame)(REQUETE+(opts.query||''),opts.graineChargement);
  const d0=g.sandbox.document, gi=d0.getElementById.bind(d0);
  d0.getElementById=id=>id==='splash'?null:gi(id);          /* start() refuse de partir tant qu'un #splash existe */
  const ce=g.sandbox.console.error;
  g.sandbox.console.error=function(...a){ const m=String(a[0]); if(m.indexOf('flatShading')>=0)return; if(opts.silence&&m==='loop error')return; return ce.apply(this,a); };
  const ev=g.ev;
  ev('CAD.ok=false');
  const loop=ev('loop'), keys=ev('keys');
  /* (2026-11-23, etape 1 BOTS-ML) LE PORTAIL : pendant qu'il attend (PORTV.att), ses demandes d'image d'ecran comptent — sauf loop(), que l'on appelle nous-memes (voir sim-env-reel.js) */
  const PORTV9=ev('PORTV');
  g.raf.porte=function(f){ return f!==loop&&PORTV9.att>0; };
  const J={g:g, ev:ev, keys:keys, partie:0};
  J.etat=function(){ return g.sandbox.__S(); };
  J.image=function(){ g.clk.t+=1000/60; g.tick(); loop(g.clk.t); }; /* les minuteries du jeu partent a l'heure du jeu, avant l'image (sim-env-reel.js) */
  J.touche=function(code,bas){ g.fire(bas?'keydown':'keyup',{code:code}); };
  J.lacher=function(){ for(const k of ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','ShiftLeft']) if(keys[k]) g.fire('keyup',{code:k}); };
  /* la piste se bâtit dans les premieres images de loop(), plus dans start()/resetGame() (2026-11-22) : on avance jusqu'a ce qu'elle existe */
  const attendPiste=function(){ let n=0; while(!(g.sandbox.__TRK().NP>0)&&n<600){ J.image(); n++; } return n; };
  /* ===== MEME GRAINE = MEME COURSE (2026-11-22, etape 0 BOTS-ML) =====
     Une course ne doit dependre que de (graine, map imposee). Avant chaque course :
     · TOUTES les courses passent par resetGame() (le REJOUER) : un seul start(), a la creation, sert de chauffe ;
     · le tirage de la map repart de zero (ni map tiree d'avance, ni « jamais la meme que la precedente », ni memoire des maps ou des modules
       recents) — `?prebati=0` coupe le pre-bati ; `o.carte` / `o.meteo` imposent la map (sinon la graine la tire) ;
     · le jeu a son propre Math (sim-env-reel.js) : three.js ne pioche plus dans la suite tiree de la graine ;
     · la sauvegarde EN MEMOIRE revient a son etat de depart (missions, records, deblocages ne passent pas d'une course a l'autre) ;
     · les minuteries uniques de la course d'avant sont jetees, les minuteries a repetition repartent en phase avec le depart. */
  g.seed(opts.graineChauffe==null?1:opts.graineChauffe);
  ev('(start(),1)'); ev('last=performance.now()'); attendPiste();
  for(let i=0;i<30;i++) J.image();
  const SAVE0=ev('JSON.stringify(SAVE.d)');
  /* L'ETAT PROPRE : resetGame() ne remet pas tout a zero (volant, derive, double appui NITRO, temps d'air, vent, camera, flow... MESURE :
     271 variables differaient entre deux departs de la meme graine). Juste apres la chauffe, on photographie chaque variable de haut niveau
     du jeu qui n'est QUE des donnees (nombres, booleens, textes, objets et tableaux de donnees — rien de three.js ni du DOM) ; avant chaque
     course, on la remet en place (dans le meme objet : les references tenues ailleurs restent bonnes). Les objets qui tiennent des maillages
     ne sont pas touches : resetGame() / newTrack() les rebâtissent. */
  g.sandbox.__NOMS=opts.noms||nomsHautNiveau();
  ev(PROPRE_CODE);
  J.proprePhoto=ev('__propre.photo()');
  /* L'HEURE DU DEPART : chaque course part a la MEME heure de l'horloge virtuelle (celle de la photo). L'horloge avance de 1000/60 par
     image, ce qui n'est pas exact en binaire : `now - last` (le dt de l'image) differait dans les derniers bits selon le nombre d'images
     deja jouees dans le processus (MESURE : ecart 1e-14 des la 1re image). Les heures remises par la photo restent coherentes avec elle. */
  const T0=g.clk.t;
  J.lancer=function(graine,o){
    o=o||{};
    J.lacher();
    g.clk.t=T0;
    J.propreRemis=ev('__propre.remet()');
    ev('(function(d){for(const k of Object.keys(SAVE.d))delete SAVE.d[k];Object.assign(SAVE.d,d);})('+SAVE0+')');
    /* les memoires de session du jeu : SF_HIST (les dernieres maps, ecartees du tirage), GRT_VUS (les modules des grottes recentes, leur poids au tirage) */
    ev('SF_HIST.length=0;GRT_VUS.length=0');
    ev('SF.prochain=null;SF.prochainDer=null;SF.tirage=[];SF.der=null;SF.neuf=false;SF.force='+(o.carte?JSON.stringify({carte:o.carte,meteo:o.meteo||null,teinte:o.teinte||null}):'null'));
    const TIM=g.minuteries; TIM.q=TIM.q.filter(x=>x.rep); for(const x of TIM.q) x.t=g.clk.t+x.ms;
    g.seed(graine==null?0:graine);
    ev('(resetGame(),1)');
    J.partie++;
    ev('last=performance.now()');
    J.imagesDepart=attendPiste();
    return J.etat();
  };
  return J;
}
module.exports={creer:creer,nomsHautNiveau:nomsHautNiveau,REQUETE:REQUETE};
