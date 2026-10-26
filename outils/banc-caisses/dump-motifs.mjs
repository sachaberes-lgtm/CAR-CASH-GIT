import fs from 'node:fs';
import { lance, prepare, charge, passeSplash, sleep } from './cdp.mjs';
const c = await lance({ port: 9485 });
try {
  await prepare(c);
  await charge(c, `http://127.0.0.1:${process.env.PORT}/index.html?colonne=0&simu=1&garde=1`, { attente: 120000 });
  await passeSplash(c); await sleep(1500);
  const js = `(async function(){var o={};for(var d of COSM.peinture){if(!d.mot)continue;var u=motUrl(d.mot);if(!u){o[d.id]={vide:1};continue;}
    var im=new Image();im.src=u;await im.decode();var cv=document.createElement('canvas');cv.width=cv.height=112;var x=cv.getContext('2d');x.drawImage(im,0,0,112,112);
    o[d.id]={c:'#'+((d.c||0)>>>0).toString(16).padStart(6,'0'),mot:d.mot,url:cv.toDataURL('image/jpeg',.8),w:im.width};}
    return JSON.stringify(o);})()`;
  const r = await c.ev(`__ev(${JSON.stringify(js)})`);
  fs.writeFileSync(process.env.SORTIE, r);console.log(r.length, Object.keys(JSON.parse(r)).length, c.erreurs.slice(0,3));
} finally { await c.fin(); }
