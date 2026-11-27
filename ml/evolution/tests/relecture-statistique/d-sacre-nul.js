/* ===== RELECTURE STATISTIQUE : combien de faux sacres sous l'hypothese nulle (meneur = champion) ? =====
   note.comparer sur 24 graines, 400 tirages, criteres (a) (b) (c) de la specification. Les courses viennent des 4 grandes notes de 900 s de
   pilote-voltige (80 courses reelles : palier et mesures). Nul : A et B tirent chacun une course au hasard dans la meme reserve, graine par graine.
   On ajoute un effet de graine commun (b ~ N(0;1,5) sur le palier des deux) pour imiter l'appariement. Puis un vrai ecart de +1 palier (puissance). */
'use strict';
const path=require('path');
const N=require(path.join(__dirname,'..','..','note.js'));
const cfg=require(path.join(__dirname,'..','..','config.json'));
const X=require(path.join(__dirname,'..','..','..','ecurie','etude','selection-naturelle','bruit','courses-0.json'));
const REF=N.referenceEpoque();
const reserve=[];for(const x of X)if(x.tmax===900)for(const c of x.courses)reserve.push({palier:c.palier,mesures:c.m||null});
function rng(s){let a=s|0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
const u=rng(11),nor=()=>Math.sqrt(-2*Math.log(1-u()))*Math.cos(2*Math.PI*u());
const essais=+(process.argv[2]||300);
for(const delta of [0,1,2]){
  let s=0,a=0,b=0,c=0;
  for(let t=0;t<essais;t++){
    const LA=[],LB=[];
    for(let i=0;i<24;i++){const g=1000000+37*i,bg=Math.round(1.5*nor());
      const x=reserve[Math.floor(u()*reserve.length)],y=reserve[Math.floor(u()*reserve.length)];
      LA.push({id:'A',graine:g,mesuree:true,palier:x.palier+bg+delta,mesures:x.mesures});LB.push({id:'B',graine:g,mesuree:true,palier:y.palier+bg,mesures:y.mesures});}
    const r=N.comparer(LA,LB,{REF,cfg});
    if(r.sacre)s++;if(r.criteres.a)a++;if(r.criteres.b)b++;if(r.criteres.c)c++;
  }
  console.log('vrai ecart de palier '+delta+' : sacre '+(100*s/essais).toFixed(1)+' % ; (a) '+(100*a/essais).toFixed(1)+' %, (b) '+(100*b/essais).toFixed(1)+' %, (c) '+(100*c/essais).toFixed(1)+' % ('+essais+' essais)');
}
/* le meme generateur de bootstrap pour toutes les validations : rngDe('comparer|24') */
console.log('bootstrap : la graine du tirage ne depend que du nombre de graines (rngDe(\'comparer|\'+n)) : deux validations differentes tirent les memes indices');
