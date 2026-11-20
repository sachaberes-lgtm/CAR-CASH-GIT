/* TOUR 6 DU CANYON FINI (2026-11-20, correction 5 : « le soir trop rouge », contrôle : « la roche tourne au kaki-olive ») : copie du tour 5 (agent interrompu),
   quatre variantes au lieu de sept, AV sur la première graine seulement, et un garde-temps (rien de neuf lancé après 8 min 30 : le verrou est repris à 15 min).
   --- en-tête du tour 5 : TOUR 5 DU CANYON FINI (2026-11-19, reprise : « des fois c'est trop rouge », contrôle : « la roche tourne au kaki-olive au lieu de dorer ») : UN passage.
   Par graine (3, 7, 11) au soir : l'avant (le jeu de référence), le lot chargé, puis des VARIANTES posées à chaud sur le lot (dbgAmb : on remet l'ambiance
   du lot telle qu'elle a été lue au chargement, puis la variante par-dessus ; `_sat` et `_sunI` = facteurs sur les valeurs de L'AVANT, que le lot ne touchait pas).
   La variante AV = l'ambiance entière de l'avant posée à chaud sur le lot : elle doit redonner les mesures de l'avant (la preuve que « à chaud » = « au chargement »).
   Photos par jeu : vue figée 900 paysage et portrait, en course (s = 2200) paysage et portrait ; comptes du renderer à la vue figée ; puis `sans=canyonfini` (g3)
   et un chargement d'orage (g3) qui avait échoué une fois au contrôle.
   WEB=/Users/sachaberes/cash-car/finition-lots banc.sh tour5.mjs out=<dossier> [graines=3,7,11] [variantes=AV,Y1,…] */
