/* LES PISTES DE COULEURS DU CANYON (2026-11-17) : la même vue du VRAI jeu, format iPhone, avec une variante de rendu posée À CHAUD (rien n'est codé dans le jeu) :
   · frag    : des remplacements [de, vers] dans le fragment de la roche (toutes les matières qui lisent les strates) — des constantes seulement ;
   · bio     : des retouches d'ambiance par météo (dbgEquilibre : les champs posés tels quels remplacent, expo/sat/con/lum/rtK multiplient) ;
   · strates : la palette des lits { m:[r,v,b,part,gain], n:[…] } (les grès massifs, les lits minces), à luminance égale comme cyStratesDonnees.
   node outils/banc-routes/canyon-final/pilote.mjs outils/banc-routes/canyon-final/pistes.mjs def=pistes.json out=dossier [pistes=0,A,B] [meteo=matin,soir] [graine=3] [s=600,3000] [formats=paysage,portrait] [mode=roule|vue] [mesure=1]
   mesure=1 : L* moyen, chroma moyenne, part de pixels brûlés (> 250) et de noirs (< 12) de chaque photo (lue dans la page). */
import fs from 'node:fs';
const POSE=`(function(V){const out={frag:0,mats:0,rates:[]};if(!V)return out;
  const sc=dbgScene().scene,vus=new Set();let tex=null;
  sc.traverse(function(o){const m=o.material;if(!m||vus.has(m)||!m.uniforms||!m.uniforms.uSTR||!m.fragmentShader)return;vus.add(m);out.mats++;tex=tex||m.uniforms.uSTR.value;
    let f=m.fragmentShader,n=0;for(const r of V.frag||[]){if(f.indexOf(r[0])<0){if(out.rates.indexOf(r[0].slice(0,40))<0)out.rates.push(r[0].slice(0,40));continue;}f=f.split(r[0]).join(r[1]);n++;}
    if(n){m.fragmentShader=f;m.needsUpdate=true;out.frag+=n;}});
  if(V.strates&&tex&&tex.image&&tex.image.data){const d=tex.image.data,T=V.strates;for(let o=0;o<d.length;o+=4){const q=d[o+3]>127?T.m:T.n,r=d[o],g=d[o+1],b=d[o+2],l=r*.3+g*.55+b*.15,n=q[0]*.3+q[1]*.55+q[2]*.15,k=q[3],G=l*q[4]/n;
      d[o]=Math.min(255,Math.round(r+(q[0]*G-r)*k));d[o+1]=Math.min(255,Math.round(g+(q[1]*G-g)*k));d[o+2]=Math.min(255,Math.round(b+(q[2]*G-b)*k));}tex.needsUpdate=true;out.strates=1;}
  for(const k in V.bio||{}){try{dbgEquilibre(k,V.bio[k]);}catch(e){out.rates.push('bio '+k);}}
  return out;})`;
const MESURE=`(async function(src){const im=new Image();im.src=src;await im.decode();const c=document.createElement('canvas');c.width=211;c.height=Math.round(211*im.height/im.width);const x=c.getContext('2d');x.drawImage(im,0,0,c.width,c.height);const d=x.getImageData(0,0,c.width,c.height).data;
  let L=0,C=0,br=0,no=0,n=0;const f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116,li=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);};
  for(let o=0;o<d.length;o+=4){const r=li(d[o]),g=li(d[o+1]),b=li(d[o+2]),X=(.4124*r+.3576*g+.1805*b)/.9505,Y=.2126*r+.7152*g+.0722*b,Z=(.0193*r+.1192*g+.9505*b)/1.089,l=116*f(Y)-16,a=500*(f(X)-f(Y)),bb=200*(f(Y)-f(Z));
    L+=l;C+=Math.hypot(a,bb);if(Math.max(d[o],d[o+1],d[o+2])>250)br++;if(l<12)no++;n++;}
  return {L:+(L/n).toFixed(1),chroma:+(C/n).toFixed(1),brule:+(br/n*100).toFixed(1),noir:+(no/n*100).toFixed(1)};})`;
export default async function(api,a){
  const DEF=JSON.parse(fs.readFileSync(a.def,'utf8')),out=a.out||'.',F={paysage:[844,390,2],portrait:[390,844,2]},bilan={};
  const noms=(a.pistes||Object.keys(DEF).join(',')).split(','),formats=(a.formats||'paysage,portrait').split(',');
  for(const meteo of (a.meteo||'matin').split(','))for(const f of formats)for(const nom of noms){const V=nom==='0'?null:DEF[nom];if(nom!=='0'&&!V){api.log('piste inconnue',nom);continue;}
    await api.charger({graine:+(a.graine||3),meteo,q:(V&&V.q)||a.q||'',taille:F[f],attente:3});
    const r=await api.ev(POSE+'('+JSON.stringify(V)+')');if(V&&(r.rates.length||!r.mats))api.log('⚠ piste',nom,JSON.stringify(r));
    for(const s9 of (a.s||'600').split(',')){const fich=`${out}/${nom}-${meteo}-s${s9}-${f}.png`;
      if(a.mode==='vue'){await api.ev(`dbgCanyonVoute('vueS',${+s9})`);await api.dort(600);await api.ev(`dbgCanyonVoute('vueS',${+s9})`);await api.dort(300);}
      else{await api.ev(`(function(){try{if(dbgState().paused)dbgCanyon('reprendre');}catch(e){}return dbgJadeAller(${Math.max(10,+s9-60)});})()`);await api.dort(1500);}
      await api.photo(fich);
      if(a.mesure){const b64=fs.readFileSync(fich).toString('base64');bilan[`${nom}-${meteo}-s${s9}-${f}`]=await api.ev(MESURE+'("data:image/png;base64,'+b64+'")',60000);}
      api.log('photo',fich,a.mesure?JSON.stringify(bilan[`${nom}-${meteo}-s${s9}-${f}`]):'');}
    if(api.erreurs.length)api.log('erreurs de page',JSON.stringify(api.erreurs.slice(0,3)));}
  if(a.mesure)fs.writeFileSync(out+'/mesures.json',JSON.stringify(bilan,null,1));
}
