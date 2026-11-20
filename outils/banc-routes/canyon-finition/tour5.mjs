/* TOUR 5 DU CANYON FINI (2026-11-19, reprise : « des fois c'est trop rouge », contrôle : « la roche tourne au kaki-olive au lieu de dorer ») : UN passage.
   Par graine (3, 7, 11) au soir : l'avant (le jeu de référence), le lot chargé, puis des VARIANTES posées à chaud sur le lot (dbgAmb : on remet l'ambiance
   du lot telle qu'elle a été lue au chargement, puis la variante par-dessus ; `_sat` et `_sunI` = facteurs sur les valeurs de L'AVANT, que le lot ne touchait pas).
   La variante AV = l'ambiance entière de l'avant posée à chaud sur le lot : elle doit redonner les mesures de l'avant (la preuve que « à chaud » = « au chargement »).
   Photos par jeu : vue figée 900 paysage et portrait, en course (s = 2200) paysage et portrait ; comptes du renderer à la vue figée ; puis `sans=canyonfini` (g3)
   et un chargement d'orage (g3) qui avait échoué une fois au contrôle.
   WEB=/Users/sachaberes/cash-car/finition-lots banc.sh tour5.mjs out=<dossier> [graines=3,7,11] [variantes=AV,Y1,…] */
