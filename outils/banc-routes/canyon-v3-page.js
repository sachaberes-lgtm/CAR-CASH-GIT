/* (2026-11-13, LE CANYON V3) l'audit du canyon dans le VRAI JEU, pour `banc.cjs gen --carte=canyon --auditfile=outils/banc-routes/canyon-v3-page.js` :
   la règle d'or (aucune roche sur la dalle ni dessous), le couloir de conduite, les pièces dans l'ordre, les rochers posés (dbgCanyonV3 : leur sorte, leur abscisse, leur hauteur
   au-dessus de la route), les ouvrages contre des points sûrs (dbgCanyonV3('test')), le dévers (angle maxi, part au-delà de 60°, vitesse de roulis), le temps de construction,
   et l'erreur éventuelle du relief posé (ms.relErr). Rend un objet court (le banc l'écrit dans `perso`). */
(function(){
  if(typeof dbgCanyonV3!=='function')return 'pas de canyon v3';
  const A=dbgCanyonAudit();if(typeof A==='string')return A;
  const D=dbgCanyon(),V=dbgCanyonV3(),T=dbgCanyonV3('test'),M=dbgCanyonMurs(),vo=typeof dbgCanyonVoute==='function'?dbgCanyonVoute():null;
  return {L:A.L,dessus:A.regle.dessus,dessous:A.regle.dessous,marge:A.regle.margeMin,ou:A.regle.ou,relief:A.relief.n,reliefOu:A.relief.ou.slice(0,6),
    pieces:D.hz&&D.hz.p.filter(function(p,i){return i%2;}).map(function(p){return p[0];}).join(' '),dix:D.hz&&D.hz.dix,
    v3:{n:V.n,rel:V.rel,ouvrages:V.ouvrages,maillages:V.maillages,rochers:V.rochers.slice(0,24)},test:{faux:T.faux,n:T.n,res:T.faux?T.res:undefined},
    murs:M&&typeof M==='object'?{ang:M.angleMaxDeg,part:M.partMurs,roulis:M.rouliMaxDegS,roche:M.contact&&M.contact.dansLaRoche}:M,
    voute:vo&&vo.tube?{long:vo.long,nY:vo.nY}:null,ms:D.ms&&{total:D.ms.total,rel:D.ms.rel,relErr:D.ms.relErr,fin:D.ms.fin,ombre:D.ms.ombre,plat:D.ms.plat},
    mods:typeof dbgMods==='function'?dbgMods().map(function(m){return [m.fig||'-',m.s0,m.s1,m.climax?1:0];}):null,tirage:D.tirage||null,eau:typeof CY!=='undefined'&&CY.deco?CY.deco.riviere:undefined};
})()
