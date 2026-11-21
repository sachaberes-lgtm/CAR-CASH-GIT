/* LE BANC DU LOT « COHÉRENCE » (2026-11-21, qa/coherence) — Chrome sans fenêtre, MUET (--mute-audio, sfx/mus/vox à false), téléphone émulé (?tel=1&appareil=iPhone14,2).
   La page servie est le VRAI index.html, plus UN crochet de lecture posé juste après TR (window.__coh : les tables CARS, COSM, M2, I18N et quelques fonctions du jeu) —
   il ne change rien au jeu ; il permet de lire les textes non traduits (TR qui rend le français en anglais) et les totaux tels que le jeu les calcule.
     · « audit » (anglais) : chaque nom, phrase et défi de CARS, COSM, M2 sans traduction anglaise ; les textes passés à TR sans clé pendant qu'on ouvre garage, boutique,
       inventaire, missions, réglages et une course ;
     · « possède » (français, une sauvegarde avec des caisses de chaque famille) : le rayon VOITURES (intertitres « à toi / total »), l'inventaire (« x / y » de chaque onglet,
       atteignable), le profil (CAISSES x / y), la barre des familles du garage (pas de MYTHIQUES ni d'INFINIS), une course ; la même chose sous ?sans=coherence (avant) ;
     · 0 exception partout.
   ⚠ UN Chrome à la fois : lancer sous ~/cash-car/verrou-banc.sh prendre "<qui>" … rendre. Le profil Chrome est effacé à la fin.
   node outils/banc-coherence/banc.cjs [--http 9993] [--cdp 9994] [--photos <dossier>] [--sortie <fichier.json>]     Dernière ligne : BANC OK / BANC KO. */
