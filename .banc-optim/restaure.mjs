// Remet la sauvegarde de Sacha (copiée avant les bancs) puis recharge l'app — sans que la page qui s'en va ne la réécrive.
import fs from 'node:fs';
const dort = (ms) => new Promise((r) => setTimeout(r, ms));
export default async function (c, [recharge = '1']) {
  const b = JSON.parse(JSON.parse(fs.readFileSync('sauvegarde-app-sacha.json', 'utf8')));
  await c.js(`(function(){const s=${JSON.stringify(b.ls)};
    ['pagehide','beforeunload','unload','visibilitychange','blur','freeze'].forEach(function(t){window.addEventListener(t,function(e){e.stopImmediatePropagation();},true);document.addEventListener(t,function(e){e.stopImmediatePropagation();},true);});
    window.__restaure=0;localStorage.setItem('cashcarSave',s);
    Capacitor.Plugins.Preferences.set({key:'cashcarSave',value:s}).then(function(){window.__restaure=1;});return 1;})()`);
  for (let i = 0; i < 20 && !(await c.js('window.__restaure')); i++) await dort(250);
  const ok = await c.js(`localStorage.getItem('cashcarSave')===${JSON.stringify(b.ls)}`);
  console.log('sauvegarde remise :', ok);
  if (recharge === '1') { await c.js('setTimeout(function(){location.reload();},50);1'); console.log('rechargement'); }
}
