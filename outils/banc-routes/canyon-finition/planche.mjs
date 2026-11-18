/* LES PLANCHES ET LES COMPTES DE LA FINITION DU CANYON (2026-11-18) : le vrai jeu « avant » (le jeu assemblé de référence) et « après » (ce dépôt), et l'après interrupteur coupé
   (?sans=canyonfini), aux mêmes vues, formats iPhone paysage 844×390 et portrait 390×844 (×2), en ?tel=1.
   WEB=/Users/sachaberes/cash-car/finition-lots node pilote.mjs planche.mjs out=<dossier> jeux=avant:avant/VERSION%20PRINCIPALE:,apres:canyon/VERSION%20PRINCIPALE:,sans:canyon/VERSION%20PRINCIPALE:sans=canyonfini
     cas=soir:3,soir:7,matin:7,nuit:3,pluie:7,orage:3  s=<abscisses des vues figées>  [sans=soir:3,matin:7 : les cas où l'on photographie aussi l'interrupteur coupé]
   Par chargement : les COMPTES du renderer (appels, triangles sur toutes les passes d'une image à la vue figée, programmes, géométries, textures) à la première vue,
   en paysage ; puis les photos des deux formats (le format change sans recharger). Une vue « en course » (mode roule) en plus, pour la caisse, l'argent et le HUD. */
import fs from 'node:fs';
export default async function(api,a){
  const out=a.out||'.',F={paysage:[844,390,2],portrait:[390,844,2]},S=(a.s||'900,3000').split(','),comptes=[];fs.mkdirSync(out,{recursive:true});
  const jeux=a.jeux.split(',').map(x=>{const p=x.split(':');return {nom:p[0],chemin:p[1],q:p.slice(2).join(':')};}),sansCas=(a.sans||'').split(',');
  for(const cs of a.cas.split(',')){const [meteo,g]=cs.split(':');
    for(const J of jeux){if(J.nom==='sans'&&sansCas.indexOf(cs)<0)continue;
      await api.charger({graine:+g,meteo,q:J.q,chemin:J.chemin,taille:F.paysage,attente:3});
      const c=await api.ev(`(function(){const R=dbgScene().rdr;dbgCanyonVoute('vueS',${+S[0]});const a0=R.info.autoReset;R.info.autoReset=false;R.info.reset();dbgCanyonVoute('vueS',${+S[0]});
        const i=R.info.render,r={appels:i.calls,triangles:i.triangles,programmes:R.info.programs?R.info.programs.length:null,geometries:R.info.memory.geometries,textures:R.info.memory.textures};R.info.autoReset=a0;return r;})()`);
      comptes.push(Object.assign({jeu:J.nom,meteo,graine:+g},c));api.log(J.nom,meteo,'g'+g,JSON.stringify(c));
      for(const f of ['paysage','portrait']){await api.taille(...F[f]);await api.dort(700);
        for(const s9 of S){await api.ev(`dbgCanyonVoute('vueS',${+s9})`);await api.dort(450);await api.ev(`dbgCanyonVoute('vueS',${+s9})`);await api.dort(250);
          await api.photo(`${out}/${J.nom}-${meteo}-g${g}-s${s9}-${f}.png`);}}
      await api.taille(...F.paysage);await api.ev(`(function(){try{if(dbgState().paused)dbgCanyon('reprendre');}catch(e){}return dbgJadeAller(${+(a.roule||2200)});})()`);await api.dort(1600);
      await api.photo(`${out}/${J.nom}-${meteo}-g${g}-roule-paysage.png`);
      if(api.erreurs.length){api.log('ERREURS de page',J.nom,meteo,JSON.stringify(api.erreurs.slice(0,4)));comptes[comptes.length-1].erreurs=api.erreurs.slice(0,4);}}}
  fs.writeFileSync(`${out}/comptes.json`,JSON.stringify(comptes,null,1));
}
