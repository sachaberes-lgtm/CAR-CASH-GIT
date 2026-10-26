// Relit le programme autonome et fait le bilan
import fs from 'node:fs';
import { bilan } from './app-course.mjs';
export default async function (c, [tag = 'x']) {
  const sortie = `res-${tag}`; fs.mkdirSync(sortie, { recursive: true });
  const P = JSON.parse(await c.js('JSON.stringify(window.__prog)'));
  console.log(P.log.join('\n')); (P.perfs || []).forEach((p) => console.log(p));
  const fr = JSON.parse(await c.js('JSON.stringify({t:window.__fr.t,ph:window.__fr.ph})'));
  fs.writeFileSync(`${sortie}/images.json`, JSON.stringify(fr));
  const b = bilan(fr, console.log); fs.writeFileSync(`${sortie}/bilan.json`, JSON.stringify({ b, prog: P }, null, 1));
}
