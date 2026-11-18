/* L'ATELIER DE LA FINITION DU CANYON (2026-11-18, finition des maps : « le plus jolies possible ») : des réglages d'ambiance essayés À CHAUD dans le vrai jeu.
   node pilote.mjs explore.mjs cands=<fichier.json> out=<dossier> [graine=3] [s=900,3000,7000] [formats=paysage]
   cands = {meteo:{nom:{champ:valeur,…}}} ; chaque essai part de l'ambiance d'origine (dbgAmb la rend, puis la remet), `satK` multiplie la saturation d'origine.
   Les photos : l'œil du joueur figé à l'abscisse s (dbgCanyonVoute('vueS')), même cadre d'un essai à l'autre ; le JSON de l'ambiance d'origine est écrit à côté. */
import fs from 'node:fs';
export default async function(api,a){
  const C=JSON.parse(fs.readFileSync(a.cands,'utf8')),out=a.out||'.',F={paysage:[844,390,2],portrait:[390,844,2]};fs.mkdirSync(out,{recursive:true});
  for(const meteo in C){const bio='canyon'+meteo[0].toUpperCase()+meteo.slice(1);
    for(const f of (a.formats||'paysage').split(',')){
      await api.charger({graine:+(a.graine||3),meteo,q:a.q||'',taille:F[f],attente:3});
      const base=await api.ev(`dbgAmb('${bio}')`);fs.writeFileSync(`${out}/base-${meteo}.json`,JSON.stringify(base));
      const essais=Object.assign({base:{}},C[meteo]);
      for(const nom in essais){const e=Object.assign({},essais[nom]);if(e.satK){e.sat=+(base.sat*e.satK).toFixed(3);delete e.satK;}
        await api.ev(`(dbgAmb('${bio}',${JSON.stringify(base)}),dbgAmb('${bio}',${JSON.stringify(e)}),1)`);await api.dort(400);
        for(const s9 of (a.s||'900,3000,7000').split(',')){await api.ev(`dbgCanyonVoute('vueS',${+s9})`);await api.dort(450);await api.ev(`dbgCanyonVoute('vueS',${+s9})`);await api.dort(200);
          const fich=`${out}/${meteo}-${nom}-s${s9}-${f}.png`;await api.photo(fich);}
        api.log(meteo,nom,'ok');}
      if(api.erreurs.length)api.log('erreurs de page',JSON.stringify(api.erreurs.slice(0,4)));}}
}
