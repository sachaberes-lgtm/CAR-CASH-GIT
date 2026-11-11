/* l'empreinte des routes de genCtrl (2026-11-11) : une somme par carte × palier sur N graines — pour prouver qu'une retouche ne déplace PAS les routes d'une autre map.
   node empreinte.cjs [graines=1-20]   (cartes : ville, crypto, vitree, et nuages/espace avec ?torsion=hasard via SEARCH) */
const B=require('./charge.cjs'),ctx=B.ctx,crypto=require('crypto');const a=process.argv.find(x=>x.startsWith('graines='));const [g0,g1]=(a?a.slice(8):'1-20').split('-').map(Number);
const CUR={ville:{id:'ville',carte:'ville',sansFin:1},crypto:{id:'ville',crypto:1,carte:'ville',sansFin:1},vitree:{id:'ville',vitre:1,carte:'vitree',sansFin:1}};
for(const c of Object.keys(CUR).concat(['nuages','espace']))for(const pal of [0,10]){const h=crypto.createHash('md5');let n=0,err='';
  for(let g=g0;g<=g1;g++){try{let ctrl;if(CUR[c]){ctx.__setPalier(pal,B.VW[pal]);ctx.LVL.cur=CUR[c];ctx.MODMARK.length=0;ctx.FILETMARK.length=0;ctrl=ctx.genCtrl(ctx.mulberry32(g),new ctx.THREE.Vector3(0,0,0),0);}else ctrl=B.piste(c,g,pal).ctrl;
    for(const v of ctrl){h.update(v.x.toFixed(2)+','+v.y.toFixed(2)+','+v.z.toFixed(2)+';');n++;}}catch(e){err=e.message.slice(0,80);}}
  console.log(c.padEnd(7),'p'+pal,'points',n,h.digest('hex').slice(0,12),err);}
