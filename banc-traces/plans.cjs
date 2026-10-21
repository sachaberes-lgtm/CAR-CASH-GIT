// node plans.cjs avant.html nouveau.html sortie.html [palier] — les plans vus de dessus, avant / après, 12 graines par map, même échelle
const path=require('path'),fs=require('fs');const JOLI=t=>t.replace(/\bmod\b/g,'module').replace(/\bfum\b/g,'fumeron').replace(/\bluxe\b/g,'luxuriante').replace(/\bgeode\b/g,'PUITS').replace(/\bstal\b/g,'stalactites').replace(/\babysse\b/g,'abysses');
const [,,a,b,out,pal0]=process.argv;const pal=+(pal0||0);
const A=require('./charge.cjs')(path.resolve(a)),B=require('./charge.cjs')(path.resolve(b));
const COUL={mine:'#b07a3a',luxe:'#4fbf4a',geode:'#a35cff',stal:'#d8a650',lave:'#ff4a1c',abysse:'#2fd6e0',fin:'#2fd6e0'};
const G=[3,7,11,15,19,23,27,31,35,39,43,47];
function panneau(r,carte,T9){const ech=T9.e;const c=r.ctrl,S=[0];for(let i=1;i<c.length;i++)S.push(S[i-1]+Math.hypot(c[i][0]-c[i-1][0],c[i][2]-c[i-1][2]));
  const W=200,H=200,cx=T9.cx,cy=T9.cy,X=p=>cx+p[0]*ech,Y=p=>cy-p[2]*ech;let svg='';
  const seg=(i0,i1,col,w)=>{let d='';for(let i=i0;i<=i1;i++)d+=(i===i0?'M':'L')+X(c[i]).toFixed(1)+' '+Y(c[i]).toFixed(1);return '<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="'+w+'" stroke-linejoin="round" stroke-linecap="round"/>';};
  const idx=s=>{let i=0;while(i<S.length-1&&S[i]<s)i++;return i;};
  if(carte==='grotte'){const SL=(r.etat.salles||[]);for(let k=0;k<SL.length;k++){const i0=idx(SL[k].s),i1=k+1<SL.length?idx(SL[k+1].s):c.length-1;svg+=seg(i0,i1,COUL[SL[k].k]||'#999',2.2);}
    const Q=r.Q;if(Q.puits0){const i=idx(Q.puits0.s);svg+='<circle cx="'+X(c[i]).toFixed(1)+'" cy="'+Y(c[i]).toFixed(1)+'" r="3.5" fill="none" stroke="#fff" stroke-width="1.2"/>';}}
  else{const Q=r.Q,iV=idx(Q.vlc0.s);svg+=seg(0,iV,'#e8b27a',2);svg+=seg(iV,c.length-1,'#ff5a2a',2.2);
    const e=r.etat;if(e.lac){svg='<circle cx="'+(cx+e.lac.x*ech).toFixed(1)+'" cy="'+(cy-e.lac.z*ech).toFixed(1)+'" r="'+((e.lac.r-180)*ech).toFixed(1)+'" fill="rgba(255,90,20,.18)"/>'+svg;}
    if(e.C)svg='<circle cx="'+(cx+e.C.x*ech).toFixed(1)+'" cy="'+(cy-e.C.z*ech).toFixed(1)+'" r="'+(e.K&&e.K.rc?e.K.rc*ech:6).toFixed(1)+'" fill="#552018" stroke="#ff7a3a" stroke-width=".8"/>'+svg;
    if(Q.arche){const i=idx(Q.arche.s);svg+='<rect x="'+(X(c[i])-3).toFixed(1)+'" y="'+(Y(c[i])-3).toFixed(1)+'" width="6" height="6" fill="#ffd34a"/>';}}
  svg+='<circle cx="'+cx+'" cy="'+cy+'" r="3" fill="#fff"/>';
  const fin=c[c.length-1];svg+='<circle cx="'+X(fin).toFixed(1)+'" cy="'+Y(fin).toFixed(1)+'" r="3" fill="#ff3cf0"/>';
  return '<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'"><rect width="'+W+'" height="'+H+'" fill="#151019"/>'+svg+'</svg>';}
let html='<!doctype html><meta charset="utf-8"><title>Tracés au hasard</title><style>body{background:#0c0a10;color:#eee;font:13px/1.5 system-ui,sans-serif;margin:16px}h2{margin:22px 0 4px}.g{display:grid;grid-template-columns:repeat(6,200px);gap:6px}.l{color:#aaa;margin:6px 0 10px}.cap{font-size:11px;color:#bbb;width:200px;overflow:hidden}</style>';
html+='<h1>Les tracés vus de dessus — palier '+pal+' (JOUER)</h1><p class="l">Point blanc = départ, rose = portail (même place du départ dans toutes les cases d\'une map). Même échelle avant / après pour chaque map. Graines '+G.join(', ')+'.</p>';
for(const carte of ['volcan','grotte']){
  const RA=G.map(g=>A.trace(carte,g,pal)),RB=G.map(g=>B.trace(carte,g,pal));
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const r of RA.concat(RB))for(const p of r.ctrl){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[2]);z1=Math.max(z1,p[2]);}
  const e9=Math.min(188/(x1-x0),188/(z1-z0)),T9={e:e9,cx:100-(x0+x1)/2*e9,cy:100+(z0+z1)/2*e9};const ech=T9;
  const nom=carte==='volcan'?'LE ROYAUME DE FEU':'LES PROFONDEURS';
  const leg=carte==='volcan'?'beige = la balade · rouge = la montée autour du cône (disque sombre = le cratère) · carré jaune = l\'arche · halo orange = le lac de lave':
    'mine <b style="color:#b07a3a">■</b> · luxuriante <b style="color:#4fbf4a">■</b> · puits de la géode <b style="color:#a35cff">■</b> (rond blanc = son entrée) · stalactites <b style="color:#d8a650">■</b> · lave <b style="color:#ff4a1c">■</b> · abysses <b style="color:#2fd6e0">■</b>';
  for(const [t,R] of [['AVANT (main)',RA],['APRÈS (au hasard)',RB]]){html+='<h2>'+nom+' — '+t+'</h2><p class="l">'+leg+'</p><div class="g">';
    for(const r of R){const Q=r.Q||{},h=Q.hasard;let cap='';if(carte==='volcan'&&h)cap=h.ordre.join(' › ')+' · coude '+h.coude+'°';else if(h)cap=h.ordre.slice(1,5).join(' › ');
      html+='<div>'+panneau(r,carte,ech)+'<div class="cap">'+JOLI(cap)+'</div></div>';}
    html+='</div>';}}
fs.writeFileSync(out,html);console.log('écrit',out);
