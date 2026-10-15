/* trace.cjs — génère la piste forêt (pelote.js) en Node, comme buildTrack, et l'écrit au format du banc raccourcis.
   node trace.cjs <graines a,b,c> <sortie.json> [--palier N] [--svg dossier] [--src fichier.js | --jeu index.html] */
const fs=require('fs'),path=require('path'),vm=require('vm');
const THREE=require(require('path').join(__dirname,'../../VERSION PRINCIPALE/vendor/three.min.js'));
const arg=process.argv.slice(2),opt=k=>{const i=arg.indexOf('--'+k);return i>=0?arg[i+1]:null;};
const graines=String(arg[0]||'1').split(',').map(Number),SORTIE=arg[1]||'t.json',PAL=+(opt('palier')||0),SVG=opt('svg'),SRC=opt('src');
const PUSH=[1.00,1.06,1.12,1.19,1.26,1.34,1.42,1.50,1.59,1.68,1.78,1.88,1.99,2.10,2.21,2.33,2.45,2.58,2.71,2.85,2.99,3.13,3.28,3.44,3.60,3.76,3.90,4.02,4.12,4.20];
const engLate=u=>1+Math.min(.5,Math.max(0,u-8)*.035),vPalDe=t=>{const u=Math.min(PUSH.length-1,(t|0)+2);return 2.75*190/3.6*engLate(u)*PUSH[u]*.48;};
const vPal=vPalDe(PAL),LV=1+(vPal-70)/100;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const ctx={THREE,Math,Float64Array,Float32Array,Uint8Array,Int32Array,Map,Set,Array,Object,JSON,console,GAPMARK:[],CAMPM:[],MODMARK:[],FORET:{},ROAD_HALF:28,mulberry32,lvPiste:()=>LV,
  rayonPalier:()=>40+.3*vPal,vPalier:()=>vPal};
// la source : pelote.js (--src) ou, par défaut, le bloc du jeu lui-même (de « LA ROUTE v3 » à « L'ATELIER DES ARBRES »)
let code;if(opt('src'))code=fs.readFileSync(SRC,'utf8');else{const h=fs.readFileSync(opt('jeu')||'C:/Users/sacha/Documents/GitHub/CAR-CASH-GIT/VERSION PRINCIPALE/index.html','utf8');
  code=h.slice(h.indexOf('/* ---------------- LA ROUTE v3'),h.indexOf("/* ---------------- L'ATELIER DES ARBRES"));}
