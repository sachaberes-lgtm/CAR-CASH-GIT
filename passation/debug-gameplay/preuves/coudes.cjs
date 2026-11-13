/* retrouve les coudes (même règle que rythmeMesure) dans ctrl0 d'un JSON : node coudes.cjs fichier.json */
const o=JSON.parse(require('fs').readFileSync(process.argv[2],'utf8'));const C=o.ctrl0,n=C.length;const cdeg=14;
const L=[];for(let i=1;i<n;i++)L[i]=Math.hypot(C[i][0]-C[i-1][0],C[i][2]-C[i-1][2]);
let s=0;const S=[0];for(let i=1;i<n;i++){s+=Math.hypot(C[i][0]-C[i-1][0],C[i][1]-C[i-1][1],C[i][2]-C[i-1][2]);S[i]=s;}
for(let i=1;i<n-1;i++){const h1=Math.atan2(C[i][0]-C[i-1][0],C[i][2]-C[i-1][2]),h2=Math.atan2(C[i+1][0]-C[i][0],C[i+1][2]-C[i][2]);let d=Math.abs(h2-h1);while(d>Math.PI)d=Math.abs(d-2*Math.PI);
  const l1=L[i],l2=L[i+1];if(d>cdeg*Math.PI/180&&Math.min(l1,l2)>8)console.log('coude i',i,'s',Math.round(S[i]),'angle',(d*57.3).toFixed(1),'l1',l1.toFixed(1),'l2',l2.toFixed(1),'marks',JSON.stringify(o.marks.filter(m=>m.i0<=i&&m.i1>=i).map(m=>m.fig||m.k||m.nom||'m')));
  else if(i<n-2&&l2<10&&l1>40&&L[i+2]>40)console.log('mini-segment i',i,'s',Math.round(S[i]),'l1',l1.toFixed(1),'l2',l2.toFixed(1),'l3',L[i+2].toFixed(1));}
