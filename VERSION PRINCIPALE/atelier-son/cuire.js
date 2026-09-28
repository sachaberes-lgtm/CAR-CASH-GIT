/* ================================================================================================
   CASH CAR — LA CUISSON DE LA BANQUE DE SONS (Node) — `node atelier-son/cuire.js`
   Rend chaque recette de `recettes.js` (chaque variante, chaque base d'octave), la MESURE, l'encode en
   MP3 et écrit `../sons-banque.js`, que le jeu (et le banc d'écoute `sons.html`) décodent au chargement.
   Besoin : Node + ffmpeg dans le PATH.
   Options : `node cuire.js piece` ne recuit que les sons dont l'id contient « piece » (les autres sont
   repris de la banque existante) · `WAV=1` garde les .wav dans atelier-son/_wav pour les écouter.

   ⚠ LES 30 ms DE SILENCE EN TÊTE. Un encodeur MP3 ajoute un retard (≈ 25 ms) que certains décodeurs
   retirent et d'autres non. Le lecteur ne peut donc pas savoir où commence le son en comptant : chaque
   fichier commence par 30 ms de silence NUMÉRIQUE, et le lecteur saute au premier échantillon audible.
   Même instant d'attaque partout, quel que soit le navigateur. (Un clic d'interface en retard de
   25 ms se sent sous le doigt.)
   ================================================================================================ */
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const ICI=__dirname,SORTIE=path.join(ICI,'..','sons-banque.js'),MESURES=path.join(ICI,'mesures.txt');
eval(fs.readFileSync(path.join(ICI,'recettes.js'),'utf8'));
const DEFS=globalThis.CCSON_DEFS,cuireBrut=globalThis.CCSON_cuireBrut,sonie=globalThis.CCSON_sonie,crete=globalThis.CCSON_crete;
const SR=32000,TETE=Math.round(.03*SR);
const filtre=process.argv[2]?new RegExp(process.argv[2].replace(/\./g,'\\.')):null;
const TMP=fs.mkdtempSync(path.join(os.tmpdir(),'ccson-'));
const WAVDIR=process.env.WAV?path.join(ICI,'_wav'):null;if(WAVDIR)fs.mkdirSync(WAVDIR,{recursive:true});

function ecritWav(f,b){ // PCM 16 bits (l'entrée de l'encodeur), avec les 30 ms de silence en tête
  const ch=b.R?2:1,n=b.n+TETE,buf=Buffer.alloc(44+n*ch*2);
  buf.write('RIFF',0);buf.writeUInt32LE(36+n*ch*2,4);buf.write('WAVE',8);buf.write('fmt ',12);buf.writeUInt32LE(16,16);
  buf.writeUInt16LE(1,20);buf.writeUInt16LE(ch,22);buf.writeUInt32LE(SR,24);buf.writeUInt32LE(SR*ch*2,28);buf.writeUInt16LE(ch*2,32);buf.writeUInt16LE(16,34);
  buf.write('data',36);buf.writeUInt32LE(n*ch*2,40);let o=44+TETE*ch*2;
  const q=x=>Math.max(-32767,Math.min(32767,Math.round(x*32767)));
  for(let i=0;i<b.n;i++){buf.writeInt16LE(q(b.L[i]),o);o+=2;if(b.R){buf.writeInt16LE(q(b.R[i]),o);o+=2;}}
  fs.writeFileSync(f,buf);
}
// la banque existante : on ne recuit que ce qu'on demande
let ancien={};
if(filtre&&fs.existsSync(SORTIE)){try{const w={};new Function('window',fs.readFileSync(SORTIE,'utf8'))(w);ancien=(w.CCSON_BANQUE&&w.CCSON_BANQUE.d)||{};}catch(e){}}
const meta={},donnees={},lignes=[];let total=0,dureeT=0;
/* L'ÉTALON : 30 ms de silence puis UNE impulsion. Le MP3 étale un pré-écho devant les attaques sèches (jusqu'à ~15 ms
   mesurés dans Chrome) : chercher « le premier échantillon audible » démarrait les clics d'interface trop tôt. Le retard
   du codec est le MÊME pour tous les fichiers (mêmes réglages d'encodeur) : le lecteur mesure la CRÊTE de l'étalon (la
   crête, elle, ne bouge pas avec le pré-écho) et en déduit l'instant d'attaque de toute la banque. */
{const b={n:Math.round(.08*SR),L:null,R:null,dur:.08};b.L=new Float32Array(b.n);for(let i=0;i<24;i++)b.L[i]=.9*Math.exp(-i/4)*(i%2?-1:1);
 const w=path.join(TMP,'e.wav'),m=path.join(TMP,'e.mp3');ecritWav(w,b);
 cp.execFileSync('ffmpeg',['-v','error','-y','-i',w,'-codec:a','libmp3lame','-q:a','5','-ar',String(SR),m]);
 donnees['__etalon']=fs.readFileSync(m).toString('base64');}
