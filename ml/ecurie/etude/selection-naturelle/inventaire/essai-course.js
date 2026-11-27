/* mesure : ouverture du jeu, plusieurs courses dans un meme processus, une vue au sol et une en vol (aucune ecriture hors de ce dossier) */
const P=require('../../../../../bot/piloter'),fs=require('fs');
const t0=Date.now();const J=P.ouvrir({regime:'allege'});const tOuv=Date.now()-t0;
const F=require('path').join(__dirname,'../../../../pilote-voltige.js');const C=P.charger(F);
const res=[];let solV=null,volV=null;
for(const [g,tm] of [[910000,45],[910037,45],[910000,45]]){const t1=Date.now();const r=P.course(J,C,g,{tmax:tm,trace:true});
  res.push({graine:g,ms:Date.now()-t1,images:r.bilan.images,fois:r.bilan.foisTempsReel,empreinte:r.bilan.empreinte,empreinteVues:r.bilan.empreinteVues,cause:r.bilan.cause,palier:r.bilan.palier,yeux_ms:r.bilan.yeux.ms_moy,cerveau_ms:r.bilan.cerveau_ms_moy,octets:r.bilan.yeux.octets_moy,cartes:r.bilan.cartes});
  for(const x of r.vues||[]){if(!solV&&x.vue.mode==='sol'&&x.vue.t>8)solV=x;if(!volV&&x.vue.mode==='vol'&&x.vue.vol&&x.vue.vol.t>.3)volV=x;}}
console.log('ouvrir :',tOuv,'ms');console.log(JSON.stringify(res,null,0));
fs.writeFileSync(require('path').join(__dirname,'vue-exemple.json'),JSON.stringify({sol:solV,vol:volV},null,1));
console.log('cles au sol :',solV&&Object.keys(solV.vue).join(' '));console.log('cles en vol :',volV&&Object.keys(volV.vue).join(' '),'| vol :',volV&&Object.keys(volV.vue.vol).join(' '));