import fs from 'node:fs';
const Y1={cyT:[1.0,.98,.80],fog:[.88,.58,.40],fogIn:[.96,.80,.66],_sunI:.93};
const X1=Object.assign({},Y1,{sunC:[.95,.64,.32],_sat:1.08});
const Y4=Object.assign({},Y1,{sunC:[.97,.68,.38],cyL:[.95,.58,.36],hemiG:[.38,.27,.24],_sat:1.10});
const Y7=Object.assign({},Y4,{cyH:[.98,.62,.46],jHor:[.98,.62,.46],cyM:[.38,.28,.60],jMid:[.38,.28,.60],fillC:[.46,.40,.78],hemiS:[.38,.36,.66],cyT:[1.02,.96,.74],cyF:[.82,.66,.66],_sat:1.16,_sunI:.90});
/* deuxième passage du tour 6 : le vert de cyT qui DORAIT (tour 4) est gardé, c'est le BLEU qu'on coupe (moins de gris), la saturation remonte, le soleil baisse */
const LT={}; /* le lot tel quel, reposé à chaud : la référence « lot » au même moment de course que les variantes */
const Z1=Object.assign({},Y7,{cyT:[.96,1.04,.70],sunC:[.97,.72,.34]});
const Z2=Object.assign({},Y4,{cyT:[.94,1.06,.74],sunC:[.97,.72,.36],_sat:1.12,_sunI:.92});
const Z3={cyT:[.94,1.06,.76],sunC:[.97,.70,.34],fog:[.88,.58,.40],fogIn:[.96,.80,.66],_sat:1.14,_sunI:.92};
const Z4=Object.assign({},Z3,{cyT:[.92,1.08,.70],_sat:1.18,_sunI:.90});
/* troisième passage : entre Z1 (le chroma tenu) et Z2-Z4 (la braise coupée, le chroma perdu) — Z1 avec une roche un cran plus or, la saturation un cran plus haut */
const W1=Object.assign({},Z1,{cyT:[.94,1.06,.68]});
const W2=Object.assign({},Z1,{cyT:[.92,1.08,.66],_sat:1.20});
const W3=Object.assign({},Z1,{cyT:[.94,1.06,.68],sunC:[.97,.74,.32],_sat:1.20,_sunI:.88});
export const VARIANTES={Y1,X1,Y4,Y7,LT,Z1,Z2,Z3,Z4,W1,W2,W3};
export default async function(api,a){
  const out=a.out||'.',F={paysage:[844,390,2],portrait:[390,844,2]},res={comptes:[],amb:{},vars:{}};fs.mkdirSync(out,{recursive:true});
  const ecrit=()=>fs.writeFileSync(`${out}/tour6.json`,JSON.stringify(res,null,1));
  await api.cdp('Page.addScriptToEvaluateOnNewDocument',{source:"window.__ctlW=[];['warn','error'].forEach(function(k){const o=console[k];console[k]=function(){try{window.__ctlW.push(k+': '+Array.prototype.map.call(arguments,String).join(' ').slice(0,200));}catch(e){}return o.apply(console,arguments);};});"});
  const compte=async(jeu,g,meteo)=>{const c=await api.ev(`(function(){const R=dbgScene().rdr;dbgCanyonVoute('vueS',900);const a0=R.info.autoReset;R.info.autoReset=false;R.info.reset();dbgCanyonVoute('vueS',900);
      const i=R.info.render,r={appels:i.calls,triangles:i.triangles,programmes:R.info.programs?R.info.programs.length:null,geometries:R.info.memory.geometries,textures:R.info.memory.textures};R.info.autoReset=a0;
      r.warn=(window.__ctlW||[]).slice(0,6);return r;})()`);
    c.erreurs=api.erreurs.slice(0,4);res.comptes.push(Object.assign({jeu,graine:g,meteo},c));api.log('comptes',jeu,meteo,g,JSON.stringify(c).slice(0,300));ecrit();};
  const vue=async f=>{await api.taille(...F[f]);await api.dort(700);await api.ev("dbgCanyonVoute('vueS',900)");await api.dort(450);await api.ev("dbgCanyonVoute('vueS',900)");await api.dort(300);};
  const tir=async(jeu,g)=>{for(const f of ['paysage','portrait']){await vue(f);await api.photo(`${out}/${jeu}-g${g}-v900-${f}.png`);}
    await api.taille(...F.paysage);await api.ev(`(function(){try{if(dbgState().paused)dbgCanyon('reprendre');}catch(e){}return dbgJadeAller(2200);})()`);await api.dort(1600);
    await api.photo(`${out}/${jeu}-g${g}-roule-paysage.png`);await api.taille(...F.portrait);await api.dort(900);await api.photo(`${out}/${jeu}-g${g}-roule-portrait.png`);await api.taille(...F.paysage);};
  const T0=Date.now(),tard=()=>Date.now()-T0>510000;
  const graines=(a.graines||'11,3,7').split(',').map(Number),noms=(a.variantes||'AV,Y1,X1,Y4,Y7').split(',').filter(x=>x&&x!=='aucune');
  for(const g of graines){if(tard()){api.log('garde-temps : graine',g,'sautée');continue;}
    let AVB;if(a.sansavant){AVB={sat:.81,sunI:1.782};}else{ /* sansavant=1 : l'avant n'est pas rechargé (ses photos viennent d'un passage précédent ; sat et sunI de l'avant, lus au tour 6) */
    try{await api.charger({graine:g,meteo:'soir',chemin:'avant/VERSION%20PRINCIPALE',taille:F.paysage,attente:3});}catch(e){api.log('ÉCHEC avant',g,String(e).slice(0,200));continue;}
    AVB=await api.ev("JSON.parse(JSON.stringify(dbgAmb('canyonSoir')))");res.amb['avant-g'+g]={sat:AVB.sat,sunI:AVB.sunI,hemiI:AVB.hemiI,fillI:AVB.fillI,sunC:AVB.sunC,cyT:AVB.cyT};
    await compte('avant',g,'soir');await tir('avant',g);
    }
    try{await api.charger({graine:g,meteo:'soir',chemin:'canyon/VERSION%20PRINCIPALE',taille:F.paysage,attente:3});}catch(e){api.log('ÉCHEC lot',g,String(e).slice(0,200));continue;}
    const LB=await api.ev("JSON.parse(JSON.stringify(dbgAmb('canyonSoir')))");res.amb['lot-g'+g]={sat:LB.sat,sunI:LB.sunI,sunC:LB.sunC,cyT:LB.cyT};
    await compte('lot',g,'soir');await tir('lot',g);
    for(const n of noms){if(n==='AV'&&g!==graines[0]&&!a.avpartout)continue;if(tard()){api.log('garde-temps : variante',n,'g'+g,'sautée');continue;}let V;if(n==='AV')V=AVB;else{V={};const S=VARIANTES[n];for(const k in S){if(k==='_sat')V.sat=+(AVB.sat*S[k]).toFixed(3);else if(k==='_sunI')V.sunI=+(AVB.sunI*S[k]).toFixed(3);else V[k]=S[k];}}
      res.vars[n]=n==='AV'?'avant entier':V;
      await api.ev(`(dbgAmb('canyonSoir',${JSON.stringify(LB)}),dbgAmb('canyonSoir',${JSON.stringify(V)}),1)`);await api.dort(300);
      if(g===graines[0])await compte(n,g,'soir');
      await tir(n,g);api.log('variante',n,'g'+g,'ok');ecrit();}
    if(String(a.sans||3).split(',').map(Number).includes(g)&&!tard()){try{await api.charger({graine:g,meteo:'soir',q:'sans=canyonfini',chemin:'canyon/VERSION%20PRINCIPALE',taille:F.paysage,attente:3});await compte('sans',g,'soir');
      await vue('paysage');await api.photo(`${out}/sans-g${g}-v900-paysage.png`);}catch(e){api.log('ÉCHEC sans',String(e).slice(0,200));}}}
  ecrit();
}
