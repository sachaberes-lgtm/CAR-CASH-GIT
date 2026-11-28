/* ===== LA VITESSE A TEMPS EGAL, ET LES MORTS PAR KM (2026-11-28, role « lecteur des joueurs et de la ville ») =====
   Memes lots que par-map.js. (1) la vitesse au sol (km/h) par minute de partie, toutes maps ; (2) par map : km parcourus le long de la route
   (somme des avancees s, comme mesures.js) et morts pour 100 km ; (3) les decollages par le bord sur decor : vitesse et nitro selon la minute.
   node ml/ecurie/etude/avant-le-bord/joueurs-ville/vitesse-et-km.js -> vitesse-et-km.json */
const fs=require('fs'),path=require('path');
const RACINE=path.join(__dirname,'..','..','..','..','..');
const {partiesJoueurs,finVraie}=require(path.join(RACINE,'ml','bot','mesures.js'));
const moy=A=>A.length?A.reduce((a,b)=>a+b,0)/A.length:null,med=A=>{A=A.slice().sort((a,b)=>a-b);const n=A.length;return n?(n%2?A[(n-1)/2]:(A[n/2-1]+A[n/2])/2):null;};
const DECOR={canyon:1,grotte:1,ville:1,jade:1};
function lot(P){
  const parMin={},km={},morts={},dec={};
  for(let c of P){c=finVraie(c);const col={};c.cols.forEach((n,i)=>col[n]=i);const E=c.ech,g=(e,n)=>e[col[n]],carte=r=>((c.routes||[])[r]||{}).carte||'?';
    for(const e of E){if(g(e,'m')!==0)continue;const k=Math.min(8,Math.floor(g(e,'t')/60));(parMin[k]=parMin[k]||[]).push(g(e,'kmh'));}
    for(let i=1;i<E.length;i++){if(g(E[i],'r')!==g(E[i-1],'r'))continue;const ds=g(E[i],'s')-g(E[i-1],'s');if(ds>0&&ds<400){const k=carte(g(E[i],'r'));km[k]=(km[k]||0)+ds/1000;}}
    let r=0,vol=null;for(const e of c.ev){if(e[1]==='route')r=e[2];else if(e[1]==='decol'){vol=carte(r);
        if(e[2]==='bord'&&DECOR[carte(r)]){const k=Math.min(4,Math.floor(e[0]/60));(dec[k]=dec[k]||[]).push(e[5]);}}
      else if(e[1]==='pose')vol=null;else if(e[1]==='mort'){const k=vol||carte(r);morts[k]=(morts[k]||0)+1;vol=null;}}}
  const o={kmh_sol_par_minute:{},maps:{},kmh_decol_decor_par_minute:{}};
  for(const k of Object.keys(parMin).sort((a,b)=>a-b))o.kmh_sol_par_minute[k]={kmh_moy:Math.round(moy(parMin[k])),n:parMin[k].length};
  for(const k of Object.keys(km).sort())o.maps[k]={km:+km[k].toFixed(1),morts:morts[k]||0,morts_100km:+(100*(morts[k]||0)/km[k]).toFixed(1)};
  for(const k of Object.keys(dec).sort((a,b)=>a-b))o.kmh_decol_decor_par_minute[k]={kmh_med:med(dec[k]),n:dec[k].length};
  return o;}
const D=path.join(RACINE,'ml','bot','etalon'),lus=fs.readdirSync(D).filter(x=>x.endsWith('.json')).map(x=>({nom:x,j:JSON.parse(fs.readFileSync(path.join(D,x),'utf8'))}));
const B=JSON.parse(fs.readFileSync(path.join(RACINE,'ml','ecurie','agents','tmp-voltige','note-voltige4-t900.json'),'utf8'));
const res={joueurs:lot(partiesJoueurs(lus).parties),c0025:lot(B.parties.map(p=>p.partie||p))};
fs.writeFileSync(path.join(__dirname,'vitesse-et-km.json'),JSON.stringify(res,null,1));
console.log(JSON.stringify(res,null,1));
