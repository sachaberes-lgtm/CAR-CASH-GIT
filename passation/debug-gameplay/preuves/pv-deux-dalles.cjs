// PV-02 : dalleProche (portail-passage.js:354) rend la dalle du DESSUS quand deux portions de route se croisent.
// Piste synthétique : portion A (en bas) le long de x à y=0 ; portion B (le pont) le long de z à y=D (croisement à angle droit),
// puis variante « hélice » : B parallèle à A, décalée de e en latéral et de D en hauteur. Pas de 1 m (N = L), RH = 28, THICK = 5,2.
// On lâche la caisse au-dessus de A et on rejoue, image par image (30 i/s), le test de pose de tryLand (demi-tour.js:404-433, simplifié).
const RH=28,THICK=5.2,SPD=.48;
function piste(kind,D,e){const P=[],N=[],T=[],Bv=[];
  for(let i=-400;i<=400;i++){P.push([i,0,0]);T.push([1,0,0]);N.push([0,1,0]);}            // A
  for(let i=0;i<400;i++)P.push(null); // 400 m de route entre les deux (loin)
  for(let i=-400;i<=400;i++){if(kind==='pont'){P.push([0,D,i]);T.push(null);}else{P.push([i,D,e]);T.push(null);}}
  const Q=[],NN=[],TT=[],BB=[];for(let k=0;k<P.length;k++){if(!P[k]){Q.push([1e6,1e6,1e6+k]);NN.push([0,1,0]);TT.push([1,0,0]);continue;}
    Q.push(P[k]);NN.push([0,1,0]);const t=k<801?[1,0,0]:(kind==='pont'?[0,0,1]:[1,0,0]);TT.push(t);}
  for(let k=0;k<Q.length;k++){const t=TT[k],n=NN[k];BB.push([t[1]*n[2]-t[2]*n[1],t[2]*n[0]-t[0]*n[2],t[0]*n[1]-t[1]*n[0]]);}
  return {Q,NN,TT,BB};}
function proche(S,x,y,z,pas){let bi=-1,bd=1e9;for(let i=0;i<S.Q.length;i+=pas){const p=S.Q[i],d=(x-p[0])**2+(y-p[1])**2+(z-p[2])**2;if(d<bd){bd=d;bi=i;}}return [bi,bd];}
function lache(S,lat,vN){ // la caisse au-dessus de A, en x = 0, à la distance lat de l'axe de A (B de A = (0,0,1) : z = lat, du côté du décalage de B)
  let x=0,y=6,z=lat;const dt=1/30;let fallT=1;
  for(let k=0;k<300;k++){y+=vN*dt*SPD;fallT+=dt;if(y<-30)return {r:"TRAVERSE A : tombée dans le vide"};
    const [bi,bd]=proche(S,x,y,z,2);if(bi<0||bd>1600)continue;const p=S.Q[bi],n=S.NN[bi],b=S.BB[bi];
    const d=[x-p[0],y-p[1],z-p[2]],h=d[0]*n[0]+d[1]*n[1]+d[2]*n[2],l=d[0]*b[0]+d[1]*b[1]+d[2]*b[2],prevH=h-vN*dt*SPD;
    const surA=bi<801;let side=0;
    if(fallT>.35&&h>-1.2&&h<3&&vN<4.5)side=1;else if(prevH>-1.2&&h<=-1.2)side=1;
    else if(!side&&Math.abs(l)<RH&&h<-1.2&&h>-THICK+1.2)return {r:'FILET (corps de la dalle)',surA,y:+y.toFixed(2)};
    if(side&&Math.abs(l)<RH)return {r:'POSE sur '+(surA?'A (la bonne)':'B (le pont !)'),y:+y.toFixed(2)};
    if(y<-30)return {r:'TRAVERSE A : tombée dans le vide',y:+y.toFixed(2)};}
  return {r:'?'};}
for(const [kind,D,e] of [['pont',20,0],['pont',26,0],['pont',34,0],['helice',19,28],['helice',24,30]]){const S=piste(kind,D,e);
  const out=[];for(const lat of [0,10,16,20,24,27])out.push('lat '+lat+' : '+lache(S,lat,-25).r);
  console.log(kind+' D='+D+(kind==='helice'?' décalage '+e:'')+'\n  '+out.join('\n  '));}