import fs from 'node:fs';
const Y1={cyT:[1.0,.98,.80],fog:[.88,.58,.40],fogIn:[.96,.80,.66]};
const Y2=Object.assign({},Y1,{sunC:[.95,.64,.32]});
const Y3=Object.assign({},Y2,{_sat:1.12,_sunI:.93});
const Y4=Object.assign({},Y1,{sunC:[.97,.68,.38],cyL:[.95,.58,.36],hemiG:[.38,.27,.24],_sat:1.10,_sunI:.93});
const Y5=Object.assign({},Y4,{cyH:[.98,.62,.46],jHor:[.98,.62,.46],cyM:[.38,.28,.60],jMid:[.38,.28,.60]});
const Y6=Object.assign({},Y5,{fillC:[.46,.40,.78],hemiS:[.38,.36,.66]});
const Y7=Object.assign({},Y6,{cyT:[1.02,.96,.74],cyF:[.82,.66,.66],_sat:1.16,_sunI:.90});
export const VARIANTES={Y1,Y2,Y3,Y4,Y5,Y6,Y7};
export default async function(api,a){
  const out=a.out||'.',F={paysage:[844,390,2],portrait:[390,844,2]},res={comptes:[],amb:{},vars:{}};fs.mkdirSync(out,{recursive:true});
  const ecrit=()=>fs.writeFileSync(`${out}/tour5.json`,JSON.stringify(res,null,1));
  await api.cdp('Page.addScriptToEvaluateOnNewDocument',{source:"window.__ctlW=[];['warn','error'].forEach(function(k){const o=console[k];console[k]=function(){try{window.__ctlW.push(k+': '+Array.prototype.map.call(arguments,String).join(' ').slice(0,200));}catch(e){}return o.apply(console,arguments);};});"});
  const compte=async(jeu,g,meteo)=>{const c=await api.ev(`(function(){const R=dbgScene().rdr;dbgCanyonVoute('vueS',900);const a0=R.info.autoReset;R.info.autoReset=false;R.info.reset();dbgCanyonVoute('vueS',900);
      const i=R.info.render,r={appels:i.calls,triangles:i.triangles,programmes:R.info.programs?R.info.programs.length:null,geometries:R.info.memory.geometries,textures:R.info.memory.textures};R.info.autoReset=a0;
      r.warn=(window.__ctlW||[]).slice(0,6);return r;})()`);
    c.erreurs=api.erreurs.slice(0,4);res.comptes.push(Object.assign({jeu,graine:g,meteo},c));api.log('comptes',jeu,meteo,g,JSON.stringify(c).slice(0,300));ecrit();};
  const vue=async f=>{await api.taille(...F[f]);await api.dort(700);await api.ev("dbgCanyonVoute('vueS',900)");await api.dort(450);await api.ev("dbgCanyonVoute('vueS',900)");await api.dort(300);};
  const tir=async(jeu,g)=>{for(const f of ['paysage','portrait']){await vue(f);await api.photo(`${out}/${jeu}-g${g}-v900-${f}.png`);}
    await api.taille(...F.paysage);await api.ev(`(function(){try{if(dbgState().paused)dbgCanyon('reprendre');}catch(e){}return dbgJadeAller(2200);})()`);await api.dort(1600);
    await api.photo(`${out}/${jeu}-g${g}-roule-paysage.png`);await api.taille(...F.portrait);await api.dort(900);await api.photo(`${out}/${jeu}-g${g}-roule-portrait.png`);await api.taille(...F.paysage);};
  const graines=(a.graines||'3,7,11').split(',').map(Number),noms=(a.variantes||'AV,Y1,Y2,Y3,Y4,Y5,Y6,Y7').split(',');
  for(const g of graines){
    try{await api.charger({graine:g,meteo:'soir',chemin:'avant/VERSION%20PRINCIPALE',taille:F.paysage,attente:3});}catch(e){api.log('ÉCHEC avant',g,String(e).slice(0,200));continue;}
    const AVB=await api.ev("JSON.parse(JSON.stringify(dbgAmb('canyonSoir')))");res.amb['avant-g'+g]={sat:AVB.sat,sunI:AVB.sunI,hemiI:AVB.hemiI,fillI:AVB.fillI,sunC:AVB.sunC,cyT:AVB.cyT};
    await compte('avant',g,'soir');await tir('avant',g);
    try{await api.charger({graine:g,meteo:'soir',chemin:'canyon/VERSION%20PRINCIPALE',taille:F.paysage,attente:3});}catch(e){api.log('ÉCHEC lot',g,String(e).slice(0,200));continue;}
    const LB=await api.ev("JSON.parse(JSON.stringify(dbgAmb('canyonSoir')))");res.amb['lot-g'+g]={sat:LB.sat,sunI:LB.sunI,sunC:LB.sunC,cyT:LB.cyT};
    await compte('lot',g,'soir');await tir('lot',g);
    for(const n of noms){let V;if(n==='AV')V=AVB;else{V={};const S=VARIANTES[n];for(const k in S){if(k==='_sat')V.sat=+(AVB.sat*S[k]).toFixed(3);else if(k==='_sunI')V.sunI=+(AVB.sunI*S[k]).toFixed(3);else V[k]=S[k];}}
      res.vars[n]=n==='AV'?'avant entier':V;
      await api.ev(`(dbgAmb('canyonSoir',${JSON.stringify(LB)}),dbgAmb('canyonSoir',${JSON.stringify(V)}),1)`);await api.dort(300);
      if(g===graines[0])await compte(n,g,'soir');
      await tir(n,g);api.log('variante',n,'g'+g,'ok');ecrit();}
    if(g===3){try{await api.charger({graine:3,meteo:'soir',q:'sans=canyonfini',chemin:'canyon/VERSION%20PRINCIPALE',taille:F.paysage,attente:3});await compte('sans',3,'soir');
      await vue('paysage');await api.photo(`${out}/sans-g3-v900-paysage.png`);}catch(e){api.log('ÉCHEC sans',String(e).slice(0,200));}}}
  const t0=Date.now();
  try{await api.charger({graine:3,meteo:'orage',chemin:'canyon/VERSION%20PRINCIPALE',taille:F.paysage,attente:3});await compte('lot',3,'orage');api.log('orage chargé en',Math.round((Date.now()-t0)/1000),'s');}
  catch(e){api.log('ÉCHEC orage',Math.round((Date.now()-t0)/1000),'s',String(e).slice(0,200));}
  ecrit();
}
