/* TOUR 3 (2026-11-18, finition des maps) : variantes d'ambiance du soir et de la pluie posées par ?cyessai=<json> (crochet d'essai à remettre le temps du banc juste avant l'application de CY_FINI_R ; il n'est PAS dans le code commité, sans lui les « essai » sont ignorés),
   photos en course + vues figées, comptes du renderer et console. WEB=/Users/sachaberes/cash-car/finition-lots banc.sh tour3.mjs out=<dossier> [v=<variantes.json>] */
import fs from 'node:fs';
export default async function(api,a){
  const out=a.out||'.',F={paysage:[844,390,2],portrait:[390,844,2]},res=[];fs.mkdirSync(out,{recursive:true});
  await api.cdp('Page.addScriptToEvaluateOnNewDocument',{source:"window.__ctlW=[];['warn','error'].forEach(function(k){const o=console[k];console[k]=function(){try{window.__ctlW.push(k+': '+Array.prototype.map.call(arguments,String).join(' ').slice(0,200));}catch(e){}return o.apply(console,arguments);};});"});
  const V=JSON.parse(fs.readFileSync(a.v,'utf8'));
  for(const cs of V.cas){const [meteo,g]=cs.split(':');
    for(const nom of Object.keys(V.jeux)){const j=V.jeux[nom];if(j.meteo&&j.meteo!==meteo)continue;const t0=Date.now();
      const q=[j.q||'',j.essai?'cyessai='+encodeURIComponent(JSON.stringify(j.essai)):''].filter(Boolean).join('&');
      try{await api.charger({graine:+g,meteo,q,chemin:j.chemin,taille:F.paysage,attente:3});}catch(e){api.log('ÉCHEC charge',nom,cs,String(e).slice(0,200));continue;}
      const c=await api.ev(`(function(){const R=dbgScene().rdr;dbgCanyonVoute('vueS',900);const a0=R.info.autoReset;R.info.autoReset=false;R.info.reset();dbgCanyonVoute('vueS',900);
        const i=R.info.render,r={appels:i.calls,triangles:i.triangles,programmes:R.info.programs?R.info.programs.length:null,geometries:R.info.memory.geometries,textures:R.info.memory.textures};R.info.autoReset=a0;
        try{const b=dbgAmb('canyon${meteo[0].toUpperCase()+meteo.slice(1)}');r.amb={sunC:b.sunC,fog:b.fog,cyT:b.cyT,rtT:b.rtT};}catch(e){r.amb=String(e).slice(0,80);}
        r.warn=(window.__ctlW||[]).slice(0,8);return r;})()`);
      await api.ev(`dbgCanyonVoute('vueS',900)`);await api.dort(450);await api.ev(`dbgCanyonVoute('vueS',900)`);await api.dort(250);
      await api.photo(`${out}/${nom}-${meteo}-g${g}-s900-paysage.png`);
      await api.taille(...F.portrait);await api.dort(700);await api.ev(`dbgCanyonVoute('vueS',2600)`);await api.dort(450);await api.ev(`dbgCanyonVoute('vueS',2600)`);await api.dort(250);
      await api.photo(`${out}/${nom}-${meteo}-g${g}-s2600-portrait.png`);
      await api.taille(...F.paysage);await api.ev(`(function(){try{if(dbgState().paused)dbgCanyon('reprendre');}catch(e){}return dbgJadeAller(2200);})()`);await api.dort(1600);
      await api.photo(`${out}/${nom}-${meteo}-g${g}-roule-paysage.png`);
      await api.taille(...F.portrait);await api.dort(900);await api.photo(`${out}/${nom}-${meteo}-g${g}-roule-portrait.png`);
      c.erreurs=api.erreurs.slice(0,4);c.warn2=await api.ev('(window.__ctlW||[]).slice(0,12)').catch(()=>null);
      res.push(Object.assign({jeu:nom,meteo,graine:+g,s:Math.round((Date.now()-t0)/1000)},c));api.log(nom,cs,JSON.stringify(c).slice(0,400));
      fs.writeFileSync(`${out}/comptes.json`,JSON.stringify(res,null,1));}}
}