const fs = require('fs'), path = require('path'), http = require('http');
const { portLibre, lanceChrome, tueChrome, CDP, dormir, tmp } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const JEU = path.resolve(path.join(__dirname, '..', '..', 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9993), P_CDP = +(A.cdp || 9994);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const J = o => JSON.stringify(o);
const MUET = { sfx: false, mus: false, vox: false };
let ko = 0; const R = {};
const dit = (c, m, d) => { if (c) console.log('  ok  ' + m + (d !== undefined ? ' — ' + J(d).slice(0, 300) : '')); else { ko++; console.log('  KO  ' + m + (d !== undefined ? ' — ' + J(d).slice(0, 600) : '')); } };
const NE = Date.now() - 40 * 864e5;
const BASE = { v: 2, ...MUET, gamme: 3, eco: 3, tuto: 1, permis: 1, bienv: 1, best: 9000, bank: 50000, aura: 100, equipped: 0,
  ex: { eng: 6, tricks: 40, gaps: 3, bumps: 9, zones: 2, chain: 12, kmh: 300, surv: 0, runs: 25, floor: 0 }, prof: { ne: NE, tA: 3600, dMax: 120 } };

/* le crochet de lecture : posé juste après la définition de TR, dans la fonction du jeu (les noms s'y voient tous, à l'appel) */
const CROCHET = 'window.__cohM=new Set();window.__coh=function(){return {CARS:CARS,CAR_UNLOCK:CAR_UNLOCK,COSM:COSM,M2:M2,I18N:I18N,TR:TR,LANG:LANG,carRar:carRar,carEnVente:carEnVente,carEuros:carEuros,carAtteignable:carAtteignable,habAtteignable:habAtteignable,invTotal:invTotal,profChiffres:profChiffres,rarListe:rarListe,garageSaute:garageSaute,SF_CARTES:SF_CARTES,SF_HORS:SF_HORS};};\n';
function serveur(port) {
  const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.webmanifest': 'application/json' };
  let idx = fs.readFileSync(path.join(JEU, 'index.html'), 'utf8');
  const a = 'function TR(s){ // traduction EXACTE, repli français silencieux\n  if(s==null)return s;';
  if (idx.split(a).length !== 2) throw new Error('crochet : TR introuvable');
  idx = idx.replace(a, CROCHET + a + '\n  if(LANG!==\'fr\'&&typeof s===\'string\'&&I18N[s]===undefined&&/[a-zà-ÿ]{3}|[A-ZÀ-Ý]{3}/.test(s))try{window.__cohM.add(s.slice(0,160));}catch(_){}');
  const s = http.createServer((rq, rs) => {
    let p = decodeURIComponent(rq.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    if (p === '/index.html') { rs.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' }); return rs.end(idx); }
    const f = path.join(JEU, p); if (!f.startsWith(JEU)) { rs.writeHead(403); return rs.end(); }
    fs.readFile(f, (e, b) => { if (e) { rs.writeHead(404); return rs.end(); } rs.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); rs.end(b); });
  });
  return new Promise(ok => s.listen(port, '127.0.0.1', () => ok(s)));
}

async function unCas(nom, ls, lang, url, port, faire) {
  const prof = tmp(); const { ch, pg } = await lanceChrome(port, prof, 390, 844);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok; const err = [];
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') err.push('exception: ' + ((m.params.exceptionDetails.exception && m.params.exceptionDetails.exception.description) || m.params.exceptionDetails.text || '').slice(0, 300));
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') err.push('error: ' + m.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300)); } catch (x) {} });
  console.log('— ' + nom);
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    const pc = !!(url && url[0] === '!'); SOURIS = pc;
    if (pc) await c.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    else {
    await c.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true, screenWidth: 390, screenHeight: 844 });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] }); }
    const L = { cashcarSave: J(ls), ccLang: lang };
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{if(!sessionStorage.getItem("__fx")){sessionStorage.setItem("__fx","1");localStorage.clear();var L=' + J(L) + ';for(var k in L)localStorage.setItem(k,L[k]);}}catch(e){}' });
    await c.send('Page.navigate', { url: `http://127.0.0.1:${P_HTTP}/index.html` + (pc ? url.slice(1) : `?tel=1&appareil=iPhone14,2&colonne=0&simu=1&garde=1&intro=ancien&attente=0${url || ''}`) });
    let pret = false; for (let i = 0; i < 160 && !pret; i++) { await dormir(500); try { pret = await c.ev("!!window.__gameReady&&document.getElementById('mHome').classList.contains('on')", 8000); } catch (x) {} }
    dit(pret, nom + ' : le jeu arrive à l\'accueil');
    if (pret) { await dormir(8000); await faire(c); }
    const graves = err.filter(x => !/favicon|404|Failed to load resource|WebGL|GPU stall|ReadPixels|AudioContext|autoplay/i.test(x));
    dit(!graves.length, nom + ' : aucune exception ni erreur console', graves.slice(0, 6));
  } catch (e) { ko++; console.log('  KO  ' + nom + ' : ' + String(e).slice(0, 300)); }
  finally { try { c.close(); } catch (x) {} tueChrome(ch); await dormir(800); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (x) {} }
}
let SOURIS = false; /* l'ordinateur : un clic (pas d'écran tactile émulé) */
async function touche(c, sel) {
  if (SOURIS) return !!(await c.ev(`(function(){const e=document.querySelector(${J(sel)});if(!e)return false;const b=e.getBoundingClientRect();if(b.width<1)return false;['pointerdown','mousedown','pointerup','mouseup'].forEach(function(t){e.dispatchEvent(new (t[0]==='p'?PointerEvent:MouseEvent)(t,{bubbles:true,clientX:b.left+b.width/2,clientY:b.top+b.height/2}));});e.click();return true;})()`));
  const r = await c.ev(`(function(){const e=document.querySelector(${J(sel)});if(!e)return null;const b=e.getBoundingClientRect();if(b.width<1||b.height<1)return null;return [b.left+b.width/2,b.top+b.height/2];})()`);
  if (!r) return false;
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: r[0], y: r[1] }] }); await dormir(60);
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return true;
}
const PAR_TEXTE = (racine, mots) => `(function(){const M=${J(mots)};const L=[...document.querySelectorAll(${J(racine)}+' *')].filter(function(e){const b=e.getBoundingClientRect();return b.width>1&&b.height>1&&M.indexOf((e.innerText||'').replace(/\\s+/g,' ').trim())>=0&&getComputedStyle(e).visibility!=='hidden';});
  if(!L.length)return false;L.sort(function(a,b){const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();return x.width*x.height-y.width*y.height;});document.querySelectorAll('[data-banc]').forEach(function(e){e.removeAttribute('data-banc');});L[0].setAttribute('data-banc','1');return true;})()`;
