/* TOUR 7 DU CANYON FINI (2026-11-20, correction 6 : « le soir trop rouge », contrôle : « ombres vert mousse sur g17, en course g17 et g23 aussi rouges qu'avant »).
   Autre voie que les tours 1-6 : la roche garde sa teinte d'avant (cyT [1,.95,.93] : cyT multiplie AUSSI l'ombre, d'où le vert mousse sous l'ardoise teal) ;
   c'est le SOLEIL DE LA ROCHE SEULE (nouvelle clé cyG, canyonTick : uSunC × cyG, rien d'autre) qui dore le grès au soleil, et le rebond cyL.
   Par graine : l'avant chargé, puis le lot chargé (code de la correction 6) sur lequel on pose À CHAUD l'ambiance ENTIÈRE de l'avant (AVB) puis la variante :
   les variantes ne dépendent donc pas des nombres du lot. Diagnostics (première graine seulement) : D0 = G3 sans soleil sur la roche, D1 = G3 sans rebond.
   Photos : vue figée 900 paysage et portrait, vue 2600 paysage, en course (s = 2200) paysage et portrait. Garde-temps 8 min 30.
   WEB=<scratchpad>/web banc.sh tour7.mjs out=<dossier> [graines=17,23,7] [variantes=G1,G2,G3,G4] [diag=1] */
import fs from 'node:fs';
const B0={sunC:[.97,.72,.34],_sunI:.90,cyL:[.95,.58,.36],hemiS:[.38,.36,.66],hemiG:[.38,.27,.24],fillC:[.46,.40,.78],fog:[.88,.58,.40],fogCj:[1,.64,.44],
  fogIn:[.96,.80,.66],cyF:[.82,.66,.66],cyH:[.98,.62,.46],jHor:[.98,.62,.46],cyZ:[.10,.12,.42],jZen:[.10,.12,.42],cyM:[.38,.28,.60],jMid:[.38,.28,.60],cyC:[1,.68,.50],cyD:[.26,.22,.40],cyR:[.36,.26,.40]};
const G1=Object.assign({},B0,{cyG:[.86,1.30,1.0],_sat:1.12});
const G2=Object.assign({},B0,{cyG:[.80,1.55,1.0],_sat:1.12});
const G3=Object.assign({},G2,{fog:[.86,.66,.40],fogIn:[.96,.84,.66],fogCj:[1,.72,.44],cyL:[.92,.66,.34],cyH:[.98,.70,.46],jHor:[.98,.70,.46]});
const G4=Object.assign({},G3,{cyG:[.74,1.75,1.0],cyL:[.88,.72,.34],_sat:1.16});
const G5=Object.assign({},G4,{cyG:[.70,1.95,1.05],cyL:[.84,.76,.36],hemiG:[.36,.29,.24],_sat:1.18});
/* second passage : le rebond (cyL) DORÉ — le diagnostic D1 montre qu'en course le rouge des parois vient du rebond, pas du soleil (D0) — et le ciel et le remplissage
   plus MAGENTA, pour que l'ombre (mêlée à l'ardoise teal du shader) ne vire pas au vert ; H3 = le rebond seul, sans cyG */
const H1=Object.assign({},B0,{cyG:[.80,1.45,1.0],cyL:[.86,.80,.40],hemiS:[.46,.34,.72],fillC:[.52,.36,.82],hemiG:[.42,.26,.30],_sat:1.22,_sunI:.84});
const H2=Object.assign({},H1,{cyG:[.74,1.70,1.05],cyL:[.80,.86,.44],_sat:1.26});
const H3=Object.assign({},H1,{cyG:[1,1,1],cyL:[.84,.84,.40]});
const D0=Object.assign({},G3,{cyG:[0,0,0]}),D1=Object.assign({},G3,{cyL:[0,0,0]});
/* W2 = le soir de la correction 5 (cyT doré), pour l'illustrer à côté des diagnostics ; quand le jeu chargé n'a pas la clé cyG (le code de la correction 6 l'a retirée),
   elle est ignorée : D0 et les G n'ont alors plus de sens (bioLerp échoue sur une clé absente de BIO.cur) */
