/* TOUR 2 (2026-11-18, finition des maps) : avant | lot | lot ?sans=canyonfini, comptes du renderer, avertissements console, photos paysage + portrait à vue figée et en course.
   WEB=/Users/sachaberes/cash-car/finition-lots banc.sh tour2.mjs out=<dossier> [cas=soir:3,nuit:7]   (reprend le scénario du contrôle adverse, tour 1) */
import fs from 'node:fs';
export default async function(api,a){
  const out=a.out||'.',F={paysage:[844,390,2],portrait:[390,844,2]},S=[900,2600],res=[];fs.mkdirSync(out,{recursive:true});
  await api.cdp('Page.addScriptToEvaluateOnNewDocument',{source:"window.__ctlW=[];['warn','error'].forEach(function(k){const o=console[k];console[k]=function(){try{window.__ctlW.push(k+': '+Array.prototype.map.call(arguments,String).join(' ').slice(0,200));}catch(e){}return o.apply(console,arguments);};});"});
  const J={avant:{chemin:'avant/VERSION%20PRINCIPALE',q:''},lot:{chemin:'canyon/VERSION%20PRINCIPALE',q:''},sans:{chemin:'canyon/VERSION%20PRINCIPALE',q:'sans=canyonfini'}};
  const cas=(a.cas||'soir:3,soir:11,nuit:7,pluie:7,orage:3,soir:7').split(',');
  for(const cs of cas){const [meteo,g]=cs.split(':');
    for(const nom of ['avant','lot','sans']){const t0=Date.now();
      try{await api.charger({graine:+g,meteo,q:J[nom].q,chemin:J[nom].chemin,taille:F.paysage,attente:3});}catch(e){api.log('ÉCHEC charge',nom,cs,String(e).slice(0,200));continue;}
      const c=await api.ev(`(function(){const R=dbgScene().rdr;dbgCanyonVoute('vueS',${S[0]});const a0=R.info.autoReset;R.info.autoReset=false;R.info.reset();dbgCanyonVoute('vueS',${S[0]});
        const i=R.info.render,r={appels:i.calls,triangles:i.triangles,programmes:R.info.programs?R.info.programs.length:null,geometries:R.info.memory.geometries,textures:R.info.memory.textures};R.info.autoReset=a0;
        try{const b=dbgAmb('canyon${meteo[0].toUpperCase()+meteo.slice(1)}');r.amb={hemiS:b.hemiS,fog:b.fog,sunC:b.sunC,sat:b.sat};}catch(e){r.amb=String(e).slice(0,80);}
        try{const s=dbgState();r.etat=Object.keys(s).filter(k=>/bio|amb|met/i.test(k)).map(k=>k+'='+s[k]).join(' ');}catch(e){}
        r.warn=(window.__ctlW||[]).slice(0,8);return r;})()`);
      for(const f of ['paysage','portrait']){await api.taille(...F[f]);await api.dort(700);
        for(const s9 of S){await api.ev(`dbgCanyonVoute('vueS',${s9})`);await api.dort(450);await api.ev(`dbgCanyonVoute('vueS',${s9})`);await api.dort(250);
          await api.photo(`${out}/${nom}-${meteo}-g${g}-s${s9}-${f}.png`);}}
      await api.taille(...F.paysage);await api.ev(`(function(){try{if(dbgState().paused)dbgCanyon('reprendre');}catch(e){}return dbgJadeAller(2200);})()`);await api.dort(1600);
      await api.photo(`${out}/${nom}-${meteo}-g${g}-roule-paysage.png`);
      c.erreurs=api.erreurs.slice(0,4);c.warn2=await api.ev('(window.__ctlW||[]).slice(0,12)').catch(()=>null);
      res.push(Object.assign({jeu:nom,meteo,graine:+g,s:Math.round((Date.now()-t0)/1000)},c));api.log(nom,cs,JSON.stringify(c).slice(0,600));
      fs.writeFileSync(`${out}/comptes.json`,JSON.stringify(res,null,1));}}
}
