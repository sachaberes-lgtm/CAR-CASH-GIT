/* LE CIEL DES REFLETS AU PORTAIL, DANS LA PAGE (2026-11-14) — banc des maps, avec le pré-bâti du vrai jeu :
   node outils/banc-maps/banc.cjs gen --carte=nuages --meteo=midi --graines=5 --prebati=1 --q="vers=espace" --auditfile=outils/banc-routes/ciel-portail-page.js
   Impose la map suivante (`vers`), laisse le pré-bâti la préparer, passe le portail, et rend l'état du cache des ciels (dbgEnvCiel) avant / après :
   calculesIci qui monte au portail = un ciel calculé sur le fil principal (une image figée), rates = la clé qui a manqué, cles = ce qui était prêt. */
(async function(){try{
  const Z=function(ms){return new Promise(function(r){setTimeout(r,ms);});},q=function(k){return ((new RegExp('[?&]'+k+'=([^&]*)').exec(location.search))||[])[1];};
  const vers=q('vers')||'espace';try{dbgClassique(vers);}catch(e){}dbgAuto(1,0,{nit:0});await Z(+q('attenteP')||9000);
  const e0=dbgEnvCiel(),z0=dbgRoute().zone,L0=dbgRoute().L;const sd0=(function(){try{return dbgScene().scene&&null;}catch(e){return null;}})();
  dbgBord({s:L0-260});const t1=performance.now();while(performance.now()-t1<30000){await Z(200);const r=dbgRoute();if(r.zone!==z0&&r.L!==L0)break;}await Z(5000);dbgAuto(0);
  const e1=dbgEnvCiel();let carte=null;try{carte=dbgRoute().niveau.carte;}catch(e){}
  return JSON.stringify({carte:carte,avant:{ici:e0.calculesIci,trav:e0.parLeTravailleur,cache:e0.prisEnCache,proche:e0.prisProche,cles:e0.cles},apres:{ici:e1.calculesIci,trav:e1.parLeTravailleur,cache:e1.prisEnCache,proche:e1.prisProche,ms:e1.msDernierCalcul,rates:e1.rates,cles:e1.cles}});
}catch(e){return 'ERREUR ciel-portail-page : '+(e&&e.stack||e);}})()
