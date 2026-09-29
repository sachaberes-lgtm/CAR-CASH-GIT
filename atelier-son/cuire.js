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
  /* ⚠ UNE BOUCLE n'a pas de silence en tête : on y met sa propre QUEUE (et son début après sa fin). L'encodeur voit alors un signal
     continu à travers la couture — un silence devant lui ferait croire à une attaque (pré-écho, artefacts) pile à l'endroit où la
     boucle se referme. Le lecteur boucle exactement sur [tête, tête + lg). */
  const bo=!!b.boucle,ch=b.R?2:1,n=b.n+TETE+(bo?TETE:0),buf=Buffer.alloc(44+n*ch*2);
  buf.write('RIFF',0);buf.writeUInt32LE(36+n*ch*2,4);buf.write('WAVE',8);buf.write('fmt ',12);buf.writeUInt32LE(16,16);
  buf.writeUInt16LE(1,20);buf.writeUInt16LE(ch,22);buf.writeUInt32LE(SR,24);buf.writeUInt32LE(SR*ch*2,28);buf.writeUInt16LE(ch*2,32);buf.writeUInt16LE(16,34);
  buf.write('data',36);buf.writeUInt32LE(n*ch*2,40);let o=44;
  const q=x=>Math.max(-32767,Math.min(32767,Math.round(x*32767)));
  const ecr=function(i){buf.writeInt16LE(q(b.L[i]),o);o+=2;if(b.R){buf.writeInt16LE(q(b.R[i]),o);o+=2;}};
  if(bo)for(let i=b.n-TETE;i<b.n;i++)ecr(i);else o+=TETE*ch*2;
  for(let i=0;i<b.n;i++)ecr(i);
  if(bo)for(let i=0;i<TETE;i++)ecr(i);
  fs.writeFileSync(f,buf);
}
/* ---- L'ALLÈGEMENT (optimisation 2026-09-29) : la MÉMOIRE DÉCODÉE ----
   Le jeu garde chaque tampon décodé en float32 : 4 octets × 32 000 × canaux par seconde. Mesuré avant : 53,6 Mo pour 238 tampons.
   · FAUX STÉRÉO → MONO : 48 tampons avaient deux canaux STRICTEMENT identiques (côté/milieu à −200 dB — des recettes « st » qui n'ont
     rien panoramiqué). Critère : la PIRE fenêtre de 50 ms sous −60 dB de côté. WebAudio remonte un mono en L = R : le rendu est le
     même au bit près — le poids, lui, est divisé par deux.
   · LA QUEUE MORTE : tout ce qui suit le dernier échantillon au-dessus de crête −70 dB (après le TRIM du lecteur : sous −90 dBFS) est
     retiré (40 ms de marge gardés), fondu de 15 ms au bout. Les BOUCLES n'y passent jamais : leur longueur EST leur couture. */
