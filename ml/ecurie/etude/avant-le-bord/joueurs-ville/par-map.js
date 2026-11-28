/* ===== AVANT LE BORD : LES JOUEURS ET c0025, MAP PAR MAP (2026-11-28, role « lecteur des joueurs et de la ville ») =====
   Lecture seule, aucune course. Deux lots au meme format (l'enregistreur du jeu, cashcar-jeurec-1), passes par les memes fonctions :
     · les joueurs : ml/bot/etalon/*.json, comptes par partiesJoueurs (ml/bot/mesures.js), comme ressemblance.js ;
     · c0025 : ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json (20 courses de 900 s au plus, maps tirees, sha du cerveau = ml/ecurie/pilote-voltige.js).
   Pour chaque map : le temps passe, les morts (cause, au sol ou en vol), les decollages par le bord, la mort dans la seconde, la nitro au decollage,
   la vitesse au decollage, la place sur la route 1 s / 0,5 s / 0,3 s avant le decollage (|lat| / demi-route), et au sol.
   node ml/ecurie/etude/avant-le-bord/joueurs-ville/par-map.js   ->   par-map.json a cote */
const fs=require('fs'),path=require('path');
const RACINE=path.join(__dirname,'..','..','..','..','..');
const {partiesJoueurs,finVraie,mesures}=require(path.join(RACINE,'ml','bot','mesures.js'));
const med=A=>{A=A.filter(x=>x!=null&&x===x).slice().sort((a,b)=>a-b);const n=A.length;return n?(n%2?A[(n-1)/2]:(A[n/2-1]+A[n/2])/2):null;};
const moy=A=>{A=A.filter(x=>x!=null&&x===x);return A.length?A.reduce((a,b)=>a+b,0)/A.length:null;};
const r2=(x,k)=>x==null?null:+x.toFixed(k==null?2:k);

