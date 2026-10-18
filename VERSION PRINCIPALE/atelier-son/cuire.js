/* ================================================================================================
   CASH CAR — LA CUISSON DE LA BANQUE DE SONS (Node) — `node atelier-son/cuire.js`
   Rend chaque recette de `recettes.js` (chaque variante, chaque base d'octave), la MESURE, l'encode en
   MP3 et écrit `../sons-banque.js`, que le jeu (et le banc d'écoute `sons.html`) décodent au chargement.
   Besoin : Node + ffmpeg dans le PATH.
   Options : `node cuire.js piece` ne recuit que les sons dont l'id contient « piece » (les autres sont
   repris de la banque existante) · `WAV=1` garde les .wav dans atelier-son/_wav pour les écouter.
   · `PCM=1 node cuire.js ui.jouer` (2026-10-16, session JOUER — le Mac de Sacha n'a pas de ffmpeg) : les sons RECUITS sont rangés en
     WAV 16 bits à 24 kHz au lieu du MP3 (sans encodeur ; ~1,6 × plus lourds qu'un MP3, donc pour un son ou deux, jamais toute la
     banque : PCM=1 exige un filtre). Leur fiche porte `pcm:1` : le lecteur (sfx.js ≥ v6) prend leur attaque à la tête exacte (30 ms),
     pas sur l'étalon MP3. Une cuisson suivante AVEC ffmpeg les repasse en MP3 d'elle-même. `FFMPEG=/chemin/ffmpeg` : un autre encodeur.

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
const SR=32000,TETE=Math.round(.03*SR),PCM=!!process.env.PCM,SR_PCM=24000,FFMPEG=process.env.FFMPEG||'ffmpeg';
const filtre=process.argv[2]?new RegExp(process.argv[2].replace(/(^|[^\\])\./g,'$1\\.')):null; // (2026-10-14, session SON) un point déjà échappé (« singe\.troupe ») le reste : on n'échappe que les points nus
/* (2026-10-14, session SON) LES SONS RETIRÉS DE LA BANQUE. Leurs recettes restent dans recettes.js (archive, banc d'écoute), mais ils ne
   sont plus cuits : sans cette liste, toute cuisson (complète OU filtrée — le filtre recuit tout id absent de l'ancienne banque) les
   faisait revenir. Train T2 (e0b0ba0) : ui.pop, ui.compteFin, fig.goutte, ui.pause plus appelés ; nuages.ambiance coupée par Léo
   (« son parasite »). Le BOUCLIER retiré du jeu (29/09, PWR_ORDRE sans 'b') : pwr.b, pwr.bouclierCasse/Fin/Plot, jamais appelés.
   (18/10, allègement) Les sons des FONCTIONS COUPÉES, sans appelant vivant par défaut : les bêtes (fig.dauphin, fig.dauphinRoyal, jeu.dauphin, singe.troupe),
   le snake (fig.snake), le météore (verdict.meteor, verdict.mega, fig.meteore), les plots (plot, porte), NITROOO (vitesse.pure), mallette.chaude, et les sons
   de la CARRIÈRE (monde.fin, panne.gresille, rival.devant, rival.passe, radar, trafic.accroche, abri, pad.neon). GARDÉS malgré leur air de carrière, parce que
   du code VIVANT les joue : rival.boum et alerte.dernier (le SURVIVANT), fantome.accroche / fantome.prise / defaite (la caisse-nuage, événement rare),
   fourgon.porte (l'atelier du garage), fourgon.billets (la pluie de richesse), dauphin.banc (les dauphins de Jade) ; et cratere, nitrooo.palier. */
const RETIRES=new Set(['ui.pop','ui.compteFin','fig.goutte','nuages.ambiance','ui.pause','pwr.b','pwr.bouclierCasse','pwr.bouclierFin','pwr.bouclierPlot',
  'fig.dauphin','fig.dauphinRoyal','jeu.dauphin','singe.troupe','fig.snake','verdict.meteor','verdict.mega','fig.meteore','plot','porte','vitesse.pure','mallette.chaude',
  'monde.fin','panne.gresille','rival.devant','rival.passe','radar','trafic.accroche','abri','pad.neon']);
if(PCM&&!filtre){console.log('PCM=1 exige un filtre (node cuire.js <son>) : toute la banque en WAV passerait de 6 à ~40 Mo.');process.exit(1);}
const TMP=fs.mkdtempSync(path.join(os.tmpdir(),'ccson-'));
const WAVDIR=process.env.WAV?path.join(ICI,'_wav'):null;if(WAVDIR)fs.mkdirSync(WAVDIR,{recursive:true});