const gagne={mono:0,s:0};
function allege(b){
  const r={mono:false,coupe:0},W=Math.round(.05*SR);
  if(b.R){let pire=-200;
    for(let o=0;o<b.n;o+=W){let m=0,sd=0;for(let i=o;i<Math.min(b.n,o+W);i++){const M=(b.L[i]+b.R[i])*.5,S=(b.L[i]-b.R[i])*.5;m+=M*M;sd+=S*S;}
      if(m>1e-12)pire=Math.max(pire,10*Math.log10(sd/m+1e-30));else if(sd>1e-12)pire=0;}
    if(pire<-60){for(let i=0;i<b.n;i++)b.L[i]=(b.L[i]+b.R[i])*.5;b.R=null;r.mono=true;}}
  if(!b.boucle){let pk=0;for(const c of [b.L,b.R])if(c)for(let i=0;i<b.n;i++){const a=Math.abs(c[i]);if(a>pk)pk=a;}
    const s70=pk*3.16e-4,F=Math.round(.015*SR);let d=0;
    for(let i=b.n-1;i>=0;i--)if(Math.abs(b.L[i])>s70||(b.R&&Math.abs(b.R[i])>s70)){d=i+1;break;}
    const nn=Math.max(F+1,d+Math.round(.04*SR)); // 40 ms de marge après le dernier échantillon audible : le fondu tombe TOUT ENTIER dans le silence (15 ms de marge laissaient la chute sèche de ui.compteur / fruit.grenade dans les 25 dernières ms)
    if(nn<b.n-Math.round(.02*SR)){r.coupe=(b.n-nn)/SR;b.n=nn;b.L=b.L.subarray(0,nn);if(b.R)b.R=b.R.subarray(0,nn);b.dur=nn/SR;
      for(const c of [b.L,b.R])if(c)for(let i=0;i<F;i++)c[nn-F+i]*=.5+.5*Math.cos(Math.PI*(i+1)/F);}}
  return r;
}
// la banque existante : on ne recuit que ce qu'on demande
let ancien={},ancienM={};
if(filtre&&fs.existsSync(SORTIE)){try{const w={};new Function('window',fs.readFileSync(SORTIE,'utf8'))(w);ancien=(w.CCSON_BANQUE&&w.CCSON_BANQUE.d)||{};ancienM=(w.CCSON_BANQUE&&w.CCSON_BANQUE.m)||{};}catch(e){}}
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
    if(filtre&&!filtre.test(id)&&ancien[cle]){donnees[cle]=ancien[cle];total+=ancien[cle].length;
      /* (débogage 2026-09-29) un son REPRIS de l'ancienne banque garde ses infos de boucle : sans elles, une recuisson partielle faisait
         reboucler garage.ambiance / espace.ambiance sur tout le tampon (marge de tête + rembourrage MP3 : un trou à chaque tour) */
      const am=ancienM[id];if(am&&am.boucle){meta[id].boucle=1;meta[id].lg=am.lg;}
      continue;}
    const b=cuireBrut(id,v,SR,false,base);
    if(b.boucle){meta[id].boucle=1;meta[id].lg=+(b.n/SR).toFixed(6);}
    let nan=0;for(const c of [b.L,b.R])if(c)for(let i=0;i<c.length;i++)if(!isFinite(c[i])){c[i]=0;nan++;}
    const L=sonie(b),pk=20*Math.log10(Math.max(1e-9,crete(b))); // mesurés AVANT l'allègement : un faux stéréo mesure +3 dB (les canaux s'additionnent), il JOUE pareil
    const al=allege(b);gagne.mono+=al.mono?1:0;gagne.s+=al.coupe;
    const w=path.join(TMP,'x.wav'),m=path.join(TMP,'x.mp3');ecritWav(w,b);
    if(WAVDIR)fs.copyFileSync(w,path.join(WAVDIR,cle.replace(/[#.]/g,'_')+'.wav'));
    cp.execFileSync('ffmpeg',['-v','error','-y','-i',w,'-codec:a','libmp3lame','-q:a',al.mono?'3':b.R?'4':'5','-ar',String(SR),m]); /* un faux stéréo passé mono monte d'un cran (q3) : en q4 le joint-stéréo donnait PLUS de bits au milieu qu'un mono q4 — mesuré contre la source non compressée (spectre en tiers d'octave), le mono q4 s'en écartait de 0,42 dB contre 0,39 */
    const b64=fs.readFileSync(m).toString('base64');donnees[cle]=b64;total+=b64.length;dureeT+=b.dur;
    lignes.push([cle,f.bus,(b.R?'st':al.mono?'mo←st':'mo'),b.dur.toFixed(2)+(al.coupe?' (−'+al.coupe.toFixed(2)+')':''),(L+f.db-10).toFixed(1),(pk).toFixed(1),Math.round(b64.length*.75/1024)+' Ko',nan?'NaN×'+nan:''].join('\t'));
  }
}
const js='/* CASH CAR — LA BANQUE DE SONS (générée par atelier-son/cuire.js le '+new Date().toISOString().slice(0,16).replace('T',' ')+' — NE PAS ÉDITER À LA MAIN :\n'+
  '   modifier la recette dans atelier-son/recettes.js puis relancer `node atelier-son/cuire.js`). MP3 32 kHz, 30 ms de silence en tête. */\n'+
  'window.CCSON_BANQUE={v:1,sr:'+SR+',tete:'+(TETE/SR)+',m:'+JSON.stringify(meta)+',\nd:{\n'+
  Object.keys(donnees).map(k=>JSON.stringify(k)+':"'+donnees[k]+'"').join(',\n')+'\n}};\n';
fs.writeFileSync(SORTIE+'.tmp',js);fs.renameSync(SORTIE+'.tmp',SORTIE);
const tete='clé\tbus\tcan (mo←st : faux stéréo allégé)\tdurée (− queue morte retirée)\tLUFS200 (sortie bus, après TRIM)\tcrête fichier dBFS\ttaille\n';
if(!filtre)fs.writeFileSync(MESURES,tete+lignes.join('\n')+'\n');
console.log(lignes.join('\n'));
console.log('\nbanque :',Object.keys(donnees).length,'tampons ·',(js.length/1048576).toFixed(2),'Mo ·',dureeT.toFixed(0),'s recuites · allègement :',gagne.mono,'faux stéréo passés en mono,',gagne.s.toFixed(1),'s de queue morte retirées');
fs.rmSync(TMP,{recursive:true,force:true});
