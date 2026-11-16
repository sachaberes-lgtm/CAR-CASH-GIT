/* LES PROGRAMMES DE SHADER VIVANTS (2026-11-14) : après 10 s de conduite, la liste des programmes (nom de matière + début de la clé du cache) — pour comparer deux arbres
   (un programme de plus = une compilation, un gel possible à sa première image). */
(async function(){try{try{dbgAuto(1,0,{nit:0});}catch(e){}await new Promise(function(r){setTimeout(r,10000);});const R=dbgScene().rdr;
return (R.info.programs||[]).map(function(p){return (p.name||'?')+' | '+String(p.cacheKey||'').replace(/\s+/g,' ').slice(0,60);}).sort();}catch(e){return 'erreur '+String(e).slice(0,200);}})()
