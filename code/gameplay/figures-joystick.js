/* ===== LE JOYSTICK NITRO ET LA FIGURE AU HASARD ADAPTÉE (2026-11-10, Sacha : « retravaille le système de figure : le bouton nitro doit être un joystick
   qui permet de faire les figures de la direction où tu le pousses, et le double-tap donne une figure aléatoire dans la liste de celles que tu as débloquées
   tant que c'est adapté à la direction de la voiture ») — la spec est docs/superpowers/specs/2026-11-10-joystick-nitro-figures-design.md.
   · `FJOY` : l'état partagé (`on` : `?figjoy=0` rend le double-tap d'avant, le pouce gauche choisit l'emplacement et NITRO ne glisse plus).
   · `figTireAdapte(o)` : LE DOUBLE-TAP. Parmi les figures possédées (`veqFigsAMoi`) on garde (1) celles qui TIENNENT dans le vol (`figDose` ≥ `figDMin` — le
     tirage ne donne jamais une figure que `figLance` refuserait) ; (2) celles de la DIRECTION du pouce gauche (côté si le pouce braque, avant / arrière si
     on pousse : `figPeut`) — sans figure pour cette direction, on garde toutes celles qui tiennent (REPLI : un débutant qui n'a que le tonneau n'est pas refusé) ;
     (3) pouce au neutre et une figure déjà en train de tourner : on CONTINUE dans son sens (un salto garde son orientation, une toupie son côté) ; puis
     `FIG.tire` évite de redonner la même deux fois de suite. Rend {f, dx, sens} (f orientée avant / arrière quand elle va dans les deux sens) ou null.
   · `window.dbgTirage(n,o)` : n tirages À SEC (sans lancer), les compteurs de ce qui serait faux. `window.dbgJoy()` : l'état du joystick. */
const FJOY={on:!/[?&]figjoy=0\b/.test(location.search),der:null,ders:-1,sens:0,cote:0,n:0,refus:0,vib:0,arme:true,dir:null,tireSaut:null};
function fjDispoSaut(){return 2*VEQ_K.saut/(FALL_G*gK())-.15;} // le temps de vol qu'un saut nitro donne (le budget des figures qui partent avec lui)
function fjPouce(o){let x,y; // le pouce GAUCHE : x > 0 = à gauche, y > 0 = en avant (le même repère que figDirSlot) — o.x / o.y : le banc
  if(o&&o.x!=null){x=+o.x||0;y=+o.y||0;}
  else if(FDIR.force){x=FDIR.force[0];y=FDIR.force[1];}
  else if(TCTL.act){x=TCTL.st;y=TCTL.sv;}
  else{x=(keys.KeyA||keys.KeyQ||keys.ArrowLeft?1:0)-(keys.KeyD||keys.ArrowRight?1:0);y=(keys.KeyW||keys.KeyZ||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0);}
  return [x,y];}
function fjSlotPouce(x,y){if(Math.abs(x)>=.3&&Math.abs(x)>=Math.abs(y)*.85)return 2;return y<=-.3?1:y>=.3?0:-1;} // 2 côté · 1 arrière · 0 avant · −1 neutre (figDirSlot, mais le neutre se distingue de l'avant)
function figTireAdapte(o){o=o||{};if(!window.FIG)return null;const C=FX2.corps;if(C&&C.occupe()>=3)return null; // trois figures en cours : rien ne part
  const bud=o.dispo!=null?o.dispo:figBudget(),douce=o.dispo!=null,xy=fjPouce(o),k=fjSlotPouce(xy[0],xy[1]);
  let ids=veqFigsAMoi().filter(function(id){const f=FIG.par[id];return f&&figDose(f,bud)>=figDMin(f,douce);});
  if(!ids.length)return null;
  if(k>=0){const D=ids.filter(function(id){return figPeut(id).indexOf(k)>=0;});if(D.length)ids=D;else FJOY.repli=(FJOY.repli|0)+1;} // (REPLI) pas de figure pour cette direction : toutes celles qui tiennent
  let run=null;if(C)for(let i=C.figs.length-1;i>=0&&!run;i--){const r=C.figs[i];if(!r.paye&&r.mv&&r.mv.length)run=r;} // la figure qui tourne encore (la plus récente)
  let f=FIG.tire(ids,FJOY.der);if(!f)return null;FJOY.der=f.id;
  const P=figPeut(f.id),dx=Math.abs(xy[0])>=.3?xy[0]:null;let sens;
  if(P.indexOf(0)>=0||P.indexOf(1)>=0){ // un salto : son orientation — le pouce (avant / arrière), sinon celle de la figure qui tourne, sinon le hasard
    const d9=k===0&&P.indexOf(0)>=0?'avant':k===1&&P.indexOf(1)>=0?'arriere':run&&(run.f.sens==='avant'||run.f.sens==='arriere')&&P.indexOf(run.f.sens==='avant'?0:1)>=0?run.f.sens:P.length>1?(Math.random()<.5?'avant':'arriere'):(P[0]===0?'avant':'arriere');
    f=FIG.oriente(f,d9);}
  if(k<0&&run&&P.indexOf(2)>=0&&run.s)sens=run.s; // pouce au neutre, une toupie / un tonneau tourne : on continue dans son sens
  return {f:f,dx:dx,sens:sens};}
window.dbgTirage=function(n,o){o=o||{};n=Math.max(1,Math.min(5000,n|0||1));const r={tires:{},refus:0,horsTemps:0,horsDirection:0,repetes:0,repli:0},xy=fjPouce(o),k=fjSlotPouce(xy[0],xy[1]),bud=o.dispo!=null?o.dispo:figBudget();let der=null;FJOY.repli=0;
  for(let i=0;i<n;i++){const t=figTireAdapte(o);if(!t){r.refus++;continue;}const id=t.f.src?t.f.src.id:t.f.id,f=FIG.par[id];r.tires[id]=(r.tires[id]|0)+1;
    if(figDose(f,bud)<figDMin(f,o.dispo!=null))r.horsTemps++;
    if(k>=0&&figPeut(id).indexOf(k)<0&&!FJOY.repli)r.horsDirection++;
    if(id===der&&Object.keys(r.tires).length>1)r.repetes++;der=id;}
  r.repli=FJOY.repli|0;return r;};
window.dbgJoy=function(){return {on:FJOY.on,arme:FJOY.arme,dir:FJOY.dir,n:FJOY.n,refus:FX2.refus|0,vib:FJOY.vib,der:FJOY.der,ders:FJOY.ders,sens:FJOY.sens,cote:FJOY.cote};};
