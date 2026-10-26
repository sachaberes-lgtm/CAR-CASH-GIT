const fs=require('fs'),W=__dirname,dg=fs.readFileSync(W+'/dg.js','utf8');
const fin='(async()=>{'+dg+'return dg();})()';
const multi='(async()=>{'+dg+'const sl=ms=>new Promise(r=>setTimeout(r,ms)),out=[];for(const [gr,pa] of [[11,0],[22,0],[33,0],[44,0],[55,0],[66,0],[77,8],[88,8],[99,20],[111,20]]){try{G.dbgTrace({carte:"dunes",graine:gr,palier:pa});let k=0;while(!G.dbgDN().DN.on&&k<80){await sl(100);k++;}const o=dg();o.g=gr;o.p=pa;delete o.fp;out.push(o);}catch(e){out.push({g:gr,e:String(e).slice(0,200)});}}return out;})()';
const sonde='(function(){const g=G.dbgDunes(),d=G.dbgDN();return {sa:g.sauts,lv:g.levre&&(g.levre.k+":"+g.levre.vx+"/"+g.levre.vy+"/"+g.levre.t),ch:g.carHaut,at:g.attente,on:g.on,ss:Math.round(d.safeS),inv:G.dbgChance().inv,pv:!!(d.DN.part&&d.DN.part.visible)}})()';
const chance='(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));G.dbgChance("t",200);G.dbgChance("$",100000);await sl(2500);const d=G.dbgDN();const k=d.DN.lev.find(v=>v.s>d.s+250);G.dbgDunes("tp",k.s-60,18);let t=0;while(!G.dbgState().gameOver&&t<100){await sl(100);t++;}const a={lip:Math.round(k.s),mortApres:t/10,texte:G.document.getElementById("mDead").innerText.replace(/\\s+/g," ").slice(0,60),ch:G.dbgChance()};await sl(600);a.joue=G.dbgChance("joue");t=0;while(G.dbgState().gameOver&&t<100){await sl(100);t++;}const e=G.dbgDN();a.apres={s:Math.round(e.s),vA:+e.vA.toFixed(1),safeS:Math.round(e.safeS),mode:e.mode,attendu:t/10};return a;})()';
const S=[
 {nom:'A-soir-1234',carte:'dunes',meteo:'soir',params:'pistegraine=1234',attente:1,secs:30,sonde,evalFin:fin},
 {nom:'B-soir-1234-sansprebati',carte:'dunes',meteo:'soir',params:'pistegraine=1234&prebati=0',secs:5,evalFin:fin},
 {nom:'C-midi-moteur',carte:'dunes',meteo:'midi',params:'pistegraine=777',secs:25,eval:'[G.dbgMoteur(),G.dbgMoteur(),G.dbgMoteur(),G.dbgMoteur(),G.dbgMoteur()]',sonde,evalFin:fin},
 {nom:'D-nuit-vol',carte:'dunes',meteo:'nuit',secs:22,auto:{lat:0,vol:true,saut:4},sonde},
 {nom:'E-vent-lat25-tel',carte:'dunes',meteo:'pluie',secs:16,vue:'tel',auto:{lat:25},sonde},
 {nom:'F-tempete-lat-25-debout',carte:'dunes',meteo:'orage',secs:16,vue:'debout',auto:{lat:-25},sonde},
 {nom:'G-portail',carte:'jade',meteo:'midi',secs:12,sonde,chaine:'dunes:soir,ville:pluie',evalFin:'(function(){const d=G.dbgDN();return {on:d.DN.on,part:!!(d.DN.part&&d.DN.part.visible),grp:!!(d.DN.grp&&d.DN.grp.visible),mesh:!!(d.DN.mesh&&d.DN.mesh.visible),lev:d.DN.lev.length,dunes:G.dbgDunes().dunes}})()'},
 {nom:'H-chance',carte:'dunes',meteo:'matin',params:'pistegraine=4321',secs:16,eval:chance,sonde},
 {nom:'I-multi',carte:'dunes',meteo:'soir',secs:2,evalFin:multi}];
fs.writeFileSync(W+'/scen1.json',JSON.stringify(S));console.log('ok',S.length);