const W2=Object.assign({},B0,{cyT:[.92,1.08,.66],_sat:1.20});
export const VARIANTES={B0,G1,G2,G3,G4,G5,D0,D1,H1,H2,H3,W2};
export default async function(api,a){
  const out=a.out||'.',F={paysage:[844,390,2],portrait:[390,844,2]},res={amb:{},vars:{},journal:[]};fs.mkdirSync(out,{recursive:true});
  const ecrit=()=>fs.writeFileSync(`${out}/tour7.json`,JSON.stringify(res,null,1));
  const vue=async(f,s9)=>{await api.taille(...F[f]);await api.dort(700);await api.ev(`dbgCanyonVoute('vueS',${s9})`);await api.dort(450);await api.ev(`dbgCanyonVoute('vueS',${s9})`);await api.dort(300);};
  const tir=async(jeu,g,court)=>{for(const f of ['paysage','portrait']){await vue(f,900);await api.photo(`${out}/${jeu}-g${g}-v900-${f}.png`);}
    if(!court){await vue('paysage',2600);await api.photo(`${out}/${jeu}-g${g}-v2600-paysage.png`);}
    await api.taille(...F.paysage);await api.ev(`(function(){try{if(dbgState().paused)dbgCanyon('reprendre');}catch(e){}return dbgJadeAller(2200);})()`);await api.dort(1600);
    await api.photo(`${out}/${jeu}-g${g}-roule-paysage.png`);await api.taille(...F.portrait);await api.dort(900);await api.photo(`${out}/${jeu}-g${g}-roule-portrait.png`);await api.taille(...F.paysage);};
  const T0=Date.now(),tard=()=>Date.now()-T0>510000;
  const graines=(a.graines||'17,23,7').split(',').map(Number),noms=(a.variantes||'G1,G2,G3,G4,G5').split(',').filter(Boolean);
  for(const g of graines){if(tard()){api.log('garde-temps : graine',g,'sautée');continue;}
    try{await api.charger({graine:g,meteo:'soir',chemin:'avant/VERSION%20PRINCIPALE',taille:F.paysage,attente:3});}catch(e){api.log('ÉCHEC avant',g,String(e).slice(0,200));continue;}
    const AVB=await api.ev("JSON.parse(JSON.stringify(dbgAmb('canyonSoir')))");res.amb['avant-g'+g]={sat:AVB.sat,sunI:AVB.sunI,sunC:AVB.sunC,cyT:AVB.cyT,cyL:AVB.cyL};
    await tir('avant',g);api.log('avant g'+g,Math.round((Date.now()-T0)/1000)+' s');
    try{await api.charger({graine:g,meteo:'soir',chemin:'canyon/VERSION%20PRINCIPALE',taille:F.paysage,attente:3});}catch(e){api.log('ÉCHEC lot',g,String(e).slice(0,200));continue;}
    const LB=await api.ev("JSON.parse(JSON.stringify(dbgAmb('canyonSoir')))");res.amb['lot-g'+g]={cyG:LB.cyG,sat:LB.sat};
    const liste=[...(g===graines[0]?['AV']:[]),...noms,...(a.diag&&g===graines[0]?(LB.cyG?['D0','D1']:['D1']):[])];
    for(const n of liste){if(tard()){api.log('garde-temps : variante',n,'g'+g,'sautée');continue;}
      let V={};if(n!=='AV'){const S=VARIANTES[n];for(const k in S){if(k==='_sat')V.sat=+(AVB.sat*S[k]).toFixed(3);else if(k==='_sunI')V.sunI=+(AVB.sunI*S[k]).toFixed(3);else if(k!=='cyG'||LB.cyG)V[k]=S[k];}}
      res.vars[n]=n==='AV'?'avant entier':V;
      await api.ev(`(dbgAmb('canyonSoir',Object.assign(${JSON.stringify(AVB)},${LB.cyG?'{cyG:[1,1,1]}':'{}'})),dbgAmb('canyonSoir',${JSON.stringify(V)}),1)`);await api.dort(300);
      await tir(n,g,n==='AV'&&g!==graines[0]);res.journal.push(n+' g'+g+' '+Math.round((Date.now()-T0)/1000)+' s');api.log('variante',n,'g'+g,'ok',Math.round((Date.now()-T0)/1000)+' s');ecrit();}
    res.erreurs=(res.erreurs||[]).concat(api.erreurs.slice(0,4));}
  ecrit();
}
