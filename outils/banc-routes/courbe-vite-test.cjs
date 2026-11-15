/* LA COURBE VITE, PREUVE ET CHRONO (2026-11-14) : courbeCR (route-rythme.js) contre THREE.CatmullRomCurve3 sur les VRAIES routes (ctrl de genCtrl, plat et roulé,
   nuages / espace / ville / crypto, paliers 0/10/20) et sur des points tirés au hasard : getLength, getLengths, getSpacedPoints, getPointAt, getUtoTmapping,
   getTangentAt — égalité au BIT près (===), puis le temps de rythmeMesure-type (getLength + getSpacedPoints tous les 5 m) des deux.
   node outils/banc-routes/courbe-vite-test.cjs [graines=1-4] */
const path=require('path'),vm=require('vm');
const arg={};for(const a of process.argv.slice(2)){const m=/^(\w+)=(.*)$/.exec(a);if(m)arg[m[1]]=m[2];}
const [g0,g1]=(arg.graines||'1-4').split('-').map(Number);
const B=require(path.join(__dirname,'charge.cjs')).creer(''),ctx=B.ctx,T=ctx.THREE;
let n=0,diff=0,tA=0,tB=0;const ecart=[];
const compare=function(ctrl,nom){const pts=ctrl.map(p=>new T.Vector3(p.x,p.y,p.z));
  const a=new T.CatmullRomCurve3(pts,false,'centripetal'),b=ctx.courbeCR(pts);a.arcLengthDivisions=b.arcLengthDivisions=Math.max(200,pts.length*16);
  if(b.constructor===T.CatmullRomCurve3)throw new Error('courbeCR rend la courbe de three (interrupteur ?)');
  const chk=function(x,y,quoi){n++;if(!(x===y)){diff++;if(ecart.length<10)ecart.push(nom+' '+quoi+' '+x+' ≠ '+y);}};
  const t0=process.hrtime.bigint();const La=a.getLength(),N=Math.max(50,Math.round(La/5)),Pa=a.getSpacedPoints(N);const t1=process.hrtime.bigint();
  const Lb=b.getLength(),Pb=b.getSpacedPoints(N);const t2=process.hrtime.bigint();tA+=Number(t1-t0)/1e6;tB+=Number(t2-t1)/1e6;
  chk(La,Lb,'L');const la=a.getLengths(),lb=b.getLengths();chk(la.length,lb.length,'nL');for(let i=0;i<la.length;i++)chk(la[i],lb[i],'lg'+i);
  for(let i=0;i<Pa.length;i++){chk(Pa[i].x,Pb[i].x,'x'+i);chk(Pa[i].y,Pb[i].y,'y'+i);chk(Pa[i].z,Pb[i].z,'z'+i);}
  for(let k=0;k<200;k++){const u=k===0?0:k===1?1:Math.random();chk(a.getUtoTmapping(u),b.getUtoTmapping(u),'u'+u);const p=a.getPointAt(u),q=b.getPointAt(u);chk(p.x,q.x,'px');chk(p.y,q.y,'py');chk(p.z,q.z,'pz');
    const ta=a.getTangentAt(u),tb=b.getTangentAt(u);chk(ta.x,tb.x,'tx');chk(ta.y,tb.y,'ty');chk(ta.z,tb.z,'tz');}
  /* les longueurs à un autre nombre de divisions (le cache se refait) */
  const la2=a.getLengths(333),lb2=b.getLengths(333);for(let i=0;i<la2.length;i++)chk(la2[i],lb2[i],'lg333');};
for(const c of ['nuages','espace','ville','crypto'])for(const p of [0,10,20])for(let g=g0;g<=g1;g++){vm.runInContext('VILLE_BANK.graine='+g+';if(typeof VILLE_ENTREE!=="undefined")VILLE_ENTREE=null;',ctx);
  const r=B.piste(c,g,p);compare(r.ctrl,c+' p'+p+' g'+g);}
for(let k=0;k<40;k++){const P=[];const m=2+Math.floor(Math.random()*60);for(let i=0;i<m;i++)P.push({x:(Math.random()-.5)*1e3,y:(Math.random()-.5)*200,z:(Math.random()-.5)*1e3});if(k%5===0&&m>3){P[2]={x:P[1].x,y:P[1].y,z:P[1].z};}compare(P,'hasard'+k);}
console.log('comparaisons',n,'· différences',diff,diff?'✗':'✓ (au bit près)');for(const e of ecart)console.log('  ',e);
console.log('temps getLength + getSpacedPoints(L/5) : three',tA.toFixed(0),'ms · courbe vite',tB.toFixed(0),'ms (×'+(tA/Math.max(1e-9,tB)).toFixed(1)+')');
process.exit(diff?1:0);
