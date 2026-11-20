/* LE PASSAGE UNIQUE DE LA FINITION DU CANYON (2026-11-18) : le verrou commun est saturé (18 bancs en attente), donc UN passage fait tout :
   1) planche.mjs (avant | après | après interrupteur coupé, comptes du renderer, photos paysage et portrait) ;
   2) deux variantes du soir essayées À CHAUD sur l'après (dbgAmb), pour que Sacha puisse trancher sans nouveau passage.
   WEB=/Users/sachaberes/cash-car/finition-lots node pilote.mjs tout.mjs out=<dossier> jeux=… cas=… sans=… s=… */
import planche from './planche.mjs';
export default async function(api,a){
  await planche(api,a);
  const out=a.out||'.',V={plusChaud:{sunC:[1,.56,.32]},plusFroid:{hemiS:[.30,.38,.74],fillC:[.32,.40,.88],fog:[.74,.48,.56],cyF:[.64,.58,.82]}};
  await api.charger({graine:3,meteo:'soir',chemin:'canyon/VERSION%20PRINCIPALE',taille:[844,390,2],attente:3});
  const base=await api.ev("dbgAmb('canyonSoir')");
  for(const n in V){const e=Object.assign({},V[n]);if(n==='plusChaud')e.sat=+(base.sat/.92).toFixed(3); /* la saturation d'avant le lot */
    await api.ev(`(dbgAmb('canyonSoir',${JSON.stringify(base)}),dbgAmb('canyonSoir',${JSON.stringify(e)}),1)`);await api.dort(400);
    await api.ev('dbgCanyonVoute(\'vueS\',900)');await api.dort(450);await api.ev('dbgCanyonVoute(\'vueS\',900)');await api.dort(250);
    await api.photo(`${out}/variante-${n}-soir-g3-s900-paysage.png`);api.log('variante',n,'ok');}
  if(api.erreurs.length)api.log('ERREURS de page (variantes)',JSON.stringify(api.erreurs.slice(0,4)));
}
