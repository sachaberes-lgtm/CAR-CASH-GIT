/* extraire.js : lit les notes mes-*.json et note-voltige*-t900.json, garde par course les chiffres du bilan et les 15 mesures de ressemblance.
   usage : node extraire.js <debut> <fin>   (tranche de la liste des fichiers, pour rester sous 2 minutes) -> courses-<debut>.json */
const fs=require('fs'),path=require('path');
const D=path.join(__dirname,'..','..');
const R=require(path.join(D,'..','..','..','bot','ressemblance.js'));
const L=fs.readdirSync(D).filter(x=>/^mes-.*\.json$/.test(x)||/^note-voltige.*-t900\.json$/.test(x)).sort();
const a=+process.argv[2]||0,b=+process.argv[3]||L.length,out=[];const t0=Date.now();
for(const f of L.slice(a,b)){
  const j=JSON.parse(fs.readFileSync(path.join(D,f),'utf8'));
  const C=j.courses.map((c,i)=>{const p=j.parties&&j.parties[i]&&(j.parties[i].partie||j.parties[i]);let m=null;try{m=p?R.mesuresPartie(p):null;}catch(e){m=null;}
    return {graine:c.graine,palier:c.palier,duree_s:c.duree_s,pieces:c.pieces,cause:c.cause,vols:c.vols,morts_en_vol:c.morts_en_vol,poses:c.poses,
      distance_m:c.distance_m,air_pct:c.air_pct,nitro_pct:c.nitro_pct,raccourcis:c.raccourcis,figures_payees:c.figures_payees,kmh_moyen:c.kmh_moyen,
      argent:c.argent,tronquee:c.tronquee,pDuree:p&&p.fin&&p.fin.t,m};});
  out.push({fichier:f,sha:j.sha_cerveau,graines:j.graines,tmax:j.tmax,note:{palier_median:j.note.palier_median,survie_mediane_s:j.note.survie_mediane_s,coupees:j.note.coupees},courses:C});
  console.log(f,((Date.now()-t0)/1000).toFixed(1)+' s');
}
fs.writeFileSync(path.join(__dirname,'courses-'+a+'.json'),JSON.stringify(out));
