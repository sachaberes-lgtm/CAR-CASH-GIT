/* TOUR 8 DU CANYON FINI (2026-11-20, correction 6 : le soir rendu à l'avant) : le passage « valeurs chargées ». Plan = météo:graine:jeux[:court] ; jeux parmi
   avant | lot | sans | tete (le jeu de HEAD avant la correction, servi à côté) ; court = vue 900 paysage seule. Comptes du renderer à la vue figée 900 à chaque chargement.
   Repris du contrôleur du 20/11 (ctl-tour5.mjs). WEB=<dossier qui sert avant/, canyon/, tete/> banc.sh tour8.mjs out=<dossier> plan=… */
import fs from 'node:fs';
export default async function(api,a){
  const out=a.out||'.',F={paysage:[844,390,2],portrait:[390,844,2]},S=[900,2600],res=[];fs.mkdirSync(out,{recursive:true});
  await api.cdp('Page.addScriptToEvaluateOnNewDocument',{source:"window.__ctlW=[];['warn','error'].forEach(function(k){const o=console[k];console[k]=function(){try{window.__ctlW.push(k+': '+Array.prototype.map.call(arguments,String).join(' ').slice(0,200));}catch(e){}return o.apply(console,arguments);};});"});
  const J={avant:{chemin:'avant/VERSION%20PRINCIPALE',q:''},lot:{chemin:'canyon/VERSION%20PRINCIPALE',q:''},sans:{chemin:'canyon/VERSION%20PRINCIPALE',q:'sans=canyonfini'},tete:{chemin:'tete/VERSION%20PRINCIPALE',q:''}};
  const plan=(a.plan||'soir:17:avant+lot+sans,soir:5:avant+lot,soir:7:avant+lot,soir:23:avant+lot,nuit:17:avant+lot,pluie:17:lot+sans,orage:23:lot+sans,matin:17:lot').split(',');
  const T0=Date.now();
  for(const p of plan){const [meteo,g,js,court]=p.split(':');
    for(const nom of js.split('+')){if(Date.now()-T0>510000){api.log('garde-temps',nom,p,'sauté');continue;}const t0=Date.now();
      try{await api.charger({graine:+g,meteo,q:J[nom].q,chemin:J[nom].chemin,taille:F.paysage,attente:3});}catch(e){api.log('ÉCHEC charge',nom,p,String(e).slice(0,200));continue;}
      const B='canyon'+meteo[0].toUpperCase()+meteo.slice(1);
      const c=await api.ev(`(function(){const R=dbgScene().rdr;dbgCanyonVoute('vueS',${S[0]});const a0=R.info.autoReset;R.info.autoReset=false;R.info.reset();dbgCanyonVoute('vueS',${S[0]});
        const i=R.info.render,r={appels:i.calls,triangles:i.triangles,programmes:R.info.programs?R.info.programs.length:null,geometries:R.info.memory.geometries,textures:R.info.memory.textures};R.info.autoReset=a0;
        try{const b=dbgAmb('${B}');r.amb={sat:b.sat,sunI:b.sunI,sunC:b.sunC,cyT:b.cyT,fog:b.fog};}catch(e){r.amb=String(e).slice(0,80);}
        return r;})()`);
      for(const f of (court?['paysage']:['paysage','portrait'])){await api.taille(...F[f]);await api.dort(700);
        for(const s9 of (court?[900]:S)){await api.ev(`dbgCanyonVoute('vueS',${s9})`);await api.dort(450);await api.ev(`dbgCanyonVoute('vueS',${s9})`);await api.dort(250);
          await api.photo(`${out}/${nom}-${meteo}-g${g}-s${s9}-${f}.png`);}}
      if(!court)for(const k of ['']){await api.taille(...F.paysage);await api.ev(`(function(){try{if(dbgState().paused)dbgCanyon('reprendre');}catch(e){}return dbgJadeAller(2200);})()`);await api.dort(1600);
        await api.photo(`${out}/${nom}-${meteo}-g${g}-roule${k}-paysage.png`);await api.taille(...F.portrait);await api.dort(900);await api.photo(`${out}/${nom}-${meteo}-g${g}-roule${k}-portrait.png`);
        if(meteo!=='soir')break;}
      await api.taille(...F.paysage);
      c.erreurs=api.erreurs.slice(0,4);c.warn=await api.ev('(window.__ctlW||[]).slice(0,12)').catch(()=>null);
      res.push(Object.assign({jeu:nom,meteo,graine:+g,s:Math.round((Date.now()-t0)/1000)},c));api.log(nom,p,JSON.stringify(c).slice(0,500));
      fs.writeFileSync(`${out}/comptes.json`,JSON.stringify(res,null,1));}}
}
