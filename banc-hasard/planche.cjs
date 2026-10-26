// node planche.cjs <avant.json> <après.json> <sortie.svg> [n=12] — la planche AVANT | APRÈS des tracés vus de dessus, canyon et dunes (NON COMMITÉ)
const fs=require('fs');
const A=JSON.parse(fs.readFileSync(process.argv[2])),B=JSON.parse(fs.readFileSync(process.argv[3])),OUT=process.argv[4],N=+process.argv[5]||12;
const NOMS={canyon:{breche0:'brèche',fer0:'raccourci',etroit0:'étroits',arche0:'arche',amphi0:'amphithéâtre',mine0:'mine',chameau:'dos de chameau',bosses:'bosses',finale0:'finale (tunnel)'},
  dunes:{erg0:'crête du Grand Erg',tob0:'toboggan',racA0:'raccourci',racB0:'raccourci',vag0:'vagues',vag2:'vagues',vlei0:'vallée morte',cr2a:'2e crête',obel0:'obélisques',oasis0:'oasis'}};
const COL={'brèche':'#d62828','raccourci':'#1d4ed8','étroits':'#9333ea','arche':'#16a34a','amphithéâtre':'#0891b2','mine':'#525252','dos de chameau':'#b45309','bosses':'#ca8a04','finale (tunnel)':'#111',
  'crête du Grand Erg':'#d62828','toboggan':'#ea580c','vagues':'#9333ea','vallée morte':'#0891b2','2e crête':'#ca8a04','obélisques':'#16a34a','oasis':'#111'};
const W=1600,o=[];let y=10;
const txt=(x,y9,t,sz,w,c)=>o.push(`<text x="${x}" y="${y9}" font-family="Menlo,monospace" font-size="${sz||13}" font-weight="${w||400}" fill="${c||'#222'}">${t}</text>`);
for(const carte of ['canyon','dunes']){const ka=Object.keys(A.cartes).find(k=>k.startsWith(carte+'@0')),kb=Object.keys(B.cartes).find(k=>k.startsWith(carte+'@0'));if(!ka||!kb)continue;
  const ra=A.cartes[ka],rb=B.cartes[kb];
  txt(10,y+22,carte==='canyon'?'LE CANYON DES GÉANTS':"LES DUNES D'OR",20,700);y+=34;
  for(const [nom,r] of [['AVANT',ra],['APRÈS',rb]]){
    const R=r.resume;txt(10,y+16,`${nom} — 40 graines, palier 0 : écart de forme ${R.ecart} · cap ${R.cap[0]}° à ${R.cap[1]}° · ${R.nOrdres} ordre${R.nOrdres>1?'s':''} des pièces · ${R.L_km[0]}–${R.L_km[1]} km`,14,700,nom==='AVANT'?'#777':'#0a5');y+=24;
    // la superposition des 40, départ commun, nord en haut
    const S=300,ox=10+S/2,oz=y+S-14;let mx=1;for(const t of r.tr)for(const p of t.C)mx=Math.max(mx,Math.hypot(p[0]-t.C[0][0],p[2]-t.C[0][2]));const sc=(S-30)/mx;
    o.push(`<rect x="10" y="${y}" width="${S}" height="${S}" fill="#fff" stroke="#ccc"/>`);
    for(const t of r.tr)o.push(`<polyline fill="none" stroke="rgba(30,40,120,.33)" stroke-width="1" points="${t.C.map(p=>[(ox-(p[0]-t.C[0][0])*sc*.5).toFixed(1),(oz-(p[2]-t.C[0][2])*sc*.5).toFixed(1)].join(',')).join(' ')}"/>`);
    txt(16,y+14,'les 40, même départ',11,400,'#666');
    // N tracés, chacun à sa propre échelle, repères colorés
    const cw=(W-S-30)/6,ch=S/2;
    r.tr.slice(0,N).forEach((t,i)=>{const cx=S+20+(i%6)*cw,cy=y+Math.floor(i/6)*ch;const xs=t.C.map(p=>p[0]),zs=t.C.map(p=>p[2]);const ex=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...zs)-Math.min(...zs),1),sc2=(ch-26)/ex,mx2=(Math.max(...xs)+Math.min(...xs))/2,mz=(Math.max(...zs)+Math.min(...zs))/2;
      const P=p=>[(cx+cw/2-(p[0]-mx2)*sc2).toFixed(1),(cy+ch/2+4-(p[2]-mz)*sc2).toFixed(1)];
      o.push(`<rect x="${cx}" y="${cy}" width="${cw-4}" height="${ch-4}" fill="#fbf7ef" stroke="#ddd"/>`);
      o.push(`<polyline fill="none" stroke="#333" stroke-width="1.2" points="${t.C.map(p=>P(p).join(',')).join(' ')}"/>`);
      const n=t.C.length,acc=[0];for(let k=1;k<n;k++)acc.push(acc[k-1]+Math.hypot(t.C[k][0]-t.C[k-1][0],t.C[k][2]-t.C[k-1][2]));
      const lab=[];for(const q in t.Q){const nm=NOMS[carte][q];if(!nm)continue;const s=t.Q[q].f*acc[n-1];let j=0;while(j<n-1&&acc[j+1]<s)j++;const pp=P(t.C[j]);o.push(`<circle cx="${pp[0]}" cy="${pp[1]}" r="3.6" fill="${COL[nm]}"/>`);lab.push([t.Q[q].f,nm]);}
      const p0=P(t.C[0]);o.push(`<circle cx="${p0[0]}" cy="${p0[1]}" r="4.2" fill="none" stroke="#0a0" stroke-width="2"/>`);
      txt(cx+4,cy+12,`${Math.round(t.cap)}° · ${(t.L/1000).toFixed(1)} km`,10,400,'#555');});
    y+=S+10;}
  // la légende
  let lx=10;for(const nm of [...new Set(Object.values(NOMS[carte]))]){o.push(`<circle cx="${lx+5}" cy="${y+6}" r="4" fill="${COL[nm]}"/>`);txt(lx+13,y+10,nm,12);lx+=nm.length*8+34;}
  o.push(`<circle cx="${lx+5}" cy="${y+6}" r="4.2" fill="none" stroke="#0a0" stroke-width="2"/>`);txt(lx+13,y+10,'départ',12);y+=30;}
fs.writeFileSync(OUT,`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y}" viewBox="0 0 ${W} ${y}"><rect width="100%" height="100%" fill="#fff"/>${o.join('\n')}</svg>`);console.log('ok',OUT,y);