vm.createContext(ctx);vm.runInContext(code,ctx);
const out=[];
for(const g of graines){
  const t0=Date.now(),ctrl=ctx.genForet(mulberry32(g*7919+13)),tGen=Date.now()-t0;
  const curve=new THREE.CatmullRomCurve3(ctrl,false,'centripetal');curve.arcLengthDivisions=Math.max(200,ctrl.length*16);
  const L=curve.getLength(),N=Math.min(9000,Math.max(3000,Math.round(L))),pts=curve.getSpacedPoints(N),NP=pts.length,ds=L/(NP-1);
  const T=[],Nn=[],B=[];let minY=1e9;
  for(let i=0;i<NP;i++){const j=Math.min(i+1,NP-1),k=Math.max(i-1,0);T.push(new THREE.Vector3().subVectors(pts[j],pts[k]).normalize());if(pts[i].y<minY)minY=pts[i].y;}
  for(let i=0;i<NP;i++){const t=T[i],n=new THREE.Vector3(0,1,0).addScaledVector(t,-t.y).normalize();Nn.push(n);B.push(new THREE.Vector3().crossVectors(n,t));}
  const k=Math.max(1,Math.round(2/ds)),nb=Math.floor((NP-1)/k)+1,r2=x=>Math.round(x*100)/100,r3=x=>Math.round(x*1000)/1000,p=[],t=[],n=[],b=[],trou=[];
  for(let j=0;j<nb;j++){const i=j*k;p.push(r2(pts[i].x),r2(pts[i].y),r2(pts[i].z));t.push(r3(T[i].x),r3(T[i].y),r3(T[i].z));n.push(r3(Nn[i].x),r3(Nn[i].y),r3(Nn[i].z));b.push(r3(B[i].x),r3(B[i].y),r3(B[i].z));trou.push(0);}
  const pel=ctx.FORET.pel;
  out.push({carte:'foret',meteo:'midi',piste:'foret',L:Math.round(L*100)/100,NP,half:28,thick:2.6,minY:r2(minY),g:15.84,spd:.48,airMax:6,pas:r2(k*ds),graine:g,graineOk:true,lv:LV,eng:PAL,vPal:Math.round(vPal*100)/100,rMin:Math.round((40+.3*vPal)*100)/100,
    p,t,n,b,trou,pel,msGen:tGen});
  console.error('graine',g,'L',Math.round(L),'gen',tGen,'ms',JSON.stringify(pel),'minY',Math.round(minY),'yFin',Math.round(pts[NP-1].y));
  if(SVG){fs.mkdirSync(SVG,{recursive:true});
    let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,y0=1e9,y1=-1e9;for(const q of pts){x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);z0=Math.min(z0,q.z);z1=Math.max(z1,q.z);y0=Math.min(y0,q.y);y1=Math.max(y1,q.y);}
    const M=80,W=900,sc=(W-2*M)/Math.max(x1-x0,z1-z0),H=Math.round((z1-z0)*sc+2*M),Wd=Math.round((x1-x0)*sc+2*M);
    const col=y=>{const u=(y-y0)/Math.max(1,y1-y0);const r=Math.round(40+215*u),gg=Math.round(60+120*(1-Math.abs(u-.5)*2)),bb=Math.round(255-215*u);return `rgb(${r},${gg},${bb})`;};
    let sv=`<svg xmlns="http://www.w3.org/2000/svg" width="${Wd}" height="${H}" style="background:#111"><text x="10" y="20" fill="#fff" font-size="14">graine ${g} · L ${Math.round(L)} m · ${pel.croise} croisements · dyMin ${pel.dyMin} m · note ${pel.note} · y ${Math.round(y0)}…${Math.round(y1)} (bleu bas, rouge haut)</text>`;
    // ordre de dessin par hauteur : les tronçons hauts par-dessus
    const segs=[];const st=Math.max(1,Math.round(8/ds));for(let i=0;i+st<NP;i+=st)segs.push(i);segs.sort((a,b)=>pts[a].y-pts[b].y);
    for(const i of segs){const a=pts[i],c=pts[i+st];sv+=`<line x1="${((a.x-x0)*sc+M).toFixed(1)}" y1="${(H-((a.z-z0)*sc+M)).toFixed(1)}" x2="${((c.x-x0)*sc+M).toFixed(1)}" y2="${(H-((c.z-z0)*sc+M)).toFixed(1)}" stroke="${col(a.y)}" stroke-width="${(56*sc).toFixed(1)}" stroke-linecap="round" stroke-opacity=".9"/>`;}
    for(const f of [.0,.25,.5,.75,1]){const i=Math.round(f*(NP-1)),a=pts[i];sv+=`<circle cx="${((a.x-x0)*sc+M).toFixed(1)}" cy="${(H-((a.z-z0)*sc+M)).toFixed(1)}" r="6" fill="${f===0?'#0f0':f===1?'#f0f':'#fff'}"/><text x="${((a.x-x0)*sc+M+8).toFixed(1)}" y="${(H-((a.z-z0)*sc+M)).toFixed(1)}" fill="#fff" font-size="12">${Math.round(f*L)}</text>`;}
    sv+='</svg>';fs.writeFileSync(path.join(SVG,'plan-'+g+'-p'+PAL+'.svg'),sv);}
}
fs.writeFileSync(SORTIE,JSON.stringify(out));
