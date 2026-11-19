/* UN ESSAI LIBRE (2026-11-17, canyon final) : une graine chargée, puis des étapes {ev: expression évaluée dans la page, photo: fichier, attente: ms} — pour l'atelier.
   args : {graine, meteo, q, format:'paysage'|'portrait', etapes:[…]} ; le résultat de chaque `ev` est écrit dans le journal. */
export default async function(api,a){const F={paysage:[844,390,2],portrait:[390,844,2]};
  await api.charger({graine:+(a.graine||3),meteo:a.meteo||'matin',q:a.q||'',taille:F[a.format||'paysage'],attente:3});
  for(const e of a.etapes||[]){let r=null;if(e.ev){try{r=await api.ev(e.ev,120000);}catch(x){r='ERREUR '+String(x.message||x).slice(0,300);}if(e.redit){await api.dort(e.attente||500);try{await api.ev(e.ev);}catch(x){}}}
    await api.dort(e.attente||300);if(e.photo)await api.photo(e.photo);api.log(e.nom||e.photo||'',r==null?'':JSON.stringify(r).slice(0,1500));}
  if(api.erreurs.length)api.log('erreurs de page',JSON.stringify(api.erreurs.slice(0,3)));
}
