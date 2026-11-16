/* (2026-11-12, LA REFONTE DU CANYON) l'audit du canyon DANS LE VRAI JEU, pour `banc.cjs gen --carte=canyon --auditfile=outils/banc-routes/canyon-page.js` :
   la règle d'or (aucune roche sur la dalle ni dessous), le couloir de conduite, les pièces dans l'ordre, les gabarits (leurs abscisses), et — pour chaque corniche —
   à combien du bord la falaise passe à la hauteur de la route (côté falaise) et la largeur du vide de l'autre côté ; la hauteur de la route au-dessus du lit. */
(function(){
  if(typeof dbgCanyonAudit!=='function')return 'pas de crochet';
  const A=dbgCanyonAudit();if(typeof A==='string')return A;
  const D=dbgCanyon(),R=dbgRoute?dbgRoute():null,par=dbgCanyon('parois');
  const out={L:A.L,regle:A.regle,relief:A.relief,hz:D.hz&&D.hz.p,note:D.hz&&D.hz.note,ms:D.ms,parois:par&&par.bord,murs:typeof dbgCanyonMurs==='function'?dbgCanyonMurs():null,gab:[]};
  const sonde=function(s9,lt){const o=dbgCanyonSonde(s9,lt);return o&&typeof o==='object'?o:null;};
  const Z=(window.dbgCanyonGab?dbgCanyonGab():[])||[];
  for(const z of Z){const g={t:z.t,sg:z.sg,a:Math.round(z.a),b:Math.round(z.b)};
    if(z.t==='corniche'||z.t==='vallee'){const m=[];for(let k=1;k<=3;k++){const s9=z.a+(z.b-z.a)*k/4;let fal=999,vide=999;
        for(const sg of [-1,1]){let d=999;for(let e=0;e<=700;e+=4){const o=sonde(s9,sg*(28+e));if(o&&o.h>o.route){d=e;break;}}if(z.sg&&sg===-z.sg)fal=d;else if(z.sg)vide=d;else{fal=Math.min(fal,d);vide=d;}}
        const c=sonde(s9,0);m.push({s:Math.round(s9),falaise:fal,vide:vide,sousLaRoute:c?Math.round(c.route-c.h):null,of:c&&c.ech?c.ech.of:null});}
      g.mesures=m;}
    out.gab.push(g);}
  return out;
})()
