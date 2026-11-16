// Vérifie que chaque fragment de code ajouté par les correctifs est du CODE (pas avalé par un commentaire) dans le script du jeu assemblé.
const fs=require('fs'),acorn=require('/Users/sachaberes/.hermes/hermes-agent/node_modules/acorn');
const html=fs.readFileSync(process.argv[2],'utf8');
// le plus grand <script> = le jeu
let best='',bi=0,re=/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g,m;
while((m=re.exec(html)))if(m[1].length>best.length){best=m[1];bi=m.index;}
const com=[];let ast;
try{ast=acorn.parse(best,{ecmaVersion:2022,onComment:(b,t,s,e)=>com.push([s,e])});console.log('analyse OK, script de',best.length,'car.,',com.length,'commentaires');}
catch(e){console.log('ERREUR de syntaxe',e.message);process.exit(1);}
const frag=["TL_V0=new THREE.Vector3()","HV9=new THREE.Vector3()","TL_V0.copy(fallVel)","TL_V0.multiplyScalar((sp8+a8)/sp8)","TL_V0.addScaledVector(FLY_U,a8)","HV9.copy(fallPos).addScaledVector","fallPos.copy(HV9)","const VIS_R2=","dalleProche(tmp2.x,tmp2.y,tmp2.z,8,VIS_R2,-1)","let bestI=dalleProche","bestI=b29;bd=d29;","if(exB!=null&&b*DALLE_K>exA","if(exB!=null&&i>exA&&i<exB)continue","let tranche9=","levre9=(a9<ROAD_HALF","tranche9=false;break;","pl9=lk;","let vNj=vN;","const impact=Math.abs(vNj)","for(let i9=0;i9<n9;i9++)","if(!drifte&&Math.abs(slipB)<.002","!PORTV.att)startFall(0,1,true)","chain=0;chainVal=0;chainMult=1;chainSeen={}","BANQ.fid=-1;","x0=cc[o]-cc[o+3]/2*E9-1","loop._errT0=performance.now()","loop._errSuite=0;try{window.__ccNote('boucle','60 images","addEventListener('orientationchange'","TCTL.inclN=TCTL.inclPN=null","const iosPose=function","document.addEventListener('pause',iosPose)","GLI.id=null;figGVoit(null);","for(const k in keys)keys[k]=false","sessionStorage.ccCtxT=t9","enCoursPose();SAVE.flush();}catch(err){}},false)"];
const inCom=p=>com.some(([s,e])=>p>=s&&p<e);
for(const f of frag){let p=best.indexOf(f),n=0,bad=0;while(p>=0){n++;if(inCom(p))bad++;p=best.indexOf(f,p+1);}console.log((n&&!bad?'CODE   ':'!!!!!! ')+n+' occ., '+bad+' dans un commentaire : '+f);}
// commentaires de bloc contenant /* (imbrication suspecte) dans les lignes ajoutées
// caractères de contrôle
let cc=0;for(let i=0;i<best.length;i++){const c=best.charCodeAt(i);if(c<32&&c!==10&&c!==13&&c!==9)cc++;}console.log('caractères de contrôle dans le script :',cc);
