const fs=require('fs'),W=__dirname,dg=fs.readFileSync(W+'/dg.js','utf8');
const fin='(async()=>{'+dg+'const o=dg();return {fp:o.fp,test:o.test};})()';
const sonde='(function(){const g=G.dbgDunes(),d=G.dbgDN(),c=G.dbgChance();return {sa:g.sauts,lv:g.levre&&(g.levre.k+":"+g.levre.vx+"/"+g.levre.vy+"/"+g.levre.t),ch:g.carHaut,ss:Math.round(d.safeS),inv:c.inv,go:c.gameOver}})()';
const chance='(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));G.dbgAuto(1,0,{});G.dbgChance("t",200);await sl(2500);const d=G.dbgDN();const k=d.DN.lev.find(v=>v.s>d.s+250);G.dbgDunes("tp",k.s-50,15);let t=0;while(!G.dbgState().gameOver&&t<250){await sl(100);t++;}const a={lip:Math.round(k.s),vide:Math.round(k.e-k.s),mortApres:t/10,texte:G.document.getElementById("mDead").innerText.replace(/\\s+/g," ").slice(0,50),ch:G.dbgChance()};await sl(500);a.joue=G.dbgChance("joue");t=0;while(G.dbgState().gameOver&&t<150){await sl(100);t++;}const e=G.dbgDN();a.apres={s:Math.round(e.s),vA:+e.vA.toFixed(1),safeS:Math.round(e.safeS),mode:e.mode,attendu:t/10,inv:G.dbgChance().inv};return a;})()';
const resp='(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));G.dbgAuto(1,0,{});await sl(1500);const d=G.dbgDN();const k=d.DN.lev[1];const r=G.dbgResp(k.s,26);return {lip:Math.round(k.s),vide:Math.round(k.e-k.s),r:r};})()';
const vues='(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));await sl(1500);const d=G.dbgDN(),lv=d.DN.lev,out={};const V=[["bordPose",lv[0].e-45,7,0,.10],["bordPoseDos",lv[0].e+40,9,180,.12],["levre",lv[0].s-70,4,0,.03],["coteVide",lv[1].s+30,3,90,.06]];for(const v of V){G.dbgDunes("vueA",v[1],v[2],v[3],v[4]);out[v[0]]=G.dbgScene().rdr.domElement.toDataURL("image/jpeg",.8);}out.lev=lv.slice(0,2).map(v=>[Math.round(v.s),Math.round(v.e)]);return out;})()';
const S=[
 {nom:'J-chance-vraie',carte:'dunes',meteo:'matin',params:'pistegraine=4321',secs:14,eval:chance,sonde},
 {nom:'K-respawn-levre',carte:'dunes',meteo:'soir',params:'pistegraine=1234',secs:10,eval:resp,sonde},
 {nom:'L-nitro-palier5',carte:'dunes',meteo:'midi',params:'pistegraine=777',secs:25,eval:'[G.dbgMoteur(),G.dbgMoteur(),G.dbgMoteur(),G.dbgMoteur(),G.dbgMoteur()]',auto:{lat:0,nit:1},sonde},
 {nom:'M-photos',carte:'dunes',meteo:'midi',params:'pistegraine=1234',secs:1,eval:vues},
 {nom:'N-sansdecor',carte:'dunes',meteo:'soir',params:'pistegraine=1234&sans=dunesdecor',secs:3,evalFin:fin}];
fs.writeFileSync(W+'/scen2.json',JSON.stringify(S));console.log('ok',S.length);