async function attend(c, expr, ms) { for (let t = 0; t < ms; t += 300) { try { if (await c.ev(expr)) return true; } catch (x) {} await dormir(300); } return false; }
const photo = async (c, n) => { if (!A.photos) return; fs.mkdirSync(A.photos, { recursive: true }); const r = await c.send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(A.photos, n + '.png'), Buffer.from(r.data, 'base64')); };
const VISIBLE = s => `(function(){const e=document.querySelector(${J(s)});if(!e)return false;const b=e.getBoundingClientRect();return b.width>1&&b.height>1;})()`;
const GARAGE_ON = "(function(){const g=document.getElementById('garage');return !!(g&&g.classList.contains('on'));})()";
const COURSE = "(function(){const s=dbgState();return !!(s.started&&!s.gameOver);})()";
async function ouvreGarage(c, mots) { if (!await touche(c, '#mHome [data-m=garage]')) return false; return attend(c, GARAGE_ON + '&&' + PAR_TEXTE('#garage', mots), 15000); }
async function bouton(c, mots) { await c.ev(PAR_TEXTE('#garage', mots)); return touche(c, '[data-banc="1"]'); }
const TXT = "(document.body.innerText||'')";

/* ce qui se lit à chaque visite : garage (barre des familles), boutique (intertitres), inventaire (« x / y »), profil */
async function visite(c, tag, en) {
  const W = en ? ['SHOP'] : ['BOUTIQUE'];
  const o = {};
  dit(await ouvreGarage(c, W), tag + ' : le garage s\'ouvre'); await dormir(2500);
  o.familles = await c.ev("[...document.querySelectorAll('#gRar .gR[data-r]')].map(b=>b.getAttribute('data-r')+(b.getBoundingClientRect().width>1?'':'(caché)'))");
  await photo(c, tag + '-garage');
  dit(await bouton(c, W), tag + ' : toucher ' + W[0]);
  await attend(c, VISIBLE('#gBqPan .bqRarS'), 15000); await dormir(2000);
  o.intertitres = await c.ev("[...document.querySelectorAll('#gBqPan .bqRarS')].map(e=>e.getAttribute('data-rar')+' '+(e.querySelector('em')?e.querySelector('em').innerText.trim():''))");
  await photo(c, tag + '-boutique-voitures'); if (en) await francais(c, 'boutique');
  /* l'intertitre d'une famille amené à l'écran (le rail défile) : la preuve visible du compte « à toi / total » */
  o.intertitreVu = await c.ev("(function(){const L=[...document.querySelectorAll('#gBqPan .bqRarS')];const e=L.find(x=>x.getAttribute('data-rar')==='rare')||L[0];if(!e)return null;e.scrollIntoView({inline:'start',block:'nearest'});const b=e.getBoundingClientRect();const s=getComputedStyle(e);return {txt:e.innerText.replace(/\\s+/g,' ').trim(),l:Math.round(b.left),t:Math.round(b.top),w:Math.round(b.width),h:Math.round(b.height),vis:s.visibility,op:s.opacity,disp:s.display};})()");
  await dormir(1200); await photo(c, tag + '-boutique-intertitre');
  try { await c.ev("window.dbgInv('ouvre');1"); } catch (x) {}
  await attend(c, VISIBLE('#ivProgTxt'), 10000); await dormir(1500);
  o.inventaire = {};
  for (const cat of ['voiture', 'peinture', 'aile', 'trainee', 'figure']) {
    const ok = await c.ev(`(function(){const b=document.querySelector('#gInv .ivTab[data-c=${cat}]');if(!b)return false;b.click();return true;})()`);
    if (!ok) continue; await dormir(1200);
    o.inventaire[cat] = await c.ev("(function(){const t=document.getElementById('ivProgTxt');return t?t.textContent:null;})()");
    if (cat === 'voiture' || cat === 'peinture') await photo(c, tag + '-inventaire-' + cat);
    if (en) await francais(c, 'inventaire-' + cat);
  }
  o.atteignable = await c.ev("(function(){const K=__coh();const r={};for(const cat of ['voiture','peinture','aile','trainee'])r[cat]=K.invTotal(cat);return r;})()");
  try { await c.ev("window.dbgInv('ferme');1"); } catch (x) {}
  o.profil = await c.ev("(function(){try{return window.dbgProfil();}catch(e){return String(e);}})()");
  await dormir(1500); await photo(c, tag + '-profil'); if (en) await francais(c, 'profil');
  return o;
}
/* en anglais : les lignes visibles et les aria-label qui ont des mots outils français (de, du, des, les, et, pour, avec, dans…) — à relire, pas un verdict */
const FR_MOTS = /(^|[^A-Za-zÀ-ÿ'])(DU|DES|LES|ET|POUR|AVEC|DANS|SUR|UNE|EST|TON|TES|PAS|PLUS|AU|AUX|ENCORE|TOUCHE|RETOUR|FERMER|ACHETER|VOITURE|PEINTURE|AILE|TRAÎNÉE|TRAINEE|FIGURE|GAGNE|JOUE|FAIS|ROULE|RÉUSSIE|REUSSIE|À|É)([^A-Za-zÀ-ÿ']|$)/i;
async function francais(c, ecran) {
  const L = await c.ev("(function(){const t=(document.body.innerText||'').split(/\\n+/).map(x=>x.trim()).filter(Boolean);const a=[...document.querySelectorAll('[aria-label]')].filter(e=>{const b=e.getBoundingClientRect();return b.width>1&&b.height>1;}).map(e=>'aria: '+e.getAttribute('aria-label'));return t.concat(a);})()");
  const v = [...new Set(L.filter(x => FR_MOTS.test(x)))];
  (R.francais = R.francais || {})[ecran] = v;
  console.log('  (' + ecran + ' : lignes à relire, mots français : ' + v.length + ')'); v.slice(0, 40).forEach(x => console.log('     · ' + x.slice(0, 160)));
}
async function jouer(c) {
  const j = await c.ev("(function(){const L=[...document.querySelectorAll('button,[data-m=play],.pbtn')].filter(e=>/JOUER|PLAY/.test((e.innerText||'').replace(/\\s+/g,''))&&e.getBoundingClientRect().width>1);if(!L.length)return null;const e=L[L.length-1];e.setAttribute('data-banc-jouer','1');return e.id||e.className;})()");
  dit(!!j && await touche(c, '[data-banc-jouer="1"]'), 'toucher JOUER', j);
  let part = await attend(c, COURSE + '&&!' + GARAGE_ON, 10000);
  if (!part) { console.log('  (le toucher n\'a pas lancé : .click() sur le même bouton, comme le banc DevTools)'); await c.ev("(function(){const e=document.querySelector('[data-banc-jouer=\"1\"]');if(e)e.click();return !!e;})()"); part = await attend(c, COURSE + '&&!' + GARAGE_ON, 25000); }
  if (!part) console.log('  état : ' + J(await c.ev("(function(){try{return dbgState();}catch(e){return String(e);}})()")));
  dit(part, 'la course part'); await dormir(6000); await photo(c, 'course');
  dit(await c.ev(COURSE), 'la course roule encore après 6 s');
}
async function missions(c, tag, en) {
  const W = ['MISSIONS'];
  dit(await ouvreGarage(c, W), tag + ' : le garage s\'ouvre'); await dormir(2500);
  dit(await bouton(c, W), tag + ' : toucher MISSIONS'); await dormir(5000);
  await photo(c, tag + '-missions'); return c.ev(TXT);
}

