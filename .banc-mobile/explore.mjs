/* node explore.mjs <profil> [params] : charge le jeu, passe le splash, liste ce qui est à toucher, photo. */
import { ouvrir, passerSplash, dort } from './lib.mjs';
import { AUDIT, LISTE } from './audit.mjs';
const [profil, params = '?colonne=0'] = process.argv.slice(2);
const B = await ouvrir({ profil, params });
try {
  await passerSplash(B);
  await dort(2500);
  B.dit('classes body :', await B.ev('document.body.className'), '· dims', await B.ev('innerWidth+"x"+innerHeight+" dpr"+devicePixelRatio+" mobile="+/Mobi|iPhone|Android/.test(navigator.userAgent)'));
  B.dit('IS_MOBILE (touch) ?', await B.ev('document.body.classList.contains("touch")'), '· cadre', await B.ev('!!document.querySelector("iframe#colonne")'));
  console.log((await B.ev(LISTE)).join('\n'));
  const a = await B.ev(AUDIT + JSON.stringify(B.insets || null) + ')');
  console.log('AUDIT', JSON.stringify(a, null, 0));
  console.log('photo', await B.photo('accueil'));
  console.log('erreurs', B.errs, 'requêtes', B.reqs);
} catch (e) { console.log('banc :', e.message); } finally { await B.fermer(); }
