// LES VOILES AU TIERS : IDENTITÉ AU PIXEL DANS WEBKIT (2026-11-17, qualité · voiles) — chaque voile plein écran du HUD (règles copiées de la feuille), plein
// puis au tiers agrandi (css/interface-opti.css §7), sur un fond rayé chargé, ×3, debout et couché, à l'opacité maximale du jeu. Écart max par canal et histogramme.
//   node outils/banc-hud/voiles-ident.cjs            (dégradés, posés par défaut)    F=2 SC=2.001 K=flowGlow,pwrFx BK=1.1 node … (essais sur les ombres)
const os=require('os'),path=require('path'),fs=require('fs'),zlib=require('zlib');
const {webkit}=require(path.join(os.homedir(),'.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core'));
const EXE=path.join(os.homedir(),'Library/Caches/ms-playwright/webkit-2388/pw_run.sh');
eval(fs.readFileSync(path.join(__dirname,'couches.cjs'),'utf8').split('\n').slice(22,34).join('\n').replace('function png','globalThis.png=function'));
const F=+(process.env.F||3),SC=process.env.SC||String(F+.001);
const T=`inset:0 auto auto 0;width:calc(100% / ${F});height:calc(100% / ${F});transform-origin:0 0;transform:scale(${SC});`;
const BK=+(process.env.BK||1);const d=(v)=>`${(v/F).toFixed(4)}px`;const bl=(v)=>`${(v/F*BK).toFixed(4)}px`;
const V={
 speedFx:[`position:fixed;inset:0;background:radial-gradient(ellipse at center,transparent 42%,rgba(45,20,55,.55) 100%);opacity:.6`,''],
 cloudFx:[`position:fixed;inset:0;opacity:1;background:radial-gradient(ellipse at 50% 55%,rgba(250,240,248,.62) 0%,rgba(232,222,240,.42) 55%,rgba(214,206,230,.14) 100%)`,''],
 flash9:[`position:fixed;inset:0;--ff:rgba(255,190,60,.55);opacity:1;background:radial-gradient(circle at 50% 62%,transparent 28%,var(--ff) 100%)`,''],
 flowGlow:[`position:fixed;inset:0;--fc:#ff3040;opacity:1;box-shadow:inset 0 0 60px color-mix(in srgb,var(--fc) 55%,transparent),inset 0 0 18px color-mix(in srgb,var(--fc) 40%,transparent)`,`box-shadow:inset 0 0 ${bl(60)} color-mix(in srgb,var(--fc) 55%,transparent),inset 0 0 ${bl(18)} color-mix(in srgb,var(--fc) 40%,transparent)`],
 hudBefore:[`position:fixed;left:0;right:0;top:0;height:214px;background:linear-gradient(180deg,rgba(10,6,26,.46) 0%,rgba(10,6,26,.24) 52%,rgba(10,6,26,0) 100%)`,`right:auto;width:calc(100% / 3);height:calc(214px / 3);transform-origin:0 0;transform:scale(3.001)`],
 pwrFx:[`position:fixed;inset:0;--pf:rgba(255,120,40,.38);--pf2:rgba(255,120,40,.2);opacity:1;box-shadow:inset 0 0 50px 8px var(--pf),inset 0 0 150px 28px var(--pf2)`,`box-shadow:inset 0 0 ${bl(50)} ${d(8)} var(--pf),inset 0 0 ${bl(150)} ${d(28)} var(--pf2)`],
};
const only=process.env.K?process.env.K.split(','):null;
const fond=`<meta name=viewport content="width=device-width,initial-scale=1"><style>html,body{margin:0;height:100%}#bg{position:fixed;inset:0;background:repeating-linear-gradient(37deg,#2a6 0 7px,#c53 7px 13px,#36c 13px 23px),linear-gradient(#000,#fff);background-blend-mode:multiply}#v{will-change:opacity}</style><div id=bg></div>`;
(async()=>{const b=await webkit.launch({executablePath:EXE,headless:true});
 for(const [w,h] of [[390,844],[844,390]]){const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:3,isMobile:true,hasTouch:true});const pg=await ctx.newPage();
  for(const [k,[css,extra]] of Object.entries(V)){if(only&&!only.includes(k))continue;
   const shot=async st=>{await pg.setContent(fond+`<div id=v style="${st}"></div>`);await pg.waitForTimeout(250);return png(await pg.screenshot());};
   const A=await shot(css),B=await shot(css+';'+(k==='hudBefore'?'':T)+extra);
   let mx=0,n=0,n3=0,bord=0;const hist=new Array(10).fill(0);for(let i=0;i<A.d.length;i+=4){let m=0;for(let c=0;c<3;c++)m=Math.max(m,Math.abs(A.d[i+c]-B.d[i+c]));if(m){n++;if(m>2){n3++;const p=i/4,x=p%A.w,y=Math.floor(p/A.w);if(x<3||y<3||x>=A.w-3||y>=A.h-3)bord++;}}hist[Math.min(9,m)]++;if(m>mx)mx=m;}
   console.log(`F=${F} sc=${SC} ${w}x${h} ${k}: max ${mx} · px≠ ${n} · >2 : ${n3} (dont bord ${bord}) · hist ${hist.slice(1).join(',')}`);}
  await ctx.close();}
 await b.close();})();