for(const id in DEFS){
  const f=DEFS[id];
  meta[id]={bus:f.bus,db:f.db,max:f.max,cd:f.cd,v:f.v,rj:f.rj,vj:f.vj,key:f.key?1:0,bases:f.bases||[0],grp:f.grp||null,prio:f.prio||0,cede:f.cede?1:0,pre:f.pre?1:0,fam:f.fam||'?',dit:f.dit||''};
  for(const base of (f.bases||[0]))for(let v=0;v<f.v;v++){
    const cle=id+'#'+v+'#'+base;
    if(filtre&&!filtre.test(id)&&ancien[cle]){donnees[cle]=ancien[cle];total+=ancien[cle].length;continue;}
    const b=cuireBrut(id,v,SR,false,base);
    let nan=0;for(const c of [b.L,b.R])if(c)for(let i=0;i<c.length;i++)if(!isFinite(c[i])){c[i]=0;nan++;}
    const L=sonie(b),pk=20*Math.log10(Math.max(1e-9,crete(b)));
    const w=path.join(TMP,'x.wav'),m=path.join(TMP,'x.mp3');ecritWav(w,b);
    if(WAVDIR)fs.copyFileSync(w,path.join(WAVDIR,cle.replace(/[#.]/g,'_')+'.wav'));
    cp.execFileSync('ffmpeg',['-v','error','-y','-i',w,'-codec:a','libmp3lame','-q:a',b.R?'4':'5','-ar',String(SR),m]);
    const b64=fs.readFileSync(m).toString('base64');donnees[cle]=b64;total+=b64.length;dureeT+=b.dur;
    lignes.push([cle,f.bus,(b.R?'st':'mo'),b.dur.toFixed(2),(L+f.db-10).toFixed(1),(pk).toFixed(1),Math.round(b64.length*.75/1024)+' Ko',nan?'NaN×'+nan:''].join('\t'));
  }
}
const js='/* CASH CAR — LA BANQUE DE SONS (générée par atelier-son/cuire.js le '+new Date().toISOString().slice(0,16).replace('T',' ')+' — NE PAS ÉDITER À LA MAIN :\n'+
  '   modifier la recette dans atelier-son/recettes.js puis relancer `node atelier-son/cuire.js`). MP3 32 kHz, 30 ms de silence en tête. */\n'+
  'window.CCSON_BANQUE={v:1,sr:'+SR+',tete:'+(TETE/SR)+',m:'+JSON.stringify(meta)+',\nd:{\n'+
  Object.keys(donnees).map(k=>JSON.stringify(k)+':"'+donnees[k]+'"').join(',\n')+'\n}};\n';
fs.writeFileSync(SORTIE+'.tmp',js);fs.renameSync(SORTIE+'.tmp',SORTIE);
const tete='clé\tbus\tcan\tdurée\tLUFS200 (sortie bus, après TRIM)\tcrête fichier dBFS\ttaille\n';
if(!filtre)fs.writeFileSync(MESURES,tete+lignes.join('\n')+'\n');
console.log(lignes.join('\n'));
console.log('\nbanque :',Object.keys(donnees).length,'tampons ·',(js.length/1048576).toFixed(2),'Mo ·',dureeT.toFixed(0),'s recuites');
fs.rmSync(TMP,{recursive:true,force:true});
