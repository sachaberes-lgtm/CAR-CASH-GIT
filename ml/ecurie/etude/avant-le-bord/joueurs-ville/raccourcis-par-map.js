/* ===== LES RACCOURCIS PAR MAP, JOUEURS ET c0025 (2026-11-28, role « lecteur des joueurs et de la ville ») =====
   Le gain d'un vol pose, compte comme ml/bot/mesures.js (piste sautee moins distance volee ; au portail : L - 80 - s0 moins la distance au portail) ;
   un raccourci = gain >= 60 m. Ici rapporte a la map du DECOLLAGE, avec les vols morts a part (un vol mort n'a pas de gain : il est seulement compte).
   Memes lots que par-map.js. node ml/ecurie/etude/avant-le-bord/joueurs-ville/raccourcis-par-map.js -> raccourcis-par-map.json */
const fs=require('fs'),path=require('path');
const RACINE=path.join(__dirname,'..','..','..','..','..');
const {partiesJoueurs,finVraie}=require(path.join(RACINE,'ml','bot','mesures.js'));
function lot(P){const T={};const t=k=>T[k]=T[k]||{min:0,vols:0,racc:0,mortsVol:0,gains:[]};
  for(let c of P){c=finVraie(c);const col={};c.cols.forEach((n,i)=>col[n]=i);const E=c.ech,g=(e,n)=>e[col[n]],carte=r=>((c.routes||[])[r]||{}).carte||'?';
    for(let i=1;i<E.length;i++){const dt=g(E[i],'t')-g(E[i-1],'t');if(g(E[i],'r')===g(E[i-1],'r')&&dt>0&&dt<.5)t(carte(g(E[i],'r'))).min+=dt/60;}
    const ici=(tt,r)=>{let b=null,bd=1e9;for(const e of E){if(r!=null&&g(e,'r')!==r)continue;const q=Math.abs(g(e,'t')-tt);if(q<bd){bd=q;b=e;}else if(g(e,'t')>tt+.3)break;}return bd<=.3?b:null;};
    const vole=(a,b)=>Math.hypot(g(b,'x')-g(a,'x'),g(b,'y')-g(a,'y'),g(b,'z')-g(a,'z'));
    let r=0,d=null;
    for(const e of c.ev){if(e[1]==='route'){if(d&&d.portail==null)d.portail=e[0];r=e[2];continue;}
      if(e[1]==='decol'){d={t:e[0],s0:e[3],r:r,carte:carte(r),portail:null};continue;}
      if(e[1]==='mort'&&d){const X=t(d.carte);X.vols++;X.mortsVol++;d=null;continue;}
      if(e[1]==='pose'&&d){const X=t(d.carte);X.vols++;const a=ici(d.t);let gain=null;
        if(a){if(d.portail!=null){const r0=g(a,'r'),b=ici(d.portail,r0),Lr=((c.routes||[])[r0]||{}).L;if(b&&Lr)gain=(Lr-80-d.s0)-vole(a,b);}
          else{const b=ici(e[0]);if(b&&g(a,'r')===g(b,'r'))gain=(e[2]-d.s0)-vole(a,b);}}
        if(gain!=null&&gain>=60){X.racc++;X.gains.push(Math.round(gain));}d=null;}}}
  const o={};for(const k of Object.keys(T).sort()){const X=T[k];const G=X.gains.sort((a,b)=>a-b);
    o[k]={minutes:+X.min.toFixed(1),vols:X.vols,raccourcis:X.racc,raccourcis_par_min:X.min?+(X.racc/X.min).toFixed(2):null,gain_med:G.length?G[G.length>>1]:null,vols_morts:X.mortsVol};}
  return o;}
const D=path.join(RACINE,'ml','bot','etalon'),lus=fs.readdirSync(D).filter(x=>x.endsWith('.json')).map(x=>({nom:x,j:JSON.parse(fs.readFileSync(path.join(D,x),'utf8'))}));
const B=JSON.parse(fs.readFileSync(path.join(RACINE,'ml','ecurie','agents','tmp-voltige','note-voltige4-t900.json'),'utf8'));
const res={joueurs:lot(partiesJoueurs(lus).parties),c0025:lot(B.parties.map(p=>p.partie||p))};
fs.writeFileSync(path.join(__dirname,'raccourcis-par-map.json'),JSON.stringify(res,null,1));
for(const q in res){console.log('== '+q);for(const [k,X] of Object.entries(res[q]))console.log(' ',k.padEnd(8),JSON.stringify(X));}