function lot(parties){
  const M={};const m=k=>M[k]=M[k]||{min:0,solMin:0,morts:0,mortsVol:0,mortsSol:0,causes:{},decolBord:0,decolAutre:0,mortsVolBord:0,mort1s:0,
    nitDecol:[],kmhDecol:[],lat10:[],lat05:[],lat03:[],latSol:[],kmhSol:[],nitSol:[],bordSol:0,nSol:0,volsMort:[],poses:0};
  const tout={parties:parties.length,durees:[],paliers:[],causesFin:{}};
  for(let c of parties){c=finVraie(c);
    const col={};c.cols.forEach((n,i)=>col[n]=i);const E=c.ech,g=(e,n)=>e[col[n]];
    const carte=r=>((c.routes||[])[r]||{}).carte||'?',rh=r=>((c.routes||[])[r]||{}).rh||28;
    const me=mesures(c);tout.durees.push(me.duree_s);tout.paliers.push(me.palier);tout.causesFin[me.cause]=(tout.causesFin[me.cause]||0)+1;
    /* le temps par map : les ecarts entre echantillons qui se suivent sur la meme route (moins de 0,5 s) */
    for(let i=1;i<E.length;i++){const p=E[i-1],q=E[i],dt=g(q,'t')-g(p,'t');if(g(p,'r')!==g(q,'r')||!(dt>0&&dt<.5))continue;
      const X=m(carte(g(p,'r')));X.min+=dt/60;if(g(p,'m')===0)X.solMin+=dt/60;}
    for(const e of E){if(g(e,'m')!==0)continue;const X=m(carte(g(e,'r'))),R=rh(g(e,'r'));X.nSol++;X.latSol.push(Math.abs(g(e,'lat'))/R);
      if(Math.abs(g(e,'lat'))>.75*R)X.bordSol++;X.kmhSol.push(g(e,'kmh'));X.nitSol.push(g(e,'nit')?1:0);}
    /* les vols, par les evenements ; la route courante par les evenements 'route' */
    let r=0,vol=null;
    const pres=(t,rr,dt)=>{let b=null,bd=dt;for(const e of E){if(g(e,'r')!==rr)continue;const d=Math.abs(g(e,'t')-t);if(d<bd){bd=d;b=e;}else if(g(e,'t')>t+dt)break;}return b;};
    for(const e of c.ev){const k=e[1];
      if(k==='route'){r=e[2];continue;}
      if(k==='decol'){const X=m(carte(r));vol={t:e[0],o:e[2],r:r,carte:carte(r)};
        if(e[2]==='bord')X.decolBord++;else X.decolAutre++;
        X.kmhDecol.push(e[5]);
        const b=pres(e[0],r,.2);if(b)X.nitDecol.push(g(b,'nit')?1:0);
        for(const [dt,cle] of [[1,'lat10'],[.5,'lat05'],[.3,'lat03']]){const a=pres(e[0]-dt,r,.06);if(a&&g(a,'m')===0)X[cle].push(Math.abs(g(a,'lat'))/rh(r));}
        continue;}
      if(k==='pose'&&vol){m(vol.carte).poses++;vol=null;continue;}
      if(k==='mort'){const cm=vol?vol.carte:carte(r),X=m(cm);X.morts++;X.causes[e[2]]=(X.causes[e[2]]||0)+1;
        if(vol){X.mortsVol++;X.volsMort.push(r2(e[0]-vol.t));if(vol.o==='bord'){X.mortsVolBord++;if(e[0]-vol.t<1)X.mort1s++;}}else X.mortsSol++;vol=null;}}
  }
  const out={};
  for(const k of Object.keys(M).sort()){const X=M[k];
    out[k]={minutes:r2(X.min,1),morts:X.morts,morts_par_10min:X.min>0?r2(10*X.morts/X.min):null,causes:X.causes,morts_en_vol:X.mortsVol,morts_au_sol:X.mortsSol,
      decollages_bord:X.decolBord,decollages_autres:X.decolAutre,bord_par_min:X.min>0?r2(X.decolBord/X.min,1):null,
      morts_apres_bord:X.mortsVolBord,morts_dans_1s_apres_bord:X.mort1s,part_bord_mortels:X.decolBord?r2(X.mortsVolBord/X.decolBord,3):null,
      mort_apres_decol_med_s:med(X.volsMort),
      nitro_au_decollage:X.nitDecol.length?r2(moy(X.nitDecol),2):null,n_nitro_decol:X.nitDecol.length,
      kmh_decollage_med:med(X.kmhDecol),kmh_sol_moy:r2(moy(X.kmhSol),0),nitro_sol:r2(moy(X.nitSol),2),
      lat_sol_med:r2(med(X.latSol)),part_sol_pres_du_bord:X.nSol?r2(X.bordSol/X.nSol):null,
      lat_1s_avant_med:r2(med(X.lat10)),lat_05s_avant_med:r2(med(X.lat05)),lat_03s_avant_med:r2(med(X.lat03)),n_lat:X.lat10.length};}
  tout.duree_med=med(tout.durees);tout.duree_moy=r2(moy(tout.durees),1);tout.palier_med=med(tout.paliers);tout.paliers=tout.paliers.sort((a,b)=>a-b);
  return {tout,maps:out};}

const D=path.join(RACINE,'ml','bot','etalon'),lus=fs.readdirSync(D).filter(x=>x.endsWith('.json')).map(x=>({nom:x,j:JSON.parse(fs.readFileSync(path.join(D,x),'utf8'))}));
const PJ=partiesJoueurs(lus).parties;
const B=JSON.parse(fs.readFileSync(path.join(RACINE,'ml','ecurie','agents','tmp-voltige','note-voltige4-t900.json'),'utf8'));
const PB=B.parties.map(p=>p.partie||p);
const res={date:'2026-11-28',sources:{joueurs:'ml/bot/etalon/*.json (partiesJoueurs)',c0025:'ml/ecurie/agents/tmp-voltige/note-voltige4-t900.json ('+B.date+', '+B.jeu+', sha cerveau '+B.sha_cerveau+', tmax '+B.tmax+')'},
  joueurs:lot(PJ),c0025:lot(PB)};
fs.writeFileSync(path.join(__dirname,'par-map.json'),JSON.stringify(res,null,1));
for(const q of ['joueurs','c0025']){const L=res[q];console.log('\n== '+q+' : '+L.tout.parties+' parties, duree med '+L.tout.duree_med+' s, palier med '+L.tout.palier_med+' ; paliers '+L.tout.paliers.join(' ')+' ; fins '+JSON.stringify(L.tout.causesFin));
  for(const [k,X] of Object.entries(L.maps))console.log(k.padEnd(8),JSON.stringify(X));}
