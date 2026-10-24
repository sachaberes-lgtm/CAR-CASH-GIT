/* Aperçu des voitures à défi caché : la vignette de boutique (dbgPhotoCar) de chaque caisse, en JPEG, vers un JSON. env : PORT, SORTIE */
import fs from 'node:fs';
import { lance, prepare, charge, passeSplash, sleep } from './cdp.mjs';
const IDX = JSON.parse(process.env.IDX), PORT = process.env.PORT || 9377, SORTIE = process.env.SORTIE;
const c = await lance({ port: 9479 });
const out = {};
try {
  await prepare(c);
  await charge(c, `http://127.0.0.1:${PORT}/index.html?colonne=0&carte=nuages&meteo=midi`, { attente: 120000 });
  await passeSplash(c); await sleep(2500);
  for (const i of IDX) {
    try {
      out[i] = await c.ev(`(async()=>{const u=dbgPhotoCar(${i});const im=new Image();im.src=u;await im.decode();const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const x=cv.getContext('2d');x.fillStyle='#1c2220';x.fillRect(0,0,cv.width,cv.height);x.drawImage(im,0,0);return cv.toDataURL('image/jpeg',.82);})()`);
      console.log(i, out[i] ? out[i].length : 'vide');
    } catch (e) { console.log(i, 'ERR', e.message.slice(0, 120)); }
  }
  console.log('erreurs', c.erreurs.slice(0, 3));
} finally { await c.fin(); }
fs.writeFileSync(SORTIE, JSON.stringify(out));
