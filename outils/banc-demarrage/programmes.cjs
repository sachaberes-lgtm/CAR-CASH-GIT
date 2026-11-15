// LES PROGRAMMES EN DOUBLE (2026-11-15, lot 2 « batterie + lancement », diagnostic seul) — d'après outils/banc-demarrage/lancement.cjs.
// Un lancement du vrai jeu, Chrome sans fenêtre et MUET, format iPhone (390×844 ×2, toucher, hover:none, UA iPhone),
// ?tel=1&classe=1&introapres=1 (le chemin du 13 Pro : tout le travail sous le serpent, puis le film, puis le menu).
// Relève CHAQUE programme WebGL lié depuis la 1re ligne de la page jusqu'à --menu secondes après l'ouverture du menu :
//   · ses sources finales (sommets + fragments, telles que three.js les donne à WebGL) ;
//   · le matériau qui l'a demandé (onBuild de three r128, appelé juste avant acquireProgram) : type, nom, defines, onBeforeCompile propre ;
//   · d'où vient ce matériau : la pile de sa CONSTRUCTION (Object.defineProperty(this,'id') du constructeur Material), ramenée au morceau
//     de code/ (ORDRE.txt) ; et la pile de la COMPILATION (qui a demandé le dessin : chauffe, vitrine…) ;
//   · la clé de cache three (renderer.info.programs) et la phase (avant « prêt », film, menu).
// Puis range les JUMEAUX :
//   EXACT   : sources finales identiques au caractère, clés three différentes (pur gaspillage) ;
//   DEFINES : même corps, seules les lignes #define diffèrent ;
//   SOURCE  : mêmes defines, même type de matériau, corps qui ne diffère que de quelques lignes (l'inverse).
// Les programmes dont le matériau naît dans code/maps/ sont marqués INTOUCHABLES.
// Aucun fichier du jeu n'est modifié : tout passe par une sonde posée avant la 1re ligne de la page.
// Usage : node outils/banc-demarrage/programmes.cjs [--http 9861 --cdp 9862] [--q "x=y"] [--froid 1] [--cpu 1] [--menu 10]
//                                                  [--json /chemin.json] [--md /chemin.md] [--cles /chemin.json] [--diff 12]
//                                                  [--brut /brut.json] (garde le relevé) · [--relire /brut.json] (analyse seule, sans Chrome)
//   ⚠ VERSION PRINCIPALE/index.html doit être assemblé depuis les morceaux (node code/assembler.cjs --depuis-morceaux) : les lignes des piles
//     sont ramenées aux morceaux par ORDRE.txt. Verrou : ~/cash-car/verrou-banc.sh prendre/rendre autour.
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const { serveur, portLibre, lanceChrome, tueChrome, CDP, dormir } = require('../banc-trainees/cdp.cjs');
const A = {}; for (let i = 2; i < process.argv.length; i += 2) A[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
const RACINE = path.resolve(__dirname, '..', '..');
const JEU = path.resolve(A.jeu || path.join(RACINE, 'VERSION PRINCIPALE'));
const P_HTTP = +(A.http || 9861), P_CDP = +(A.cdp || 9862);
const PROF = A.froid ? fs.mkdtempSync(path.join(os.tmpdir(), 'banc-programmes-froid-')) : path.join(os.tmpdir(), 'banc-programmes-profil');
const W = 390, H = 844, CPU = +(A.cpu || 1), MENU_S = +(A.menu || 10), DIFF_MAX = +(A.diff || 12);
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SAVE = { v: 2, sfx: false, mus: false, vox: false, tuto: 1, permis: 1, bank: 48500, aura: 1200, auraMax: 3000, owned: [0, 1, 2, 3], ex: { runs: 12 }, plq: { m: 'fr', x: 'CC-161-RZ', ok: 1 } };

/* LA SONDE : posée AVANT la 1re ligne du jeu. Ne change aucun comportement : onBuild est un noop de three (hors clé de cache),
   les fonctions WebGL sont rappelées telles quelles, defineProperty aussi. */
const SONDE = `(function(){
  Error.stackTraceLimit=60;
  var P=window.__PG={progs:[],notes:[],rev:0,mats:0,rend:null};var now=function(){return performance.now();};
  var pile=function(){var s=new Error().stack||'';return s.split('\\n').slice(2).map(function(l){return l.trim();}).filter(function(l){return !/__PG|pile@|at pile /.test(l);}).slice(0,40).join('\\n');};
  /* 1. la naissance de chaque matériau (r128 : Object.defineProperty(this,"id",{value:n++}) dans le constructeur Material) */
  var dp=Object.defineProperty,proto0=null,dern=null;
  Object.defineProperty=function(o,p,d){var r=dp.apply(this,arguments);
    try{if(p==='id'&&o&&o.isMaterial&&!o.__pgPile){dp(o,'__pgPile',{value:pile(),enumerable:false});P.mats++;if(!proto0)crochet(o);}}catch(e){}return r;};
  /* 2. onBuild (noop du prototype Material, appelé par getProgram juste avant acquireProgram, 2e argument = le renderer) */
  function crochet(m){var pr=Object.getPrototypeOf(m);while(pr&&!Object.prototype.hasOwnProperty.call(pr,'onBuild'))pr=Object.getPrototypeOf(pr);if(!pr)return;proto0=pr;
    var ob=pr.onBuild;pr.onBuild=function(par,rend){dern={m:this,par:par,t:now()};if(rend&&!P.rend)P.rend=rend;return ob.apply(this,arguments);};}
  /* 3. WebGL : les sources, et chaque liaison */
  var SRC=new WeakMap(),ATT=new WeakMap();
  [window.WebGLRenderingContext,window.WebGL2RenderingContext].forEach(function(C){if(!C)return;var p=C.prototype;
    var ss=p.shaderSource,at=p.attachShader,ln=p.linkProgram,cs=p.createShader;
    p.createShader=function(t){var s=cs.apply(this,arguments);try{if(s)SRC.set(s,{t:t,src:''});}catch(e){}return s;};
    p.shaderSource=function(s,src){try{var o=SRC.get(s)||{};o.src=src;SRC.set(s,o);}catch(e){}return ss.apply(this,arguments);};
    p.attachShader=function(pg,s){try{var a=ATT.get(pg)||[];a.push(s);ATT.set(pg,a);}catch(e){}return at.apply(this,arguments);};
    p.linkProgram=function(pg){var t0=now();var r=ln.apply(this,arguments);try{var a=ATT.get(pg)||[],vs='',fs='',VS=this.VERTEX_SHADER;
      a.forEach(function(s){var o=SRC.get(s)||{};if(o.t===VS)vs=o.src||'';else fs=o.src||'';});
      var m=dern&&dern.m,ok=m&&(t0-dern.t)<50;
      var e={i:P.progs.length,t:Math.round(t0),vs:vs,fs:fs,gl:pg,pileLien:pile()};
      if(ok){var df={};try{for(var k in (m.defines||{}))df[k]=String(m.defines[k]);}catch(x){}
        e.mat={id:m.id,type:m.type,nom:m.name||'',defines:df,obc:Object.prototype.hasOwnProperty.call(m,'onBeforeCompile'),obcTxt:Object.prototype.hasOwnProperty.call(m,'onBeforeCompile')?String(m.onBeforeCompile).slice(0,300):'',
          cpk:Object.prototype.hasOwnProperty.call(m,'customProgramCacheKey'),lights:!!m.lights,fog:!!m.fog,toneMapped:m.toneMapped!==false,transparent:!!m.transparent,
          shaderID:dern.par&&dern.par.shaderID||'',shaderName:dern.par&&dern.par.shaderName||'',naissance:m.__pgPile||''};}
      dern=null;P.progs.push(e);}catch(x){}return r;};
  });
  document.addEventListener('cc:revele',function(){if(!P.rev)P.rev=Math.round(now());});
  var f=null;Object.defineProperty(window,'__ccNote',{configurable:true,get:function(){return f;},set:function(v){f=function(g,m){try{P.notes.push([Math.round(now()),g,String(m).slice(0,300)]);}catch(e){}return v.apply(this,arguments);};}});
})();`;

/* ---------- la carte index.html → morceaux ---------- */
function carteMorceaux() {
  const noms = fs.readFileSync(path.join(RACINE, 'code', 'ORDRE.txt'), 'utf8').split(/\r?\n/).map(l => l.replace(/#.*$/, '').trim()).filter(Boolean);
  const C = []; let ligne = 1; const morceaux = [];
  for (const n of noms) { const b = fs.readFileSync(path.join(RACINE, 'code', n)); morceaux.push(b); let nl = 0; for (let i = 0; i < b.length; i++) if (b[i] === 10) nl++;
    C.push({ n, de: ligne, a: ligne + nl }); ligne += nl; }
  const idx = fs.readFileSync(path.join(JEU, 'index.html'));
  const egal = Buffer.concat(morceaux).equals(idx);
  const lignesIdx = idx.toString('utf8').split('\n');
  return { egal, ou: l => { for (const c of C) if (l >= c.de && l <= c.a) return { m: c.n, l: l - c.de + 1 }; return null; }, texte: l => (lignesIdx[l - 1] || '') };
}
/* une pile → ses cadres DU JEU (ni three, ni vendor, ni la sonde) */
function cadres(pileTxt, K) {
  const out = [];
  for (const l of String(pileTxt).split('\n')) {
    const m = /\/([^\/?#:\s()]+\.(?:html|js))(?:\?[^:\s()]*)?:(\d+):(\d+)/.exec(l); if (!m) continue;
    const f = m[1], ln = +m[2], fn = (/at ([^\s(]+) \(/.exec(l) || [])[1] || '';
    if (/three|EffectComposer|ShaderPass|RenderPass|UnrealBloom|CopyShader|Luminosity/.test(f)) continue;
    if (f === 'index.html') { const o = K.ou(ln); out.push({ f: o ? o.m : 'index.html', l: o ? o.l : ln, fn, idx: ln }); }
    else out.push({ f: 'VERSION PRINCIPALE/' + f, l: ln, fn });
  }
  return out;
}
const h8 = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
/* corps / defines d'une source finale */
function decoupe(src) {
  const D = [], B = []; let nom = '';
  for (const l0 of String(src).split('\n')) { const l = l0.trim(); if (!l) continue;
    if (/^#define\s+SHADER_NAME\b/.test(l)) { nom = l.replace(/^#define\s+SHADER_NAME\s*/, ''); continue; }
    if (/^#define\s/.test(l)) D.push(l.replace(/\s+/g, ' ')); else if (/^#version|^precision /.test(l)) continue; else B.push(l); }
  return { D, B, nom };
}
function diffLignes(a, b) { /* multiensemble : lignes en plus d'un côté et de l'autre */
  const M = new Map(); for (const l of a) M.set(l, (M.get(l) || 0) + 1); for (const l of b) M.set(l, (M.get(l) || 0) - 1);
  const plusA = [], plusB = []; for (const [l, n] of M) { if (n > 0) for (let i = 0; i < n; i++) plusA.push(l); else if (n < 0) for (let i = 0; i < -n; i++) plusB.push(l); }
  return { plusA, plusB, n: plusA.length + plusB.length };
}

(async () => {
  const K = carteMorceaux();
  let brut = null, rendu = {}, echec = ''; const erreurs = [];
  if (A.relire) brut = JSON.parse(fs.readFileSync(A.relire, 'utf8')); /* --relire /brut.json : refaire l'analyse sans relancer Chrome */
  else {
  for (const p of [P_HTTP, P_CDP]) if (!portLibre(p)) { console.error('port occupé :', p); process.exit(2); }
  if (!K.egal) console.error('⚠ index.html ≠ morceaux : lancer  node code/assembler.cjs --depuis-morceaux  (les lignes des piles seraient fausses)');
  fs.mkdirSync(PROF, { recursive: true });
  const srv = await serveur(JEU, P_HTTP);
  const { ch, pg } = await lanceChrome(P_CDP, PROF, W, H);
  const c = new CDP(pg.webSocketDebuggerUrl); await c.ok;
  c.ws.addEventListener('message', e => { try { const m = JSON.parse(e.data); if (m.method === 'Runtime.exceptionThrown') erreurs.push(JSON.stringify(m.params.exceptionDetails).slice(0, 300)); } catch (x) {} });
  try {
    await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Network.enable');
    await c.send('Network.setBypassServiceWorker', { bypass: true }); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true, screenWidth: W, screenHeight: H });
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await c.send('Emulation.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'hover', value: 'none' }, { name: 'pointer', value: 'coarse' }] });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: 'try{localStorage.setItem("cashcarSave",' + JSON.stringify(JSON.stringify(SAVE)) + ');localStorage.removeItem("cashcarErr");}catch(e){}\n' + SONDE });
    if (CPU > 1) await c.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    const url = `http://127.0.0.1:${P_HTTP}/index.html?tel=1&classe=1&palier=2&colonne=0&garde=1&attente=0&chute=0&introapres=1` + (A.q ? '&' + A.q : '');
    await c.send('Page.navigate', { url });
    const T0 = Date.now(); let rev = 0;
    for (let i = 0; i < 400; i++) { await dormir(1000);
      try { rev = await c.ev('(window.__PG&&__PG.rev)|0', 8000); if (rev) break;
        /* le film fini, le logo attend un toucher : on touche (comme lancement.cjs) */
        if (await c.ev("!!(window.__PG&&__PG.notes.some(function(n){return /prêt en/.test(n[2]);}))&&!!window.__ccIntroAuto&&__ccIntroAuto.lance()&&performance.now()-__PG.notes.filter(function(n){return /prêt en/.test(n[2]);})[0][0]>9000", 8000))
          await c.ev("(function(){var s=document.getElementById('splash');if(!s)return 0;try{s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));s.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));s.click();}catch(e){}return 1})()");
      } catch (e) {} if (Date.now() - T0 > 170000) break; }
    await dormir(MENU_S * 1000);
    brut = await c.ev(`(function(){var P=__PG,pret=0;for(var i=0;i<P.notes.length;i++)if(P.notes[i][1]==='chargement'&&/prêt en/.test(P.notes[i][2])){pret=P.notes[i][0];break;}
      var info=[];try{info=(P.rend&&P.rend.info.programs||[]).map(function(p){return {gl:p.program,cle:String(p.cacheKey),nom:p.name,usages:p.usedTimes};});}catch(e){}
      var progs=P.progs.map(function(e){var x={};for(var k in e)if(k!=='gl')x[k]=e[k];var j=-1;for(var q=0;q<info.length;q++)if(info[q].gl===e.gl){j=q;break;}
        if(j>=0){x.cle=info[j].cle;x.nomThree=info[j].nom;x.usages=info[j].usages;x.vivant=1;}else x.vivant=0;return x;});
      var r={pret:pret,menu:P.rev,mats:P.mats,progs:progs,infoN:info.length,notes:P.notes.filter(function(n){return /chargement|panne|erreur/.test(n[1]);}).map(function(n){return (n[0]/1000).toFixed(1)+' '+n[1]+' | '+n[2];})};
      try{r.chauffe=dbgChauffe();}catch(e){}try{r.prf=window.dbgPrf?dbgPrf():null;}catch(e){}
      return r;})()`, 60000);
  } catch (e) { echec = String(e && e.message || e); }
  c.close(); tueChrome(ch); srv.close();
  if (A.froid) try { fs.rmSync(PROF, { recursive: true, force: true }); } catch (e) {}
  if (brut && A.brut) fs.writeFileSync(A.brut, JSON.stringify(brut));
  }
  if (!brut) { console.log(JSON.stringify({ echec, erreurs }, null, 1)); process.exit(1); }

  /* ---------- l'analyse ---------- */
  const pret = brut.pret, menu = brut.menu || 1e12;
  const P = brut.progs.map(e => {
    const v = decoupe(e.vs), f = decoupe(e.fs);
    const nai = e.mat ? cadres(e.mat.naissance, K) : [], lien = cadres(e.pileLien, K);
    const o = nai[0] || null;
    return { cleBrute: e.cle || '', i: e.i, t: e.t, phase: !pret ? '?' : e.t < pret ? 'serpent' : e.t < menu ? 'film' : 'menu', vivant: e.vivant, cle: e.cle ? h8(e.cle) : '-', usages: e.usages,
      type: e.mat ? e.mat.type : '?', nom: (e.mat && e.mat.nom) || '', shaderName: v.nom || f.nom, defMat: e.mat ? e.mat.defines : {}, obc: e.mat ? e.mat.obc : false, cpk: e.mat ? e.mat.cpk : false, lights: e.mat ? e.mat.lights : null,
      obcTxt: e.mat ? e.mat.obcTxt : '', fog: e.mat ? e.mat.fog : null, toneMapped: e.mat ? e.mat.toneMapped : null, transparent: e.mat ? e.mat.transparent : null,
      origine: o ? o.f + ':' + o.l : '?', origineFn: o ? o.fn : '', origineCode: o && o.idx ? K.texte(o.idx).trim().slice(0, 160) : '',
      pileNaissance: nai.slice(0, 4).map(x => x.f + ':' + x.l + (x.fn ? ' ' + x.fn : '')), pileLien: lien.slice(0, 4).map(x => x.f + ':' + x.l + (x.fn ? ' ' + x.fn : '')),
      maps: !!(o && /^maps\//.test(o.f)) || nai.some(x => /^maps\//.test(x.f)),
      hTout: h8(e.vs + '\u0000' + e.fs), hCorps: h8(v.B.join('\n') + '\u0000' + f.B.join('\n')), hDef: h8(v.D.join('\n') + '\u0000' + f.D.join('\n')),
      D: [...new Set(v.D.concat(f.D))], B: v.B.concat(['\u0000']).concat(f.B), taille: e.vs.length + e.fs.length };
  });
  const grp = (cle) => { const M = new Map(); for (const p of P) { const k = cle(p); if (!M.has(k)) M.set(k, []); M.get(k).push(p); } return [...M.values()].filter(g => g.length > 1); };
  const EXACT = grp(p => p.hTout);
  const DEF = grp(p => p.hCorps).filter(g => new Set(g.map(p => p.hTout)).size > 1);
  /* SOURCE : même type + mêmes defines, corps différents mais proches (≤ DIFF_MAX lignes) — on relie de proche en proche */
  const SRCG = [];
  for (const g of grp(p => p.type + '|' + p.shaderName + '|' + p.hDef)) {
    const corps = [...new Map(g.map(p => [p.hCorps, p])).values()]; if (corps.length < 2) continue;
    const par = corps.map((_, i) => i), rac = i => par[i] === i ? i : (par[i] = rac(par[i])), paires = [];
    for (let a = 0; a < corps.length; a++) for (let b = a + 1; b < corps.length; b++) { const d = diffLignes(corps[a].B, corps[b].B); if (d.n <= DIFF_MAX && d.n <= 0.15 * Math.min(corps[a].B.length, corps[b].B.length)) { par[rac(a)] = rac(b); paires.push({ a: corps[a].i, b: corps[b].i, d }); } }
    const M = new Map(); corps.forEach((p, i) => { const r = rac(i); if (!M.has(r)) M.set(r, []); M.get(r).push(p.hCorps); });
    for (const hs of M.values()) if (hs.length > 1) { const S = new Set(hs); const membres = g.filter(p => S.has(p.hCorps)); const ids = new Set(membres.map(p => p.i));
      SRCG.push({ membres, paires: paires.filter(x => ids.has(x.a) && ids.has(x.b)) }); }
  }
  /* DEFINES INERTES : un #define dont le NOM n'apparaît nulle part dans le corps (ni dans la valeur d'un autre define) ne change rien au
     programme compilé : deux jumeaux qui ne diffèrent que par de tels defines donnent la même image au pixel. */
  const nomDef = d => (/^#define\s+(\w+)/.exec(d) || [])[1] || d;
  const inerte = (p, d) => { const n = nomDef(d), re = new RegExp('\\b' + n + '\\b'); return !re.test(p.B.join('\n')) && !p.D.some(x => x !== d && re.test(x.replace(/^#define\s+\w+/, ''))); };
  const fusions = [];
  for (const g of DEF) { const par = g.map((_, i) => i), rac = i => par[i] === i ? i : (par[i] = rac(par[i]));
    for (let a = 0; a < g.length; a++) for (let b = a + 1; b < g.length; b++) { const da = g[a].D.filter(d => !g[b].D.includes(d)), db = g[b].D.filter(d => !g[a].D.includes(d));
      if (da.every(d => inerte(g[a], d)) && db.every(d => inerte(g[b], d))) par[rac(a)] = rac(b); }
    const M = new Map(); g.forEach((p, i) => { const r = rac(i); if (!M.has(r)) M.set(r, []); M.get(r).push(p); });
    for (const c of M.values()) if (c.length > 1) fusions.push(c); }
  /* (noms des cases de la clé r128 quand le matériau a un shaderID : shaderID, defines…, puis la liste g de WebGLPrograms, encodage, gamma, clé propre) */
  const CASES = ['precision','isWebGL2','supportsVertexTextures','outputEncoding','instancing','instancingColor','map','mapEncoding','matcap','matcapEncoding','envMap','envMapMode','envMapEncoding','envMapCubeUV','lightMap','lightMapEncoding','aoMap','emissiveMap','emissiveMapEncoding','bumpMap','normalMap','objectSpaceNormalMap','tangentSpaceNormalMap','clearcoatMap','clearcoatRoughnessMap','clearcoatNormalMap','displacementMap','specularMap','roughnessMap','metalnessMap','gradientMap','alphaMap','combine','vertexColors','vertexAlphas','vertexTangents','vertexUvs','uvsVertexOnly','fog','useFog','fogExp2','flatShading','sizeAttenuation','logarithmicDepthBuffer','skinning','maxBones','useVertexTexture','morphTargets','morphNormals','premultipliedAlpha','numDirLights','numPointLights','numSpotLights','numHemiLights','numRectAreaLights','numDirLightShadows','numPointLightShadows','numSpotLightShadows','shadowMapEnabled','shadowMapType','toneMapping','physicallyCorrectLights','alphaTest','doubleSided','flipSided','numClippingPlanes','numClipIntersection','depthPacking','dithering','sheen','transmissionMap','renderer.outputEncoding','renderer.gammaFactor'];
  const casesDe = p => { if (/ShaderMaterial/.test(p.type)) return null; /* clé = shaderID, puis les defines du matériau (nom, valeur), puis la liste g, puis la clé propre (qui peut contenir des virgules) */
    const t = p.cleBrute.split(','), n0 = 1 + 2 * Object.keys(p.defMat || {}).length; if (t.length < n0 + CASES.length) return null;
    return { tete: t.slice(0, n0).join(','), cases: Object.fromEntries(CASES.map((c, j) => [c, t[n0 + j]])), propre: t.slice(n0 + CASES.length).join(',') }; };
  const diffCases = g => { const C = g.map(p => casesDe(p)); if (C.some(c => !c)) return null; const d = {};
    for (const c of CASES) { const v = C.map(x => x.cases[c]); if (new Set(v).size > 1) d[c] = v; }
    const pr = C.map(x => x.propre.length > 60 ? h8(x.propre) : x.propre); if (new Set(pr).size > 1) d.clePropre = pr; return d; };
  /* SIMULATION D'UN CORRECTIF DE three (proposé, pas codé) : (1) matériau sans brume (useFog faux) : fog/fogExp2 de la scène à faux ; (2) pour un matériau SANS lumière (MeshBasic, LineBasic, Sprite, Points, ou
     ShaderMaterial lights:false) et sans onBeforeCompile/customProgramCacheKey propres, getParameters met à zéro les nombres de lumières
     et d'ombres de la scène (et, pour les matériaux de base, doubleSided/flipSided), qui n'entrent pas dans son programme.
     Garde-fou : deux programmes réunis doivent avoir des sources finales identiques au caractère près (sinon le correctif serait faux). */
  const SANS_LUM = /^(MeshBasicMaterial|LineBasicMaterial|LineDashedMaterial|SpriteMaterial|PointsMaterial)$/;
  const LUMS = ['numDirLights','numPointLights','numSpotLights','numHemiLights','numRectAreaLights','numDirLightShadows','numPointLightShadows','numSpotLightShadows','shadowMapEnabled','shadowMapType'];
  const cleSimulee = p => {
    if (p.obc || p.cpk) return null; const corps = p.B.join('\n');
    const t = p.cleBrute.split(','), base = SANS_LUM.test(p.type);
    const sansLum = (base || (p.type === 'ShaderMaterial' && p.lights === false)) && !/directionalLights|pointLights|spotLights|hemisphereLights|rectAreaLights|shadowMap|getShadow/.test(corps);
    const n0 = t.length - 1 - 2 - (CASES.length - 2); if (n0 < 1) return null; /* depuis la fin : clé propre (1 case, sans virgule sans obc), encodage + gamma, puis la liste g */
    const g0 = t.slice(n0, n0 + CASES.length - 2), nom = CASES.slice(0, CASES.length - 2), iUse = nom.indexOf('useFog');
    const sansBrume = g0[iUse] === 'false' || g0[iUse] === ''; /* matériau sans brume : la brume de la SCÈNE (fog, fogExp2) n'entre pas dans le programme */
    if (!sansLum && !sansBrume) return null;
    nom.forEach((c, j) => { if (sansBrume && (c === 'fog' || c === 'fogExp2')) g0[j] = 'false'; if (!sansLum) return; if (LUMS.includes(c)) g0[j] = c === 'shadowMapEnabled' ? 'false' : '0'; if (base && c === 'doubleSided' && !/\bDOUBLE_SIDED\b/.test(corps)) g0[j] = 'false'; if (base && c === 'flipSided' && !/\bFLIP_SIDED\b/.test(corps)) g0[j] = 'false'; });
    return t.slice(0, n0).concat(g0, t.slice(n0 + CASES.length - 2)).join(','); };
  const simul = (() => { const M = new Map(); let eligibles = 0;
    for (const p of P) { const k = cleSimulee(p); if (k !== null) eligibles++; const kk = k === null ? 'brut|' + p.cleBrute : 'sim|' + k; if (!M.has(kk)) M.set(kk, []); M.get(kk).push(p); }
    /* le garde-fou compare le CORPS et les defines, moins les lignes #define que le correctif rend sans objet (ombres, faces) : ce qui reste doit être identique */
    const NEUTRES = /^#define (USE_SHADOWMAP|SHADOWMAP_TYPE_\w+|DOUBLE_SIDED|FLIP_SIDED|USE_FOG|FOG_EXP2)$/, sig = p => p.hCorps + '|' + p.D.filter(d => !NEUTRES.test(d)).sort().join(';');
    const reunis = [...M.values()].filter(g => g.length > 1), faux = reunis.filter(g => new Set(g.map(sig)).size > 1);
    return { eligibles, programmesApres: M.size, evites: P.length - M.size, garde_fou_sources_differentes: faux.length,
      groupes: reunis.map(g => ({ n: g.length, sourcesIdentiques: new Set(g.map(sig)).size === 1, membres: g.map(p => '#' + p.i + ' ' + p.type + ' ' + p.origine + (p.maps ? ' MAPS' : '')) })) }; })();
  const diffCle = g => { const parts = g.map(p => p.cleBrute.split(',')); const tous = new Set(parts.flat());
    return g.map((p, k) => ({ i: p.i, propres: [...new Set(parts[k])].filter(x => !parts.every(q => q.includes(x))).map(x => x.slice(0, 160)).slice(0, 8) })); };
  const diffDef = g => { const tous = new Set(g.flatMap(p => p.D)); return [...tous].filter(d => !g.every(p => p.D.includes(d))); };
  const decritGroupe = (genre, g, extra) => {
    const membres = g.map(p => ({ i: p.i, phase: p.phase, type: p.type, nom: p.nom, shader: p.shaderName, cle: p.cle, origine: p.origine, fn: p.origineFn, code: p.origineCode,
      naissance: p.pileNaissance, lien: p.pileLien, obc: p.obc, cpk: p.cpk, defMat: p.defMat, fog: p.fog, toneMapped: p.toneMapped, transparent: p.transparent, maps: p.maps,
      definesPropres: p.D.filter(d => !g.every(q => q.D.includes(d))) }));
    const nMaps = membres.filter(m => m.maps).length;
    return Object.assign({ genre, n: g.length, evitables: g.length - 1, intouchable: nMaps === g.length ? 'tous maps' : nMaps ? nMaps + ' maps / ' + g.length : 'non',
      definesQuiDifferent: diffDef(g), membres }, extra || {});
  };
  const groupes = [].concat(
    EXACT.map(g => decritGroupe('EXACT', g, { cle: diffCle(g), cases: diffCases(g) })),
    fusions.map(g => decritGroupe('INERTES', g, { cle: diffCle(g), cases: diffCases(g), inertes: diffDef(g) })),
    DEF.map(g => { const ss = [...new Map(g.map(p => [p.hTout, p])).values()]; return decritGroupe('DEFINES', g, { variantes: ss.length }); }),
    SRCG.map(x => decritGroupe('SOURCE', x.membres, { ecarts: x.paires.slice(0, 6).map(y => ({ a: y.a, b: y.b, lignes: y.d.n, plusA: y.d.plusA.slice(0, 6).map(s => s.slice(0, 140)), plusB: y.d.plusB.slice(0, 6).map(s => s.slice(0, 140)) })) })));
  const parOrigine = {}; for (const p of P) { const k = p.origine.replace(/:\d+$/, ''); parOrigine[k] = (parOrigine[k] || 0) + 1; }
  const sortie = { quand: new Date().toISOString(), url: '?tel=1&classe=1&palier=2&introapres=1' + (A.q ? '&' + A.q : ''), cpu: CPU, froid: !!A.froid, indexEgalMorceaux: K.egal,
    pret, menu: brut.menu, programmesLies: P.length, vivantsThree: brut.infoN, materiaux: brut.mats, chauffe: brut.chauffe, prf: brut.prf,
    parPhase: P.reduce((o, p) => (o[p.phase] = (o[p.phase] || 0) + 1, o), {}), sansMateriau: P.filter(p => p.type === '?').length,
    parOrigine: Object.entries(parOrigine).sort((a, b) => b[1] - a[1]),
    resume: { exact: EXACT.length, exactEvitables: EXACT.reduce((s, g) => s + g.length - 1, 0), inertes: fusions.length, inertesEvitables: fusions.reduce((s, g) => s + g.length - 1, 0), defines: DEF.length, definesProgrammes: DEF.reduce((s, g) => s + g.length, 0), source: SRCG.length, sourceProgrammes: SRCG.reduce((s, g) => s + g.membres.length, 0) },
    simulationThree: simul, groupes, programmes: P.map(p => ({ i: p.i, t: p.t, phase: p.phase, vivant: p.vivant, cle: p.cle, type: p.type, nom: p.nom, shader: p.shaderName, origine: p.origine, fn: p.origineFn, lien: p.pileLien[0] || '', maps: p.maps, obc: p.obc, hTout: p.hTout, hCorps: p.hCorps, hDef: p.hDef, taille: p.taille })),
    notes: brut.notes, erreurs, echec };
  if (A.json) fs.writeFileSync(A.json, JSON.stringify(sortie, null, 1));
  if (A.cles) fs.writeFileSync(A.cles, JSON.stringify(P.map(p => ({ i: p.i, type: p.type, obc: p.obc, cpk: p.cpk, lights: p.lights, hTout: p.hTout, cle: p.cleBrute, sim: cleSimulee(p) }))));
  /* le tableau lisible */
  const L = [];
  L.push(`# Programmes compilés au lancement (${sortie.quand.slice(0, 16)}, ${sortie.url}, cpu ×${CPU}${A.froid ? ', froid' : ''})`, '');
  L.push(`- ${P.length} programmes liés (three en garde ${brut.infoN} vivants) ; ${brut.mats} matériaux créés ; prêt à ${(pret / 1000).toFixed(1)} s, menu à ${((brut.menu || 0) / 1000).toFixed(1)} s.`);
  L.push(`- Par phase : ${JSON.stringify(sortie.parPhase)} ; sans matériau reconnu : ${sortie.sansMateriau}.`);
  L.push(`- Jumeaux : EXACT ${EXACT.length} groupes (${sortie.resume.exactEvitables} programmes évitables), INERTES ${fusions.length} groupes (${sortie.resume.inertesEvitables} évitables, defines sans effet), DEFINES ${DEF.length} groupes (${sortie.resume.definesProgrammes} programmes), SOURCE ${SRCG.length} groupes (${sortie.resume.sourceProgrammes} programmes).`, '');
  L.push('## Simulation du correctif three (lumières/ombres/faces ignorées des matériaux sans lumière)', '', `- éligibles ${simul.eligibles}, programmes ${P.length} → ${simul.programmesApres} (${simul.evites} évités) ; garde-fou (sources différentes réunies) : ${simul.garde_fou_sources_differentes}`);
  for (const g of simul.groupes) L.push(`- ${g.n} réunis${g.sourcesIdentiques ? '' : ' ⚠ SOURCES DIFFÉRENTES'} : ${g.membres.join(' · ')}`);
  L.push('');
  L.push('## Par origine (morceau où naît le matériau)', '', '| origine | programmes |', '|---|---|'); for (const [k, n] of sortie.parOrigine) L.push(`| ${k}${/^maps\//.test(k) ? ' (INTOUCHABLE)' : ''} | ${n} |`);
  L.push('', '## Groupes de jumeaux', '');
  for (const g of groupes) { L.push(`### ${g.genre} · ${g.n} programmes · intouchable : ${g.intouchable}` + (g.definesQuiDifferent.length ? ` · defines qui diffèrent : ${g.definesQuiDifferent.join(' ; ')}` : ''));
    for (const m of g.membres) L.push(`- #${m.i} ${m.phase} ${m.type}${m.nom ? ' « ' + m.nom + ' »' : ''} clé ${m.cle} — ${m.origine}${m.fn ? ' (' + m.fn + ')' : ''}${m.maps ? ' MAPS' : ''}${m.obc ? ' obc' : ''}${m.cpk ? ' cpk' : ''} — lien ${m.lien[0] || '?'}${m.definesPropres.length ? ' — propres : ' + m.definesPropres.join(' ; ') : ''}`);
    if (g.cases) L.push(`  - cases de la clé three qui diffèrent (dans l'ordre des membres) : ${JSON.stringify(g.cases)}`);
    if (g.cle) for (const k of g.cle) if (k.propres.length) L.push(`  - clé three propre à #${k.i} : ${JSON.stringify(k.propres)}`);
    if (g.ecarts) for (const e of g.ecarts) L.push(`  - écart #${e.a}/#${e.b} : ${e.lignes} lignes ; +#${e.a} ${JSON.stringify(e.plusA)} ; +#${e.b} ${JSON.stringify(e.plusB)}`);
    L.push(''); }
  L.push('## Tous les programmes', '', '| # | t ms | phase | type | nom | origine | maps | clé | corps | defs |', '|---|---|---|---|---|---|---|---|---|---|');
  for (const p of P) L.push(`| ${p.i} | ${p.t} | ${p.phase} | ${p.type} | ${p.nom} | ${p.origine} | ${p.maps ? 'INTOUCHABLE' : ''} | ${p.cle} | ${p.hCorps} | ${p.hDef} |`);
  if (A.md) fs.writeFileSync(A.md, L.join('\n') + '\n');
  console.log(JSON.stringify({ simulationThree: { eligibles: simul.eligibles, evites: simul.evites, gardeFou: simul.garde_fou_sources_differentes }, programmesLies: P.length, vivantsThree: brut.infoN, parPhase: sortie.parPhase, resume: sortie.resume, sansMateriau: sortie.sansMateriau, pret, menu: brut.menu, chauffe: brut.chauffe, prf: brut.prf && { c: brut.prf.c, n: brut.prf.n, on: brut.prf.on }, erreurs: erreurs.length, echec, indexEgalMorceaux: K.egal }, null, 1));
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