function ecritWav(f,b){ // PCM 16 bits (l'entrée de l'encodeur), avec les 30 ms de silence en tête
  /* ⚠ UNE BOUCLE n'a pas de silence en tête : on y met sa propre QUEUE (et son début après sa fin). L'encodeur voit alors un signal
     continu à travers la couture — un silence devant lui ferait croire à une attaque (pré-écho, artefacts) pile à l'endroit où la
     boucle se referme. Le lecteur boucle exactement sur [tête, tête + lg). */
  const SR=b.sr||32000,TETE=Math.round(.03*SR); // (2026-10-16) la fréquence de la TOILE : 32 kHz pour l'encodeur, 24 kHz pour un son rangé en PCM
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
  const SR=b.sr||32000,r={mono:false,coupe:0},W=Math.round(.05*SR); // (2026-10-16) la fréquence de la toile (24 kHz en PCM)
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
if(PCM){if(!ancien.__etalon){console.log('PCM=1 : pas d\'étalon dans la banque existante.');process.exit(1);}donnees['__etalon']=ancien.__etalon;}
else{const b={n:Math.round(.08*SR),L:null,R:null,dur:.08};b.L=new Float32Array(b.n);for(let i=0;i<24;i++)b.L[i]=.9*Math.exp(-i/4)*(i%2?-1:1);
 const w=path.join(TMP,'e.wav'),m=path.join(TMP,'e.mp3');ecritWav(w,b);
 cp.execFileSync(FFMPEG,['-v','error','-y','-i',w,'-codec:a','libmp3lame','-q:a','5','-ar',String(SR),m]);
 donnees['__etalon']=fs.readFileSync(m).toString('base64');}
for(const id in DEFS){
  if(RETIRES.has(id))continue;
  const f=DEFS[id];
  meta[id]={bus:f.bus,db:f.db,max:f.max,cd:f.cd,v:f.v,rj:f.rj,vj:f.vj,key:f.key?1:0,bases:f.bases||[0],grp:f.grp||null,prio:f.prio||0,cede:f.cede?1:0,pre:f.pre?1:0,fam:f.fam||'?',dit:f.dit||''};
  for(const base of (f.bases||[0]))for(let v=0;v<f.v;v++){
    const cle=id+'#'+v+'#'+base;
    if(filtre&&!filtre.test(id)&&ancien[cle]){donnees[cle]=ancien[cle];total+=ancien[cle].length;
      /* (débogage 2026-09-29) un son REPRIS de l'ancienne banque garde ses infos de boucle : sans elles, une recuisson partielle faisait
         reboucler garage.ambiance / espace.ambiance sur tout le tampon (marge de tête + rembourrage MP3 : un trou à chaque tour) */
      const am=ancienM[id];if(am&&am.boucle){meta[id].boucle=1;meta[id].lg=am.lg;}
      if(am&&am.pcm)meta[id].pcm=1; // (2026-10-16) …et son rangement PCM (son attaque n'est pas celle de l'étalon MP3)
      continue;}
    if(PCM&&!filtre.test(id))continue; // (2026-10-16) PCM : seuls les sons DEMANDÉS sont recuits — un son absent de l'ancienne banque reste absent (sa fiche est retirée plus bas)
    const b=cuireBrut(id,v,PCM?SR_PCM:SR,false,base);
    if(b.boucle){meta[id].boucle=1;meta[id].lg=+(b.n/b.sr).toFixed(6);}
    let nan=0;for(const c of [b.L,b.R])if(c)for(let i=0;i<c.length;i++)if(!isFinite(c[i])){c[i]=0;nan++;}
    const L=sonie(b),pk=20*Math.log10(Math.max(1e-9,crete(b))); // mesurés AVANT l'allègement : un faux stéréo mesure +3 dB (les canaux s'additionnent), il JOUE pareil
    const al=allege(b);gagne.mono+=al.mono?1:0;gagne.s+=al.coupe;
    const w=path.join(TMP,'x.wav'),m=path.join(TMP,'x.mp3');ecritWav(w,b);
    if(WAVDIR)fs.copyFileSync(w,path.join(WAVDIR,cle.replace(/[#.]/g,'_')+'.wav'));
    if(PCM){meta[id].pcm=1;const b64=fs.readFileSync(w).toString('base64');donnees[cle]=b64;total+=b64.length;dureeT+=b.dur; // (2026-10-16) le WAV lui-même, sans encodeur
      lignes.push([cle,f.bus,(b.R?'st':al.mono?'mo←st':'mo')+' PCM '+b.sr,b.dur.toFixed(2)+(al.coupe?' (−'+al.coupe.toFixed(2)+')':''),(L+f.db-10).toFixed(1),(pk).toFixed(1),Math.round(b64.length*.75/1024)+' Ko',nan?'NaN×'+nan:''].join('\t'));continue;}
    cp.execFileSync(FFMPEG,['-v','error','-y','-i',w,'-codec:a','libmp3lame','-q:a',al.mono?'3':b.R?'4':'5','-ar',String(SR),m]); /* un faux stéréo passé mono monte d'un cran (q3) : en q4 le joint-stéréo donnait PLUS de bits au milieu qu'un mono q4 — mesuré contre la source non compressée (spectre en tiers d'octave), le mono q4 s'en écartait de 0,42 dB contre 0,39 */
    const b64=fs.readFileSync(m).toString('base64');donnees[cle]=b64;total+=b64.length;dureeT+=b.dur;
    lignes.push([cle,f.bus,(b.R?'st':al.mono?'mo←st':'mo'),b.dur.toFixed(2)+(al.coupe?' (−'+al.coupe.toFixed(2)+')':''),(L+f.db-10).toFixed(1),(pk).toFixed(1),Math.round(b64.length*.75/1024)+' Ko',nan?'NaN×'+nan:''].join('\t'));
  }
  if(PCM&&!Object.keys(donnees).some(function(k){return k.indexOf(id+'#')===0;}))delete meta[id]; // (2026-10-16) PCM : une fiche sans aucun tampon n'entre pas dans la banque
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