(async () => {
  for (const p of [P_HTTP, P_CDP, P_CDP + 1, P_CDP + 2, P_CDP + 3, P_CDP + 4, P_CDP + 5, P_CDP + 6, P_CDP + 7]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  const srv = await serveur(P_HTTP);
  /* 1. AUDIT en anglais, sauvegarde neuve : les tables, les RÉGLAGES du téléphone, la boutique, une course */
  let possedees = null;
  {
  await unCas('audit (anglais)', { ...BASE, owned: [0] }, 'en', '', P_CDP, async c => {
    const t = JSON.parse(await c.ev(`JSON.stringify((function(){const K=__coh(),T=K.TR,out=[];const v=function(o,s){if(s&&typeof s==='string'&&T(s)===s&&/[a-zà-ÿ]/i.test(s)&&K.I18N[s]===undefined)out.push(o+' : '+s);};
      K.CARS.forEach(function(c,i){if(c.retire)return;v('CARS['+i+'].name',c.name);v('CARS['+i+'].desc',c.desc);});
      for(const cat in K.COSM)(K.COSM[cat]||[]).forEach(function(d){v(cat+':'+d.id+' n',d.n);v(cat+':'+d.id+' d',d.d);v(cat+':'+d.id+' ind',d.ind);if(d.def)v(cat+':'+d.id+' def',d.def.t);});
      K.M2.forEach(function(m){if(m.t&&!m.en)out.push('M2 '+m.id+' (pas de en) : '+m.t);});
      const P={};K.CARS.forEach(function(c,i){const u=K.CAR_UNLOCK[i];if(c.retire||!u||!(u.p>0&&u.k!=='premium'))return;const f=K.carRar(i);(P[f]=P[f]||[]).push(i);});
      return {manque:out,pieces:P};})())`));
    R.auditTables = t.manque; possedees = t.pieces;
    R.tables = await c.ev("(function(){const K=__coh();const cartes=Object.keys(K.SF_CARTES).map(k=>k+'='+K.SF_CARTES[k].nm+(K.SF_HORS[k]?' (HORS)':''));const voit=K.CARS.filter(c=>!c.retire).length;const chat=K.CARS.some(c=>!c.retire&&c.shape==='poptart');const eurV=K.CARS.filter((c,i)=>!c.retire&&K.carEuros(i)&&K.carEnVente(i)).length;const P=K.COSM.peinture;return {cartes:cartes,voitures:voit,chatPresent:chat,voituresEnEurosEnVente:eurV,peintures:P.length,peinturesSansOrigine:P.filter(d=>d.id!=='usine').length,peinturesEnEuros:P.filter(d=>d.eur&&!d.def).length,ailes:K.COSM.aile.length,trainees:K.COSM.trainee.length,figures:K.COSM.figure.length};})()");
    console.log('  tables : ' + J(R.tables));
    console.log('  (textes des tables sans anglais : ' + t.manque.length + ')'); t.manque.forEach(x => console.log('     · ' + x));
    const taxi = await c.ev("(function(){const K=__coh();const i=K.CARS.findIndex(c=>c.shape==='a_taxi');return [K.TR(K.CARS[i].name),K.TR(K.CARS[i].desc)];})()");
    dit(taxi && !/compteur/i.test(taxi[1]), 'TAXI JAUNE en anglais : nom et phrase', taxi);
    const tours = await c.ev("(function(){const K=__coh();const m=K.M2.find(x=>x.id==='tours5');return m&&[m.t,m.en];})()");
    dit(tours && /CRYPTO CITY/.test(tours[0]) && /CRYPTO CITY/.test(tours[1]), 'la mission tours5 dit CRYPTO CITY (FR et EN)', tours);
    const se = await c.ev("(function(){const b=document.getElementById('saveExp');return b?b.textContent.trim():null;})()");
    dit(se && /Copy my save/.test(se), 'RÉGLAGES classiques : « Copy my save »', se);
    dit(await touche(c, '#mHome [data-m=set]'), 'toucher SETTINGS'); await dormir(3000); await photo(c, 'en-reglages');
    R.enReglages = await c.ev(TXT); await francais(c, 'réglages'); console.log('  réglages : ' + R.enReglages.replace(/\s+/g, ' ').slice(0, 700));
    await c.ev("(function(){const b=[...document.querySelectorAll('[data-m=back]')].find(e=>e.getBoundingClientRect().width>1);if(b)b.click();return 1;})()"); await dormir(2500);
    R.en = await visite(c, 'en', true);
    console.log('  en : ' + J(R.en.intertitres) + ' | ' + J(R.en.inventaire));
    R.trManque = await c.ev('[...window.__cohM]');
    console.log('  (textes passés à TR sans clé pendant la visite : ' + R.trManque.length + ')'); R.trManque.forEach(x => console.log('     · ' + x));
  });
  }
  if (A.seul !== 'possede') {
  await unCas('missions (anglais)', { ...BASE, owned: [0] }, 'en', '', P_CDP + 3, async c => {
    const t = await missions(c, 'en', true); R.enMissions = t; await francais(c, 'missions');
    dit(t.length > 300 && !/THE CITY\)/.test(t), 'écran MISSIONS en anglais sans « (THE CITY) »', t.replace(/\s+/g, ' ').slice(0, 300));
    const m = await c.ev('[...window.__cohM]'); R.trManqueMissions = m;
    console.log('  (textes passés à TR sans clé : ' + m.length + ')'); m.forEach(x => console.log('     · ' + x));
  });
  await unCas('missions (français)', { ...BASE, owned: [0] }, 'fr', '', P_CDP + 4, async c => {
    const t = await missions(c, 'fr', false); R.frMissions = t;
    dit(t.length > 300 && !/LA VILLE\)/.test(t), 'écran MISSIONS sans « (LA VILLE) »', t.replace(/\s+/g, ' ').slice(0, 300));
  });
  await unCas('course (anglais)', { ...BASE, owned: [0] }, 'en', '', P_CDP + 5, async c => {
    dit(await ouvreGarage(c, ['SHOP']), 'course : le garage s\'ouvre'); await dormir(2500);
    await jouer(c); await francais(c, 'course');
    const m = await c.ev('[...window.__cohM]'); console.log('  (textes passés à TR sans clé : ' + m.length + ')'); m.forEach(x => console.log('     · ' + x));
  });
  for (const [tag, q, port] of [['pc-apres', '!?colonne=0&garde=1&intro=ancien&attente=0', P_CDP + 6], ['pc-avant', '!?colonne=0&garde=1&intro=ancien&attente=0&sans=coherence', P_CDP + 7]])
    await unCas('ordinateur (' + tag + ')', { ...BASE, owned: [0] }, 'fr', q, port, async c => {
      await c.ev("(function(){const b=document.querySelector('#mHome [data-m=garage]')||document.getElementById('garageBtn');if(b)b.click();return !!b;})()");
      await attend(c, GARAGE_ON, 15000); await dormir(4000);
      const f = await c.ev("[...document.querySelectorAll('#gRar .gR[data-r]')].map(b=>b.getAttribute('data-r')+(b.getBoundingClientRect().width>1?'':'(caché)'))");
      R[tag] = f; console.log('  familles du garage : ' + J(f)); await photo(c, tag + '-garage');
      if (tag === 'pc-apres') dit(f.every(x => !/^(mythique|infini)/.test(x)), 'ordinateur : pas de MYTHIQUES ni d\'INFINIS dans la barre', f);
    });
  }
  /* 2. une sauvegarde qui possède des caisses de chaque famille, avec et sans le lot */
  const own = [0]; for (const f in (possedees || {})) own.push(...possedees[f].slice(0, Math.max(1, Math.floor(possedees[f].length / 2))));
  const SAV = { ...BASE, owned: own };
  const PCQ = '!?colonne=0&garde=1&intro=ancien&attente=0'; /* --pc 1 : la même sauvegarde sur l'ORDINATEUR (le rail large montre les intertitres en toutes lettres) */
  for (const [tag, q, port] of (A.pc ? [['pc-possede-apres', PCQ, P_CDP + 1], ['pc-possede-avant', PCQ + '&sans=coherence', P_CDP + 2]] : [['apres', '', P_CDP + 1], ['avant', '&sans=coherence', P_CDP + 2]])) {
    await unCas('possède ' + own.length + ' caisses (' + tag + ')', SAV, 'fr', q, port, async c => {
      const v = await visite(c, tag, false); R[tag] = v;
      console.log('  ' + tag + ' : ' + J(v.familles) + ' | ' + J(v.intertitres) + ' | ' + J(v.inventaire) + ' | atteignable ' + J(v.atteignable) + ' | ' + J(v.profil && v.profil.filter && v.profil.filter(x => /CAISSES|MISSIONS/.test(x))) + ' | intertitre à l\'écran ' + J(v.intertitreVu));
      if (tag === 'apres' || tag === 'pc-possede-apres') {
        dit(v.familles.indexOf('mythique') < 0 && v.familles.indexOf('infini') < 0, 'la barre des familles n\'a plus MYTHIQUES ni INFINIS', v.familles);
        dit(v.intertitres.length && v.intertitres.every(x => !/^\S+ 0\//.test(x) || x.startsWith('secret')), 'les intertitres du rayon VOITURES comptent les caisses à toi', v.intertitres);
        const m = /(\d+) \/ (\d+)/.exec(v.inventaire.voiture || '');
        dit(m && +m[2] === v.atteignable.voiture, 'inventaire VOITURES : le total = ce qui s\'obtient encore', [v.inventaire.voiture, v.atteignable]);
        const p = (v.profil || []).find(x => /CAISSES/.test(x)) || '', mp = /(\d+) \/ (\d+)/.exec(p);
        dit(mp && +mp[2] === v.atteignable.voiture, 'profil : CAISSES x / total atteignable', [p, v.atteignable.voiture]);
      }
    });
  }
  srv.close();
  if (A.sortie) fs.writeFileSync(A.sortie, J(R, null, 1));
  console.log(ko ? 'BANC KO' : 'BANC OK'); process.exit(ko ? 1 : 0);
})();
