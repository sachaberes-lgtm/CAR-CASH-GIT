/* ===== RELECTURE STATISTIQUE : une course a loi « retour » (retourOn = 1) est-elle MESUREE (yeuxTirages 0, pas de panne) ? =====
   Si elle ne l'etait pas, chaque graine courue par un tel pilote serait retiree pour tous, et lui ne serait jamais renvoyable (n = 0).
   2 graines d'entrainement, 60 s, sans cache, sans ecriture (rien dans l'etat). */
'use strict';
const path=require('path');
const D=path.join(__dirname,'..','..');
const C=require(path.join(D,'commun.js')),K=require(path.join(D,'courses.js')),Gn=require(path.join(D,'genome.js'));
const cfg=C.lireConfig(null);
const T=Gn.genomeTemoin(cfg);
const g=JSON.parse(JSON.stringify(T));g.A.retourOn=1;g.A.volMieux=1;Gn.reparer(g,cfg);
const variantes=[['temoin',T],['retourOn=1,volMieux=1',g]];
(async()=>{
  const ord=K.creer({cfg,cache:false,ecrire:false,travailleurs:4});
  const taches=[];
  for(const [nom,G] of variantes){const s=Gn.ecrirePilote(G,{cfg});for(const gr of [910000,910037])taches.push({source:s,shaPilote:Gn.shaPilote(s),id:nom,graine:gr,tmax:60,usage:'essai'});}
  const L=await ord.demander(taches);await ord.arreter();
  for(const l of L)console.log(l.id.padEnd(22)+' graine '+l.graine+' : '+(l.mesuree?'MESUREE':'NON MESUREE ('+l.raison+')')+' ; palier '+l.palier+', '+l.survie_s+' s, yeuxTirages '+l.yeuxTirages+', pannes '+l.pannes+', erreurs '+l.erreurs+(l.derniereErreur?' ['+String(l.derniereErreur).slice(0,160)+']':'')+', empreinte '+l.empreinte);
})().catch(e=>{console.error(e);process.exit(1);});
