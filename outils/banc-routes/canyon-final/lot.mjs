/* LE LOT DE GRAINES DU CANYON FINAL (2026-11-17) : pour chaque graine, le vrai jeu (téléphone, ?tel=1) lancé sur le canyon, puis audit-page.js.
   node outils/banc-routes/canyon-final/pilote.mjs outils/banc-routes/canyon-final/lot.mjs graines=1-40 [meteo=matin] [q=sans=…] [out=fichier.json]
   Sort une ligne par graine et un bilan ; code de sortie 1 si un défaut (couloir, œil, pièces, règle d'or, décor, murs dans la roche, lames, ouvrages, raccords, erreurs de page).
   Donné pour information, pas un défaut : la dalle couchée sans roche derrière elle (le fond des boucles tourne dans le vide du cirque : vu à l'image), le double des pièces sous la dalle. */
import fs from 'node:fs';import path from 'node:path';
export default async function(api,a){
  const [g0,g1]=(a.graines||'1-12').split('-').map(Number),src=fs.readFileSync(path.join(api.racine,'outils/banc-routes/canyon-final/audit-page.js'),'utf8'),tout={};let defauts=0;
  for(let g=g0;g<=(g1||g0);g++){let r;
    try{await api.charger({graine:g,meteo:a.meteo||'matin',q:a.q||'',attente:2});r=await api.ev(src,300000);r.erreursPage=api.erreurs.slice(0,5);
      try{r.dbgErr=(await api.ev("(function(){try{const e=dbgErreurs();return (e&&e.length?e:[]).filter(function(x){return x&&x.g!=='serpent'&&x.g!=='son';}).slice(0,5).map(function(x){return (x.g||'')+' '+(x.m||'');});}catch(x){return [];}})()"))||[];}catch(e){}
      if(r.dbgErr&&r.dbgErr.length)r.erreursPage=r.erreursPage.concat(r.dbgErr); /* le mouchard du jeu (hors « serpent » : les trous d'image du chargement, qui dépendent de la charge de la machine ; hors « son » : le banc est muet) */}
    catch(e){r={erreur:String(e.message||e).slice(0,300)};}
    tout[g]=r;
    const d=[];if(r.erreur)d.push('ERREUR '+r.erreur);else{
      if(r.couloir.n)d.push('couloir '+r.couloir.n+' ['+r.couloir.ou.slice(0,4).join(' ')+']');
      if(r.oeil.n)d.push('oeil '+r.oeil.n+' ['+r.oeil.ou.slice(0,4).join(' ')+']');
      if(r.pieces.n)d.push('pieces '+r.pieces.n+'/'+r.pieces.tot+' ['+r.pieces.ou.slice(0,4).join(' ')+']');
      if(r.raccord.n)d.push('raccord '+r.raccord.n+' ['+r.raccord.ou.slice(0,3).join(' ')+']');
      if(r.regle&&(r.regle.dessus||r.regle.dessous))d.push('regle '+r.regle.dessus+'/'+r.regle.dessous+' ['+String(r.regle.ou).slice(0,80)+']');
      if(r.relief&&r.relief.n)d.push('relief '+r.relief.n);
      if(r.deco){const D={}; /* tolérés, vérifiés à l'image : le pied des murs du tunnel d'arrivée posé sur le bord de la dalle (≤ 5 sommets au-dessus du bitume, à 1,5 m du bord), les rails de la mine posés SUR la dalle (comptés « dalle », jamais « couloir ») */
        for(const k in r.deco){const e=r.deco[k];if(k==='tunnel'&&e.couloir<=5)continue;if(k==='mine'&&e.couloir<=10)continue;D[k]=e;}
        if(Object.keys(D).length)d.push('deco '+JSON.stringify(D).slice(0,260));}
      if(r.flotte&&(r.flotte.peupliers||r.flotte.cheminees))d.push('flotte '+r.flotte.peupliers+'/'+r.flotte.cheminees);
      if(r.murs&&typeof r.murs==='object'&&r.murs.dansLaRoche)d.push('murs dans la roche '+r.murs.dansLaRoche+' '+JSON.stringify(r.murs.pire));
      if(r.v3&&r.v3.faux)d.push('ouvrages '+JSON.stringify(r.v3.res));
      if(r.lames&&typeof r.lames==='object'&&(r.lames.lames||r.lames.n))d.push('lames '+JSON.stringify(r.lames).slice(0,120));
      if(r.bornes&&r.bornes.horsBornes)d.push('bornes '+r.bornes.horsBornes+' pire '+r.bornes.pire);
      for(const k of ['audit','murs','lames','v3','tubes','bornes'])if(typeof r[k]==='string'&&r[k].startsWith('erreur'))d.push(k+' '+r[k]);
      if(r.erreursPage.length)d.push('page '+String(r.erreursPage[0]).slice(0,160));}
    if(d.length)defauts++;
    api.log('g'+String(g).padEnd(3),r.erreur?'':('L '+r.L+' ang '+r.raccord.angMax+'°/m n '+r.raccord.nMax+'°/m tubes '+(r.tubes||[]).length+' ouvr '+(r.ouvrages||[]).length+' pièces '+r.pieces.tot+(r.mur?' · dalle couchée sans roche à moins de 60 m '+r.mur.n+'/'+r.mur.pts:'')),d.length?'✘ '+d.join(' · '):'✔');}
  if(a.out){fs.mkdirSync(path.dirname(path.resolve(a.out)),{recursive:true});fs.writeFileSync(a.out,JSON.stringify(tout,null,1));}
  api.log('BILAN',defauts,'graine(s) en défaut sur',(g1||g0)-g0+1);if(defauts)process.exitCode=1;
}
