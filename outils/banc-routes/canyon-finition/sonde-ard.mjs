/* SONDE DE L'ARDOISE (2026-11-20, correction 7) : l'uniforme uArd agit-il, et où ? Graine 17, soir, vue 2600 paysage : W2 posé à chaud, puis W2 + une ardoise
   MAGENTA franche [2,0,2] (là où l'image vire au magenta, c'est l'ardoise qui fait la couleur), puis W2 + rebond nul. Lit aussi U.uArd dans la page.
   WEB=<dossier> banc.sh sonde-ard.mjs out=<dossier> */
import {VARIANTES} from './tour7.mjs';
export default async function(api,a){
  const out=a.out||'.';
  await api.charger({graine:17,meteo:'soir',chemin:'canyon/VERSION%20PRINCIPALE',taille:[844,390,2],attente:3});
  const W=Object.assign({},VARIANTES.W2);delete W._sat;delete W._sunI;W.sat=.972;W.sunI=1.604;
  const jeux={W2:W,MAG:Object.assign({},W,{cyAr:[2,0,2]}),VERT:Object.assign({},W,{cyAr:[0,2,0]})};
  for(const n in jeux){await api.ev(`(dbgAmb('canyonSoir',${JSON.stringify(jeux[n])}),1)`);await api.dort(400);
    for(const s9 of [2600,900]){await api.ev(`dbgCanyonVoute('vueS',${s9})`);await api.dort(450);await api.ev(`dbgCanyonVoute('vueS',${s9})`);await api.dort(300);await api.photo(`${out}/${n}-g17-v${s9}-paysage.png`);}
    api.log(n,JSON.stringify(await api.ev("(function(){try{return {cur:BIO.cur.cyAr};}catch(e){return String(e);}})()")));}
}
