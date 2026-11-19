/* LES PHOTOS DU CANYON FINAL (2026-11-17) : mêmes points de vue, formats iPhone (portrait 390×844, paysage 844×390, ×2).
   node outils/banc-routes/canyon-final/pilote.mjs outils/banc-routes/canyon-final/photos.mjs graine=3 meteo=matin,soir s=600,2400 out=dossier [tag=avant] [q=sans=…] [mode=vue|roule] [formats=paysage,portrait]
   mode=vue (défaut) : l'œil du joueur figé à l'abscisse s (dbgCanyonVoute('vueS', s), en pause : même cadre d'une photo à l'autre, sans flou de vitesse)
   mode=roule        : la caisse posée 60 m avant s (dbgJadeAller), 1,4 s de course au pilote auto, la caméra et le HUD du jeu
   s=auto            : le milieu de chaque gabarit et de chaque tube de la route */
export default async function(api,a){
  const out=a.out||'.',tag=a.tag||'cy',formats=(a.formats||'paysage,portrait').split(','),F={paysage:[844,390,2],portrait:[390,844,2]};
  for(const meteo of (a.meteo||'matin').split(','))for(const g of String(a.graine||3).split(',')){
    for(const f of formats){
      await api.charger({graine:+g,meteo,q:a.q||'',taille:F[f],attente:3});
      let LS=(a.s||'600').split(',');
      if(a.s==='auto'){const L=await api.ev('Math.round(dbgRoute().L)'),G=await api.ev('dbgCanyonGab().map(function(z){return Math.round((z.a+z.b)/2);})'),T=await api.ev('(dbgCanyonVoute().tubes||[]).map(function(v){return [v[0]-80,Math.round((v[0]+v[1])/2),v[1]+50];})');
        LS=Array.from(new Set(G.concat(...T).filter(x=>x>40&&x<L-80))).sort((x,y)=>x-y);if(a.max)LS=LS.slice(0,+a.max);}
      for(const s9 of LS){const fich=`${out}/${tag}-${meteo}-g${g}-s${s9}-${f}.png`;
        if(a.mode==='roule'){await api.ev(`(function(){try{if(dbgState().paused)dbgCanyon('reprendre');}catch(e){}return dbgJadeAller(${Math.max(10,+s9-60)});})()`);await api.dort(1400);}
        else{await api.ev(`dbgCanyonVoute('vueS',${+s9})`);await api.dort(500);await api.ev(`dbgCanyonVoute('vueS',${+s9})`);await api.dort(250);}
        await api.photo(fich);api.log('photo',fich);}
      if(api.erreurs.length)api.log('erreurs de page',JSON.stringify(api.erreurs.slice(0,4)));}}
}
